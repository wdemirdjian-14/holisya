export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Get services error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    const slug = (data?.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const service = await prisma.service.create({ data: { name: data?.name ?? '', slug, description: data?.description ?? '', longDescription: data?.longDescription ?? '', duration: parseInt(data?.duration ?? '60'), price: parseFloat(data?.price ?? '0'), imageUrl: data?.imageUrl ?? '', category: data?.category ?? '', benefits: data?.benefits ?? '', isActive: data?.isActive ?? true, sortOrder: parseInt(data?.sortOrder ?? '0') } });
    return NextResponse.json(service);
  } catch (error: any) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const service = await prisma.service.update({ where: { id: data.id }, data: { name: data?.name, description: data?.description, longDescription: data?.longDescription, duration: data?.duration ? parseInt(data.duration) : undefined, price: data?.price !== undefined ? parseFloat(data.price) : undefined, imageUrl: data?.imageUrl, category: data?.category, benefits: data?.benefits, isActive: data?.isActive, sortOrder: data?.sortOrder ? parseInt(data.sortOrder) : undefined } });
    return NextResponse.json(service);
  } catch (error: any) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
