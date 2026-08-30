export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const body = await request.json();
    const slug = (body?.slug ?? body?.title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = await prisma.blogPost.create({ data: { title: body?.title ?? '', slug, excerpt: body?.excerpt ?? '', content: body?.content ?? '', category: body?.category ?? '', imageUrl: body?.imageUrl ?? '', sourceUrl: body?.sourceUrl ?? '', isPublished: body?.isPublished ?? false, publishedAt: body?.publishedAt ? new Date(body.publishedAt) : (body?.isPublished ? new Date() : null) } });
    return NextResponse.json({ post });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const body = await request.json();
    await prisma.blogPost.update({ where: { id: body?.id ?? '' }, data: { title: body?.title, excerpt: body?.excerpt, content: body?.content, category: body?.category, imageUrl: body?.imageUrl, sourceUrl: body?.sourceUrl, isPublished: body?.isPublished, publishedAt: body?.publishedAt ? new Date(body.publishedAt) : (body?.isPublished ? new Date() : null) } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    await prisma.blogPost.delete({ where: { id: searchParams.get('id') ?? '' } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
