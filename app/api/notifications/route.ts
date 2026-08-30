export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function whereFor(userId: string, role: string) {
  return role === 'ADMIN'
    ? { OR: [{ audience: 'admin' }, { audience: 'user', userId }] }
    : { audience: 'user', userId };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ notifications: [], unread: 0 });
    const userId = (session.user as any)?.id ?? '';
    const role = (session.user as any)?.role ?? 'USER';
    const where = whereFor(userId, role);
    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.notification.count({ where: { ...where, read: false } }),
    ]);
    return NextResponse.json({ notifications, unread });
  } catch (error: any) { console.error(error); return NextResponse.json({ notifications: [], unread: 0 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const role = (session.user as any)?.role ?? 'USER';
    const d = await req.json().catch(() => ({}));
    const base = whereFor(userId, role);
    if (d?.all) {
      await prisma.notification.updateMany({ where: { ...base, read: false }, data: { read: true } });
    } else if (d?.id) {
      await prisma.notification.updateMany({ where: { id: d.id, ...base }, data: { read: true } });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
