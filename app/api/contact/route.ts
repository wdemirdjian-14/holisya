export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';
import { notifyAdmins } from '@/lib/notify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, phone, message } = body ?? {};
    if (!firstName || !phone) return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    await prisma.contactRequest.create({ data: { firstName, phone, message: message ?? '' } });
    await notifyAdmins({ type: 'message', title: 'Nouveau message de contact', body: `${firstName} · ${phone}${message ? ' — ' + message.slice(0, 80) : ''}`, url: '/admin' });
    await sendNotificationEmail({
      notificationId: process.env.NOTIF_ID_CONTACT_FORM_SUBMISSION ?? '',
      subject: `Nouvelle demande de rappel - ${firstName}`,
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 30px;"><h2 style="color: #3B312D;">Nouvelle demande de rappel</h2><div style="background: white; padding: 20px; border-radius: 12px;"><p><strong>Prénom :</strong> ${firstName}</p><p><strong>Téléphone :</strong> ${phone}</p>${message ? `<p><strong>Message :</strong> ${message}</p>` : ''}</div></div>`,
      recipientEmail: 'contact@holisya.fr',
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
