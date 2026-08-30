export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const photos = await prisma.galleryPhoto.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ photos });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const photo = await prisma.galleryPhoto.update({ where: { id: data.id }, data: { isActive: data?.isActive, caption: data?.caption, sortOrder: data?.sortOrder !== undefined ? parseInt(data.sortOrder) : undefined } });
    return NextResponse.json({ photo });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
    if (photo?.imageUrl?.startsWith('/uploads/gallery/')) {
      await unlink(path.join(process.cwd(), 'public', photo.imageUrl)).catch(() => {});
    }
    await prisma.galleryPhoto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
