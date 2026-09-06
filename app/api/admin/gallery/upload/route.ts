export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import path from 'path';
import { processAndSaveImage } from '@/lib/image-process';

const MAX_SIZE = 25 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) return NextResponse.json({ error: 'Fichier(s) requis' }, { status: 400 });

    const maxSort = await prisma.galleryPhoto.aggregate({ _max: { sortOrder: true } });
    let nextSort = (maxSort._max.sortOrder ?? 0) + 1;

    const created = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) continue;
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = await processAndSaveImage({ input: buffer, mime: file.type, destDir: UPLOAD_DIR, baseName: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
        const photo = await prisma.galleryPhoto.create({ data: { imageUrl: `/uploads/gallery/${filename}`, sortOrder: nextSort } });
        created.push(photo);
        nextSort += 1;
      } catch (e) { console.error('gallery image skip', e); }
    }

    return NextResponse.json({ photos: created });
  } catch (error: any) {
    console.error('Upload gallery error:', error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  }
}
