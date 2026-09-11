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

  // --- Localisation (institut à Boulogne-Billancourt) ---
  streetAddress: '66 Boulevard Jean Jaurès',
  city: 'Boulogne-Billancourt',
  postalCode: '92100',
  region: 'Île-de-France',
  country: 'FR',
  // Coordonnées GPS exactes (fiche Google Maps)
  geo: { lat: 48.8401573, lng: 2.2394942 },

  // --- Contact ---
  email: 'contact@holisya.fr',
  phone: '+33618264346',
  phoneDisplay: '06 18 26 43 46',
  whatsapp: '',                   // laissé vide : activer seulement si ce numéro a WhatsApp

  // --- Horaires (openingHoursSpecification) ---
  // days : 'Monday'..'Sunday'
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], open: '17:00', close: '20:00' },
    { days: ['Saturday'], open: '10:00', close: '20:00' },
  ] as { days: string[]; open: string; close: string }[],

  // --- Zone desservie (pour le SEO local Paris + Ouest parisien) ---
  areaServed: ['Boulogne-Billancourt', 'Paris', 'Paris 16e', 'Paris 15e', 'Hauts-de-Seine'],

  priceRange: '€€',
  bookingUrl: `${SITE_URL}/rendez-vous`,
  image: `${SITE_URL}/og-image.png`,

  // --- Réseaux / profils (champ sameAs du balisage) : à compléter ---
  sameAs: [
    'https://www.instagram.com/holisya_/',
    'https://www.planity.com/le-chalet-des-cils-92100-boulogne-billancourt',
    // 'https://www.facebook.com/...',    // à ajouter si page Facebook
  ] as string[],

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
