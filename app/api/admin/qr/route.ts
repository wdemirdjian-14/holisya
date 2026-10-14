export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/business';
import { PLANITY_URL } from '@/lib/config';
import { getQrTarget, resolveQrTarget, normalizeCustomUrl, QR_TARGET_TYPES, type QrTarget, QR_TARGET_KEY, QR_SCANS_KEY, QR_PATH, QR_PAGES } from '@/lib/qr-target';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as any)?.role === 'ADMIN';
}

export async function GET() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const target = await getQrTarget();
    const scans = await prisma.siteContent.findUnique({ where: { key: QR_SCANS_KEY } });
    return NextResponse.json({
      target,
      destination: resolveQrTarget(target),
      qrUrl: `${SITE_URL}${QR_PATH}`,
      scans: parseInt(scans?.value ?? '0', 10) || 0,
      pages: QR_PAGES,
      planityUrl: PLANITY_URL,
      siteUrl: SITE_URL,
    });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

// Enregistre la destination du QR code.
export async function PUT(req: NextRequest) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    if (!QR_TARGET_TYPES.includes(data?.type)) return NextResponse.json({ error: 'Destination invalide' }, { status: 400 });
    const target: QrTarget = { type: data.type, page: data?.page, url: data?.url };
    if (target.type === 'page' && !QR_PAGES.some((p) => p.path === target.page)) return NextResponse.json({ error: 'Page invalide' }, { status: 400 });
    if (target.type === 'custom') {
      const url = normalizeCustomUrl(target.url ?? '');
      if (!url) return NextResponse.json({ error: 'Lien invalide' }, { status: 400 });
      target.url = url;
    }
    const clean = { type: target.type, ...(target.type === 'page' ? { page: target.page } : {}), ...(target.type === 'custom' ? { url: target.url } : {}) };
    const value = JSON.stringify(clean);
    await prisma.siteContent.upsert({ where: { key: QR_TARGET_KEY }, update: { value }, create: { key: QR_TARGET_KEY, value } });
    return NextResponse.json({ target: clean, destination: resolveQrTarget(clean) });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}

// Vérifie qu'un lien personnalisé répond avant de l'enregistrer.
export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const data = await req.json();
    const url = normalizeCustomUrl(data?.url ?? '');
    if (!url) return NextResponse.json({ ok: false, error: 'Lien invalide : saisissez une adresse web complète (ex. https://exemple.fr).' });
    const host = new URL(url).hostname;
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.)/.test(host)) {
      return NextResponse.json({ ok: false, url, error: 'Adresse non autorisée.' });
    }
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0 (Holisya QR check)' } });
      // Certains sites (Instagram, Planity…) refusent les robots : 401/403/429 veulent dire que le site existe.
      const reachable = res.ok || [401, 403, 429].includes(res.status);
      return NextResponse.json({ ok: reachable, url, status: res.status, finalUrl: res.url, error: reachable ? undefined : `Le site répond avec une erreur (${res.status}).` });
    } catch {
      return NextResponse.json({ ok: false, url, error: 'Le site ne répond pas. Vérifiez l\'adresse.' });
    }
  } catch (error: any) { console.error(error); return NextResponse.json({ error: 'Erreur' }, { status: 500 }); }
}
