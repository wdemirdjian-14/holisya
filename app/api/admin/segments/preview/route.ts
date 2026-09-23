export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { computeSegment } from '@/lib/segments';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const data = await req.json();
  const clients = await computeSegment(data?.filters ?? {});
  return NextResponse.json({ count: clients.length, ids: clients.map((c) => c.id), clients });
}
