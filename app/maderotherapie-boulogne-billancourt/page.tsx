import LocalLanding from '@/components/local-landing';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/maderotherapie-boulogne-billancourt', {
    title: 'Madérothérapie (Madero Sculpt) à Boulogne-Billancourt (92)',
    description:
      "Madérothérapie à Boulogne-Billancourt (92), aux portes de Paris : massage sculptant au bois anti-cellulite, remodelage de la silhouette et relaxation. Institut de bien-être féminin, réservation en ligne.",
    alternates: { canonical: '/maderotherapie-boulogne-billancourt' },
  });
}

export default function Page() {
  return (
    <LocalLanding
      path="/maderotherapie-boulogne-billancourt"
      city="Boulogne-Billancourt"
      serviceType="Madérothérapie"
      eyebrow="Madérothérapie · Boulogne-Billancourt"
      h1="Madérothérapie à Boulogne-Billancourt"
      locationNote="Institut à Boulogne-Billancourt (92100), aux portes de Paris"
      intro={[
        "Affinez et remodelez votre silhouette grâce à la madérothérapie (Madero Sculpt), le massage sculptant au bois, dans notre institut de bien-être féminin à Boulogne-Billancourt.",
        "La madérothérapie utilise des instruments en bois spécialement conçus pour masser en profondeur, stimuler la circulation et le système lymphatique, et aider à lisser la peau. C'est un soin de choix contre la cellulite et pour redessiner les courbes du corps, dans une vraie parenthèse de relaxation.",
        "Chez Holisya, chaque séance s'inscrit dans une approche holistique : nous adaptons l'intensité et les zones travaillées (cuisses, ventre, fessiers, bras) à vos objectifs, en cure ou en soin unique.",
        "Idéalement situées à Boulogne-Billancourt, à deux pas de Paris et de l'Ouest parisien (16e, 15e), nos séances sont accessibles en quelques minutes et réservables en ligne 7j/7.",
      ]}
      reasons={[
        { title: 'Massage sculptant au bois', text: "Une technique manuelle aux outils en bois pour remodeler la silhouette et lisser l'aspect de la peau." },
        { title: 'Action anti-cellulite', text: "Stimule la circulation et le drainage pour atténuer la cellulite et l'effet peau d'orange, séance après séance." },
        { title: 'Relaxation & bien-être', text: "Un soin du corps enveloppant qui associe résultats esthétiques et détente profonde." },
        { title: 'Réservation en ligne 7j/7', text: "Choisissez votre créneau en quelques clics, avec confirmation immédiate, aux portes de Paris." },
      ]}
      faq={[
        { q: "Qu'est-ce que la madérothérapie (Madero Sculpt) ?", a: "La madérothérapie est un massage sculptant pratiqué avec des instruments en bois. Elle masse les tissus en profondeur, stimule la circulation et le drainage lymphatique pour remodeler la silhouette, atténuer la cellulite et lisser la peau, tout en procurant une agréable relaxation." },
        { q: "Combien de séances pour voir des résultats ?", a: "Les premiers effets (peau plus lisse, silhouette redessinée) apparaissent souvent au bout de quelques séances. Pour un résultat durable, une cure de plusieurs séances rapprochées est recommandée ; nous définissons ensemble le rythme lors du premier rendez-vous à Boulogne-Billancourt." },
        { q: "La madérothérapie fait-elle mal ?", a: "Le soin peut être intense sur certaines zones, mais l'intensité est toujours adaptée à votre ressenti. Beaucoup de clientes le vivent comme un massage tonique et relaxant à la fois." },
        { q: "Comment prendre rendez-vous ?", a: "Directement en ligne sur cette page (bouton « Réserver un soin »), disponible 7j/7 avec confirmation immédiate. Vous pouvez aussi nous contacter par e-mail." },
      ]}
    />
  );
}
