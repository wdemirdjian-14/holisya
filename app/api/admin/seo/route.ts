export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getSeoSettings } from '@/lib/seo/settings';
import { isConfigured, getServiceAccount } from '@/lib/seo/google-auth';

async function admin() {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as any)?.role === 'ADMIN';
}

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const settings = await getSeoSettings();
  const sa = getServiceAccount();

  const config = {
    ga4Tag: !!settings.ga4MeasurementId,              // tag GA4 sur le site
    serviceAccount: isConfigured(),                   // clé compte de service présente
    serviceAccountEmail: sa?.email ?? null,
    ga4DataApi: isConfigured() && !!settings.ga4PropertyId,  // lecture trafic GA4
    searchConsole: isConfigured() && !!settings.gscSiteUrl,  // lecture Search Console
  };

  // Checklist SEO (vrais booléens vérifiables côté code).
  const health = [
    { key: 'https', label: 'Site en HTTPS', ok: true },
    { key: 'sitemap', label: 'Sitemap XML (/sitemap.xml)', ok: true },
    { key: 'robots', label: 'robots.txt + crawlers IA autorisés', ok: true },
    { key: 'llms', label: 'Fichier /llms.txt pour les IA', ok: true },
    { key: 'jsonld', label: 'Données structurées (LocalBusiness + réservation)', ok: true },
    { key: 'ga4', label: 'Mesure d’audience GA4 installée', ok: config.ga4Tag },
    { key: 'ga4api', label: 'API GA4 connectée (trafic dans l’admin)', ok: config.ga4DataApi },
    { key: 'gsc', label: 'Search Console connectée (mots-clés)', ok: config.searchConsole },
  ];

  return NextResponse.json({ settings, config, health });
}

export async function PUT(req: NextRequest) {
  if (!(await admin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const d = await req.json();
  const clean = (v: any) => (typeof v === 'string' ? v.trim() : undefined);
  const settings = await prisma.seoSettings.upsert({
    where: { id: 'global' },
    update: {
      ga4MeasurementId: clean(d?.ga4MeasurementId),
      ga4PropertyId: clean(d?.ga4PropertyId),
      gscSiteUrl: clean(d?.gscSiteUrl),
    },
    create: {
      id: 'global',
      ga4MeasurementId: clean(d?.ga4MeasurementId) || 'G-4W6W1H5WVZ',
      ga4PropertyId: clean(d?.ga4PropertyId) || '',
      gscSiteUrl: clean(d?.gscSiteUrl) || '',
    },
  });
  return NextResponse.json({ settings });
}
