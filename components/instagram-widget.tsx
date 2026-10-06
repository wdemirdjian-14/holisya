'use client';

import { usePathname } from 'next/navigation';
import { Instagram } from 'lucide-react';

/**
 * Bouton flottant « Suivez-nous sur Instagram ».
 * Présent sur tout le site public, masqué sur l'administration et le parcours de prise de RDV.
 * Placé en bas à gauche (le widget de rappel occupe le bas à droite).
 */
const IG_URL = 'https://www.instagram.com/holisya_/';

export default function InstagramWidget() {
  const pathname = usePathname() || '';
  if (pathname.startsWith('/admin') || pathname.startsWith('/rendez-vous')) return null;

  return (
    <a
      href={IG_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Suivez Holisya sur Instagram"
      title="Suivez-nous sur Instagram"
      className="group fixed bottom-24 lg:bottom-6 left-4 lg:left-6 z-50 flex items-center h-12 lg:h-14 rounded-full shadow-lg text-white
                 transition-all duration-300 overflow-hidden
                 w-12 lg:w-14 lg:hover:w-48"
      style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
    >
      <span className="flex items-center justify-center w-12 lg:w-14 h-12 lg:h-14 shrink-0">
        <Instagram size={22} />
      </span>
      <span className="hidden lg:block whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-5">
        Suivez-nous
      </span>
    </a>
  );
}
