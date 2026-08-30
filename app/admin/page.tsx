import Header from '@/components/header';
import Footer from '@/components/footer';
import AdminDashboard from './admin-dashboard';

export const metadata = { title: 'Administration' };

export default function AdminPage() {
  return (<><Header /><main className="pt-20 min-h-screen bg-[#F8F4EF]"><AdminDashboard /></main><Footer /></>);
}
