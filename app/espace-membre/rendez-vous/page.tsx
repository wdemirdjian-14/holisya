import Header from '@/components/header';
import Footer from '@/components/footer';
import AppointmentsClient from './appointments-client';

export const metadata = { title: 'Mes Rendez-vous' };

export default function RendezVousPage() {
  return (<><Header /><main className="pt-20 min-h-screen bg-[#F8F4EF]"><AppointmentsClient /></main><Footer /></>);
}
