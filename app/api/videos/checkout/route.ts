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
    const userId = (session.user as any)?.id ?? '';
    const { videoId } = await request.json();
    const video = await prisma.videoContent.findUnique({ where: { id: videoId ?? '' } });
    if (!video || !video.isPublished) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });
    if (video.priceCents <= 0) return NextResponse.json({ error: 'Cette vidéo n\'est pas à l\'achat' }, { status: 400 });

    const existing = await prisma.videoAccess.findUnique({ where: { userId_videoId: { userId, videoId: video.id } } });
    if (existing) return NextResponse.json({ error: 'Vous possédez déjà cette vidéo' }, { status: 400 });

    const origin = request.headers.get('origin') ?? '';
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'eur', product_data: { name: `Vidéo — ${video.title}` }, unit_amount: video.priceCents }, quantity: 1 }],
      success_url: `${origin}/espace-membre/videos?purchase={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/espace-membre/videos`,
      metadata: { type: 'video_purchase', userId, videoId: video.id },
    });
    return NextResponse.json({ url: checkoutSession?.url ?? '' });
  } catch (error: any) {
    console.error('Video checkout error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
