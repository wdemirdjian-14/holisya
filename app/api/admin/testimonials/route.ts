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
    if (!body?.name || !body?.comment) return NextResponse.json({ error: 'Nom et commentaire requis' }, { status: 400 });
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        rating: body?.rating ? parseInt(body.rating) : 5,
        comment: body.comment,
        serviceType: body?.serviceType ?? '',
        isApproved: body?.isApproved ?? true,
      },
    });
    return NextResponse.json({ testimonial, googleReviewUrl: process.env.GOOGLE_REVIEW_URL ?? '' });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const body = await request.json();
    await prisma.testimonial.update({ where: { id: body?.id ?? '' }, data: { isApproved: body?.isApproved ?? false } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    await prisma.testimonial.delete({ where: { id: searchParams.get('id') ?? '' } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
