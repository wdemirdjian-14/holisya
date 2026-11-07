import LocalLanding from '@/components/local-landing';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/maderotherapie-antibes', {
    title: 'Madérothérapie (Madero Sculpt) à Antibes (06)',
    description:
      "Madérothérapie à Antibes : massage sculptant au bois anti-cellulite, remodelage de la silhouette et relaxation. Institut de bien-être sur la Côte d'Azur, réservation en ligne.",
    alternates: { canonical: '/maderotherapie-antibes' },
  });
}

export default function Page() {
  return (
    <LocalLanding
      path="/maderotherapie-antibes"
      city="Antibes"
      serviceType="Madérothérapie"
      eyebrow="Madérothérapie · Antibes"
      h1="Madérothérapie à Antibes"
      locationNote="Institut à Antibes (06600), 16 Avenue Guillabert — Côte d'Azur"
      intro={[
        "Affinez et remodelez votre silhouette grâce à la madérothérapie (Madero Sculpt), le massage sculptant au bois, dans notre institut de bien-être à Antibes.",
        "La madérothérapie utilise des instruments en bois spécialement conçus pour masser en profondeur, stimuler la circulation et le système lymphatique, et aider à lisser la peau. C'est un soin de choix contre la cellulite et pour redessiner les courbes du corps, dans une vraie parenthèse de relaxation.",
        "Chez Holisya, chaque séance s'inscrit dans une approche holistique : nous adaptons l'intensité et les zones travaillées (cuisses, ventre, fessiers, bras) à vos objectifs, en cure ou en soin unique.",
        "Idéalement situées à Antibes, sur la Côte d'Azur (Juan-les-Pins, Biot, Cannes), nos séances sont accessibles en quelques minutes et réservables en ligne.",
      ]}
      reasons={[
        { title: 'Massage sculptant au bois', text: "Une technique manuelle aux outils en bois pour remodeler la silhouette et lisser l'aspect de la peau." },
        { title: 'Action anti-cellulite', text: "Stimule la circulation et le drainage pour atténuer la cellulite et l'effet peau d'orange, séance après séance." },
        { title: 'Relaxation & bien-être', text: "Un soin du corps enveloppant qui associe résultats esthétiques et détente profonde." },
        { title: 'Réservation en ligne', text: "Choisissez votre créneau en quelques clics, avec confirmation immédiate, à Antibes." },
      ]}
      faq={[
        { q: "Qu'est-ce que la madérothérapie (Madero Sculpt) ?", a: "La madérothérapie est un massage sculptant pratiqué avec des instruments en bois. Elle masse les tissus en profondeur, stimule la circulation et le drainage lymphatique pour remodeler la silhouette, atténuer la cellulite et lisser la peau, tout en procurant une agréable relaxation." },
        { q: "Combien de séances pour voir des résultats ?", a: "Les premiers effets (peau plus lisse, silhouette redessinée) apparaissent souvent au bout de quelques séances. Pour un résultat durable, une cure de plusieurs séances rapprochées est recommandée ; nous définissons ensemble le rythme lors du premier rendez-vous à Antibes." },
        { q: "La madérothérapie fait-elle mal ?", a: "Le soin peut être intense sur certaines zones, mais l'intensité est toujours adaptée à votre ressenti. Beaucoup de clientes le vivent comme un massage tonique et relaxant à la fois." },
        { q: "Comment prendre rendez-vous à Antibes ?", a: "Directement en ligne sur cette page (bouton « Réserver un soin »), avec confirmation immédiate. Vous pouvez aussi nous contacter par e-mail." },
      ]}
    />
  );
}
