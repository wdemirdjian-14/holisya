import { BUSINESS, SITE_URL } from '@/lib/business';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * /llms-full.txt — version étendue de llms.txt : inclut le détail des soins (tarifs,
 * durées) et les derniers articles de blog, générés depuis la base. Pour que les IA
 * disposent du contenu complet et à jour d'Holisya.
 */
export async function GET() {
  let servicesBlock = '';
  let blogBlock = '';

  try {
    const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    if (services.length) {
      servicesBlock = '\n## Soins & prestations\n' + services.map((s: any) => {
        const price = s.price != null ? `${s.price} €` : '';
        const dur = s.duration ? `${s.duration} min` : '';
        const meta = [dur, price].filter(Boolean).join(' · ');
        const desc = (s.description ?? '').replace(/\s+/g, ' ').trim();
        return `- **${s.name}**${meta ? ` (${meta})` : ''}${desc ? ` — ${desc}` : ''}`;
      }).join('\n') + '\n';
    }
  } catch {}

  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true, publishedAt: { lte: new Date() } },
      select: { slug: true, title: true, excerpt: true },
      orderBy: { publishedAt: 'desc' },
      take: 25,
    });
    if (posts.length) {
      blogBlock = '\n## Articles de blog\n' + posts.map((p: any) => {
        const ex = (p.excerpt ?? '').replace(/\s+/g, ' ').trim();
        return `- [${p.title}](${SITE_URL}/blog/${p.slug})${ex ? ` — ${ex}` : ''}`;
      }).join('\n') + '\n';
    }
  } catch {}

  const hoursText = BUSINESS.hours.map((h) => `${h.days.join(', ')} : ${h.open}–${h.close}`).join(' ; ');

  const body = `# Holisya — contenu complet pour moteurs et IA

> ${BUSINESS.slogan}. Institut de bien-être féminin à ${BUSINESS.city} (${BUSINESS.postalCode}), aux portes de Paris. Spécialités : Kobido (lifting naturel japonais), drainage lymphatique, Madero Sculpt, coaching nutrition. Praticienne : ${BUSINESS.practitioner}.

## Coordonnées
- Adresse : ${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.city}
- Téléphone : ${BUSINESS.phoneDisplay} — Email : ${BUSINESS.email}
- Horaires : ${hoursText}
- Zone desservie : ${BUSINESS.areaServed.join(', ')}
- Réservation : ${BUSINESS.bookingUrl}
${servicesBlock}${blogBlock}
## Liens
- Accueil : ${SITE_URL}/
- Soins : ${SITE_URL}/services
- Rendez-vous : ${SITE_URL}/rendez-vous
- Blog : ${SITE_URL}/blog
- Contact : ${SITE_URL}/contact
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
