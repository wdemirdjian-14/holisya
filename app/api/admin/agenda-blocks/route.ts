export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function guard() {
  const session = await getServerSession(authOptions);
  return !!(session?.user && (session.user as any)?.role === 'ADMIN');
}

// GET ?from=YYYY-MM-DD&to=YYYY-MM-DD → blocs sur la plage (bornes incluses)
export async function GET(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');
  const where: any = {};
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) where.date = { ...(where.date ?? {}), gte: new Date(from + 'T00:00:00') };
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) where.date = { ...(where.date ?? {}), lt: new Date(to + 'T23:59:59') };
  const blocks = await prisma.agendaBlock.findMany({ where, orderBy: { date: 'asc' } });
  return NextResponse.json({ blocks });
}

// POST { date: ISO, duration?: number, reason?: string }
export async function POST(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const d = await req.json();
  if (!d?.date) return NextResponse.json({ error: 'Date requise' }, { status: 400 });
  const date = new Date(d.date);
  if (isNaN(date.getTime())) return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  const duration = Math.max(15, parseInt(d?.duration) || 60);
  const block = await prisma.agendaBlock.create({ data: { date, duration, reason: (d?.reason ?? '').toString().slice(0, 200) } });
  return NextResponse.json({ block });
}

// PUT { id, date?: ISO, duration?: number } → déplace / redimensionne un bloc
export async function PUT(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const d = await req.json();
  if (!d?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  const data: any = {};
  if (d?.date) { const date = new Date(d.date); if (isNaN(date.getTime())) return NextResponse.json({ error: 'Date invalide' }, { status: 400 }); data.date = date; }
  if (d?.duration !== undefined) data.duration = Math.max(15, parseInt(d.duration) || 60);
  const block = await prisma.agendaBlock.update({ where: { id: d.id }, data }).catch(() => null);
  if (!block) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ block });
}

export async function DELETE(req: NextRequest) {
  if (!(await guard())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  await prisma.agendaBlock.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ success: true });
}
