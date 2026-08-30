export const dynamic = 'force-dynamic';
export const maxDuration = 300;
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VIDEO_DIR } from '@/lib/video-storage';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import path from 'path';

// Upload du fichier vidéo : le corps brut de la requête est écrit en flux sur le
// disque privé, sans être bufferisé en mémoire (adapté aux gros fichiers).
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    const duration = parseInt(req.nextUrl.searchParams.get('duration') ?? '0') || 0;
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    if (!req.body) return NextResponse.json({ error: 'Corps vide' }, { status: 400 });

    const video = await prisma.videoContent.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });

    await mkdir(VIDEO_DIR, { recursive: true });
    const fileName = `${id}.mp4`;
    const filePath = path.join(VIDEO_DIR, fileName);

    const nodeReadable = Readable.fromWeb(req.body as any);
    await pipeline(nodeReadable, createWriteStream(filePath));

    await prisma.videoContent.update({ where: { id }, data: { fileName, durationSec: duration || video.durationSec } });
    return NextResponse.json({ success: true, fileName });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  }
}
