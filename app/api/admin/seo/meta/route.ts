export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SEO_PAGES } from '@/lib/seo/meta';

async function admin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as any)?.role === 'ADMIN';
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const rows = await prisma.seoMeta.findMany();
  const byPath = new Map(rows.map((r) => [r.path, r]));
  const pages = SEO_PAGES.map((p) => ({
    path: p.path,
    label: p.label,
    title: byPath.get(p.path)?.title ?? '',
    description: byPath.get(p.path)?.description ?? '',
  }));
  return NextResponse.json({ pages });
}

export async function PUT(req: NextRequest) {
  if (!(await admin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const d = await req.json();
  const path = typeof d?.path === 'string' ? d.path : '';
  if (!SEO_PAGES.some((p) => p.path === path)) return NextResponse.json({ error: 'Page inconnue' }, { status: 400 });
  const title = typeof d?.title === 'string' ? d.title.trim() : '';
  const description = typeof d?.description === 'string' ? d.description.trim() : '';
  await prisma.seoMeta.upsert({
    where: { path },
    update: { title, description },
    create: { path, title, description },
  });
  return NextResponse.json({ success: true });
}
