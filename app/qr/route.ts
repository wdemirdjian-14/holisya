export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/business';
import { getQrTarget, resolveQrTarget, QR_SCANS_KEY } from '@/lib/qr-target';
import { getPlanityMode } from '@/lib/site-flags';

// Adresse encodée dans le QR code : redirige vers la destination choisie dans
// les réglages de l'administration (redirection temporaire, jamais mise en cache).
export async function GET() {
  let destination = SITE_URL;
  try {
    destination = resolveQrTarget(await getQrTarget(), (await getPlanityMode()).url);
    const row = await prisma.siteContent.findUnique({ where: { key: QR_SCANS_KEY } });
    const scans = String((parseInt(row?.value ?? '0', 10) || 0) + 1);
    await prisma.siteContent.upsert({ where: { key: QR_SCANS_KEY }, update: { value: scans }, create: { key: QR_SCANS_KEY, value: scans } });
  } catch (error) { console.error(error); }
  const res = NextResponse.redirect(destination, 302);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
