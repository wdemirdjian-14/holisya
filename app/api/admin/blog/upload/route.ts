export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { processAndSaveImage } from '@/lib/image-process';

const MAX_SIZE = 25 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'blog');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const postId = formData.get('postId') as string | null;
    if (!file || !postId) return NextResponse.json({ error: 'Fichier et postId requis' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop volumineux (max 25 Mo)' }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = await processAndSaveImage({ input: buffer, mime: file.type, destDir: UPLOAD_DIR, baseName: `${postId}-${Date.now()}` });

    if (post.imageUrl?.startsWith('/uploads/blog/')) {
      await unlink(path.join(process.cwd(), 'public', post.imageUrl)).catch(() => {});
    }

    const imageUrl = `/uploads/blog/${filename}`;
    await prisma.blogPost.update({ where: { id: postId }, data: { imageUrl } });
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Upload blog photo error:', error);
    return NextResponse.json({ error: 'Image illisible ou non supportée' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const postId = req.nextUrl.searchParams.get('postId');
    if (!postId) return NextResponse.json({ error: 'postId requis' }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    if (post.imageUrl?.startsWith('/uploads/blog/')) {
      await unlink(path.join(process.cwd(), 'public', post.imageUrl)).catch(() => {});
    }
    await prisma.blogPost.update({ where: { id: postId }, data: { imageUrl: '' } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete blog photo error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
