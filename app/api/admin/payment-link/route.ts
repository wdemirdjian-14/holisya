export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { sendNotificationEmail } from '@/lib/notifications';
import { paymentLinkEmail } from '@/lib/emails';

// Crée un lien de paiement Stripe (montant libre) et l'envoie par email.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { email, amount, label, firstName } = await req.json();
    const amt = Number(amount);
    if (!email || !amt || amt <= 0) return NextResponse.json({ error: 'Email et montant requis' }, { status: 400 });

    const price = await stripe.prices.create({
      unit_amount: Math.round(amt * 100),
      currency: 'eur',
      product_data: { name: (label && String(label).trim()) || 'Paiement Holisya' },
    });
    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { type: 'admin_payment_link' },
    });

    await sendNotificationEmail({
      subject: 'Votre lien de paiement Holisya 🌸',
      recipientEmail: String(email),
      replyTo: 'contact@holisya.fr',
      body: paymentLinkEmail({ firstName: firstName ? String(firstName) : '', label: (label && String(label).trim()) || 'Paiement', amount: amt, url: link.url }),
    });

    return NextResponse.json({ success: true, url: link.url });
  } catch (error: any) {
    console.error('Payment link error:', error);
    return NextResponse.json({ error: error?.message ?? 'Erreur' }, { status: 500 });
  }
}
