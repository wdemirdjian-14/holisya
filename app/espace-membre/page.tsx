import Header from '@/components/header';
import Footer from '@/components/footer';
import MemberDashboard from './member-dashboard';

export const metadata = { title: 'Mon Espace' };

export default function EspaceMembrePage() {
  return (<><Header /><main className="pt-20 min-h-screen bg-[#F8F4EF]"><MemberDashboard /></main><Footer /></>);
}
