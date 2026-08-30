import { PrismaClient } from '@prisma/client';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { parsePlanityEmail } from '../lib/planity-parser';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

function welcomeNoCoupon(firstName: string) {
  return `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 40px 30px;">
    <div style="text-align:center;margin-bottom:24px;"><h1 style="color:#3B312D;font-size:26px;margin:0;">Bienvenue chez Holisya</h1><p style="color:#AAB7A0;font-size:13px;margin-top:6px;">Bien-être Holistique Féminin</p></div>
    <div style="background:white;padding:30px;border-radius:12px;">
      <p style="color:#3B312D;">Bonjour ${firstName || ''},</p>
      <p style="color:#3B312D;">Nous avons hâte de vous accueillir pour votre rendez-vous. Nous vous remercions de votre confiance.</p>
      <p style="color:#3B312D;">À très bientôt dans l'univers Holisya 🌸</p>
    </div>
  </div>`;
}

async function main() {
  const host = process.env.IMAP_HOST;
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASSWORD;
  if (!host || !user || !pass) { console.log('[planity] IMAP non configuré'); return; }

  const client = new ImapFlow({
    host, port: Number(process.env.IMAP_PORT ?? 993), secure: process.env.IMAP_SECURE !== 'false',
    auth: { user, pass }, logger: false,
  });

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');
  let imported = 0, pending = 0, skipped = 0;
  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const uids = await client.search({ from: 'noreply@planity.com', since }, { uid: true });
    if (uids && uids.length) {
      for await (const msg of client.fetch(uids, { source: true, envelope: true }, { uid: true })) {
        const mail = await simpleParser(msg.source as Buffer);
        const messageId = mail.messageId || `planity-${msg.uid}`;
        const text = (mail.text || '') + '\n' + (typeof mail.html === 'string' ? mail.html.replace(/<[^>]+>/g, ' ') : '');

        // Filtre : doit contenir "Holisya" dans le corps.
        if (!/holisya/i.test(text)) { skipped++; continue; }
        // Déduplication.
        const exists = await prisma.planityBooking.findUnique({ where: { messageId } });
        if (exists) { skipped++; continue; }

        const parsed = parsePlanityEmail(text);
        if (!parsed) { skipped++; continue; }

        const email = parsed.email;
        const existingUser = email ? await prisma.user.findUnique({ where: { email } }) : null;

        const whenLabel = parsed.date.toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
        if (existingUser) {
          const appt = await prisma.appointment.create({
            data: { userId: existingUser.id, serviceType: parsed.serviceType || 'Soin', therapist: 'Lamyae', date: parsed.date, duration: parsed.durationMin, status: 'CONFIRMED', notes: 'Importé depuis Planity' },
          });
          await prisma.planityBooking.create({ data: { messageId, firstName: parsed.firstName, lastName: parsed.lastName, email, phone: parsed.phone, serviceType: parsed.serviceType, date: parsed.date, durationMin: parsed.durationMin, status: 'imported', appointmentId: appt.id, rawSubject: mail.subject || '' } });
          await prisma.notification.create({ data: { audience: 'admin', type: 'booking', title: 'Nouveau RDV (Planity)', body: `${parsed.firstName} ${parsed.lastName} — ${parsed.serviceType} · ${whenLabel}`, url: '/admin' } });
          imported++;
        } else {
          await prisma.planityBooking.create({ data: { messageId, firstName: parsed.firstName, lastName: parsed.lastName, email, phone: parsed.phone, serviceType: parsed.serviceType, date: parsed.date, durationMin: parsed.durationMin, status: 'pending', rawSubject: mail.subject || '' } });
          await prisma.notification.create({ data: { audience: 'admin', type: 'booking', title: 'Nouvelle cliente Planity à créer', body: `${parsed.firstName} ${parsed.lastName} — ${parsed.serviceType} · ${whenLabel}`, url: '/admin' } });
          pending++;
          // Email de bienvenue sans coupon.
          if (email) {
            try {
              await transporter.sendMail({ from: process.env.SMTP_FROM ?? '"Holisya" <contact@holisya.fr>', to: email, subject: 'Bienvenue chez Holisya 🌸', html: welcomeNoCoupon(parsed.firstName) });
            } catch (e) { console.error('welcome mail fail', email, e); }
          }
        }
      }
    }
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }
  console.log(`[planity] ${imported} RDV importé(s), ${pending} fiche(s) à créer, ${skipped} ignoré(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
