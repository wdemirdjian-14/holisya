import { prisma } from '@/lib/db';
import { SITE_URL } from '@/lib/business';
import { PLANITY_URL } from '@/lib/config';

// QR code du salon : il encode toujours l'adresse fixe `${SITE_URL}/qr`, qui
// redirige vers la destination choisie dans Administration > Réglages. On peut
// donc changer la destination sans réimprimer les QR codes déjà distribués.
export const QR_TARGET_KEY = 'qr.target';
export const QR_SCANS_KEY = 'qr.scans';
export const QR_PATH = '/qr';

export const QR_TARGET_TYPES = ['site', 'planity', 'booking', 'page', 'custom'] as const;
export type QrTargetType = (typeof QR_TARGET_TYPES)[number];
export type QrTarget = { type: QrTargetType; page?: string; url?: string };

export const QR_PAGES: { path: string; label: string }[] = [
  { path: '/', label: 'Accueil' },
  { path: '/services', label: 'Nos Soins' },
  { path: '/rendez-vous', label: 'Rendez-vous' },
  { path: '/cartes-cadeaux', label: 'Cartes Cadeaux' },
  { path: '/abonnements', label: 'Abonnements' },
  { path: '/blog', label: 'Blog' },
  { path: '/avis', label: 'Laisser un avis' },
  { path: '/temoignages', label: 'Témoignages' },
  { path: '/a-propos', label: 'À Propos' },
  { path: '/contact', label: 'Contact' },
  { path: '/massage-kobido-boulogne-billancourt', label: 'Massage Kobido' },
  { path: '/drainage-lymphatique-boulogne-billancourt', label: 'Drainage lymphatique' },
  { path: '/maderotherapie-boulogne-billancourt', label: 'Madérothérapie' },
  { path: '/coaching-nutrition-boulogne-billancourt', label: 'Coaching nutrition' },
  { path: '/inscription', label: 'Créer un compte' },
  { path: '/espace-membre', label: 'Espace membre' },
];

export const DEFAULT_QR_TARGET: QrTarget = { type: 'site' };

// Accepte uniquement des liens http(s) complets.
export function normalizeCustomUrl(raw: string): string | null {
  const s = (raw ?? '').trim();
  if (!s) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function parseQrTarget(raw: string | null | undefined): QrTarget {
  if (!raw) return DEFAULT_QR_TARGET;
  try {
    const t = JSON.parse(raw);
    if (QR_TARGET_TYPES.includes(t?.type)) return t;
  } catch {}
  return DEFAULT_QR_TARGET;
}

// planityUrl : lien réglé dans Réservation en ligne (bascule Planity), sinon le lien par défaut.
export function resolveQrTarget(t: QrTarget, planityUrl: string = PLANITY_URL): string {
  switch (t.type) {
    case 'planity':
      return planityUrl;
    case 'booking':
      return `${SITE_URL}/rendez-vous`;
    case 'page': {
      const page = QR_PAGES.find((p) => p.path === t.page);
      return page && page.path !== '/' ? `${SITE_URL}${page.path}` : SITE_URL;
    }
    case 'custom':
      return normalizeCustomUrl(t.url ?? '') ?? SITE_URL;
    default:
      return SITE_URL;
  }
}

export async function getQrTarget(): Promise<QrTarget> {
  const row = await prisma.siteContent.findUnique({ where: { key: QR_TARGET_KEY } });
  return parseQrTarget(row?.value);
}
