export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { userId, message } = await request.json();
    const user = await prisma.user.findUnique({ where: { id: userId ?? '' } });
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    await sendNotificationEmail({
      notificationId: process.env.NOTIF_ID_APPOINTMENT_REMINDER ?? '',
      subject: 'Message de Holisya',
      body: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 30px;"><h2 style="color: #3B312D;">Message de Holisya</h2><div style="background: white; padding: 20px; border-radius: 12px;"><p style="color: #3B312D;">Bonjour ${user?.firstName ?? ''},</p><p style="color: #3B312D;">${message ?? ''}</p></div><p style="color: #999; font-size: 12px; margin-top: 20px;">Holisya - Bien-être Holistique Féminin</p></div>`,
      recipientEmail: user.email,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
