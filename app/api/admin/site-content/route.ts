export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SITE_CONTENT_REGISTRY } from '@/lib/site-content-registry';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const rows = await prisma.siteContent.findMany();
    const overrides: Record<string, string> = {};
    rows.forEach((r) => { overrides[r.key] = r.value; });
    const fields = SITE_CONTENT_REGISTRY.map((f) => ({ ...f, value: overrides[f.key] ?? f.defaultValue }));
    return NextResponse.json({ fields });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!data?.key) return NextResponse.json({ error: 'Clé requise' }, { status: 400 });
    const content = await prisma.siteContent.upsert({
      where: { key: data.key },
      update: { value: data?.value ?? '' },
      create: { key: data.key, value: data?.value ?? '' },
    });
    return NextResponse.json({ content });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
