export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { notifyBookingCreated } from '@/lib/booking-notify';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'Session manquante' }, { status: 400 });

    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const meta = checkout?.metadata ?? {};
    if (meta.type !== 'booking_imprint' || !meta.appointmentId) return NextResponse.json({ error: 'Session invalide' }, { status: 400 });

    const appt = await prisma.appointment.findUnique({ where: { id: meta.appointmentId } });
    if (!appt || appt.userId !== userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    if (appt.imprintSetupId) return NextResponse.json({ success: true, status: appt.status });

    const setupIntentId = typeof checkout.setup_intent === 'string' ? checkout.setup_intent : (checkout.setup_intent as any)?.id ?? '';
    if (!setupIntentId) return NextResponse.json({ error: 'Empreinte non finalisée' }, { status: 400 });

    await prisma.appointment.update({ where: { id: appt.id }, data: { imprintSetupId: setupIntentId } });
    await notifyBookingCreated(appt.id);
    return NextResponse.json({ success: true, status: appt.status });
  } catch (error: any) {
    console.error('Imprint complete error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
