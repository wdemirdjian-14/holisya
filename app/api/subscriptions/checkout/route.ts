export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

const planPrices: Record<string, { monthly: number; quarterly: number; credits: number }> = {
  'Essentiel': { monthly: 9900, quarterly: 8910, credits: 1 },
  'Harmonie': { monthly: 17900, quarterly: 16110, credits: 2 },
  'Transformation': { monthly: 32900, quarterly: 29610, credits: 4 },
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { planName, billingCycle } = await request.json();
    const plan = planPrices[planName ?? ''];
    if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });

    const origin = request.headers.get('origin') ?? '';
    const unitAmount = billingCycle === 'quarterly' ? plan.quarterly : plan.monthly;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price_data: { currency: 'eur', product_data: { name: `Abonnement ${planName}` }, unit_amount: unitAmount, recurring: { interval: 'month', interval_count: billingCycle === 'quarterly' ? 3 : 1 } }, quantity: 1 }],
      success_url: `${origin}/abonnements/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/abonnements`,
      metadata: { type: 'subscription', userId: (session.user as any)?.id ?? '', planName: planName ?? '', billingCycle: billingCycle ?? 'monthly', credits: String(plan.credits) },
    });

    return NextResponse.json({ url: checkoutSession?.url ?? '' });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
