import Header from '@/components/header';
import Footer from '@/components/footer';
import ProfileClient from './profile-client';

export const metadata = { title: 'Mon Profil' };

export default function ProfilPage() {
  return (<><Header /><main className="pt-20 min-h-screen bg-[#F8F4EF]"><ProfileClient /></main><Footer /></>);
}
