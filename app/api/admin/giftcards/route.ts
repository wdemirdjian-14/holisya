export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { findOrCreateUserByEmail } from '@/lib/user-invite';
import { deductGiftCardBalance } from '@/lib/gift-card';

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'HOLISYA-';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += `-${new Date().getFullYear()}`;
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    const amount = parseFloat(data?.amount ?? '0');
    if (!data?.purchaserEmail || !amount || amount <= 0) return NextResponse.json({ error: 'Email acheteur et montant requis' }, { status: 400 });
    if (!['CASH', 'CARD', 'GIFT_CARD'].includes(data?.paymentMethod)) return NextResponse.json({ error: 'Mode d\'encaissement invalide' }, { status: 400 });

    const { user } = await findOrCreateUserByEmail({
      email: data.purchaserEmail,
      firstName: data?.purchaserFirstName ?? '',
      lastName: data?.purchaserLastName ?? '',
    });

    const giftCard = await prisma.giftCard.create({
      data: {
        code: generateGiftCardCode(),
        amount,
        remainingAmount: amount,
        purchasedById: user.id,
        recipientName: data?.recipientName ?? '',
        recipientEmail: data?.recipientEmail ?? '',
        personalMessage: data?.personalMessage ?? '',
        careType: data?.careType ?? '',
        paymentMethod: data.paymentMethod,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({ giftCard });
  } catch (error: any) {
    console.error('Create gift card error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    if (data?.deductAmount !== undefined) {
      const giftCard = await deductGiftCardBalance({ id: data.id, amount: parseFloat(data.deductAmount) });
      return NextResponse.json({ giftCard });
    }

    const giftCard = await prisma.giftCard.update({
      where: { id: data.id },
      data: {
        status: data?.status,
        remainingAmount: data?.status === 'USED' ? 0 : undefined,
      },
    });
    return NextResponse.json({ giftCard });
  } catch (error: any) {
    console.error('Update gift card error:', error);
    return NextResponse.json({ error: error?.message ?? 'Erreur' }, { status: 400 });
  }
}
