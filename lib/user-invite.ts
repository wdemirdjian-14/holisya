import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';

export async function findOrCreateUserByEmail(opts: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  sendInvite?: boolean;
}) {
  const email = opts.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { user: existing, created: false };

  const tempPassword = crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: opts.firstName ?? '',
      lastName: opts.lastName ?? '',
      phone: opts.phone ?? '',
      source: 'import',
      resetToken,
      resetTokenExpiry,
    },
  });

  if (opts.sendInvite !== false) {
    const appUrl = process.env.NEXTAUTH_URL ?? '';
    const activationLink = `${appUrl}/reinitialisation?token=${resetToken}`;
    await sendNotificationEmail({
      subject: 'Holisya - Votre espace client vous attend',
      recipientEmail: email,
      body: `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 40px 30px;">
        <h1 style="color: #3B312D; text-align: center;">Bienvenue chez Holisya</h1>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <p style="color: #3B312D;">Bonjour ${opts.firstName ?? ''},</p>
          <p style="color: #3B312D;">Un espace client a été créé pour vous. Cliquez sur le lien ci-dessous pour choisir votre mot de passe :</p>
          <div style="text-align: center; margin: 25px 0;"><a href="${activationLink}" style="background: #C98F79; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Définir mon mot de passe</a></div>
          <p style="color: #999; font-size: 13px;">Ce lien expire dans 7 jours.</p>
        </div>
      </div>`,
    });
  }

  return { user, created: true };
}
