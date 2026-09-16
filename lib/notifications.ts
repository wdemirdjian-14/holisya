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

// Version texte simple à partir du HTML (améliore le score anti-spam : multipart/alternative).
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/tr|\/h[1-6])\s*\/?>(?=)/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&laquo;|&raquo;/g, '"')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
}

export async function sendNotificationEmail(opts: {
  notificationId?: string;
  subject: string;
  body: string;
  recipientEmail: string;
  replyTo?: string;
  text?: string;
}) {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM ?? '"Holisya" <contact@holisya.fr>',
      to: opts.recipientEmail,
      subject: opts.subject,
      html: opts.body,
      text: opts.text ?? htmlToText(opts.body),
      replyTo: opts.replyTo,
      headers: {
        'List-Unsubscribe': '<mailto:contact@holisya.fr?subject=Desinscription>, <https://www.holisya.fr/desinscription>',
      },
    });
    return { success: true, messageId: info.messageId };
  } catch (e) {
    console.error('Notification email error:', e);
    return { success: false };
  }
}
