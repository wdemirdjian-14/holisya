export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'services');

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const serviceId = formData.get('serviceId') as string | null;
    if (!file || !serviceId) return NextResponse.json({ error: 'Fichier et serviceId requis' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 });

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: 'Service introuvable' }, { status: 404 });

    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = (file.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
    const filename = `${serviceId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    if (service.imageUrl?.startsWith('/uploads/services/')) {
      await unlink(path.join(process.cwd(), 'public', service.imageUrl)).catch(() => {});
    }

    const imageUrl = `/uploads/services/${filename}`;
    await prisma.service.update({ where: { id: serviceId }, data: { imageUrl } });
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Upload service photo error:', error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
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
