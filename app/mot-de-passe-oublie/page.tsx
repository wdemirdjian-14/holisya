import Header from '@/components/header';
import Footer from '@/components/footer';
import ForgotPasswordForm from './forgot-form';

export const metadata = { title: 'Mot de passe oublié' };

export default function ForgotPasswordPage() {
  return (<><Header /><main className="pt-24 pb-20 min-h-screen bg-[#F8F4EF]"><ForgotPasswordForm /></main><Footer /></>);
}
