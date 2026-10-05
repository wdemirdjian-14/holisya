export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';
import crypto from 'crypto';

// Envoie un lien d'activation (choix du mot de passe) à un client importé — à la demande.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.email) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await prisma.user.update({ where: { id }, data: { resetToken, resetTokenExpiry } });

    const appUrl = process.env.NEXTAUTH_URL ?? 'https://www.holisya.fr';
    const activationLink = `${appUrl}/reinitialisation?token=${resetToken}`;
    const result = await sendNotificationEmail({
      subject: 'Activez votre espace client Holisya 🌸',
      recipientEmail: user.email,
      replyTo: 'contact@holisya.fr',
      body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#F8F4EF;padding:32px 16px;color:#3B312D;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:30px 28px;">
          <h1 style="font-family:Georgia,serif;font-size:22px;text-align:center;margin:0 0 16px;">Votre espace client Holisya</h1>
          <p>Bonjour ${user.firstName ?? ''},</p>
          <p>Vous pouvez activer votre espace client Holisya pour suivre vos rendez-vous, vos cartes cadeaux et vos avantages. Cliquez ci-dessous pour choisir votre mot de passe :</p>
          <div style="text-align:center;margin:24px 0;"><a href="${activationLink}" style="background:#C98F79;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Activer mon espace</a></div>
          <p style="color:#8b807a;font-size:13px;">Ce lien est valable 14 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
        </div>
      </div>`,
    });
    if (result?.success === false) return NextResponse.json({ error: "L'email n'a pas pu être envoyé" }, { status: 500 });
    return NextResponse.json({ success: true, email: user.email });
  } catch (error: any) {
    console.error('activate client error', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
