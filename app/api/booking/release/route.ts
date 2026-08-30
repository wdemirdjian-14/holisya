export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Libère (annule) un créneau réservé mais dont l'empreinte n'a pas été finalisée.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const { appointmentId } = await request.json();
    if (!appointmentId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (appt && appt.userId === userId && appt.status === 'PENDING' && appt.source === 'online' && !appt.imprintSetupId) {
      await prisma.appointment.delete({ where: { id: appt.id } });
    }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: true }); }
}
