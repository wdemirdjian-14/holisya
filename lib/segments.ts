import { prisma } from '@/lib/db';

export type SegmentFilters = {
  activity?: 'any' | 'never' | 'gt1m' | 'gt3m' | 'gt6m' | 'recent1m';
  minAppointments?: number;
  subscription?: 'any' | 'active' | 'none';
  source?: string;        // 'any' ou une valeur de User.source
  newAccount?: 'any' | 'lt1m';
  region?: 'any' | 'idf' | 'other';
};

/** Région estimée à partir de l'indicatif téléphonique FR (01 = Île-de-France ; 02-05 = autres régions ; mobiles/autres = inconnu). */
export function regionFromPhone(phone: string): 'idf' | 'other' | 'unknown' {
  let d = (phone || '').replace(/[^\d+]/g, '');
  d = d.replace(/^\+33/, '0').replace(/^0033/, '0');
  d = d.replace(/\D/g, '');
  if (d.startsWith('33') && d.length >= 11) d = '0' + d.slice(2);
  if (d.length < 2) return 'unknown';
  const p = d.slice(0, 2);
  if (p === '01') return 'idf';
  if (['02', '03', '04', '05'].includes(p)) return 'other';
  return 'unknown';
}

function monthsAgo(n: number): Date { const d = new Date(); d.setMonth(d.getMonth() - n); return d; }

export type SegmentClient = {
  id: string; firstName: string; lastName: string; email: string; phone: string;
  lastVisit: string | null; apptCount: number; region: string; hasActiveSub: boolean;
};

/** Calcule (dynamiquement) la liste des clientes correspondant aux filtres. Exclut toujours les désinscrites et les comptes sans email. */
export async function computeSegment(filters: SegmentFilters): Promise<SegmentClient[]> {
  const users = await prisma.user.findMany({
    where: { role: 'USER', emailOptOut: false, NOT: { email: '' } },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true, source: true, createdAt: true,
      appointments: { where: { status: 'COMPLETED' }, orderBy: { date: 'desc' }, select: { date: true } },
      subscriptions: { where: { status: 'ACTIVE' }, select: { id: true } },
    },
  });

  const m1 = monthsAgo(1), m3 = monthsAgo(3), m6 = monthsAgo(6);
  const out: SegmentClient[] = [];

  for (const u of users) {
    const apptCount = u.appointments.length;
    const lastVisit = u.appointments[0]?.date ?? null;
    const hasActiveSub = u.subscriptions.length > 0;
    const region = regionFromPhone(u.phone);

    const act = filters.activity ?? 'any';
    if (act === 'never' && lastVisit) continue;
    if (act === 'recent1m' && !(lastVisit && lastVisit >= m1)) continue;
    if (act === 'gt1m' && !(lastVisit && lastVisit < m1)) continue;
    if (act === 'gt3m' && !(lastVisit && lastVisit < m3)) continue;
    if (act === 'gt6m' && !(lastVisit && lastVisit < m6)) continue;

    if (filters.minAppointments && apptCount < filters.minAppointments) continue;

    if (filters.subscription === 'active' && !hasActiveSub) continue;
    if (filters.subscription === 'none' && hasActiveSub) continue;

    if (filters.source && filters.source !== 'any' && u.source !== filters.source) continue;

    if (filters.newAccount === 'lt1m' && !(u.createdAt >= m1)) continue;

    if (filters.region === 'idf' && region !== 'idf') continue;
    if (filters.region === 'other' && region !== 'other') continue;

    out.push({
      id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone,
      lastVisit: lastVisit ? lastVisit.toISOString() : null, apptCount, region, hasActiveSub,
    });
  }
  return out;
}
