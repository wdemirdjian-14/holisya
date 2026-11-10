'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X } from 'lucide-react';

/**
 * Bandeau d'annonce épinglé en haut de toutes les pages publiques.
 * Annonce l'ouverture d'Antibes + lien de réservation. Rejetable (localStorage).
 * Décale le header via la variable CSS --ann-h (lue dans le header et globals.css).
 */
const KEY = 'holisya_ann_antibes_v1';

export default function AnnouncementBar() {
  const pathname = usePathname() || '';
  const hiddenHere = pathname.startsWith('/admin') || pathname.startsWith('/rendez-vous') || pathname.startsWith('/agenda');
  const [dismissed, setDismissed] = useState(true); // true par défaut → évite le flash avant lecture localStorage

  useEffect(() => {
    try { setDismissed(localStorage.getItem(KEY) === '1'); } catch { setDismissed(false); }
  }, []);

  const visible = !dismissed && !hiddenHere;

  useEffect(() => {
    const root = document.documentElement;
    if (visible) {
      root.setAttribute('data-ann', '1');
      root.style.setProperty('--ann-h', '2.75rem');
    } else {
      root.removeAttribute('data-ann');
      root.style.setProperty('--ann-h', '0px');
    }
    return () => {
      root.removeAttribute('data-ann');
      root.style.setProperty('--ann-h', '0px');
    };
  }, [visible]);

  if (!visible) return null;

  const close = () => { try { localStorage.setItem(KEY, '1'); } catch {} setDismissed(true); };

  return (
    <div className="fixed top-0 inset-x-0 z-[70] h-11 flex items-center" style={{ background: 'linear-gradient(90deg, #C98F79 0%, #b87d68 100%)' }}>
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 w-full flex items-center justify-center gap-2 sm:gap-3 text-white">
        <Sparkles size={15} className="shrink-0 hidden sm:block" />
        <p className="text-[12.5px] sm:text-sm text-center leading-tight">
          <span className="font-semibold">Holisya ouvre à Antibes !</span>
          <span className="hidden sm:inline"> Soyez les premières à réserver votre soin.</span>
        </p>
        <Link
          href="/rendez-vous"
          className="shrink-0 px-3 py-1 rounded-full bg-white text-[#b87d68] text-[12px] sm:text-[13px] font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
        >
          Réserver
        </Link>
        <button onClick={close} aria-label="Fermer l'annonce" className="shrink-0 p-1 -mr-1 text-white/80 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
