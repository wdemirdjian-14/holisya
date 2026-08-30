export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const settings = await prisma.agendaSettings.upsert({ where: { id: 'global' }, update: {}, create: { id: 'global' } });
    return NextResponse.json({ settings });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    const settings = await prisma.agendaSettings.upsert({
      where: { id: 'global' },
      update: {
        openDays: data?.openDays ?? undefined,
        openTime: data?.openTime ?? undefined,
        closeTime: data?.closeTime ?? undefined,
        breakMinutes: data?.breakMinutes !== undefined ? parseInt(data.breakMinutes) : undefined,
      },
      create: {
        id: 'global',
        openDays: data?.openDays ?? '1,2,3,4,5',
        openTime: data?.openTime ?? '09:00',
        closeTime: data?.closeTime ?? '18:00',
        breakMinutes: data?.breakMinutes !== undefined ? parseInt(data.breakMinutes) : 15,
      },
    });
    return NextResponse.json({ settings });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
