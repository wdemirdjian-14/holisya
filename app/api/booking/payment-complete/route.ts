export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { onPaymentRecorded } from '@/lib/loyalty';
import { notifyBookingCreated, notifyPaymentReceived } from '@/lib/booking-notify';

// Finalise un paiement en ligne (prix total) : enregistre l'encaissement (CB) et confirme le RDV.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'Session manquante' }, { status: 400 });

    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const meta = checkout?.metadata ?? {};
    if (meta.type !== 'booking_payment' || !meta.appointmentId) return NextResponse.json({ error: 'Session invalide' }, { status: 400 });
    if (checkout.payment_status !== 'paid') return NextResponse.json({ error: 'Paiement non abouti' }, { status: 400 });

    const appt = await prisma.appointment.findUnique({ where: { id: meta.appointmentId } });
    if (!appt || appt.userId !== userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    // Idempotence : si déjà traité, on renvoie l'état sans re-créer d'encaissement.
    if (appt.onlinePaymentRef) return NextResponse.json({ success: true, status: appt.status });

    const amount = (checkout.amount_total ?? 0) / 100;
    const paymentIntentId = typeof checkout.payment_intent === 'string' ? checkout.payment_intent : (checkout.payment_intent as any)?.id ?? sessionId;

    await prisma.appointment.update({ where: { id: appt.id }, data: { onlinePaymentRef: paymentIntentId, status: 'CONFIRMED' } });
    await prisma.payment.create({ data: { appointmentId: appt.id, method: 'CARD', amount, notes: 'Payé en ligne (Stripe)' } });
    if (appt.userId) await onPaymentRecorded(appt.userId, amount).catch((e) => console.error('loyalty error', e));

    await notifyBookingCreated(appt.id);
    await notifyPaymentReceived(appt.id, amount, 'ONLINE');
    return NextResponse.json({ success: true, status: 'CONFIRMED' });
  } catch (error: any) {
    console.error('Payment complete error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
