export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { renderGiftCardPng } from '@/lib/gift-card-image';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const email = session?.user?.email ?? '';
    const isAdmin = (session?.user as any)?.role === 'ADMIN';
    if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

    const card = await prisma.giftCard.findUnique({ where: { id } });
    if (!card) return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });

    const owns = card.purchasedById === userId
      || card.receivedById === userId
      || (!!card.recipientEmail && !!email && card.recipientEmail.toLowerCase() === email.toLowerCase());
    if (!owns && !isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const png = await renderGiftCardPng(card);
    return new NextResponse(png as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="carte-cadeau-holisya-${card.code}.png"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error: any) {
    console.error('gift card image error', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
