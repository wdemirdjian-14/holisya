import { prisma } from '@/lib/db';

/** Pages dont le titre / la description sont éditables dans l'admin SEO. */
export const SEO_PAGES: { path: string; label: string }[] = [
  { path: '/', label: 'Accueil' },
  { path: '/services', label: 'Nos soins' },
  { path: '/rendez-vous', label: 'Rendez-vous' },
  { path: '/cartes-cadeaux', label: 'Cartes cadeaux' },
  { path: '/a-propos', label: 'À propos' },
  { path: '/temoignages', label: 'Témoignages' },
  { path: '/blog', label: 'Blog' },
  { path: '/contact', label: 'Contact' },
];

export async function getMetaOverride(path: string): Promise<{ title?: string; description?: string }> {
  try {
    const m = await prisma.seoMeta.findUnique({ where: { path } });
    if (!m) return {};
    return { title: m.title?.trim() || undefined, description: m.description?.trim() || undefined };
  } catch {
    return {};
  }
}

/**
 * Fusionne un éventuel override admin (SeoMeta) dans l'objet metadata d'une page.
 * À utiliser dans un generateMetadata() async.
 */
export async function withSeoOverride(path: string, base: any): Promise<any> {
  const o = await getMetaOverride(path);
  if (!o.title && !o.description) return base;
  const out: any = { ...base };
  if (o.title) out.title = o.title;
  if (o.description) out.description = o.description;
  out.openGraph = {
    ...(base.openGraph || {}),
    ...(o.title ? { title: o.title } : {}),
    ...(o.description ? { description: o.description } : {}),
  };
  return out;
}
