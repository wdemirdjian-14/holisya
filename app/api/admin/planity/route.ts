export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { findOrCreateUserByEmail } from '@/lib/user-invite';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const bookings = await prisma.planityBooking.findMany({ where: { status: 'pending' }, orderBy: { date: 'asc' } });
    return NextResponse.json({ bookings });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

// Crée la fiche cliente + le rendez-vous en 1 clic depuis une réservation Planity.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { id } = await req.json();
    const b = await prisma.planityBooking.findUnique({ where: { id: id ?? '' } });
    if (!b || b.status !== 'pending') return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    if (!b.email) return NextResponse.json({ error: 'Email cliente manquant' }, { status: 400 });

    // Bienvenue déjà envoyée à la capture → on ne renvoie pas d'invitation.
    const { user } = await findOrCreateUserByEmail({ email: b.email, firstName: b.firstName, lastName: b.lastName, phone: b.phone, sendInvite: false });
    const appt = await prisma.appointment.create({
      data: { userId: user.id, serviceType: b.serviceType || 'Soin', therapist: 'Lamyae', date: b.date, duration: b.durationMin, status: 'CONFIRMED', notes: 'Importé depuis Planity' },
    });
    await prisma.planityBooking.update({ where: { id: b.id }, data: { status: 'done', appointmentId: appt.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await prisma.planityBooking.update({ where: { id }, data: { status: 'ignored' } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
