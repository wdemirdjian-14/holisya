export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const templates = await prisma.emailTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ templates });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.name || !data?.subject || !data?.body) return NextResponse.json({ error: 'Nom, sujet et contenu requis' }, { status: 400 });
    const template = await prisma.emailTemplate.create({ data: { name: data.name, subject: data.subject, body: data.body } });
    return NextResponse.json({ template });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const template = await prisma.emailTemplate.update({ where: { id: data.id }, data: { name: data?.name, subject: data?.subject, body: data?.body } });
    return NextResponse.json({ template });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await prisma.emailTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
