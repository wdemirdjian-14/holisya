export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as any)?.role === 'ADMIN';
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const list = req.nextUrl.searchParams.get('list') ?? undefined;
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: list ? { list } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ subscribers, count: subscribers.length });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  await prisma.newsletterSubscriber.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
