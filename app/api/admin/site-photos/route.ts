export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Liste toutes les photos du site (galerie, soins, blog, vidéos) pour la gestion centralisée.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const [gallery, services, posts] = await Promise.all([
    prisma.galleryPhoto.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.service.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, imageUrl: true } }),
    prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true, imageUrl: true } }),
  ]);
  let videos: any[] = [];
  try { videos = await (prisma as any).videoContent.findMany({ select: { id: true, title: true, thumbnailUrl: true } }); } catch { videos = []; }

  const items = [
    ...gallery.map((g) => ({ source: 'gallery', id: g.id, title: 'Carrousel accueil', url: g.imageUrl, isActive: g.isActive })),
    ...services.map((s) => ({ source: 'service', id: s.id, title: s.name, url: s.imageUrl })),
    ...posts.map((p) => ({ source: 'blog', id: p.id, title: p.title, url: p.imageUrl })),
    ...videos.map((v) => ({ source: 'video', id: v.id, title: v.title, url: v.thumbnailUrl })),
  ].filter((x) => x.url).map((x) => ({ ...x, editable: String(x.url).startsWith('/uploads/') }));

  return NextResponse.json({ items });
}
