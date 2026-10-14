import Header from '@/components/header';
import Footer from '@/components/footer';
import BookingClient from './booking-client';
import { redirect } from 'next/navigation';
import { getPlanityMode } from '@/lib/site-flags';

export const dynamic = 'force-dynamic';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/rendez-vous', {
    title: 'Prendre Rendez-vous',
    description: "Réservez votre soin en ligne chez Holisya à Boulogne-Billancourt : Kobido, drainage lymphatique, Madero Sculpt. Choisissez votre créneau en quelques clics.",
    alternates: { canonical: '/rendez-vous' },
  });
}

export default async function RendezVousPage() {
  // Bascule Planity active : les anciens liens (emails, Google…) renvoient vers Planity.
  const planity = await getPlanityMode();
  if (planity.enabled) redirect(planity.url);
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
