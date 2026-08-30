import Header from '@/components/header';
import Footer from '@/components/footer';
import ResetForm from './reset-form';

export const metadata = { title: 'Réinitialiser le mot de passe' };

export default function ResetPage() {
  return (<><Header /><main className="pt-24 pb-20 min-h-screen bg-[#F8F4EF]"><ResetForm /></main><Footer /></>);
}
