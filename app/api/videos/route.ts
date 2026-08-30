export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isPremiumUser } from '@/lib/premium';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? '';
    const role = (session?.user as any)?.role;

    const videos = await prisma.videoContent.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } });
    const premium = userId ? await isPremiumUser(userId) : false;
    const accesses = userId ? await prisma.videoAccess.findMany({ where: { userId } }) : [];
    const views = userId ? await prisma.videoView.findMany({ where: { userId } }) : [];
    const accessSet = new Set(accesses.map((a) => a.videoId));
    const viewMap: Record<string, any> = {};
    views.forEach((v) => { viewMap[v.videoId] = v; });

    const result = videos.map((v) => {
      const hasAccess = role === 'ADMIN' || premium || accessSet.has(v.id) || (!v.isPremiumOnly && v.priceCents === 0);
      const view = viewMap[v.id];
      return {
        id: v.id, title: v.title, slug: v.slug, description: v.description, thumbnailUrl: v.thumbnailUrl,
        durationSec: v.durationSec, priceCents: v.priceCents, isPremiumOnly: v.isPremiumOnly,
        chapters: v.chapters, hasAccess,
        lastPositionSec: view?.lastPositionSec ?? 0, completed: view?.completed ?? false,
      };
    });
    return NextResponse.json({ videos: result, premium, isLogged: !!userId });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
