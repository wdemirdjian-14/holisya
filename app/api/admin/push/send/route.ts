export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendPush, pushConfigured } from '@/lib/push';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const count = await prisma.pushSubscription.count();
  return NextResponse.json({ enabled: pushConfigured(), subscribers: count });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    if (!pushConfigured()) return NextResponse.json({ error: 'Notifications push non configurées sur le serveur' }, { status: 400 });
    const d = await req.json();
    if (!d?.title || !d?.body) return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 });
    const result = await sendPush({ title: d.title, body: d.body, url: d?.url || '/' });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Push send error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
