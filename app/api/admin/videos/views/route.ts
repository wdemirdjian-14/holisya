export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Monitoring : qui a regardé une vidéo et sa progression.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const views = await prisma.videoView.findMany({ where: { videoId: id }, orderBy: { updatedAt: 'desc' } });
    const userIds = views.map((v) => v.userId);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true, email: true } });
    const userMap: Record<string, any> = {};
    users.forEach((u) => { userMap[u.id] = u; });
    const rows = views.map((v) => ({ ...v, user: userMap[v.userId] ?? null }));
    return NextResponse.json({ views: rows });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
