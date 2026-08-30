export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    const { userId, amount, action } = data ?? {};
    if (!userId || !amount || !action) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    
    const currentCredits = user.credits ?? 0;
    const delta = parseInt(amount);
    let newCredits = currentCredits;
    
    if (action === 'add') {
      newCredits = currentCredits + delta;
    } else if (action === 'remove') {
      newCredits = Math.max(0, currentCredits - delta);
    } else if (action === 'set') {
      newCredits = delta;
    }
    
    const updated = await prisma.user.update({ where: { id: userId }, data: { credits: newCredits } });
    return NextResponse.json({ credits: updated.credits });
  } catch (error: any) {
    console.error('Update credits error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
