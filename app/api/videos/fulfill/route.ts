export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// Valide le paiement Stripe d'une vidéo et débloque l'accès à vie.
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { sessionId } = await request.json();
    if (!sessionId) return NextResponse.json({ error: 'Session manquante' }, { status: 400 });

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (checkoutSession?.payment_status !== 'paid') return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 });

    const meta = checkoutSession?.metadata ?? {};
    if (meta.type !== 'video_purchase' || !meta.videoId || !meta.userId) return NextResponse.json({ error: 'Session invalide' }, { status: 400 });

    const access = await prisma.videoAccess.upsert({
      where: { userId_videoId: { userId: meta.userId, videoId: meta.videoId } },
      update: {},
      create: { userId: meta.userId, videoId: meta.videoId, source: 'purchase', stripePaymentId: sessionId },
    });
    return NextResponse.json({ success: true, access });
  } catch (error: any) {
    console.error('Video fulfill error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
