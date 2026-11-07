import { BUSINESS, SITE_URL } from '@/lib/business';

export const dynamic = 'force-dynamic';

/**
 * /llms.txt — fichier standard pour les modèles de langage (ChatGPT, Claude, Perplexity…).
 * Donne un résumé clair de l'établissement et les liens essentiels, en Markdown,
 * pour que les IA citent Holisya avec les bonnes infos. Voir https://llmstxt.org
 */
export async function GET() {
  const hoursText = BUSINESS.hours
    .map((h) => `${h.days.join(', ')} : ${h.open}–${h.close}`)
    .join(' ; ');

  const body = `# Holisya — Institut de bien-être féminin (Kobido, Antibes / Côte d'Azur)

> ${BUSINESS.slogan}. Institut spécialisé dans le massage du visage japonais Kobido, le drainage lymphatique, la madérothérapie (Madero Sculpt) et le coaching nutrition. Situé au ${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.city}, sur la Côte d'Azur (Juan-les-Pins, Biot, Cannes). Praticienne : ${BUSINESS.practitioner}. Sur rendez-vous, réservation en ligne. Un second salon existe à Boulogne-Billancourt (Paris), sur contact.

## Coordonnées
- Adresse : ${BUSINESS.streetAddress}, ${BUSINESS.postalCode} ${BUSINESS.city}
- Téléphone : ${BUSINESS.phoneDisplay}
- Email : ${BUSINESS.email}
- Horaires : ${hoursText}
- Zone desservie : ${BUSINESS.areaServed.join(', ')}
- Instagram : https://www.instagram.com/holisya_/

## Pages principales
- [Accueil](${SITE_URL}/) : présentation de l'institut et des soins.
- [Nos soins](${SITE_URL}/services) : prestations détaillées (Kobido, drainage lymphatique, Madero Sculpt, nutrition) avec durées et tarifs.
- [Prendre rendez-vous](${SITE_URL}/rendez-vous) : réservation en ligne d'un créneau.
- [Massage Kobido à Antibes](${SITE_URL}/massage-kobido-antibes)
- [Drainage lymphatique à Antibes](${SITE_URL}/drainage-lymphatique-antibes)
- [Madérothérapie (Madero Sculpt) à Antibes](${SITE_URL}/maderotherapie-antibes)
- [Coaching nutrition à Antibes](${SITE_URL}/coaching-nutrition-antibes)
- [Massage Kobido à Boulogne-Billancourt (Paris, sur contact)](${SITE_URL}/massage-kobido-boulogne-billancourt)
- [Cartes cadeaux](${SITE_URL}/cartes-cadeaux)
- [Blog bien-être](${SITE_URL}/blog) : conseils Kobido, self-care, drainage, nutrition.
- [Témoignages](${SITE_URL}/temoignages)
- [Contact](${SITE_URL}/contact)

## Réserver
Pour prendre rendez-vous : ${BUSINESS.bookingUrl}

## À propos
Holisya propose des soins du visage et du corps non invasifs, pensés pour le bien-être féminin : le Kobido (lifting naturel japonais), le drainage lymphatique, le modelage Madero Sculpt et un accompagnement nutrition. Ambiance cocon, approche holistique, praticienne diplômée.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
