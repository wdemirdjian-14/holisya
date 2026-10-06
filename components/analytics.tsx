'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Google Analytics 4 avec Consent Mode v2 (RGPD).
 * - Par défaut, le consentement analytics est REFUSÉ (aucun cookie de mesure).
 * - Le bandeau cookies (components/cookie-consent.tsx) appelle gtag('consent','update')
 *   quand la visiteuse accepte, et on déclenche la mesure à ce moment-là.
 * - Suit aussi les changements de page (SPA) via page_view manuels.
 */
export default function Analytics({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined' || !(window as any).gtag) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    (window as any).gtag('event', 'page_view', { page_path: url, page_location: window.location.href });
  }, [pathname, searchParams, measurementId]);

  if (!measurementId) return null;

  return (
    <>
      <Script id="ga-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
          try {
            if (localStorage.getItem('holisya_consent_v1') === 'granted') {
              gtag('consent', 'update', { analytics_storage: 'granted' });
            }
          } catch (e) {}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true, send_page_view: true });
        `}
      </Script>
      <Script
        id="ga-lib"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </>
  );
}
