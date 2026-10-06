import Header from '@/components/header';
import Footer from '@/components/footer';
import ContactClient from './contact-client';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/contact', {
    title: 'Contact',
    description: "Contacter Holisya, institut de bien-être à Boulogne-Billancourt : adresse, téléphone, horaires et accès. Prenez rendez-vous pour un soin Kobido ou un drainage lymphatique.",
    alternates: { canonical: '/contact' },
  });
}

export default function ContactPage() {
  return (<><Header /><main className="pt-20"><ContactClient /></main><Footer /></>);
}
