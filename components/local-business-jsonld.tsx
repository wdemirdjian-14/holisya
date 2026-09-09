import { BUSINESS, SITE_URL } from '@/lib/business';

/**
 * Données structurées schema.org LocalBusiness (HealthAndBeautyBusiness / DaySpa).
 * Injecté sur toutes les pages via le layout. Ne publie QUE les champs réellement
 * renseignés dans lib/business.ts (jamais de fausse donnée).
 */
export default function LocalBusinessJsonLd() {
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: BUSINESS.city,
    postalCode: BUSINESS.postalCode,
    addressRegion: BUSINESS.region,
    addressCountry: BUSINESS.country,
  };
  if (BUSINESS.streetAddress) address.streetAddress = BUSINESS.streetAddress;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['HealthAndBeautyBusiness', 'DaySpa'],
    '@id': `${SITE_URL}/#business`,
    name: BUSINESS.name,
    description:
      "Institut de bien-être féminin à Boulogne-Billancourt : massage du visage Kobido, drainage lymphatique, Madero Sculpt et coaching nutrition. Sur rendez-vous, à deux pas de Paris.",
    url: SITE_URL,
    image: BUSINESS.image,
    logo: `${SITE_URL}/images/logo-holisya.png`,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: 'EUR',
    address,
    areaServed: BUSINESS.areaServed.map((a) => ({ '@type': 'City', name: a })),
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${BUSINESS.name} ${BUSINESS.postalCode} ${BUSINESS.city}`,
    )}`,
  };

  if (BUSINESS.phone) data.telephone = BUSINESS.phone;
  if (BUSINESS.geo) {
    data.geo = { '@type': 'GeoCoordinates', latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng };
  }
  if (BUSINESS.sameAs.length) data.sameAs = BUSINESS.sameAs;

  if (BUSINESS.hours.length) {
    data.openingHoursSpecification = BUSINESS.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.open,
      closes: h.close,
    }));
  }

  if (BUSINESS.services.length) {
    data.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Soins & prestations',
      itemListElement: BUSINESS.services.map((s) => ({
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: String(s.price),
        itemOffered: { '@type': 'Service', name: s.name },
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
