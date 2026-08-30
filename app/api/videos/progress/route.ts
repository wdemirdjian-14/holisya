export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { userHasVideoAccess } from '@/lib/premium';

// Suivi de visionnage : position, secondes vues, complétion, comptage.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const userId = (session.user as any)?.id ?? '';
    const role = (session.user as any)?.role;
    const d = await req.json();
    if (!d?.videoId) return NextResponse.json({ error: 'videoId requis' }, { status: 400 });

    const video = await prisma.videoContent.findUnique({ where: { id: d.videoId } });
    if (!video) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    const allowed = await userHasVideoAccess({ userId, role, video });
    if (!allowed) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const lastPositionSec = Math.max(0, Math.floor(d?.lastPositionSec ?? 0));
    const secondsWatched = Math.max(0, Math.floor(d?.secondsWatched ?? 0));
    const completed = !!d?.completed;
    const isStart = !!d?.isStart;

    const existing = await prisma.videoView.findUnique({ where: { userId_videoId: { userId, videoId: d.videoId } } });
    if (existing) {
      await prisma.videoView.update({
        where: { userId_videoId: { userId, videoId: d.videoId } },
        data: {
          lastPositionSec,
          secondsWatched: Math.max(existing.secondsWatched, secondsWatched),
          completed: existing.completed || completed,
          viewCount: isStart ? existing.viewCount + 1 : existing.viewCount,
        },
      });
    } else {
      await prisma.videoView.create({ data: { userId, videoId: d.videoId, lastPositionSec, secondsWatched, completed, viewCount: 1 } });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
