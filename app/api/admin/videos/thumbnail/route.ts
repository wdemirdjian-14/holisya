export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VIDEO_THUMB_DIR } from '@/lib/video-storage';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const id = form.get('id') as string | null;
    if (!file || !id) return NextResponse.json({ error: 'Fichier et id requis' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });

    const video = await prisma.videoContent.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });

    await mkdir(VIDEO_THUMB_DIR, { recursive: true });
    const ext = (file.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
    const filename = `${id}-${Date.now()}.${ext}`;
    await writeFile(path.join(VIDEO_THUMB_DIR, filename), Buffer.from(await file.arrayBuffer()));
    if (video.thumbnailUrl?.startsWith('/uploads/video-thumbs/')) await unlink(path.join(process.cwd(), 'public', video.thumbnailUrl)).catch(() => {});

    const thumbnailUrl = `/uploads/video-thumbs/${filename}`;
    await prisma.videoContent.update({ where: { id }, data: { thumbnailUrl } });
    return NextResponse.json({ thumbnailUrl });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
