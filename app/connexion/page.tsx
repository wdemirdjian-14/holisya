import Header from '@/components/header';
import Footer from '@/components/footer';
import LoginForm from './login-form';

export const metadata = { title: 'Connexion' };

export default function ConnexionPage() {
  return (<><Header /><main className="pt-24 pb-20 min-h-screen bg-[#F8F4EF]"><LoginForm /></main><Footer /></>);
}
