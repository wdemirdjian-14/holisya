export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { sendNotificationEmail } from '@/lib/notifications';
import { notifyAdmins } from '@/lib/notify';
import crypto from 'crypto';

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'HOLISYA-';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += `-${new Date().getFullYear()}`;
  return code;
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'Session manquante' }, { status: 400 });

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkoutSession?.payment_status !== 'paid') return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 });

    const meta = checkoutSession?.metadata ?? {};
    const existing = await prisma.giftCard.findFirst({ where: { stripePaymentId: sessionId } });
    if (existing) return NextResponse.json({ giftCard: existing });

    const code = generateGiftCardCode();
    const amount = parseFloat(meta.amount ?? '0');

    const giftCard = await prisma.giftCard.create({
      data: {
        code, amount, remainingAmount: amount,
        purchasedById: meta.userId ?? '', recipientEmail: meta.recipientEmail ?? '',
        recipientName: meta.recipientName ?? '', personalMessage: meta.personalMessage ?? '',
        careType: meta.careType ?? '', stripePaymentId: sessionId,
        promoCodeUsed: meta.promoCode ?? '',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    if (meta.promoCode) {
      await prisma.discountCode.update({ where: { code: meta.promoCode }, data: { currentUses: { increment: 1 } } }).catch(() => {});
    }

    // Notify admin
    await sendNotificationEmail({
      notificationId: process.env.NOTIF_ID_NEW_ORDER_NOTIFICATION ?? '',
      subject: `Nouvelle carte cadeau - ${amount}€`,
      body: `<div style="font-family: Arial; max-width: 600px; margin: 0 auto; background: #F8F4EF; padding: 30px;"><h2 style="color: #3B312D;">Nouvelle carte cadeau vendue</h2><div style="background: white; padding: 20px; border-radius: 12px;"><p><strong>Montant :</strong> ${amount}€</p><p><strong>Code :</strong> ${code}</p><p><strong>Destinataire :</strong> ${meta.recipientName ?? 'N/A'}</p></div></div>`,
      recipientEmail: 'contact@holisya.fr',
    });
    await notifyAdmins({ type: 'giftcard', title: `Nouvelle carte cadeau — ${amount}€`, body: `Code ${code}${meta.recipientName ? ' · pour ' + meta.recipientName : ''}`, url: '/admin' });

    return NextResponse.json({ giftCard });
  } catch (error: any) {
    console.error('Gift card fulfill error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
