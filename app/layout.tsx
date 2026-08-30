import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import ContactWidget from '@/components/contact-widget';
import MobileNav from '@/components/mobile-nav';
import ServiceWorkerRegister from '@/components/service-worker-register';

export const dynamic = 'force-dynamic';

export const viewport = {
  themeColor: '#C98F79',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export async function generateMetadata() {
  const siteUrl = process.env.NEXTAUTH_URL ?? 'https://holisya.fr';
  return {
    metadataBase: new URL(siteUrl),
    title: { default: 'Holisya | Bien-être Holistique Féminin', template: '%s | Holisya' },
    description: 'Approche holistique du bien-être féminin. Kobido, drainage lymphatique, nutrition et programmes personnalisés.',
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, statusBarStyle: 'default' as const, title: 'Holisya' },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/icons/icon-192.png',
    },
    openGraph: {
      title: 'Holisya | Bien-être Holistique Féminin',
      description: 'Approche holistique du bien-être féminin. Kobido, drainage lymphatique, nutrition et programmes personnalisés.',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-opensans antialiased">
        <Providers>
          <div className="pb-16 lg:pb-0">
            {children}
          </div>
          <ContactWidget />
          <MobileNav />
          <Toaster />
          <ChunkLoadErrorHandler />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
