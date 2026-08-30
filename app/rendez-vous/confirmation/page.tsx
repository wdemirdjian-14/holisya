import Header from '@/components/header';
import Footer from '@/components/footer';
import ConfirmationClient from './confirmation-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Confirmation de rendez-vous' };

export default function ConfirmationPage({ searchParams }: { searchParams: { imprint?: string; cancelled?: string } }) {
  return (
    <><Header /><main className="pt-24 pb-16 min-h-[60vh] bg-[#F8F4EF]"><ConfirmationClient imprint={searchParams?.imprint ?? ''} cancelled={searchParams?.cancelled ?? ''} /></main><Footer /></>
  );
}
