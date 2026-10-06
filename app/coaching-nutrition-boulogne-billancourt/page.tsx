import LocalLanding from '@/components/local-landing';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/coaching-nutrition-boulogne-billancourt', {
    title: 'Coaching nutrition à Boulogne-Billancourt (92) & à distance',
    description:
      "Coaching nutrition à Boulogne-Billancourt (92) et à distance : accompagnement personnalisé, rééquilibrage alimentaire et bien-être au naturel. Institut Holisya, prise de rendez-vous en ligne.",
    alternates: { canonical: '/coaching-nutrition-boulogne-billancourt' },
  });
}

export default function Page() {
  return (
    <LocalLanding
      path="/coaching-nutrition-boulogne-billancourt"
      city="Boulogne-Billancourt"
      serviceType="Coaching nutrition"
      eyebrow="Coaching nutrition · Boulogne-Billancourt"
      h1="Coaching nutrition à Boulogne-Billancourt"
      locationNote="À Boulogne-Billancourt (92100) et en visio, aux portes de Paris"
      intro={[
        "Retrouvez énergie, équilibre et confiance grâce à un coaching nutrition personnalisé, chez Holisya à Boulogne-Billancourt ou à distance en visio.",
        "Loin des régimes restrictifs, notre accompagnement nutrition vise un rééquilibrage alimentaire durable, adapté à votre mode de vie, vos objectifs (vitalité, silhouette, digestion, bien-être hormonal) et vos goûts.",
        "Dans une approche holistique du bien-être féminin, le coaching nutrition se marie idéalement avec nos soins corps (drainage lymphatique, madérothérapie) pour des résultats visibles et un vrai mieux-être au quotidien.",
        "Que vous soyez à Boulogne-Billancourt, à Paris ou ailleurs, les séances sont accessibles en cabinet ou en visio, et réservables en ligne.",
      ]}
      reasons={[
        { title: 'Accompagnement sur-mesure', text: "Un plan nutritionnel personnalisé, sans frustration, construit autour de votre réalité et de vos objectifs." },
        { title: 'Rééquilibrage durable', text: "On privilégie des habitudes tenables dans le temps plutôt que des régimes éclair sans lendemain." },
        { title: 'Approche holistique', text: "La nutrition en complément de nos soins bien-être, pour agir à la fois de l'intérieur et de l'extérieur." },
        { title: 'En cabinet ou en visio', text: "Des séances à Boulogne-Billancourt ou à distance, à réserver en ligne selon vos disponibilités." },
      ]}
      faq={[
        { q: "En quoi consiste le coaching nutrition chez Holisya ?", a: "C'est un accompagnement personnalisé vers un rééquilibrage alimentaire durable : bilan de vos habitudes, objectifs, conseils concrets et suivi. L'idée n'est pas d'imposer un régime, mais de construire une alimentation qui vous convient et que vous pouvez tenir dans le temps." },
        { q: "Les séances se font-elles à Boulogne-Billancourt ou en ligne ?", a: "Les deux. Vous pouvez venir à l'institut à Boulogne-Billancourt (92), aux portes de Paris, ou suivre votre coaching nutrition en visio si c'est plus pratique pour vous." },
        { q: "Peut-on associer la nutrition aux soins du corps ?", a: "Oui, c'est même recommandé. Le coaching nutrition se combine parfaitement avec le drainage lymphatique et la madérothérapie pour agir à la fois de l'intérieur (alimentation) et de l'extérieur (soins), dans une logique de bien-être global." },
        { q: "Comment prendre rendez-vous ?", a: "Directement en ligne sur cette page (bouton « Réserver un soin »), avec confirmation. Vous pouvez aussi nous contacter par e-mail pour un premier échange." },
      ]}
    />
  );
}
