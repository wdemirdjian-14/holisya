import Header from '@/components/header';
import Footer from '@/components/footer';
import ReviewClient from './review-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votre avis' };

export default function AvisPage({ searchParams }: { searchParams: { t?: string } }) {
  return (
    <><Header /><main className="pt-24 pb-16 min-h-[60vh] bg-[#F8F4EF]"><ReviewClient token={searchParams?.t ?? ''} /></main><Footer /></>
  );
}
