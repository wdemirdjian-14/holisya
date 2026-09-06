export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VIDEO_THUMB_DIR } from '@/lib/video-storage';
import { unlink } from 'fs/promises';
import path from 'path';
import { processAndSaveImage } from '@/lib/image-process';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const id = form.get('id') as string | null;
    if (!file || !id) return NextResponse.json({ error: 'Fichier et id requis' }, { status: 400 });

    const video = await prisma.videoContent.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = await processAndSaveImage({ input: buffer, mime: file.type, destDir: VIDEO_THUMB_DIR, baseName: `${id}-${Date.now()}` });
    if (video.thumbnailUrl?.startsWith('/uploads/video-thumbs/')) await unlink(path.join(process.cwd(), 'public', video.thumbnailUrl)).catch(() => {});

    const thumbnailUrl = `/uploads/video-thumbs/${filename}`;
    await prisma.videoContent.update({ where: { id }, data: { thumbnailUrl } });
    return NextResponse.json({ thumbnailUrl });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Image illisible ou non supportée' }, { status: 500 }); }
}
