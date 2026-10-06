import Header from '@/components/header';
import Footer from '@/components/footer';
import BookingClient from './booking-client';

export const dynamic = 'force-dynamic';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/rendez-vous', {
    title: 'Prendre Rendez-vous',
    description: "Réservez votre soin en ligne chez Holisya à Boulogne-Billancourt : Kobido, drainage lymphatique, Madero Sculpt. Choisissez votre créneau en quelques clics.",
    alternates: { canonical: '/rendez-vous' },
  });
}

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
