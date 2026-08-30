import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import webpush from 'web-push';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

const pushReady = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (pushReady) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@holisya.fr', process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
}

function body(firstName: string, service: string, when: string) {
  return `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 40px 30px;">
    <h1 style="color: #3B312D; text-align: center; font-size: 24px;">Rappel de rendez-vous 🌸</h1>
    <div style="background: white; padding: 30px; border-radius: 12px;">
      <p style="color: #3B312D;">Bonjour ${firstName || ''},</p>
      <p style="color: #3B312D;">Nous avons hâte de vous accueillir pour votre soin${service ? ` « ${service} »` : ''} :</p>
      <p style="color: #C98F79; font-weight: bold; font-size: 18px; text-align:center;">${when}</p>
      <p style="color: #666; font-size: 13px;">Un empêchement ? Prévenez-nous depuis votre espace client ou par téléphone.</p>
    </div>
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">Holisya — Bien-être Holistique Féminin</p>
  </div>`;
}

async function main() {
  const now = new Date();
  const in36h = new Date(now.getTime() + 36 * 60 * 60 * 1000);

  const appts = await prisma.appointment.findMany({
    where: { status: { in: ['PENDING', 'CONFIRMED'] }, reminderSent: false, date: { gte: now, lte: in36h } },
    include: { user: { select: { id: true, email: true, firstName: true } } },
  });

  let sent = 0;
  for (const appt of appts) {
    await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent: true } });
    const when = new Date(appt.date).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

    if (appt.user?.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM ?? '"Holisya" <contact@holisya.fr>',
          to: appt.user.email,
          subject: 'Rappel : votre rendez-vous chez Holisya 🌸',
          html: body(appt.user.firstName ?? '', appt.serviceType ?? '', when),
        });
        sent += 1;
      } catch (e) { console.error('mail fail', appt.user.email, e); }
    }

    if (pushReady && appt.user?.id) {
      const subs = await prisma.pushSubscription.findMany({ where: { userId: appt.user.id } });
      const payload = JSON.stringify({ title: 'Rappel de rendez-vous 🌸', body: `${appt.serviceType} — ${when}`, url: '/espace-membre/rendez-vous' });
      for (const s of subs) {
        try { await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any, payload); }
        catch (e: any) { if (e?.statusCode === 404 || e?.statusCode === 410) await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {}); }
      }
    }
  }
  console.log(`[reminders] ${sent} rappel(s) email envoyé(s) sur ${appts.length} RDV éligible(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
