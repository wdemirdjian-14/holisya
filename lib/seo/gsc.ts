import { getAccessToken } from './google-auth';

/**
 * Google Search Console API — requêtes de recherche qui amènent du trafic.
 * Nécessite gscSiteUrl : soit "sc-domain:holisya.fr" (propriété domaine),
 * soit "https://www.holisya.fr/" (propriété préfixe d'URL).
 */

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export type GscResult = {
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
};

async function query(siteUrl: string, token: string, payload: any): Promise<any> {
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
  );
  if (!res.ok) {
    console.error('[seo][gsc] erreur', res.status, await res.text().catch(() => ''));
    return null;
  }
  return res.json();
}

export async function getGscData(siteUrl: string, days: number): Promise<GscResult | null> {
  const token = await getAccessToken();
  if (!token || !siteUrl) return null;

  // GSC a ~2-3 jours de latence : on décale la fin.
  const startDate = daysAgo(days + 3);
  const endDate = daysAgo(3);
  const base = { startDate, endDate };

  const [totalsRaw, queriesRaw, pagesRaw] = await Promise.all([
    query(siteUrl, token, { ...base }),
    query(siteUrl, token, { ...base, dimensions: ['query'], rowLimit: 25 }),
    query(siteUrl, token, { ...base, dimensions: ['page'], rowLimit: 15 }),
  ]);

  if (totalsRaw === null && queriesRaw === null) return null;

  const t = totalsRaw?.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const map = (rows: any[]) => (rows ?? []).map((r: any) => ({
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));

  return {
    totals: { clicks: t.clicks ?? 0, impressions: t.impressions ?? 0, ctr: t.ctr ?? 0, position: t.position ?? 0 },
    queries: (queriesRaw?.rows ?? []).map((r: any) => ({ query: r.keys?.[0] ?? '', ...map([r])[0] })),
    pages: (pagesRaw?.rows ?? []).map((r: any) => ({ page: r.keys?.[0] ?? '', ...map([r])[0] })),
  };
}
