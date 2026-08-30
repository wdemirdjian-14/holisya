export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Fiche client 360° : tout l'historique d'un client.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        appointments: { orderBy: { date: 'desc' }, include: { payments: true } },
        giftCardsPurchased: { orderBy: { createdAt: 'desc' } },
        giftCardsReceived: { orderBy: { createdAt: 'desc' } },
        subscriptions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!user) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });

    const emailLogs = await prisma.emailLog.findMany({ where: { recipientEmail: user.email }, orderBy: { createdAt: 'desc' }, take: 30 });
    const wellness = await prisma.wellnessEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 });

    const totalSpent = user.appointments.reduce((sum, a) => sum + a.payments.reduce((s, p) => s + (p.amount ?? 0), 0), 0);
    const completedCount = user.appointments.filter((a) => a.status === 'COMPLETED').length;
    const lastVisit = user.appointments.find((a) => a.status === 'COMPLETED')?.date ?? null;

    const { password, resetToken, unsubscribeToken, ...safeUser } = user as any;
    return NextResponse.json({ client: safeUser, emailLogs, wellness, stats: { totalSpent, completedCount, lastVisit } });
  } catch (error: any) {
    console.error('Client 360 error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

// Mise à jour des notes privées.
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await prisma.user.update({ where: { id: data.id }, data: { privateNotes: data?.privateNotes ?? '' } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update client notes error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
