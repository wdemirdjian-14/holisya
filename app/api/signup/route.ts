export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';
import { ensureReferralCode } from '@/lib/loyalty';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, ref } = body ?? {};
    if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email: email?.toLowerCase?.() ?? '' } });
    if (existing) return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 400 });

    // Parrainage : rattacher au parrain si le code est valide.
    let referredById: string | undefined;
    if (ref) {
      const sponsor = await prisma.user.findUnique({ where: { referralCode: String(ref).toUpperCase() }, select: { id: true } });
      if (sponsor) referredById = sponsor.id;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), password: hashedPassword, firstName: firstName ?? '', lastName: lastName ?? '', phone: phone ?? '', referredById },
    });
    await ensureReferralCode(user.id).catch(() => {});

    // Send welcome email with -15€ discount code
    try {
      const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B312D; font-size: 28px; margin: 0;">Bienvenue chez Holisya</h1>
            <p style="color: #AAB7A0; font-size: 14px; margin-top: 8px;">Bien-être Holistique Féminin</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 12px;">
            <p style="color: #3B312D;">Bonjour ${firstName ?? ''},</p>
            <p style="color: #3B312D;">Nous sommes ravies de vous accueillir dans l'univers Holisya.</p>
            <p style="color: #3B312D;">Pour célébrer votre inscription, voici un code de réduction de <strong>15€</strong> sur votre premier soin :</p>
            <div style="background: #AAB7A0; color: white; text-align: center; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; margin: 20px 0;">BIENVENUE15</div>
            <p style="color: #666; font-size: 13px;">Ce code est valable 3 mois à compter de votre inscription.</p>
          </div>
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">Holisya - Approche holistique du bien-être féminin</p>
        </div>`;
      await sendNotificationEmail({
        subject: 'Bienvenue chez Holisya - Votre code -15€',
        body: htmlBody,
        recipientEmail: email,
      });
    } catch (e) { console.error('Welcome email error:', e); }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'inscription' }, { status: 500 });
  }
}
