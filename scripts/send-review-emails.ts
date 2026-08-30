import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

function emailBody(firstName: string, link: string, service: string) {
  return `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 40px 30px;">
    <h1 style="color: #3B312D; text-align: center; font-size: 24px;">Votre avis compte 🌸</h1>
    <div style="background: white; padding: 30px; border-radius: 12px;">
      <p style="color: #3B312D;">Bonjour ${firstName || ''},</p>
      <p style="color: #3B312D;">Nous espérons que vous avez profité de votre soin${service ? ` « ${service} »` : ''} chez Holisya.</p>
      <p style="color: #3B312D;">Votre ressenti nous aide à vous offrir des rituels toujours plus adaptés. Prendriez-vous un instant pour nous le partager ?</p>
      <div style="text-align: center; margin: 25px 0;"><a href="${link}" style="background: #C98F79; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Donner mon avis</a></div>
    </div>
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">Holisya — Approche holistique du bien-être féminin</p>
  </div>`;
}

async function main() {
  const appUrl = process.env.NEXTAUTH_URL ?? '';
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
    const token = crypto.randomBytes(20).toString('hex');
    await prisma.appointment.update({ where: { id: appt.id }, data: { reviewToken: token, reviewEmailSent: true } });
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? '"Holisya" <contact@holisya.fr>',
        to: email,
        subject: 'Comment s\'est passé votre soin ? 🌸',
        html: emailBody(appt.user?.firstName ?? '', `${appUrl}/avis?t=${token}`, appt.serviceType ?? ''),
      });
      sent += 1;
    } catch (e) {
      console.error('send fail', email, e);
    }
  }
  console.log(`[review-emails] ${sent} email(s) envoyé(s) sur ${appts.length} rendez-vous éligible(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
