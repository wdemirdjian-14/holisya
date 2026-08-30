export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VIDEO_DIR, VIDEO_THUMB_DIR } from '@/lib/video-storage';
import { unlink } from 'fs/promises';
import path from 'path';

function slugify(s: string): string {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const videos = await prisma.videoContent.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { views: true, accesses: true } } },
    });
    return NextResponse.json({ videos });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const d = await req.json();
    if (!d?.title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
    let slug = slugify(d?.slug || d.title);
    const existing = await prisma.videoContent.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    const video = await prisma.videoContent.create({
      data: {
        title: d.title, slug, description: d?.description ?? '',
        priceCents: d?.priceCents ? parseInt(d.priceCents) : 0,
        isPremiumOnly: d?.isPremiumOnly ?? true,
        isPublished: d?.isPublished ?? false,
        chapters: d?.chapters ?? '',
        sortOrder: d?.sortOrder ? parseInt(d.sortOrder) : 0,
      },
    });
    return NextResponse.json({ video });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const d = await req.json();
    if (!d?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const video = await prisma.videoContent.update({
      where: { id: d.id },
      data: {
        title: d?.title, description: d?.description,
        priceCents: d?.priceCents !== undefined ? parseInt(d.priceCents) : undefined,
        isPremiumOnly: d?.isPremiumOnly,
        isPublished: d?.isPublished,
        chapters: d?.chapters,
        sortOrder: d?.sortOrder !== undefined ? parseInt(d.sortOrder) : undefined,
      },
    });
    return NextResponse.json({ video });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const video = await prisma.videoContent.findUnique({ where: { id } });
    if (video?.fileName) await unlink(path.join(VIDEO_DIR, path.basename(video.fileName))).catch(() => {});
    if (video?.thumbnailUrl?.startsWith('/uploads/video-thumbs/')) await unlink(path.join(process.cwd(), 'public', video.thumbnailUrl)).catch(() => {});
    await prisma.videoContent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
