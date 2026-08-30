export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const settings = await prisma.bookingSettings.upsert({ where: { id: 'global' }, update: {}, create: { id: 'global' } });
    return NextResponse.json({ settings });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const d = await req.json();
    const num = (v: any, def: number) => (v === undefined || v === null || v === '' ? def : parseInt(v));
    const settings = await prisma.bookingSettings.upsert({
      where: { id: 'global' },
      update: {
        onlineBookingEnabled: d?.onlineBookingEnabled,
        requireCardImprint: d?.requireCardImprint,
        autoConfirm: d?.autoConfirm,
        slotGranularityMin: d?.slotGranularityMin !== undefined ? num(d.slotGranularityMin, 15) : undefined,
        minNoticeHours: d?.minNoticeHours !== undefined ? num(d.minNoticeHours, 2) : undefined,
        maxAdvanceDays: d?.maxAdvanceDays !== undefined ? num(d.maxAdvanceDays, 60) : undefined,
        breakMinutes: d?.breakMinutes !== undefined ? num(d.breakMinutes, 15) : undefined,
      },
      create: { id: 'global', onlineBookingEnabled: d?.onlineBookingEnabled ?? false, requireCardImprint: d?.requireCardImprint ?? false, autoConfirm: d?.autoConfirm ?? false },
    });
    return NextResponse.json({ settings });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
