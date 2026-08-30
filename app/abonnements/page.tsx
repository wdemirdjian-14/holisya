import Header from '@/components/header';
import Footer from '@/components/footer';
import SubscriptionsClient from './subscriptions-client';

export const metadata = { title: 'Abonnements' };

export default function AbonnementsPage() {
  return (<><Header /><main className="pt-20"><SubscriptionsClient /></main><Footer /></>);
}
