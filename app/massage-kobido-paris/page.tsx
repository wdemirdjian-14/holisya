import LocalLanding from '@/components/local-landing';

export const metadata = {
  title: 'Massage Kobido à Paris (Ouest parisien)',
  description:
    "Massage du visage Kobido près de Paris : lifting naturel japonais, drainage lymphatique et soins anti-âge. Institut de bien-être féminin à Boulogne-Billancourt, aux portes du 16e et du 15e. Réservez en ligne.",
  alternates: { canonical: '/massage-kobido-paris' },
};

export default function Page() {
  return (
    <LocalLanding
      path="/massage-kobido-paris"
      city="Paris"
      eyebrow="Massage Kobido · Paris Ouest"
      h1="Massage Kobido à Paris"
      locationNote="Aux portes de Paris — institut à Boulogne-Billancourt (16e / 15e à quelques minutes)"
      intro={[
        "Envie d'un lifting naturel du visage à Paris ? Découvrez le Kobido, ce massage facial japonais d'exception, dans notre institut de bien-être féminin situé à Boulogne-Billancourt, aux portes de l'Ouest parisien.",
        "Le Kobido stimule la microcirculation, tonifie les muscles du visage et relance la production de collagène. Sans injection ni chirurgie, il redonne au visage éclat, fermeté et douceur, tout en offrant une profonde relaxation.",
        "Facilement accessible depuis le 16e et le 15e arrondissement, Holisya accueille les Parisiennes en quête d'un soin haut de gamme et d'une parenthèse de bien-être, à quelques minutes seulement du centre de Paris.",
        "Nos soins — du Kobido au drainage lymphatique, en passant par le Madero Sculpt et le coaching nutrition — sont réservables en ligne 7j/7, avec confirmation immédiate.",
      ]}
      reasons={[
        { title: 'Un soin d\'exception près de Paris', text: "L'expertise du Kobido japonais, à quelques minutes du 16e et du 15e arrondissement." },
        { title: 'Approche holistique', text: "Un rituel qui prend soin de votre visage comme de votre bien-être global." },
        { title: 'Réservation en ligne 7j/7', text: "Prenez rendez-vous en quelques clics, quand vous le souhaitez." },
        { title: 'Cadre calme et confidentiel', text: "Loin de l'agitation parisienne, un moment suspendu rien que pour vous." },
      ]}
      faq={[
        { q: "Où se déroulent les soins pour les Parisiennes ?", a: "Dans notre institut à Boulogne-Billancourt (92100), directement aux portes de Paris. Nous sommes à quelques minutes du 16e et du 15e arrondissement, facilement accessibles en transports." },
        { q: "Le Kobido remplace-t-il un lifting ?", a: "Le Kobido est un « lifting naturel » : il raffermit et tonifie le visage sans injection ni chirurgie. Les résultats sont progressifs et s'entretiennent idéalement en cure, pour un effet visible et durable." },
        { q: "Quels soins proposez-vous en plus du Kobido ?", a: "Le drainage lymphatique du visage, un soin hybride drainage + Kobido, le Madero Sculpt et un accompagnement en nutrition, pour une approche complète du bien-être féminin." },
        { q: "Comment réserver depuis Paris ?", a: "En ligne, directement sur cette page (bouton « Réserver un soin »), 7j/7 et avec confirmation immédiate." },
      ]}
    />
  );
}
