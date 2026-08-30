export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const d = await req.json();
    const mood = Math.min(5, Math.max(1, parseInt(d?.mood ?? '3')));
    const entry = await prisma.wellnessEntry.create({ data: { userId, mood, note: (d?.note ?? '').slice(0, 2000), appointmentId: d?.appointmentId ?? '' } });
    return NextResponse.json({ entry });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const entry = await prisma.wellnessEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    await prisma.wellnessEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
