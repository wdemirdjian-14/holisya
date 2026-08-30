export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { userHasVideoAccess } from '@/lib/premium';
import { VIDEO_DIR } from '@/lib/video-storage';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';
import { Readable } from 'stream';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response('Non autorisé', { status: 401 });
  const userId = (session.user as any)?.id ?? '';
  const role = (session.user as any)?.role;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return new Response('ID requis', { status: 400 });

  const video = await prisma.videoContent.findUnique({ where: { id } });
  if (!video || !video.fileName) return new Response('Introuvable', { status: 404 });
  if (!video.isPublished && role !== 'ADMIN') return new Response('Introuvable', { status: 404 });

  const allowed = await userHasVideoAccess({ userId, role, video });
  if (!allowed) return new Response('Accès réservé', { status: 403 });

  // Empêche toute traversée de répertoire.
  const safeName = path.basename(video.fileName);
  const filePath = path.join(VIDEO_DIR, safeName);
  if (!existsSync(filePath)) return new Response('Fichier absent', { status: 404 });

  const stat = statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.get('range');

  const commonHeaders: Record<string, string> = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'Content-Disposition': 'inline',
  };

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match && match[1] ? parseInt(match[1], 10) : 0;
    const end = match && match[2] ? parseInt(match[2], 10) : Math.min(start + 1024 * 1024 - 1, fileSize - 1);
    if (start >= fileSize || start > end) {
      return new Response('Range non satisfaisable', { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` } });
    }
    const nodeStream = createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;
    return new Response(webStream, {
      status: 206,
      headers: { ...commonHeaders, 'Content-Range': `bytes ${start}-${end}/${fileSize}`, 'Content-Length': String(end - start + 1) },
    });
  }

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;
  return new Response(webStream, { status: 200, headers: { ...commonHeaders, 'Content-Length': String(fileSize) } });
}
