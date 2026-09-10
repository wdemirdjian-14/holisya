export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Associe une carte cadeau (par son code) au compte de la cliente connectée.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';

    const { code } = await req.json();
    const clean = String(code ?? '').trim().toUpperCase();
    if (!clean) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

    const card = await prisma.giftCard.findUnique({ where: { code: clean } });
    if (!card) return NextResponse.json({ error: 'Aucune carte cadeau ne correspond à ce code' }, { status: 404 });
    if (card.status === 'EXPIRED' || (card.expiresAt && new Date(card.expiresAt) < new Date())) {
      return NextResponse.json({ error: 'Cette carte cadeau est expirée' }, { status: 400 });
    }
    if (card.receivedById && card.receivedById !== userId) {
      return NextResponse.json({ error: 'Cette carte est déjà associée à un autre compte' }, { status: 400 });
    }
    if (card.receivedById === userId) {
      return NextResponse.json({ giftCard: card, alreadyLinked: true });
    }

    const updated = await prisma.giftCard.update({ where: { id: card.id }, data: { receivedById: userId } });
    return NextResponse.json({ giftCard: updated });
  } catch (error: any) {
    console.error('Associate gift card error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
