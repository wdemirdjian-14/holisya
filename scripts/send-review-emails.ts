import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { thankYouReviewEmail } from '../lib/emails';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

async function main() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const appts = await prisma.appointment.findMany({
    where: { status: 'COMPLETED', reviewEmailSent: false, date: { gte: since } },
    include: { user: { select: { email: true, firstName: true, emailOptOut: true } } },
  });

  let sent = 0;
  for (const appt of appts) {
    const email = appt.user?.email;
    if (!email || appt.user?.emailOptOut) {
      await prisma.appointment.update({ where: { id: appt.id }, data: { reviewEmailSent: true } });
      continue;
    }
    await prisma.appointment.update({ where: { id: appt.id }, data: { reviewEmailSent: true } });
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? '"Holisya" <contact@holisya.fr>',
        to: email,
        replyTo: 'contact@holisya.fr',
        subject: 'Merci pour votre visite 🌸',
        html: thankYouReviewEmail({ firstName: appt.user?.firstName ?? '', serviceType: appt.serviceType ?? '' }),
      });
      sent += 1;
    } catch (e) {
      console.error('send fail', email, e);
    }
  }
  console.log(`[review-emails] ${sent} email(s) envoyé(s) sur ${appts.length} rendez-vous éligible(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
