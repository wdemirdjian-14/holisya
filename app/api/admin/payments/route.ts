export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deductGiftCardBalance } from '@/lib/gift-card';
import { onPaymentRecorded } from '@/lib/loyalty';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.appointmentId || !data?.method || !data?.amount) return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    if (!['CASH', 'CARD', 'GIFT_CARD'].includes(data.method)) return NextResponse.json({ error: 'Mode de paiement invalide' }, { status: 400 });
    const amount = parseFloat(data.amount);

    if (data.method === 'GIFT_CARD') {
      if (!data?.giftCardCode) return NextResponse.json({ error: 'Carte cadeau requise' }, { status: 400 });
      await deductGiftCardBalance({ code: data.giftCardCode, amount });
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId: data.appointmentId,
        method: data.method,
        amount,
        giftCardCode: data?.giftCardCode ?? '',
        notes: data?.notes ?? '',
      },
    });

    // Fidélité : points + récompense parrainage au 1er paiement du filleul.
    const appt = await prisma.appointment.findUnique({ where: { id: data.appointmentId }, select: { userId: true } });
    if (appt?.userId) await onPaymentRecorded(appt.userId, amount).catch((e) => console.error('loyalty error', e));

    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: error?.message ?? 'Erreur' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await prisma.payment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete payment error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
