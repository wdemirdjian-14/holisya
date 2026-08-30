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
    const promo = await prisma.discountCode.create({ data: { code: (body?.code ?? '').toUpperCase(), type: body?.type ?? 'fixed', value: body?.value ?? 0, maxUses: body?.maxUses ?? 0, description: body?.description ?? '', expiresAt: body?.expiresAt ? new Date(body.expiresAt) : null } });
    return NextResponse.json({ promo });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const body = await request.json();
    await prisma.discountCode.update({ where: { id: body?.id ?? '' }, data: { code: (body?.code ?? '').toUpperCase(), type: body?.type ?? 'fixed', value: body?.value ?? 0, maxUses: body?.maxUses ?? 0, description: body?.description ?? '', isActive: body?.isActive ?? true } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    await prisma.discountCode.delete({ where: { id: searchParams.get('id') ?? '' } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
