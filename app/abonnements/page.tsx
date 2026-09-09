import Header from '@/components/header';
import Footer from '@/components/footer';
import SubscriptionsClient from './subscriptions-client';
import { areSubscriptionsEnabled } from '@/lib/site-flags';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Abonnements' };

export default async function AbonnementsPage() {
  if (!(await areSubscriptionsEnabled())) notFound();
  return (<><Header /><main className="pt-20"><SubscriptionsClient /></main><Footer /></>);
}
