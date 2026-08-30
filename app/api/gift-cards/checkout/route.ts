export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const body = await request.json();
    const { amount, recipientName, recipientEmail, personalMessage, careType, promoCode } = body ?? {};
    if (!amount || amount < 10) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });

    let finalAmount = amount;
    let promoUsed = '';
    if (promoCode) {
      const dc = await prisma.discountCode.findUnique({ where: { code: promoCode } });
      if (dc && dc.isActive && (!dc.expiresAt || dc.expiresAt > new Date()) && (dc.maxUses === 0 || dc.currentUses < dc.maxUses)) {
        if (dc.type === 'percentage') finalAmount = amount * (1 - dc.value / 100);
        else finalAmount = Math.max(0, amount - dc.value);
        promoUsed = promoCode;
      }
    }

    const origin = request.headers.get('origin') ?? '';
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'eur', product_data: { name: `Carte Cadeau Holisya - ${amount}€`, description: `Pour ${recipientName || 'un proche'}` }, unit_amount: Math.round(finalAmount * 100) }, quantity: 1 }],
      success_url: `${origin}/cartes-cadeaux/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cartes-cadeaux`,
      metadata: { type: 'gift_card', userId: (session.user as any)?.id ?? '', amount: String(amount), recipientName: recipientName ?? '', recipientEmail: recipientEmail ?? '', personalMessage: personalMessage ?? '', careType: careType ?? '', promoCode: promoUsed },
    });

    return NextResponse.json({ url: checkoutSession?.url ?? '' });
  } catch (error: any) {
    console.error('Gift card checkout error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
