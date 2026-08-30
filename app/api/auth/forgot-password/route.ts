export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase?.() ?? '' } });
    if (!user) return NextResponse.json({ success: true, message: 'Si un compte existe, un email a été envoyé.' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
    const appUrl = process.env.NEXTAUTH_URL ?? '';
    const resetLink = `${appUrl}/reinitialisation?token=${resetToken}`;
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 40px 30px;">
        <h1 style="color: #3B312D; text-align: center;">Réinitialisation de mot de passe</h1>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <p style="color: #3B312D;">Bonjour ${user?.firstName ?? ''},</p>
          <p style="color: #3B312D;">Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <div style="text-align: center; margin: 25px 0;"><a href="${resetLink}" style="background: #C98F79; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Réinitialiser mon mot de passe</a></div>
          <p style="color: #999; font-size: 13px;">Ce lien expire dans 1 heure.</p>
        </div>
      </div>`;
    await sendNotificationEmail({
      subject: 'Holisya - Réinitialisation de votre mot de passe',
      body: htmlBody,
      recipientEmail: user.email,
    });
    return NextResponse.json({ success: true, message: 'Si un compte existe, un email a été envoyé.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
