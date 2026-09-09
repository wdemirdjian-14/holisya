import LocalLanding from '@/components/local-landing';

export const metadata = {
  title: 'Massage Kobido à Boulogne-Billancourt (92)',
  description:
    "Massage du visage Kobido à Boulogne-Billancourt : lifting naturel japonais, drainage lymphatique et soins anti-âge dans notre institut de bien-être féminin. Réservez en ligne.",
  alternates: { canonical: '/massage-kobido-boulogne-billancourt' },
};

export default function Page() {
  return (
    <LocalLanding
      path="/massage-kobido-boulogne-billancourt"
      city="Boulogne-Billancourt"
      eyebrow="Massage Kobido · Boulogne-Billancourt"
      h1="Massage Kobido à Boulogne-Billancourt"
      locationNote="Institut à Boulogne-Billancourt (92100), aux portes de Paris"
      intro={[
        "Offrez à votre visage le lifting naturel du Kobido, ce massage japonais ancestral, dans notre institut de bien-être féminin à Boulogne-Billancourt.",
        "Le Kobido est un art du massage facial venu du Japon qui stimule la microcirculation, tonifie les muscles du visage et relance naturellement la production de collagène. Le résultat : un teint éclatant, des traits reposés et une véritable détente, sans injection ni chirurgie.",
        "Chez Holisya, chaque soin s'inscrit dans une approche holistique du bien-être féminin. Nous prenons le temps de comprendre votre peau et vos attentes pour composer un rituel sur-mesure, du soin unique à la cure anti-âge en plusieurs séances.",
        "Idéalement situées à Boulogne-Billancourt, à deux pas de Paris et de l'Ouest parisien (16e, 15e), nos prestations sont accessibles en quelques minutes et réservables en ligne 7j/7.",
      ]}
      reasons={[
        { title: 'Expertise Kobido', text: "Une gestuelle précise, fidèle à la tradition japonaise, pour un lifting naturel visible dès les premières séances." },
        { title: 'Approche holistique', text: "Bien plus qu'un soin esthétique : un moment de reconnexion à soi, corps et esprit." },
        { title: 'Réservation en ligne 7j/7', text: "Choisissez votre créneau en quelques clics, avec confirmation immédiate." },
        { title: 'Aux portes de Paris', text: "Un institut facilement accessible depuis Boulogne, le 16e et le 15e arrondissement." },
      ]}
      faq={[
        { q: "Le Kobido, qu'est-ce que c'est exactement ?", a: "Le Kobido est un massage facial japonais traditionnel surnommé « lifting naturel ». Par des mouvements rapides et rythmés, il stimule les muscles et la circulation du visage pour raffermir la peau, lisser les traits et illuminer le teint." },
        { q: "Combien de temps dure une séance à Boulogne-Billancourt ?", a: "Un soin du visage Kobido dure environ 60 minutes. Nous proposons aussi une cure anti-âge en plusieurs séances pour des résultats durables, ainsi qu'un soin hybride drainage lymphatique + Kobido de 75 minutes." },
        { q: "Le massage Kobido convient-il à toutes les peaux ?", a: "Oui. Le Kobido est un soin naturel et non invasif adapté à tous les types de peau. Lors du premier rendez-vous, nous adaptons la gestuelle et l'intensité à votre visage et à vos besoins." },
        { q: "Comment prendre rendez-vous ?", a: "Directement en ligne sur cette page (bouton « Réserver un soin »), disponible 7j/7 avec confirmation immédiate. Vous pouvez aussi nous contacter par e-mail." },
      ]}
    />
  );
}
