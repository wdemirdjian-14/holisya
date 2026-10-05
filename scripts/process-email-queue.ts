import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { renderTemplate, withUnsubscribeFooter } from '../lib/email-template';
import { sendNotificationEmail } from '../lib/notifications';

const prisma = new PrismaClient();

// Réglage du débit : nombre d'emails par exécution + délai entre chaque (protège l'IP/réputation).
const BATCH_PER_RUN = 50;
const DELAY_MS = 500;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const appUrl = process.env.NEXTAUTH_URL ?? 'https://www.holisya.fr';

  const items = await prisma.emailQueueItem.findMany({
    where: { status: 'pending', scheduledFor: { lte: new Date() } },
    orderBy: { scheduledFor: 'asc' },
    take: BATCH_PER_RUN,
    include: { campaign: true },
  });
  if (items.length === 0) { console.log('[email-queue] rien à envoyer'); return; }

  // Marque les campagnes concernées en "sending".
  const campaignIds = Array.from(new Set(items.map((i) => i.campaignId)));
  await prisma.emailCampaign.updateMany({ where: { id: { in: campaignIds }, status: 'queued' }, data: { status: 'sending' } });

  let sent = 0, failed = 0, skipped = 0;
  for (const it of items) {
    const camp = it.campaign;
    const vars = { prenom: it.firstName ?? '', nom: it.lastName ?? '', email: it.email ?? '' };

    // Désinscription (token client si disponible).
    let unsubscribeUrl = `${appUrl}/desinscription`;
    let optedOut = false;
    if (it.userId) {
      const u = await prisma.user.findUnique({ where: { id: it.userId }, select: { emailOptOut: true, unsubscribeToken: true } });
      if (u?.emailOptOut) optedOut = true;
      else {
        let token = u?.unsubscribeToken;
        if (!token) { token = crypto.randomBytes(24).toString('hex'); await prisma.user.update({ where: { id: it.userId }, data: { unsubscribeToken: token } }); }
        unsubscribeUrl = `${appUrl}/desinscription?token=${token}`;
      }
    }

    if (optedOut) {
      await prisma.emailQueueItem.update({ where: { id: it.id }, data: { status: 'skipped', error: 'désinscrit' } });
      skipped += 1;
      continue;
    }

    const subject = renderTemplate(camp.subject, vars);
    const finalBody = withUnsubscribeFooter(renderTemplate(camp.body, vars), unsubscribeUrl);
    const result = await sendNotificationEmail({ subject, body: finalBody, recipientEmail: it.email });
    const success = result?.success !== false;

    await prisma.emailQueueItem.update({ where: { id: it.id }, data: { status: success ? 'sent' : 'failed', error: success ? '' : 'Échec SMTP', sentAt: new Date() } });
    await prisma.emailCampaign.update({ where: { id: it.campaignId }, data: success ? { sentCount: { increment: 1 } } : { failedCount: { increment: 1 } } });
    await prisma.emailLog.create({ data: { recipientEmail: it.email, recipientName: `${it.firstName ?? ''} ${it.lastName ?? ''}`.trim(), subject, templateId: camp.templateId ?? '', status: success ? 'SENT' : 'FAILED', error: success ? '' : 'Échec envoi SMTP' } });

    if (success) sent += 1; else failed += 1;
    await sleep(DELAY_MS);
  }

  // Clôture des campagnes sans "pending" restant.
  for (const cid of campaignIds) {
    const remaining = await prisma.emailQueueItem.count({ where: { campaignId: cid, status: 'pending' } });
    if (remaining === 0) await prisma.emailCampaign.update({ where: { id: cid }, data: { status: 'done' } });
  }

  console.log(`[email-queue] ${sent} envoyé(s), ${failed} échec(s), ${skipped} désinscrit(s) — sur ${items.length} traité(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
