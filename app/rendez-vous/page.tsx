import Header from '@/components/header';
import Footer from '@/components/footer';
import BookingClient from './booking-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Prendre Rendez-vous' };

export default function RendezVousPage() {
  return (
    <>
      <Header />
      <main className="pt-20 bg-[#F8F4EF] min-h-screen">
        <BookingClient />
      </main>
      <Footer />
    </>
  );
}
