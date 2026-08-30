import Header from '@/components/header';
import Footer from '@/components/footer';
import SuccessClient from './success-client';

export const metadata = { title: 'Achat réussi' };

export default function SuccessPage() {
  return (<><Header /><main className="pt-24 pb-20 min-h-screen bg-[#F8F4EF]"><SuccessClient /></main><Footer /></>);
}
