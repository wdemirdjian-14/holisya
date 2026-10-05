export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';
import { renderTemplate, withUnsubscribeFooter } from '@/lib/email-template';
import crypto from 'crypto';

// Au-dessus de ce nombre de destinataires, l'envoi est mis en file et étalé par le cron (protège la réputation / l'IP).
const BATCH_THRESHOLD = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    const recipientIds: string[] = Array.isArray(data?.recipientIds) ? data.recipientIds : [];
    const rawEmails: string[] = Array.isArray(data?.rawEmails) ? data.rawEmails.map((e: any) => String(e)) : [];
    if (recipientIds.length === 0 && rawEmails.length === 0) return NextResponse.json({ error: 'Aucun destinataire sélectionné' }, { status: 400 });
    if (!data?.subject || !data?.body) return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });

    // Liste de destinataires unifiée (clientes + emails bruts), dédoublonnée, sans désinscrits.
    // On préserve l'ordre de priorité envoyé par le client (recipientIds déjà triés).
    const usersRaw = await prisma.user.findMany({ where: { id: { in: recipientIds } } });
    const orderIndex = new Map(recipientIds.map((id, i) => [id, i]));
    const users = usersRaw.sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));
    let skippedOptOut = 0;
    const seen = new Set<string>();
    const list: { email: string; firstName: string; lastName: string; userId: string | null }[] = [];
    for (const u of users) {
      const em = (u.email ?? '').toLowerCase();
      if (!em) continue;
      if (u.emailOptOut) { skippedOptOut += 1; continue; }
      if (seen.has(em)) continue;
      seen.add(em);
      list.push({ email: u.email, firstName: u.firstName ?? '', lastName: u.lastName ?? '', userId: u.id });
    }
    for (const raw of rawEmails) {
      const em = String(raw).trim().toLowerCase();
      if (!EMAIL_RE.test(em) || seen.has(em)) continue;
      seen.add(em);
      list.push({ email: em, firstName: '', lastName: '', userId: null });
    }
    if (list.length === 0) return NextResponse.json({ error: 'Aucun destinataire valide' }, { status: 400 });

    // Gros envoi → file d'attente étalée par priorité (cron).
    if (list.length > BATCH_THRESHOLD) {
      const maxPerDay = Math.min(2000, Math.max(20, parseInt(data?.maxPerDay) || 400));
      const now = new Date();
      const nineAm = (dayOffset: number) => { const d = new Date(); d.setHours(9, 0, 0, 0); d.setDate(d.getDate() + dayOffset); return d; };
      const days = Math.ceil(list.length / maxPerDay);
      const campaign = await prisma.emailCampaign.create({
        data: { subject: data.subject, body: data.body, templateId: data?.templateId ?? '', total: list.length, status: 'queued' },
      });
      const items = list.map((r, idx) => {
        const day = Math.floor(idx / maxPerDay);
        return { campaignId: campaign.id, userId: r.userId, email: r.email, firstName: r.firstName, lastName: r.lastName, scheduledFor: day === 0 ? now : nineAm(day) };
      });
      for (let i = 0; i < items.length; i += 1000) await prisma.emailQueueItem.createMany({ data: items.slice(i, i + 1000) });
      return NextResponse.json({ queued: true, total: list.length, campaignId: campaign.id, skippedOptOut, days, maxPerDay });
    }

    // Petit envoi → immédiat.
    const appUrl = process.env.NEXTAUTH_URL ?? '';
    let sent = 0, failed = 0;
    for (const r of list) {
      const vars = { prenom: r.firstName, nom: r.lastName, email: r.email };
      const subject = renderTemplate(data.subject, vars);
      let unsubscribeUrl = `${appUrl}/desinscription`;
      if (r.userId) {
        const u = await prisma.user.findUnique({ where: { id: r.userId }, select: { unsubscribeToken: true } });
        let token = u?.unsubscribeToken;
        if (!token) { token = crypto.randomBytes(24).toString('hex'); await prisma.user.update({ where: { id: r.userId }, data: { unsubscribeToken: token } }); }
        unsubscribeUrl = `${appUrl}/desinscription?token=${token}`;
      }
      const finalBody = withUnsubscribeFooter(renderTemplate(data.body, vars), unsubscribeUrl);
      const result = await sendNotificationEmail({ subject, body: finalBody, recipientEmail: r.email });
      const success = result?.success !== false;
      if (success) sent += 1; else failed += 1;
      await prisma.emailLog.create({ data: { recipientEmail: r.email, recipientName: `${r.firstName} ${r.lastName}`.trim(), subject, templateId: data?.templateId ?? '', status: success ? 'SENT' : 'FAILED', error: success ? '' : 'Échec envoi SMTP' } });
    }
    return NextResponse.json({ sent, failed, skippedOptOut, total: sent + failed + skippedOptOut });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Erreur envoi' }, { status: 500 });
  }
}
