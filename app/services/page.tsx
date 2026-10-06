import Header from '@/components/header';
import Footer from '@/components/footer';
import ServicesClient from './services-client';
import FaqSection from '@/components/faq-section';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/services', {
    title: 'Nos soins : Kobido, drainage lymphatique & soins visage',
    description:
      "Découvrez nos soins à Boulogne-Billancourt et Paris : massage du visage Kobido (lifting naturel), drainage lymphatique, Madero Sculpt et coaching nutrition. Tarifs et réservation en ligne.",
    alternates: { canonical: '/services' },
  });
}

const SERVICES_FAQ = [
  { q: "Quels soins propose l'institut Holisya à Boulogne-Billancourt ?", a: "Holisya propose le massage du visage Kobido (lifting naturel japonais), le drainage lymphatique, la madérothérapie (Madero Sculpt, massage sculptant au bois), des soins du visage et un coaching nutrition. Chaque prestation s'inscrit dans une approche holistique du bien-être féminin, à Boulogne-Billancourt (92), aux portes de Paris." },
  { q: "Quelle est la différence entre Kobido, drainage lymphatique et madérothérapie ?", a: "Le Kobido est un massage du visage qui raffermit la peau et illumine le teint (lifting naturel). Le drainage lymphatique est un massage doux du corps qui élimine les toxines, soulage les jambes lourdes et réduit la rétention d'eau. La madérothérapie est un massage sculptant au bois, anti-cellulite, qui remodèle la silhouette. Les trois procurent aussi une vraie relaxation." },
  { q: "Proposez-vous du coaching nutrition ?", a: "Oui. Nous proposons un coaching nutrition personnalisé, en cabinet à Boulogne-Billancourt ou en visio : un rééquilibrage alimentaire durable, sans frustration, qui se marie idéalement avec nos soins du corps pour un bien-être global." },
  { q: "Vos soins sont-ils aussi un moment de relaxation ?", a: "Absolument. Au-delà des résultats esthétiques, chaque soin est pensé comme une parenthèse de relaxation et de reconnexion à soi, dans un cadre cocon à Boulogne-Billancourt, aux portes de Paris (16e, 15e)." },
  { q: "Comment réserver un soin ?", a: "La réservation se fait en ligne 7j/7 avec confirmation immédiate depuis la page Rendez-vous. Vous pouvez aussi nous contacter par e-mail pour toute question sur le soin le plus adapté à vos besoins." },
];

export default function ServicesPage() {
  return (<><Header /><main className="pt-20"><ServicesClient /><FaqSection items={SERVICES_FAQ} /></main><Footer /></>);
}
