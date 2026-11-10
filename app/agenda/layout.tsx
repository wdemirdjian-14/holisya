import type { Metadata } from 'next';

// Vue agenda autonome, installable en application (web app) et réservée à l'administratrice.
export const metadata: Metadata = {
  title: { absolute: 'Holisya Agenda' },
  description: 'Agenda professionnel Holisya — pilotage du planning au quotidien.',
  manifest: '/agenda.webmanifest',
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Agenda' },
};

export default function AgendaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
