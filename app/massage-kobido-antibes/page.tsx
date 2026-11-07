import LocalLanding from '@/components/local-landing';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/massage-kobido-antibes', {
    title: 'Massage Kobido à Antibes (06)',
    description:
      "Massage du visage Kobido à Antibes : lifting naturel japonais, anti-âge et éclat du teint dans notre institut de bien-être, sur la Côte d'Azur. Réservez en ligne.",
    alternates: { canonical: '/massage-kobido-antibes' },
  });
}

export default function Page() {
  return (
    <LocalLanding
      path="/massage-kobido-antibes"
      city="Antibes"
      serviceType="Massage du visage Kobido"
      eyebrow="Massage Kobido · Antibes"
      h1="Massage Kobido à Antibes"
      locationNote="Institut à Antibes (06600), 16 Avenue Guillabert — Côte d'Azur"
      intro={[
        "Offrez à votre visage le lifting naturel du Kobido, ce massage japonais ancestral, dans notre institut de bien-être à Antibes.",
        "Le Kobido est un art du massage facial venu du Japon qui stimule la microcirculation, tonifie les muscles du visage et relance naturellement la production de collagène. Le résultat : un teint éclatant, des traits reposés et une véritable détente, sans injection ni chirurgie.",
        "Chez Holisya, chaque soin s'inscrit dans une approche holistique du bien-être féminin. Nous prenons le temps de comprendre votre peau et vos attentes pour composer un rituel sur-mesure, du soin unique à la cure anti-âge en plusieurs séances.",
        "Idéalement situées à Antibes, en plein cœur de la Côte d'Azur (Juan-les-Pins, Biot, Cannes), nos prestations sont accessibles en quelques minutes et réservables en ligne.",
      ]}
      reasons={[
        { title: 'Expertise Kobido', text: "Une gestuelle précise, fidèle à la tradition japonaise, pour un lifting naturel visible dès les premières séances." },
        { title: 'Approche holistique', text: "Bien plus qu'un soin esthétique : un moment de reconnexion à soi, corps et esprit." },
        { title: 'Réservation en ligne', text: "Choisissez votre créneau en quelques clics, avec confirmation immédiate." },
        { title: "Au cœur d'Antibes", text: "Un institut facilement accessible à Antibes, Juan-les-Pins et dans tout l'Est des Alpes-Maritimes." },
      ]}
      faq={[
        { q: "Le Kobido, qu'est-ce que c'est exactement ?", a: "Le Kobido est un massage facial japonais traditionnel surnommé « lifting naturel ». Par des mouvements rapides et rythmés, il stimule les muscles et la circulation du visage pour raffermir la peau, lisser les traits et illuminer le teint." },
        { q: "Combien de temps dure une séance à Antibes ?", a: "Un soin du visage Kobido dure environ 60 minutes. Nous proposons aussi une cure anti-âge en plusieurs séances pour des résultats durables, ainsi qu'un soin hybride drainage lymphatique + Kobido." },
        { q: "Le massage Kobido convient-il à toutes les peaux ?", a: "Oui. Le Kobido est un soin naturel et non invasif adapté à tous les types de peau. Lors du premier rendez-vous, nous adaptons la gestuelle et l'intensité à votre visage et à vos besoins." },
        { q: "Comment prendre rendez-vous à Antibes ?", a: "Directement en ligne sur cette page (bouton « Réserver un soin »), avec confirmation immédiate. Vous pouvez aussi nous contacter par e-mail." },
      ]}
    />
  );
}
