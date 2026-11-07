/**
 * Source UNIQUE des informations de l'établissement.
 * Utilisée par : le balisage LocalBusiness (SEO Google), le footer, la page Contact,
 * les pages localisées. Modifier ici met tout à jour partout.
 *
 * ⚠️ Champs à compléter avec les vraies coordonnées (laisser vide = simplement non affiché,
 *    jamais de fausse donnée). Dès qu'ils sont remplis, ils apparaissent partout.
 */

export const SITE_URL = (process.env.NEXTAUTH_URL ?? 'https://www.holisya.fr').replace(/\/$/, '');

export const BUSINESS = {
  name: 'Holisya',
  slogan: 'Bien-être holistique féminin',
  practitioner: 'Lamyae',
  // Lien pour laisser un avis Google (ouvre la fiche via son CID).
  // Remplaçable par le lien direct "Demander des avis" de Google Business Profile
  // (format https://g.page/r/<code>/review) pour ouvrir directement le dialogue d'avis.
  googleReviewUrl: 'https://g.page/r/CUZKtxs0iAb3EAE/review',

  // --- Localisation (institut principal désormais à ANTIBES) ---
  streetAddress: '16 Avenue Guillabert',
  city: 'Antibes',
  postalCode: '06600',
  region: "Provence-Alpes-Côte d'Azur",
  country: 'FR',
  // Coordonnées GPS exactes (16 Avenue Guillabert, Antibes)
  geo: { lat: 43.578738, lng: 7.121217 },

  // --- Contact ---
  email: 'contact@holisya.fr',
  phone: '+33618264346',
  phoneDisplay: '06 18 26 43 46',
  whatsapp: '',                   // laissé vide : activer seulement si ce numéro a WhatsApp

  // --- Horaires d'ouverture Antibes (openingHoursSpecification) ---
  // Reflètent l'agenda de réservation en ligne. days : 'Monday'..'Sunday'
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], open: '10:30', close: '21:00' },
    { days: ['Friday'], open: '10:00', close: '17:00' },
    { days: ['Sunday'], open: '12:00', close: '21:00' },
  ] as { days: string[]; open: string; close: string }[],

  // --- Zone desservie (SEO local Antibes / Côte d'Azur) ---
  areaServed: ['Antibes', 'Juan-les-Pins', 'Antibes Juan-les-Pins', 'Biot', 'Vallauris', 'Cannes', 'Alpes-Maritimes', "Côte d'Azur"],

  priceRange: '€€',
  bookingUrl: `${SITE_URL}/rendez-vous`,
  image: `${SITE_URL}/og-image.png`,

  // --- Réseaux / profils (champ sameAs du balisage) : à compléter ---
  sameAs: [
    'https://www.instagram.com/holisya_/',
    // 'https://www.facebook.com/...',    // à ajouter si page Facebook
  ] as string[],

  // --- Salons (adresses affichées sur le site) ---
  // Antibes = salon principal avec réservation en ligne. Paris = sur rendez-vous (agenda en ligne fermé).
  locations: [
    { name: 'Antibes', streetAddress: '16 Avenue Guillabert', postalCode: '06600', city: 'Antibes', comingSoon: false, primary: true, booking: true, note: 'Réservation en ligne ouverte' },
    { name: 'Boulogne-Billancourt (Paris)', streetAddress: '66 Boulevard Jean Jaurès', postalCode: '92100', city: 'Boulogne-Billancourt', comingSoon: false, primary: false, booking: false, note: 'Agenda en ligne fermé — sur rendez-vous, nous contacter' },
  ] as { name: string; streetAddress: string; postalCode: string; city: string; comingSoon: boolean; primary?: boolean; booking?: boolean; note?: string }[],

  // Prestations phares (prix TTC) — alimentent le catalogue d'offres du balisage
  services: [
    { name: 'Soin du visage Kobido', price: 120, duration: 60 },
    { name: 'Cure Rituel Kobido', price: 320, duration: 180 },
    { name: 'Drainage lymphatique + Kobido', price: 140, duration: 75 },
    { name: 'Madero Sculpt', price: 90, duration: 60 },
    { name: 'Coaching en nutrition', price: 80, duration: 45 },
  ],
};

/** Adresse affichable en une ligne (n'affiche que ce qui est renseigné). */
export function addressLine(): string {
  return [BUSINESS.streetAddress, `${BUSINESS.postalCode} ${BUSINESS.city}`.trim()]
    .filter(Boolean)
    .join(', ');
}
