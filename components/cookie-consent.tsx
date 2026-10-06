'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Bandeau de consentement cookies (RGPD) pour la mesure d'audience (GA4).
 * Tant que la visiteuse n'a pas choisi, aucun cookie analytics n'est posé
 * (Consent Mode par défaut = denied dans components/analytics.tsx).
 */
const KEY = 'holisya_consent_v1';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch { /* localStorage indisponible : on n'affiche rien */ }
  }, []);

  const choose = (granted: boolean) => {
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch {}
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
      });
      if (granted) {
        (window as any).gtag('event', 'page_view', { page_path: window.location.pathname });
      }
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-2xl bg-white border border-[#E9E0D6] shadow-lg rounded-2xl p-4 sm:p-5">
        <p className="text-sm text-[#3B312D]/80 leading-relaxed">
          Nous utilisons des cookies de mesure d'audience (Google Analytics) pour améliorer votre
          expérience. Vous pouvez accepter ou refuser.{' '}
          <Link href="/politique-confidentialite" className="underline text-[#C98F79]">En savoir plus</Link>.
        </p>
        <div className="flex flex-wrap gap-2 mt-3 justify-end">
          <button
            onClick={() => choose(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[#E9E0D6] text-[#3B312D]/70 hover:bg-[#F8F4EF]"
          >
            Refuser
          </button>
          <button
            onClick={() => choose(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#C98F79] text-white hover:bg-[#b87d68]"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
