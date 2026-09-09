import './globals.css';
import Providers from './providers';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import ContactWidget from '@/components/contact-widget';
import MobileNav from '@/components/mobile-nav';
import ServiceWorkerRegister from '@/components/service-worker-register';
import LocalBusinessJsonLd from '@/components/local-business-jsonld';

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
    title: {
      default: 'Holisya | Massage Kobido & bien-être à Boulogne-Billancourt et Paris',
      template: '%s | Holisya Boulogne-Billancourt',
    },
    description:
      "Institut de bien-être féminin à Boulogne-Billancourt (92), aux portes de Paris. Massage du visage Kobido, drainage lymphatique, Madero Sculpt et coaching nutrition. Réservez votre soin en ligne.",
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
      title: 'Holisya | Massage Kobido & bien-être à Boulogne-Billancourt et Paris',
      description:
        "Institut de bien-être féminin à Boulogne-Billancourt, aux portes de Paris. Kobido, drainage lymphatique, nutrition. Réservez en ligne.",
      url: siteUrl,
      siteName: 'Holisya',
      locale: 'fr_FR',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-opensans antialiased">
        <LocalBusinessJsonLd />
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
