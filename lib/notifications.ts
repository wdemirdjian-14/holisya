import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendNotificationEmail(opts: {
  notificationId?: string;
  subject: string;
  body: string;
  recipientEmail: string;
  replyTo?: string;
}) {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM ?? '"Holisya" <contact@holisya.fr>',
      to: opts.recipientEmail,
      subject: opts.subject,
      html: opts.body,
      replyTo: opts.replyTo,
    });
    return { success: true, messageId: info.messageId };
  } catch (e) {
    console.error('Notification email error:', e);
    return { success: false };
  }
}
