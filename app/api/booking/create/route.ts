export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { getBookingSettings, getSlotsForDate } from '@/lib/booking-server';
import { dateStrToLocal, toMinutes } from '@/lib/booking';
import { notifyBookingCreated } from '@/lib/booking-notify';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Connexion requise', needLogin: true }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';

    const { serviceId, date, time, method } = await request.json();
    if (!serviceId || !date || !time) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });

    const settings = await getBookingSettings();
    if (!settings.onlineBookingEnabled) return NextResponse.json({ error: 'Réservation en ligne indisponible' }, { status: 400 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) return NextResponse.json({ error: 'Prestation introuvable' }, { status: 404 });

    // Le créneau doit toujours être disponible (anti double-réservation / triche).
    const slots = await getSlotsForDate(serviceId, date);
    if (!slots.includes(time)) return NextResponse.json({ error: 'Ce créneau n\'est plus disponible' }, { status: 409 });

    const startDate = dateStrToLocal(date, toMinutes(time));

    // Cliente de confiance (cochée en admin) : aucune empreinte ni paiement exigé.
    const bookingUser = await prisma.user.findUnique({ where: { id: userId }, select: { exemptCardImprint: true } });
    const exempt = !!bookingUser?.exemptCardImprint;
    const needsSecure = settings.requireCardImprint && !exempt;

    const finalStatus = settings.autoConfirm ? 'CONFIRMED' : 'PENDING';

    const appt = await prisma.appointment.create({
      data: { userId, serviceType: service.name, therapist: 'Lamyae', date: startDate, duration: service.duration || 60, status: finalStatus, source: 'online', notes: 'Réservation en ligne' },
    });

    if (needsSecure) {
      const origin = request.headers.get('origin') ?? (process.env.NEXTAUTH_URL ?? '');
      const allowPay = (settings as any).allowOnlinePayment ?? false;
      // Paiement en ligne du prix total (si proposé et choisi par la cliente).
      if (method === 'pay' && allowPay && (service.price ?? 0) > 0) {
        const checkout = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [{
            quantity: 1,
            price_data: { currency: 'eur', unit_amount: Math.round((service.price || 0) * 100), product_data: { name: service.name } },
          }],
          success_url: `${origin}/rendez-vous/confirmation?paid={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/rendez-vous/confirmation?cancelled=${appt.id}`,
          metadata: { type: 'booking_payment', appointmentId: appt.id, userId },
        });
        return NextResponse.json({ requiresPayment: true, url: checkout?.url ?? '', appointmentId: appt.id });
      }
      // Sinon : empreinte bancaire (carte enregistrée, non débitée).
      const checkout = await stripe.checkout.sessions.create({
        mode: 'setup',
        payment_method_types: ['card'],
        success_url: `${origin}/rendez-vous/confirmation?imprint={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/rendez-vous/confirmation?cancelled=${appt.id}`,
        metadata: { type: 'booking_imprint', appointmentId: appt.id, userId },
      });
      return NextResponse.json({ requiresImprint: true, url: checkout?.url ?? '', appointmentId: appt.id });
    }

    await notifyBookingCreated(appt.id);
    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error: any) {
    console.error('Booking create error:', error);
    return NextResponse.json({ error: error?.message ?? 'Erreur' }, { status: 500 });
  }
}
