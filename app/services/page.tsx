import Header from '@/components/header';
import Footer from '@/components/footer';
import ServicesClient from './services-client';

export const metadata = {
  title: 'Nos soins : Kobido, drainage lymphatique & soins visage',
  description:
    "Découvrez nos soins à Boulogne-Billancourt et Paris : massage du visage Kobido (lifting naturel), drainage lymphatique, Madero Sculpt et coaching nutrition. Tarifs et réservation en ligne.",
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (<><Header /><main className="pt-20"><ServicesClient /></main><Footer /></>);
}
