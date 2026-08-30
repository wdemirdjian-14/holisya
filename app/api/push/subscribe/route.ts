export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? '';
    const sub = await req.json();
    const endpoint = sub?.endpoint;
    const p256dh = sub?.keys?.p256dh;
    const auth = sub?.keys?.auth;
    if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: 'Abonnement invalide' }, { status: 400 });

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { userId, p256dh, auth },
      create: { endpoint, userId, p256dh, auth },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: true }); }
}
