export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSeoSettings } from '@/lib/seo/settings';
import { isConfigured } from '@/lib/seo/google-auth';
import { getGscData } from '@/lib/seo/gsc';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const settings = await getSeoSettings();
  if (!isConfigured()) return NextResponse.json({ configured: false, reason: 'service-account' });
  if (!settings.gscSiteUrl) return NextResponse.json({ configured: false, reason: 'site-url' });

  const days = Math.min(365, Math.max(1, parseInt(req.nextUrl.searchParams.get('days') || '28')));
  const data = await getGscData(settings.gscSiteUrl, days);
  if (!data) return NextResponse.json({ configured: false, reason: 'api-error' });
  return NextResponse.json({ configured: true, days, ...data });
}
