export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { dateStrToLocal } from '@/lib/booking';

async function guard() {
  const session = await getServerSession(authOptions);
  return !!(session?.user && (session.user as any)?.role === 'ADMIN');
}

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const [windows, closures] = await Promise.all([
    prisma.availabilityWindow.findMany({ orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] }),
    prisma.availabilityClosure.findMany({ orderBy: { date: 'asc' } }),
  ]);
  return NextResponse.json({ windows, closures });
}

export async function POST(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const d = await req.json();
  if (d?.kind === 'window') {
    if (d?.weekday === undefined || !d?.startTime || !d?.endTime) return NextResponse.json({ error: 'Champs requis' }, { status: 400 });
    const w = await prisma.availabilityWindow.create({ data: { weekday: parseInt(d.weekday), startTime: d.startTime, endTime: d.endTime } });
    return NextResponse.json({ window: w });
  }
  if (d?.kind === 'closure') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d?.date ?? '')) return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
    const date = dateStrToLocal(d.date, 0);
    const c = await prisma.availabilityClosure.upsert({ where: { date }, update: { reason: d?.reason ?? '' }, create: { date, reason: d?.reason ?? '' } });
    return NextResponse.json({ closure: c });
  }
  return NextResponse.json({ error: 'kind invalide' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const kind = req.nextUrl.searchParams.get('kind');
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  if (kind === 'window') await prisma.availabilityWindow.delete({ where: { id } }).catch(() => {});
  else if (kind === 'closure') await prisma.availabilityClosure.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ success: true });
}
