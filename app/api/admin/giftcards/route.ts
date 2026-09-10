export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { findOrCreateUserByEmail } from '@/lib/user-invite';
import { deductGiftCardBalance } from '@/lib/gift-card';
import { sendNotificationEmail } from '@/lib/notifications';
import { giftCardEmail } from '@/lib/emails';

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
    // OFFERT = carte offerte par l'institut (ne pas encaisser)
    if (!['CASH', 'CARD', 'GIFT_CARD', 'OFFERT'].includes(data?.paymentMethod)) return NextResponse.json({ error: 'Mode d\'encaissement invalide' }, { status: 400 });

    const { user } = await findOrCreateUserByEmail({
      email: data.purchaserEmail,
      firstName: data?.purchaserFirstName ?? '',
      lastName: data?.purchaserLastName ?? '',
    });

    // Validité 6 mois
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    // Si le destinataire a déjà un compte, on lui associe la carte automatiquement.
    let receivedById: string | undefined;
    const recipientEmail = (data?.recipientEmail ?? '').trim();
    if (recipientEmail) {
      const existing = await prisma.user.findUnique({ where: { email: recipientEmail.toLowerCase() }, select: { id: true } }).catch(() => null);
      if (existing) receivedById = existing.id;
    }

    const giftCard = await prisma.giftCard.create({
      data: {
        code: generateGiftCardCode(),
        amount,
        remainingAmount: amount,
        purchasedById: user.id,
        receivedById,
        recipientName: data?.recipientName ?? '',
        recipientEmail,
        personalMessage: data?.personalMessage ?? '',
        careType: data?.careType ?? '',
        paymentMethod: data.paymentMethod,
        expiresAt,
      },
    });

    // Envoi de la jolie carte au destinataire si un email est fourni.
    if (recipientEmail) {
      await sendNotificationEmail({
        subject: 'Vous avez reçu une carte cadeau Holisya 🎁',
        recipientEmail,
        replyTo: 'contact@holisya.fr',
        body: giftCardEmail({
          recipientName: giftCard.recipientName,
          amount, code: giftCard.code, expiresAt,
          personalMessage: giftCard.personalMessage,
        }),
      }).catch((e) => console.error('gift card email error', e));
    }

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
