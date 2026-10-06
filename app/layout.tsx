import './globals.css';
import { Suspense } from 'react';
import Providers from './providers';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import ContactWidget from '@/components/contact-widget';
import MobileNav from '@/components/mobile-nav';
import ServiceWorkerRegister from '@/components/service-worker-register';
import LocalBusinessJsonLd from '@/components/local-business-jsonld';
import SiteJsonLd from '@/components/site-jsonld';
import ScrollFlower from '@/components/scroll-flower';
import Analytics from '@/components/analytics';
import CookieConsent from '@/components/cookie-consent';
import { getSeoSettings } from '@/lib/seo/settings';
import { getMetaOverride } from '@/lib/seo/meta';

export const dynamic = 'force-dynamic';

export const viewport = {
  themeColor: '#C98F79',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export async function generateMetadata() {
  const siteUrl = process.env.NEXTAUTH_URL ?? 'https://holisya.fr';
  const override = await getMetaOverride('/'); // titre/description éditables en admin (page d'accueil)
  const defaultTitle = override.title || 'Massage & Kobido à Boulogne-Billancourt (92) | Holisya';
  const defaultDescription = override.description ||
    "Institut de massage à Boulogne-Billancourt (92), aux portes de Paris : Kobido (lifting naturel), drainage lymphatique et soin du visage. Noté 5,0 ★. Réservez en ligne 7j/7.";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: '%s | Holisya Boulogne-Billancourt',
    },
    description: defaultDescription,
    keywords: [
      'massage Kobido Boulogne-Billancourt', 'massage Kobido Paris', 'massage visage Boulogne',
      'drainage lymphatique Boulogne-Billancourt', 'lifting naturel visage Paris',
      'institut bien-être Boulogne', 'soin visage anti-âge Paris', 'Madero Sculpt Boulogne',
    ],
    alternates: { canonical: '/' },
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, statusBarStyle: 'default' as const, title: 'Holisya' },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/icons/apple-touch-icon.png',
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: siteUrl,
      siteName: 'Holisya',
      locale: 'fr_FR',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const seo = await getSeoSettings();
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-opensans antialiased">
        <LocalBusinessJsonLd />
        <SiteJsonLd />
        <Suspense fallback={null}>
          <Analytics measurementId={seo.ga4MeasurementId} />
        </Suspense>
        <Providers>
          <div className="pb-16 lg:pb-0">
            {children}
          </div>
          <ContactWidget />
          <ScrollFlower />
          <MobileNav />
          <Toaster />
          <CookieConsent />
          <ChunkLoadErrorHandler />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
