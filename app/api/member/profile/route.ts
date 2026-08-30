export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const profile = await prisma.user.findUnique({ where: { id: (session.user as any)?.id ?? '' }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, photoUrl: true, carePreferences: true, credits: true } });
    return NextResponse.json({ profile });
  } catch { return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const body = await request.json();
    await prisma.user.update({ where: { id: (session.user as any)?.id ?? '' }, data: { firstName: body?.firstName ?? '', lastName: body?.lastName ?? '', phone: body?.phone ?? '', carePreferences: body?.carePreferences ?? '' } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
