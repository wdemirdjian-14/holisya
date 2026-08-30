import Header from '@/components/header';
import Footer from '@/components/footer';
import SignupForm from './signup-form';

export const metadata = { title: 'Inscription' };

export default function InscriptionPage() {
  return (<><Header /><main className="pt-24 pb-20 min-h-screen bg-[#F8F4EF]"><SignupForm /></main><Footer /></>);
}
