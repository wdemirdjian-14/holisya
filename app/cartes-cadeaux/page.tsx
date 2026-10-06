import Header from '@/components/header';
import Footer from '@/components/footer';
import GiftCardsClient from './gift-cards-client';

import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/cartes-cadeaux', {
    title: 'Cartes Cadeaux',
    description: "Offrez un moment de bien-être : carte cadeau Holisya valable 6 mois sur tous nos soins (Kobido, drainage lymphatique, Madero Sculpt) à Boulogne-Billancourt.",
    alternates: { canonical: '/cartes-cadeaux' },
  });
}

export default function CartesPage() {
  return (<><Header /><main className="pt-20"><GiftCardsClient /></main><Footer /></>);
}
