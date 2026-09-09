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

  // --- Localisation (institut à Boulogne-Billancourt) ---
  streetAddress: '',              // ⚠️ à compléter, ex : '12 avenue Jean-Baptiste Clément'
  city: 'Boulogne-Billancourt',
  postalCode: '92100',
  region: 'Île-de-France',
  country: 'FR',
  // Coordonnées GPS (par défaut : centre de Boulogne-Billancourt ; à affiner avec l'adresse exacte)
  geo: { lat: 48.8356, lng: 2.2419 },

  // --- Contact ---
  email: 'contact@holisya.fr',
  phone: '',                      // ⚠️ format international pour les liens, ex : '+33612345678'
  phoneDisplay: '',               // ⚠️ format affiché, ex : '06 12 34 56 78'
  whatsapp: '',                   // ⚠️ numéro international sans '+', ex : '33612345678'

  // --- Horaires (openingHoursSpecification) : à compléter ---
  // days : 'Monday'..'Sunday' — laisser [] tant que non renseigné
  hours: [] as { days: string[]; open: string; close: string }[],
  // Exemple à décommenter/adapter :
  // hours: [{ days: ['Tuesday','Wednesday','Thursday','Friday'], open: '10:00', close: '19:00' },
  //         { days: ['Saturday'], open: '10:00', close: '18:00' }],

  // --- Zone desservie (pour le SEO local Paris + Ouest parisien) ---
  areaServed: ['Boulogne-Billancourt', 'Paris', 'Paris 16e', 'Paris 15e', 'Hauts-de-Seine'],

  priceRange: '€€',
  bookingUrl: `${SITE_URL}/rendez-vous`,
  image: `${SITE_URL}/og-image.png`,

  // --- Réseaux / profils (champ sameAs du balisage) : à compléter ---
  sameAs: [
    'https://www.planity.com/le-chalet-des-cils-92100-boulogne-billancourt',
    // 'https://www.instagram.com/...',   // ⚠️ à ajouter
    // 'https://www.facebook.com/...',    // ⚠️ à ajouter
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
