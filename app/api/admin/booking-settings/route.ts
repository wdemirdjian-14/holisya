export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// URL Planity : https uniquement, vide = lien par défaut.
function cleanPlanityUrl(v: any): string | null | undefined {
  if (v === undefined) return undefined;
  const t = String(v ?? '').trim();
  if (!t) return null;
  try { const u = new URL(t); return u.protocol === 'https:' ? u.toString() : 'INVALID'; } catch { return 'INVALID'; }
}

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
    const planityUrl = cleanPlanityUrl(d?.planityUrl);
    if (planityUrl === 'INVALID') return NextResponse.json({ error: 'Lien Planity invalide (https://… attendu)' }, { status: 400 });
    const num = (v: any, def: number) => (v === undefined || v === null || v === '' ? def : parseInt(v));
    const settings = await prisma.bookingSettings.upsert({
      where: { id: 'global' },
      update: {
        onlineBookingEnabled: d?.onlineBookingEnabled,
        subscriptionsEnabled: d?.subscriptionsEnabled,
        emailWindowStart: d?.emailWindowStart !== undefined ? num(d.emailWindowStart, 8) : undefined,
        emailWindowEnd: d?.emailWindowEnd !== undefined ? num(d.emailWindowEnd, 21) : undefined,
        requireCardImprint: d?.requireCardImprint,
        autoConfirm: d?.autoConfirm,
        slotGranularityMin: d?.slotGranularityMin !== undefined ? num(d.slotGranularityMin, 15) : undefined,
        minNoticeHours: d?.minNoticeHours !== undefined ? num(d.minNoticeHours, 2) : undefined,
        maxAdvanceDays: d?.maxAdvanceDays !== undefined ? num(d.maxAdvanceDays, 60) : undefined,
        breakMinutes: d?.breakMinutes !== undefined ? num(d.breakMinutes, 15) : undefined,
        planityMode: typeof d?.planityMode === 'boolean' ? d.planityMode : undefined,
        planityUrl,
      },
      create: { id: 'global', onlineBookingEnabled: d?.onlineBookingEnabled ?? false, requireCardImprint: d?.requireCardImprint ?? false, autoConfirm: d?.autoConfirm ?? false },
    });
    return NextResponse.json({ settings });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
