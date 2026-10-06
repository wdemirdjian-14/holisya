import { getAccessToken } from './google-auth';

/**
 * GA4 Data API (runReport) — trafic du site pour le dashboard admin.
 * Nécessite GA4_PROPERTY_ID (ou réglage DB) = l'ID numérique de la propriété GA4.
 */

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export type Ga4Result = {
  summary: { sessions: number; totalUsers: number; newUsers: number; pageViews: number; avgEngagementSec: number };
  series: { date: string; sessions: number; users: number }[];
  channels: { channel: string; sessions: number }[];
  topPages: { path: string; title: string; views: number }[];
  devices: { device: string; sessions: number }[];
};

export async function getGa4Traffic(propertyId: string, days: number): Promise<Ga4Result | null> {
  const token = await getAccessToken();
  if (!token || !propertyId) return null;

  const startDate = daysAgo(days);
  const endDate = 'today';
  const dateRanges = [{ startDate, endDate }];

  const body = {
    requests: [
      // 0 — totaux
      { dateRanges, metrics: [
        { name: 'sessions' }, { name: 'totalUsers' }, { name: 'newUsers' },
        { name: 'screenPageViews' }, { name: 'averageSessionDuration' },
      ] },
      // 1 — série temporelle
      { dateRanges, dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }] },
      // 2 — canaux d'acquisition
      { dateRanges, dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 },
      // 3 — pages les plus vues
      { dateRanges, dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }], metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 15 },
      // 4 — appareils
      { dateRanges, dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] },
    ],
  };

  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error('[seo][ga4] erreur', res.status, await res.text().catch(() => ''));
    return null;
  }
  const data: any = await res.json();
  const reports = data.reports ?? [];
  const num = (v: any) => (v == null ? 0 : Number(v) || 0);

  const r0 = reports[0]?.rows?.[0]?.metricValues ?? [];
  const summary = {
    sessions: num(r0[0]?.value),
    totalUsers: num(r0[1]?.value),
    newUsers: num(r0[2]?.value),
    pageViews: num(r0[3]?.value),
    avgEngagementSec: Math.round(num(r0[4]?.value)),
  };

  const series = (reports[1]?.rows ?? []).map((row: any) => {
    const d = row.dimensionValues?.[0]?.value ?? '';
    return {
      date: d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d,
      sessions: num(row.metricValues?.[0]?.value),
      users: num(row.metricValues?.[1]?.value),
    };
  });

  const channels = (reports[2]?.rows ?? []).map((row: any) => ({
    channel: row.dimensionValues?.[0]?.value ?? '—',
    sessions: num(row.metricValues?.[0]?.value),
  }));

  const topPages = (reports[3]?.rows ?? []).map((row: any) => ({
    path: row.dimensionValues?.[0]?.value ?? '',
    title: row.dimensionValues?.[1]?.value ?? '',
    views: num(row.metricValues?.[0]?.value),
  }));

  const devices = (reports[4]?.rows ?? []).map((row: any) => ({
    device: row.dimensionValues?.[0]?.value ?? '—',
    sessions: num(row.metricValues?.[0]?.value),
  }));

  return { summary, series, channels, topPages, devices };
}
