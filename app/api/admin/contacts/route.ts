export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const body = await request.json();
    if (!body?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const data: any = {};
    if (body?.status !== undefined) data.status = body.status;
    if (body?.adminReply !== undefined) { data.adminReply = body.adminReply; data.respondedAt = new Date(); if (!body?.status) data.status = 'resolved'; }
    const contact = await prisma.contactRequest.update({ where: { id: body.id }, data });
    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
