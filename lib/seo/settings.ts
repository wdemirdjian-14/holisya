import { prisma } from '@/lib/db';

export type SeoSettingsShape = {
  ga4MeasurementId: string;
  ga4PropertyId: string;
  gscSiteUrl: string;
};

const DEFAULTS: SeoSettingsShape = {
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA_ID ?? 'G-4W6W1H5WVZ',
  ga4PropertyId: process.env.GA4_PROPERTY_ID ?? '',
  gscSiteUrl: process.env.GSC_SITE_URL ?? '',
};

/** Lit les réglages SEO (singleton). Tolérant aux pannes : renvoie les valeurs par défaut. */
export async function getSeoSettings(): Promise<SeoSettingsShape> {
  try {
    const s = await prisma.seoSettings.upsert({
      where: { id: 'global' },
      update: {},
      create: { id: 'global' },
    });
    return {
      ga4MeasurementId: s.ga4MeasurementId || DEFAULTS.ga4MeasurementId,
      ga4PropertyId: s.ga4PropertyId || DEFAULTS.ga4PropertyId,
      gscSiteUrl: s.gscSiteUrl || DEFAULTS.gscSiteUrl,
    };
  } catch {
    return DEFAULTS;
  }
}
