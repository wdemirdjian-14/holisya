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

    const { serviceId, date, time } = await request.json();
    if (!serviceId || !date || !time) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });

    const settings = await getBookingSettings();
    if (!settings.onlineBookingEnabled) return NextResponse.json({ error: 'Réservation en ligne indisponible' }, { status: 400 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) return NextResponse.json({ error: 'Prestation introuvable' }, { status: 404 });

    // Le créneau doit toujours être disponible (anti double-réservation / triche).
    const slots = await getSlotsForDate(serviceId, date);
    if (!slots.includes(time)) return NextResponse.json({ error: 'Ce créneau n\'est plus disponible' }, { status: 409 });

    const startDate = dateStrToLocal(date, toMinutes(time));
    const priorCount = await prisma.appointment.count({ where: { userId } });
    const isNewClient = priorCount === 0;

    const finalStatus = settings.autoConfirm ? 'CONFIRMED' : 'PENDING';

    const appt = await prisma.appointment.create({
      data: { userId, serviceType: service.name, therapist: 'Lamyae', date: startDate, duration: service.duration || 60, status: finalStatus, source: 'online', notes: 'Réservation en ligne' },
    });

    // Empreinte bancaire pour les nouveaux clients (carte enregistrée, non débitée).
    if (settings.requireCardImprint && isNewClient) {
      const origin = request.headers.get('origin') ?? (process.env.NEXTAUTH_URL ?? '');
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
