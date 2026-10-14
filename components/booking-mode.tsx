'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { PLANITY_URL } from '@/lib/config';

// Mode de prise de RDV (site ou Planity), piloté depuis l'admin > Réservation en ligne.
type BookingMode = { planity: boolean; url: string };
const BookingModeContext = createContext<BookingMode>({ planity: false, url: PLANITY_URL });

export function BookingModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<BookingMode>({ planity: false, url: PLANITY_URL });
  useEffect(() => {
    fetch('/api/booking/config').then((r) => r.json())
      .then((d) => setMode({ planity: !!d?.planityMode, url: d?.planityUrl || PLANITY_URL }))
      .catch(() => {});
  }, []);
  return <BookingModeContext.Provider value={mode}>{children}</BookingModeContext.Provider>;
}

export const useBookingMode = () => useContext(BookingModeContext);

/** Lien "Prendre RDV" : /rendez-vous, ou Planity (nouvel onglet) quand la bascule est active. */
export function BookingLink({ children, ...props }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { children: React.ReactNode }) {
  const { planity, url } = useBookingMode();
  if (planity) return <a href={url} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
  return <Link href="/rendez-vous" {...props}>{children}</Link>;
}
