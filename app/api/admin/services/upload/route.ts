export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { processAndSaveImage } from '@/lib/image-process';

const MAX_SIZE = 25 * 1024 * 1024; // 25 Mo (photos iPhone brutes)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'services');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const serviceId = formData.get('serviceId') as string | null;
    if (!file || !serviceId) return NextResponse.json({ error: 'Fichier et serviceId requis' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop volumineux (max 25 Mo)' }, { status: 400 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: 'Service introuvable' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = await processAndSaveImage({ input: buffer, mime: file.type, destDir: UPLOAD_DIR, baseName: `${serviceId}-${Date.now()}` });

    if (service.imageUrl?.startsWith('/uploads/services/')) {
      await unlink(path.join(process.cwd(), 'public', service.imageUrl)).catch(() => {});
    }

    const imageUrl = `/uploads/services/${filename}`;
    await prisma.service.update({ where: { id: serviceId }, data: { imageUrl } });
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Upload service photo error:', error);
    return NextResponse.json({ error: 'Image illisible ou non supportée' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const serviceId = req.nextUrl.searchParams.get('serviceId');
    if (!serviceId) return NextResponse.json({ error: 'serviceId requis' }, { status: 400 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: 'Service introuvable' }, { status: 404 });
    if (service.imageUrl?.startsWith('/uploads/services/')) {
      await unlink(path.join(process.cwd(), 'public', service.imageUrl)).catch(() => {});
    }
    await prisma.service.update({ where: { id: serviceId }, data: { imageUrl: '' } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete service photo error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
