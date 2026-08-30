import Header from '@/components/header';
import Footer from '@/components/footer';
import GiftCardsClient from './gift-cards-client';

export const metadata = { title: 'Cartes Cadeaux' };

export default function CartesPage() {
  return (<><Header /><main className="pt-20"><GiftCardsClient /></main><Footer /></>);
}
