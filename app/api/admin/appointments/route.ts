export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { findOrCreateUserByEmail } from '@/lib/user-invite';
import { notifyUser } from '@/lib/notify';
import { sendNotificationEmail } from '@/lib/notifications';
import { thankYouReviewEmail } from '@/lib/emails';

function fmt(date: Date) { return new Date(date).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }); }

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const body = await request.json();
    if (!body?.userEmail) return NextResponse.json({ error: 'Client requis' }, { status: 400 });
    const { user } = await findOrCreateUserByEmail({ email: body.userEmail, firstName: body?.userFirstName ?? '', lastName: body?.userLastName ?? '' });
    const apt = await prisma.appointment.create({ data: { userId: user.id, serviceType: body?.serviceType ?? '', therapist: body?.therapist ?? 'Lamyae', date: new Date(body?.date ?? new Date()), status: body?.status ?? 'PENDING', duration: body?.duration ?? 60 } });
    await notifyUser(user.id, { type: 'appointment', title: 'Nouveau rendez-vous', body: `${apt.serviceType || 'Soin'} — ${fmt(apt.date)}`, url: '/espace-membre/rendez-vous' });
    return NextResponse.json({ appointment: apt });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const body = await request.json();
    let userId: string | undefined;
    if (body?.userEmail) {
      const { user } = await findOrCreateUserByEmail({ email: body.userEmail, firstName: body?.userFirstName ?? '', lastName: body?.userLastName ?? '' });
      userId = user.id;
    }
    const updated = await prisma.appointment.update({
      where: { id: body?.id ?? '' },
      data: { userId, serviceType: body?.serviceType, status: body?.status, date: body?.date ? new Date(body.date) : undefined, duration: body?.duration !== undefined ? parseInt(body.duration) : undefined, clientRequest: '', clientRequestNote: '' },
      include: { user: { select: { email: true, firstName: true, emailOptOut: true } } },
    });
    // Notifie la cliente du changement (statut / date).
    const statusLabel: Record<string, string> = { CONFIRMED: 'confirmé', CANCELLED: 'annulé', COMPLETED: 'terminé', PENDING: 'en attente' };
    await notifyUser(updated.userId, { type: 'appointment', title: 'Rendez-vous mis à jour', body: `${updated.serviceType || 'Soin'} — ${fmt(updated.date)} (${statusLabel[updated.status] ?? updated.status})`, url: '/espace-membre/rendez-vous' });

    // Dès qu'un RDV est marqué "terminé" : email de remerciement + invitation à laisser un avis Google (une seule fois).
    if (updated.status === 'COMPLETED' && !updated.reviewEmailSent && updated.user?.email && !updated.user?.emailOptOut) {
      await prisma.appointment.update({ where: { id: updated.id }, data: { reviewEmailSent: true } });
      sendNotificationEmail({
        subject: 'Merci pour votre visite 🌸',
        recipientEmail: updated.user.email,
        replyTo: 'contact@holisya.fr',
        body: thankYouReviewEmail({ firstName: updated.user.firstName ?? '', serviceType: updated.serviceType ?? '' }),
      }).catch((e) => console.error('review email error', e));
    }
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    await prisma.appointment.delete({ where: { id: searchParams.get('id') ?? '' } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
