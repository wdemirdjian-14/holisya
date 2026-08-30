export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const { recipientEmail, amount, message } = await request.json();
    if (!recipientEmail || !amount || amount < 1) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    const sender = await prisma.user.findUnique({ where: { id: userId } });
    if (!sender || (sender.credits ?? 0) < amount) return NextResponse.json({ error: 'Crédits insuffisants' }, { status: 400 });
    const receiver = await prisma.user.findUnique({ where: { email: recipientEmail?.toLowerCase?.() ?? '' } });
    if (!receiver) return NextResponse.json({ error: 'Destinataire non trouvé' }, { status: 404 });
    if (receiver.id === userId) return NextResponse.json({ error: 'Impossible de transférer à vous-même' }, { status: 400 });
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { credits: { decrement: amount } } }),
      prisma.user.update({ where: { id: receiver.id }, data: { credits: { increment: amount } } }),
      prisma.creditTransfer.create({ data: { senderId: userId, receiverId: receiver.id, amount, message: message ?? '' } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
