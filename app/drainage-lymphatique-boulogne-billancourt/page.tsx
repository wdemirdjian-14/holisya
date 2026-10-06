import LocalLanding from '@/components/local-landing';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/drainage-lymphatique-boulogne-billancourt', {
    title: 'Drainage lymphatique à Boulogne-Billancourt (92)',
    description:
      "Drainage lymphatique manuel à Boulogne-Billancourt (92), aux portes de Paris : jambes légères, détox, anti-rétention d'eau et peau éclatante. Institut de bien-être féminin, réservation en ligne.",
    alternates: { canonical: '/drainage-lymphatique-boulogne-billancourt' },
  });
}

export default function Page() {
  return (
    <LocalLanding
      path="/drainage-lymphatique-boulogne-billancourt"
      city="Boulogne-Billancourt"
      serviceType="Drainage lymphatique"
      eyebrow="Drainage lymphatique · Boulogne-Billancourt"
      h1="Drainage lymphatique à Boulogne-Billancourt"
      locationNote="Institut à Boulogne-Billancourt (92100), aux portes de Paris"
      intro={[
        "Retrouvez des jambes légères et une sensation de bien-être profond grâce au drainage lymphatique manuel, dans notre institut de bien-être féminin à Boulogne-Billancourt.",
        "Le drainage lymphatique est un massage doux et rythmé qui stimule la circulation de la lymphe. Il aide à éliminer les toxines, à réduire la rétention d'eau et les sensations de jambes lourdes, tout en affinant la silhouette et en illuminant la peau.",
        "Chez Holisya, chaque séance s'inscrit dans une approche holistique : nous adaptons la pression et le parcours de drainage à vos besoins, qu'il s'agisse de détox, de récupération, de confort pré/post-grossesse ou d'un simple moment de relâchement.",
        "Idéalement situées à Boulogne-Billancourt, à deux pas de Paris et de l'Ouest parisien (16e, 15e), nos séances sont accessibles en quelques minutes et réservables en ligne 7j/7.",
      ]}
      reasons={[
        { title: 'Technique manuelle douce', text: "Un drainage lymphatique précis, tout en lenteur et en rythme, pour relancer la circulation sans agresser les tissus." },
        { title: 'Jambes légères & détox', text: "Idéal contre la rétention d'eau, les jambes lourdes et pour un effet détox visible sur la silhouette et le teint." },
        { title: 'Approche holistique', text: "Un vrai temps pour soi, qui associe bien-être du corps et détente de l'esprit." },
        { title: 'Réservation en ligne 7j/7', text: "Choisissez votre créneau en quelques clics, avec confirmation immédiate, aux portes de Paris." },
      ]}
      faq={[
        { q: "À quoi sert le drainage lymphatique ?", a: "Le drainage lymphatique manuel stimule la circulation de la lymphe pour éliminer les toxines et l'excès de liquides. Il soulage les jambes lourdes, réduit la rétention d'eau, favorise la détox et aide à affiner la silhouette, tout en procurant une profonde détente." },
        { q: "Combien de temps dure une séance à Boulogne-Billancourt ?", a: "Une séance de drainage lymphatique dure en général 60 minutes. Nous proposons aussi un soin hybride drainage + Kobido (75 min) pour associer bien-être du corps et éclat du visage, ainsi que des cures en plusieurs séances." },
        { q: "À quelle fréquence faire un drainage lymphatique ?", a: "Pour un effet détox ou anti-jambes lourdes, une cure de plusieurs séances rapprochées donne les meilleurs résultats, puis un entretien régulier. Lors du premier rendez-vous, nous définissons ensemble le rythme adapté à vos objectifs." },
        { q: "Le drainage lymphatique convient-il à tout le monde ?", a: "C'est un soin doux et non invasif adapté à la plupart des personnes. Certaines contre-indications existent (problèmes veineux ou cardiaques sévères, infections…) : parlez-nous de votre situation à la prise de rendez-vous, nous adaptons ou vous orientons si besoin." },
        { q: "Comment prendre rendez-vous ?", a: "Directement en ligne sur cette page (bouton « Réserver un soin »), disponible 7j/7 avec confirmation immédiate. Vous pouvez aussi nous contacter par e-mail." },
      ]}
    />
  );
}
