export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/notifications';
import { notifyAdmins } from '@/lib/notify';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const d = await req.json();
    if (!d?.appointmentId || !['cancel', 'reschedule'].includes(d?.type)) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });

    const appt = await prisma.appointment.findUnique({ where: { id: d.appointmentId }, include: { user: { select: { firstName: true, lastName: true, email: true } } } });
    if (!appt || appt.userId !== userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    if (['CANCELLED', 'COMPLETED'].includes(appt.status)) return NextResponse.json({ error: 'Ce rendez-vous ne peut plus être modifié' }, { status: 400 });

    await prisma.appointment.update({ where: { id: appt.id }, data: { clientRequest: d.type, clientRequestNote: (d?.note ?? '').slice(0, 500) } });

    const label = d.type === 'cancel' ? 'annulation' : 'report';
    await notifyAdmins({ type: 'appointment', title: `Demande de ${label}`, body: `${appt.user?.firstName ?? ''} ${appt.user?.lastName ?? ''} — ${appt.serviceType} le ${new Date(appt.date).toLocaleDateString('fr-FR')}`, url: '/admin' });
    await sendNotificationEmail({
      subject: `Demande de ${label} — ${appt.user?.firstName ?? ''} ${appt.user?.lastName ?? ''}`,
      recipientEmail: process.env.SMTP_USER || 'contact@holisya.fr',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 30px;">
        <h2 style="color: #3B312D;">Demande de ${label}</h2>
        <div style="background: white; padding: 20px; border-radius: 12px;">
          <p><strong>Cliente :</strong> ${appt.user?.firstName ?? ''} ${appt.user?.lastName ?? ''} (${appt.user?.email ?? ''})</p>
          <p><strong>Soin :</strong> ${appt.serviceType}</p>
          <p><strong>Le :</strong> ${new Date(appt.date).toLocaleString('fr-FR')}</p>
          ${d?.note ? `<p><strong>Message :</strong> ${d.note}</p>` : ''}
        </div>
        <p style="color:#999;font-size:12px;margin-top:16px;">Retrouvez cette demande dans l'onglet Rendez-vous de votre administration.</p>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Appointment request error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
