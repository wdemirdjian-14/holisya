import { BUSINESS, SITE_URL } from '@/lib/business';

/**
 * Balisage Organization + WebSite (schema.org), injecté globalement.
 * Complète le LocalBusiness : aide Google et les LLM à identifier l'entité
 * « Holisya », son logo, ses réseaux et son contact.
 */
export default function SiteJsonLd() {
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-holisya.png`,
    image: BUSINESS.image,
    email: BUSINESS.email,
    slogan: BUSINESS.slogan,
  };
  if (BUSINESS.phone) {
    org.contactPoint = {
      '@type': 'ContactPoint',
      telephone: BUSINESS.phone,
      contactType: 'reservations',
      areaServed: 'FR',
      availableLanguage: ['French'],
    };
  }
  if (BUSINESS.sameAs.length) org.sameAs = BUSINESS.sameAs;

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BUSINESS.name,
    inLanguage: 'fr-FR',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
