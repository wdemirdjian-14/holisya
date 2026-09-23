export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as any)?.role === 'ADMIN';
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const rows = await prisma.segment.findMany({ orderBy: { createdAt: 'desc' } });
  const segments = rows.map((s) => ({ id: s.id, name: s.name, filters: safeParse(s.filters), createdAt: s.createdAt }));
  return NextResponse.json({ segments });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const data = await req.json();
  const name = String(data?.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'Nom de liste requis' }, { status: 400 });
  const filters = JSON.stringify(data?.filters ?? {});
  const segment = data?.id
    ? await prisma.segment.update({ where: { id: data.id }, data: { name, filters } })
    : await prisma.segment.create({ data: { name, filters } });
  return NextResponse.json({ segment: { id: segment.id, name: segment.name, filters: safeParse(segment.filters) } });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await prisma.segment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

function safeParse(s: string) { try { return JSON.parse(s || '{}'); } catch { return {}; } }
