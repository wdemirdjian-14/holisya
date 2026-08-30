import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Date de référence pour la planification des publications.
// Ne pas utiliser new Date() ou Date.now() : on fige une date de départ fixe.
const START_DATE = new Date('2026-07-13T09:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

interface BlogArticleSeed {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  authorName?: string;
}

// NOTE SUR LA LOGIQUE DE PUBLICATION :
// La page publique (app/blog/page.tsx) filtre uniquement sur `isPublished: true`
// (where: { isPublished: true }, orderBy: { publishedAt: 'desc' }) et ne compare
// jamais `publishedAt` à la date du jour : il n'existe aucun mécanisme de type
// "planification différée" côté lecture. Le champ `isPublished` est donc un simple
// drapeau "publié/brouillon", et `publishedAt` ne sert qu'à l'affichage de la date
// et au tri (le plus récent en premier).
// Conformément à la consigne, on met donc `isPublished: true` pour tous les
// articles, et on laisse `publishedAt` porter la logique de planification
// (START_DATE, puis +7 jours par article). Si un mécanisme de filtrage par date
// est ajouté plus tard côté application, ce même échelonnement de `publishedAt`
// permettra un déploiement progressif sans modifier ce script.
const articles: BlogArticleSeed[] = [
  {
    title: "Le Kobido, l'art ancestral du massage facial japonais",
    slug: 'kobido-art-ancestral-massage-facial-japonais',
    category: 'Kobido',
    tags: 'kobido, massage facial, japon, tradition, histoire',
    excerpt:
      "Né dans le Japon impérial il y a plus de 700 ans, le Kobido est bien plus qu'un massage facial : une philosophie du soin transmise avec précision de génération en génération.",
    content: `
<h2>Une tradition née dans le Japon impérial</h2>
<p>Le mot « Kobido » signifie littéralement « voie ancienne de la beauté ». Ce massage facial trouverait ses origines il y a plus de sept siècles, dans l'entourage des familles impériales japonaises, avant d'être transmis dans le plus grand secret au sein de cercles restreints de praticiens. Contrairement à de nombreuses techniques de bien-être occidentales apparues récemment, le Kobido s'inscrit dans une lignée où chaque geste a été observé, affiné et transmis avec une exigence quasi artisanale.</p>
<p>Ce qui distingue le Kobido dès son origine, c'est son ambition double : offrir une détente profonde tout en travaillant le visage comme on travaillerait le corps entier, avec des pressions, des tapotements et des mouvements d'étirement pensés pour redonner du tonus aux tissus.</p>
<h2>Un massage codifié, geste après geste</h2>
<p>Le Kobido traditionnel se compose d'une succession de mouvements très codifiés, chacun ayant un objectif précis : stimuler la circulation, détendre les tensions musculaires du visage, ou encore accompagner le drainage naturel des tissus. On y retrouve notamment :</p>
<ul>
<li>Des pressions profondes le long des points d'acupression du visage et du cuir chevelu</li>
<li>Des mouvements de pétrissage pour dénouer les tensions logées dans la mâchoire et les pommettes</li>
<li>Des tapotements rythmés qui stimulent la microcirculation</li>
<li>Des étirements doux qui accompagnent la détente des muscles superficiels du visage</li>
</ul>
<h3>Une transmission de main à main</h3>
<p>Historiquement, le Kobido ne s'apprenait pas dans les livres. Il se transmettait au contact direct d'un maître, par l'observation et la répétition, ce qui explique la diversité des écoles et des variantes que l'on retrouve aujourd'hui. Chaque praticienne qui se forme au Kobido hérite ainsi d'un savoir-faire vivant, façonné par des générations de mains expertes.</p>
<h2>Le Kobido aujourd'hui, entre respect de la tradition et approche contemporaine</h2>
<p>En Occident, le Kobido a gagné en popularité ces dernières années, porté par une envie croissante de renouer avec des rituels de soin plus lents, plus incarnés, à contre-courant de la cosmétique purement technologique. Chez Holisya, nous avons à cœur de respecter la gestuelle traditionnelle tout en l'adaptant à chaque visage, à chaque histoire de peau.</p>
<p>Ce respect du geste originel est essentiel : le Kobido n'est pas une simple relaxation, c'est un rituel exigeant qui demande une vraie maîtrise technique. C'est aussi ce qui en fait, pour beaucoup de femmes, une parenthèse si particulière : le sentiment de recevoir un soin ancestral, pensé pour sublimer et apaiser à la fois.</p>
<h2>Pourquoi s'y intéresser aujourd'hui</h2>
<p>Dans un quotidien souvent rythmé par les écrans et les sollicitations permanentes, le Kobido propose une expérience à rebours : un temps long, un contact humain attentif, une gestuelle pensée dans les moindres détails. C'est peut-être là sa plus grande force : nous reconnecter, le temps d'une séance, à un rituel de beauté qui prend soin autant du visage que de l'esprit.</p>
`,
  },
  {
    title: 'Kobido et massage facial classique : quelles différences ?',
    slug: 'kobido-massage-facial-classique-differences',
    category: 'Kobido',
    tags: 'kobido, massage facial, comparatif, technique',
    excerpt:
      "Tapotements, pressions, rythme, intensité : le Kobido se distingue nettement des massages faciaux relaxants classiques. Voici ce qui les différencie vraiment.",
    content: `
<h2>Deux approches, deux intentions</h2>
<p>Un massage facial classique, souvent proposé en institut, vise avant tout la détente : des mouvements doux, glissés, appliqués avec une crème ou une huile, dans le seul objectif de relâcher les tensions superficielles. Le Kobido, lui, part d'une intention plus large : traiter le visage comme un ensemble de muscles, de points d'énergie et de circuits de circulation qu'il s'agit de stimuler activement.</p>
<p>Cette différence d'intention change tout dans la pratique : le Kobido ne se contente pas d'effleurer, il agit avec précision sur des zones ciblées.</p>
<h2>Des gestes plus riches et plus variés</h2>
<h3>Le rythme et l'intensité</h3>
<p>Là où le massage facial classique reste généralement lent et uniforme, le Kobido alterne les rythmes : des séquences douces et enveloppantes viennent contraster avec des tapotements plus toniques et des pressions plus franches. Cette alternance participe à l'effet « réveil » que beaucoup de clientes ressentent après une séance.</p>
<h3>Le nombre de mouvements</h3>
<p>Une séance de Kobido peut mobiliser plusieurs dizaines de mouvements différents, quand un massage facial classique en compte généralement une poignée. Cette richesse gestuelle permet de travailler l'ensemble du visage, du cou et du cuir chevelu de façon beaucoup plus complète.</p>
<ul>
<li>Massage facial classique : gestes glissés, rythme lent, objectif détente</li>
<li>Kobido : gestes variés (pressions, tapotements, pétrissages, étirements), rythme alterné, objectif tonicité et éclat</li>
<li>Massage facial classique : zone du visage principalement</li>
<li>Kobido : visage, cou, décolleté et cuir chevelu inclus dans le rituel</li>
</ul>
<h2>Une expérience sensorielle différente</h2>
<p>Sur le plan du ressenti, les deux approches n'offrent pas la même expérience. Le massage classique procure une détente immédiate et une sensation de légèreté. Le Kobido, de par son intensité et sa précision, peut donner une impression de « regain » : un teint qui paraît plus lumineux, des traits qui semblent détendus en profondeur, et souvent une sensation de légèreté qui persiste au-delà de la séance elle-même.</p>
<h2>Lequel choisir ?</h2>
<p>Il n'y a pas de réponse universelle : tout dépend de ce que l'on recherche. Pour une parenthèse ponctuelle de détente pure, un massage facial classique peut suffire. Pour une expérience plus complète, qui associe relaxation profonde et attention portée à la tonicité des traits, le Kobido offre une réponse plus riche. C'est aussi une question de régularité : intégré dans une routine, le Kobido devient un véritable rituel de soin, à part entière, au même titre qu'un soin du corps ou qu'une séance de sport.</p>
<p>Chez Holisya, nous proposons les deux approches en fonction des envies et du temps disponible de chacune, avec toujours la même exigence de geste et d'écoute.</p>
`,
  },
  {
    title: 'Les bienfaits ressentis du Kobido sur la peau et sur l\'esprit',
    slug: 'bienfaits-ressentis-kobido-peau-esprit',
    category: 'Kobido',
    tags: 'kobido, bienfaits, détente, éclat, bien-être',
    excerpt:
      "Au-delà du geste esthétique, le Kobido est avant tout une expérience sensorielle complète, dont les bienfaits se ressentent aussi bien sur la peau que sur le moral.",
    content: `
<h2>Un rituel pensé pour le corps et pour l'esprit</h2>
<p>Si le Kobido est souvent présenté comme un soin du visage, il serait réducteur de le limiter à cette seule dimension esthétique. La richesse de sa gestuelle, la durée de la séance et la qualité du contact qu'il propose en font une expérience à part entière, dont les effets se ressentent bien au-delà du miroir.</p>
<h2>Sur la peau : une sensation de tonicité et d'éclat</h2>
<p>Les mouvements de pression et de pétrissage propres au Kobido stimulent la microcirculation locale. De nombreuses clientes rapportent, à l'issue d'une séance, une sensation de teint plus lumineux et de traits plus détendus. Cette sensation de « bonne mine » est l'un des effets les plus souvent évoqués, en particulier après une période de fatigue ou de stress intense.</p>
<p>Il est important de rester prudent sur ce terrain : le Kobido n'est pas un acte médical et ne se substitue en rien à un suivi dermatologique. Il s'agit d'un soin de bien-être, dont les effets sont avant tout ressentis à court terme, et qui prend tout son sens lorsqu'il est pratiqué régulièrement, dans la durée.</p>
<h2>Sur le plan émotionnel : une vraie parenthèse de reconnexion</h2>
<h3>Un temps rien que pour soi</h3>
<p>Une séance de Kobido dure généralement entre 45 minutes et une heure, un temps précieux durant lequel le corps est invité à ralentir. Beaucoup de femmes décrivent cette parenthèse comme l'un des rares moments de leur semaine où elles ne pensent à rien d'autre qu'à l'instant présent.</p>
<h3>Une détente qui touche tout le haut du corps</h3>
<p>Parce qu'il inclut souvent le cou, les épaules et le cuir chevelu, le Kobido agit sur des zones où se logent fréquemment les tensions liées au stress. Cette détente globale du haut du corps participe à un sentiment d'apaisement qui dépasse largement la seule sphère du visage.</p>
<ul>
<li>Sensation de teint plus lumineux et de traits reposés</li>
<li>Relâchement des tensions logées dans la mâchoire, le cou et les épaules</li>
<li>Moment de déconnexion propice à la baisse du stress ressenti</li>
<li>Sensation de légèreté qui peut persister plusieurs jours</li>
</ul>
<h2>Un soin à intégrer dans une routine de bien-être</h2>
<p>Comme pour beaucoup de rituels de bien-être, c'est la régularité qui permet d'en tirer le meilleur. Une séance ponctuelle offre déjà un vrai moment de respiration ; une pratique plus régulière, intégrée à un rythme mensuel par exemple, permet d'ancrer ces bienfaits dans la durée et d'en faire un véritable outil de gestion du stress au quotidien.</p>
<p>Chez Holisya, chaque séance est pensée comme une parenthèse sur-mesure, adaptée à l'état de fatigue, aux tensions et aux envies de chacune.</p>
`,
  },
  {
    title: 'Comment se déroule une séance de Kobido chez Holisya',
    slug: 'deroulement-seance-kobido-holisya',
    category: 'Kobido',
    tags: 'kobido, séance, déroulement, rituel, institut',
    excerpt:
      "Curieuse de découvrir le Kobido mais vous ne savez pas à quoi vous attendre ? Voici, étape par étape, le déroulement d'une séance telle que nous la concevons chez Holisya.",
    content: `
<h2>Avant tout, un temps d'écoute</h2>
<p>Chez Holisya, chaque séance de Kobido commence par un échange. Avant même de poser les mains sur le visage, il est essentiel de comprendre l'état de fatigue du moment, les zones de tension, les attentes de la cliente et ses éventuelles sensibilités cutanées. Ce temps d'écoute, souvent négligé, conditionne pourtant la qualité de tout ce qui suit.</p>
<h2>La préparation de la peau</h2>
<p>La séance débute par un double nettoyage du visage, afin de préparer la peau à recevoir le massage dans les meilleures conditions. Une huile ou un baume spécifique est ensuite appliqué : il sert de support aux mouvements et permet aux mains de glisser sans tirer sur la peau, tout en nourrissant l'épiderme.</p>
<h2>Le cœur du rituel : la gestuelle Kobido</h2>
<h3>Une progression pensée du bas vers le haut du visage</h3>
<p>Le massage suit généralement une progression precise : le décolleté et le cou sont travaillés en premier, puis la mâchoire, les joues, le contour des yeux, le front et enfin le cuir chevelu. Cette progression permet d'accompagner naturellement la circulation et de préparer chaque zone avant de la travailler plus intensément.</p>
<h3>L'alternance des mouvements</h3>
<p>Tout au long de la séance, les pressions profondes alternent avec des tapotements plus légers et des mouvements d'étirement. Cette variation de rythme et d'intensité est la signature du Kobido : elle évite la monotonie du geste et permet de solliciter différemment chaque type de tissu.</p>
<ul>
<li>Temps d'échange et d'analyse de la peau (5 à 10 minutes)</li>
<li>Double nettoyage et préparation de la peau</li>
<li>Massage Kobido du décolleté jusqu'au cuir chevelu (30 à 45 minutes)</li>
<li>Application d'un soin de finition adapté au type de peau</li>
<li>Temps de repos et conseils personnalisés pour la suite</li>
</ul>
<h2>Après la séance : les conseils pour prolonger les effets</h2>
<p>À l'issue du soin, quelques conseils simples sont partagés pour prolonger la sensation de bien-être : bien s'hydrater, éviter les écrans immédiatement après la séance si possible, et privilégier une soirée calme. Certains gestes d'auto-massage peuvent également être transmis pour permettre de recréer, chez soi, une partie de cette sensation entre deux rendez-vous.</p>
<h2>Une expérience qui se personnalise</h2>
<p>Chaque visage est différent, chaque histoire aussi. C'est pourquoi la séance de Kobido chez Holisya n'est jamais tout à fait la même d'une cliente à l'autre : l'intensité, le rythme et les zones travaillées s'ajustent en fonction des besoins exprimés et de ce que les mains perçoivent au fil du massage.</p>
`,
  },
  {
    title: 'Kobido : à quelle fréquence pratiquer ce rituel du visage ?',
    slug: 'kobido-frequence-ideale-rituel-visage',
    category: 'Kobido',
    tags: 'kobido, fréquence, routine, régularité',
    excerpt:
      "Une fois par mois, toutes les deux semaines, en cure intensive ? Voici comment penser la fréquence de vos séances de Kobido selon vos objectifs et votre rythme de vie.",
    content: `
<h2>Une question qui revient souvent</h2>
<p>« À quelle fréquence dois-je faire du Kobido ? » est sans doute l'une des questions les plus posées par les clientes qui découvrent ce massage facial japonais. La réponse dépend de plusieurs facteurs : l'objectif recherché, le budget disponible, le rythme de vie, et bien sûr l'envie de faire de ce rituel un rendez-vous régulier ou occasionnel.</p>
<h2>La séance découverte : pour se faire une première idée</h2>
<p>Pour une première expérience, une séance unique suffit à ressentir les effets immédiats du Kobido : sensation de détente profonde, teint plus lumineux, traits apaisés. C'est une excellente façon de tester ce soin avant de décider de l'intégrer à un rythme plus régulier.</p>
<h2>La cure : pour des effets qui s'installent dans la durée</h2>
<h3>Un rythme rapproché sur une période définie</h3>
<p>Pour celles qui souhaitent aller plus loin, une cure de plusieurs séances rapprochées (par exemple une fois par semaine sur quatre à six semaines) permet d'installer une routine intensive. C'est l'option privilégiée avant un événement particulier, ou pour redonner un vrai coup de fouet à une peau marquée par la fatigue.</p>
<h3>L'entretien mensuel</h3>
<p>Une fois la cure terminée, un rythme d'entretien mensuel est souvent recommandé pour prolonger les bienfaits ressentis. C'est un bon compromis entre régularité et budget, qui permet de faire du Kobido un rendez-vous récurrent avec soi-même.</p>
<ul>
<li>Découverte : une séance ponctuelle pour tester</li>
<li>Cure intensive : une séance par semaine pendant 4 à 6 semaines</li>
<li>Entretien : une séance toutes les 3 à 4 semaines</li>
<li>Occasionnel : avant un événement, en période de fatigue accrue</li>
</ul>
<h2>Écouter son corps avant tout</h2>
<p>Au-delà de ces repères, la meilleure fréquence reste celle qui correspond à votre propre rythme de vie et à vos sensations. Certaines femmes ressentent le besoin d'une séance dès qu'une période de stress s'installe, d'autres préfèrent un rendez-vous fixe, posé dans l'agenda comme un rituel incontournable, au même titre qu'une séance de sport.</p>
<h2>Le Kobido, un rituel à conjuguer avec d'autres habitudes de bien-être</h2>
<p>Le Kobido gagne à s'inscrire dans une hygiène de vie plus large : une hydratation suffisante, un sommeil de qualité et une alimentation équilibrée participent également à l'éclat du teint et à la sensation de bien-être général. Le massage facial n'est pas une solution isolée, mais un maillon d'une routine bien-être cohérente.</p>
`,
  },
  {
    title: "Qu'est-ce que le bien-être holistique et pourquoi s'y intéresser",
    slug: 'quest-ce-que-bien-etre-holistique',
    category: 'Bien-être',
    tags: 'holistique, bien-être, approche globale, corps-esprit',
    excerpt:
      "Le bien-être holistique part d'une idée simple : le corps, l'esprit et les émotions ne fonctionnent jamais isolément. Comprendre cette approche, c'est changer sa façon de prendre soin de soi.",
    content: `
<h2>Une approche qui considère la personne dans son ensemble</h2>
<p>Le mot « holistique » vient du grec « holos », qui signifie « entier ». L'approche holistique du bien-être part d'un principe simple : on ne peut pas prendre soin d'une partie de soi en ignorant le reste. Le stress ressenti au travail peut se traduire par des tensions dans la nuque. Une alimentation déséquilibrée peut affecter la qualité du sommeil. Un manque de sommeil peut, à son tour, impacter l'humeur et la concentration.</p>
<p>Plutôt que de traiter chaque symptôme séparément, l'approche holistique invite à observer les liens entre ces différentes dimensions de la vie, pour agir de façon plus cohérente et plus durable.</p>
<h2>Les grandes dimensions du bien-être holistique</h2>
<h3>Le corps</h3>
<p>L'alimentation, le sommeil, l'activité physique, mais aussi les soins corporels comme le massage ou le drainage lymphatique font partie de cette dimension physique, souvent la plus visible et la plus facile à travailler concrètement.</p>
<h3>L'esprit et les émotions</h3>
<p>La gestion du stress, la qualité des relations, le sens que l'on donne à son quotidien : cette dimension plus intime est tout aussi essentielle, même si elle est parfois plus difficile à objectiver.</p>
<h3>L'environnement</h3>
<p>Le cadre de vie, le rythme professionnel, la qualité de l'air ou de la lumière influencent également notre état général, souvent de façon plus discrète mais bien réelle.</p>
<h2>Pourquoi cette approche prend-elle autant de sens aujourd'hui ?</h2>
<p>Dans une époque marquée par l'accélération du rythme de vie et la sursollicitation permanente, de plus en plus de femmes ressentent le besoin de reprendre la main sur leur équilibre, plutôt que de subir les événements. L'approche holistique offre un cadre pour cela : elle ne promet pas de solution miracle, mais invite à observer ses propres besoins avec attention, et à agir sur plusieurs leviers à la fois plutôt que sur un seul.</p>
<ul>
<li>Observer les liens entre alimentation, sommeil, stress et énergie</li>
<li>Privilégier des rituels de soin qui touchent à la fois le corps et l'esprit</li>
<li>Accepter que le bien-être ne soit jamais figé, mais évolue selon les périodes de vie</li>
<li>Se donner le droit de prioriser certains équilibres plutôt que d'autres selon les moments</li>
</ul>
<h2>Une philosophie, pas une contrainte supplémentaire</h2>
<p>L'écueil serait de transformer le bien-être holistique en une nouvelle liste de choses à faire, source de pression supplémentaire. Ce n'est pas l'esprit de cette approche : il s'agit avant tout d'un changement de regard, qui invite à la bienveillance envers soi-même et à une meilleure écoute de ses propres signaux, plutôt qu'à l'accumulation de nouvelles obligations.</p>
<p>C'est cette philosophie qui anime chaque soin proposé chez Holisya : chaque rituel, qu'il s'agisse de Kobido, de drainage lymphatique ou de coaching nutritionnel, est pensé comme une pièce d'un équilibre plus large, jamais comme une fin en soi.</p>
`,
  },
  {
    title: "Corps, esprit, émotions : les trois piliers de l'approche holistique",
    slug: 'trois-piliers-approche-holistique',
    category: 'Bien-être',
    tags: 'holistique, corps, esprit, émotions, équilibre',
    excerpt:
      "Prendre soin de son corps ne suffit pas toujours à se sentir bien. Découvrez comment les trois piliers de l'approche holistique s'articulent pour un équilibre plus durable.",
    content: `
<h2>Pourquoi parler de « piliers » ?</h2>
<p>L'image du pilier est parlante : un édifice tenu par un seul pilier est fragile, quel que soit sa solidité. Il en va de même pour notre équilibre général. Se concentrer uniquement sur l'alimentation, ou uniquement sur le sport, ou uniquement sur le repos, laisse souvent un sentiment d'incomplétude. L'approche holistique invite à observer trois dimensions en parallèle : le corps, l'esprit et les émotions.</p>
<h2>Le pilier du corps</h2>
<p>C'est souvent la dimension la plus concrète : le sommeil, l'alimentation, l'activité physique, mais aussi les soins que l'on s'accorde, comme un massage ou un rituel de drainage lymphatique. Prendre soin de son corps, ce n'est pas seulement viser une silhouette ou une apparence : c'est aussi lui offrir des moments de récupération, de détente musculaire et de circulation retrouvée.</p>
<h2>Le pilier de l'esprit</h2>
<h3>La clarté mentale</h3>
<p>Un esprit encombré par une charge mentale excessive peine à se reposer, même lorsque le corps est au repos. Ce pilier concerne la façon dont on organise ses pensées, dont on hiérarchise ses priorités, et dont on s'accorde (ou non) des moments de pause mentale, loin des sollicitations numériques.</p>
<h3>Le sens</h3>
<p>Se sentir aligné avec ses valeurs et ses choix de vie contribue également à cet équilibre mental, souvent sous-estimé dans les approches purement physiques du bien-être.</p>
<h2>Le pilier des émotions</h2>
<p>Les émotions occupent une place particulière : elles sont souvent le premier signal d'un déséquilibre, avant même que celui-ci ne se traduise physiquement. Apprendre à reconnaître une fatigue émotionnelle, une irritabilité inhabituelle ou une perte d'élan, c'est se donner les moyens d'agir avant que ces signaux ne s'installent durablement.</p>
<ul>
<li>Corps : sommeil, alimentation, mouvement, soins corporels</li>
<li>Esprit : organisation mentale, moments de pause, sens donné au quotidien</li>
<li>Émotions : écoute de ses ressentis, expression, régulation du stress</li>
</ul>
<h2>Faire dialoguer ces trois piliers</h2>
<p>L'enjeu n'est pas de exceller dans chacun de ces trois domaines en permanence, ce qui serait irréaliste, mais de repérer lequel mérite le plus d'attention à un moment donné de sa vie. Une période de surcharge professionnelle appellera peut-être davantage de soin porté au corps et au repos. Une période de remise en question personnelle nécessitera peut-être plus d'attention portée aux émotions et au sens.</p>
<h2>Une approche vivante, pas un modèle figé</h2>
<p>C'est précisément cette souplesse qui fait la force de l'approche holistique : elle s'adapte à chaque period de vie, plutôt que d'imposer un modèle unique. Chez Holisya, cette philosophie guide l'ensemble des rituels proposés, qu'ils touchent au corps par le massage ou le drainage, ou à l'équilibre global par le coaching nutritionnel.</p>
`,
  },
  {
    title: 'Cinq rituels holistiques à intégrer dans son quotidien',
    slug: 'cinq-rituels-holistiques-quotidien',
    category: 'Bien-être',
    tags: 'rituels, holistique, quotidien, habitudes, bien-être',
    excerpt:
      "Pas besoin de tout changer du jour au lendemain : voici cinq rituels simples, inspirés de l'approche holistique, à intégrer progressivement dans votre quotidien.",
    content: `
<h2>Des petits gestes, de grands effets</h2>
<p>L'approche holistique du bien-être n'exige pas de bouleverser sa vie en une semaine. Elle repose au contraire sur de petits rituels, répétés avec régularité, qui finissent par façonner un équilibre plus durable. Voici cinq pistes simples à explorer, sans pression, à votre rythme.</p>
<h2>1. Un réveil sans écran</h2>
<p>Repousser de dix minutes la consultation du téléphone au réveil permet de démarrer la journée sans être immédiatement happée par les sollicitations extérieures. Ce court moment peut être consacré à un étirement, à quelques respirations profondes, ou simplement au silence.</p>
<h2>2. Un moment d'auto-massage du visage</h2>
<p>Quelques minutes de gestes doux sur le visage, inspirés des techniques du Kobido, suffisent à stimuler la circulation et à relâcher les tensions accumulées dans la mâchoire ou le front, notamment après une nuit agitée.</p>
<h2>3. Une pause repas sans distraction</h2>
<h3>Manger en pleine conscience</h3>
<p>Prendre le temps de manger sans écran, en portant attention aux saveurs et aux sensations de faim et de satiété, participe à la fois à une meilleure digestion et à un rapport plus apaisé à l'alimentation.</p>
<h2>4. Un rituel du soir apaisant</h2>
<p>Tamiser les lumières, réduire l'exposition aux écrans une demi-heure avant le coucher, appliquer un soin du visage avec des gestes lents : ce petit rituel du soir aide à signaler au corps qu'il est temps de ralentir.</p>
<h2>5. Un temps hebdomadaire dédié à soi</h2>
<p>Que ce soit une séance de sport, un soin en institut ou simplement une heure de lecture, réserver un créneau fixe dans son agenda, chaque semaine, permet de transformer le self-care en habitude plutôt qu'en simple intention.</p>
<ul>
<li>Réveil sans écran pendant quelques minutes</li>
<li>Auto-massage du visage le matin ou le soir</li>
<li>Repas pris en pleine conscience, sans distraction</li>
<li>Rituel du soir apaisant avant le coucher</li>
<li>Créneau hebdomadaire fixe consacré à soi</li>
</ul>
<h2>La clé : la régularité plutôt que la perfection</h2>
<p>Il n'est pas nécessaire d'appliquer ces cinq rituels tous les jours, ni même tous en même temps. L'essentiel est de choisir un ou deux gestes qui font sens pour vous, et de les répéter suffisamment souvent pour qu'ils deviennent une habitude naturelle plutôt qu'une contrainte de plus dans votre emploi du temps.</p>
`,
  },
  {
    title: 'Le pouvoir du toucher thérapeutique sur notre bien-être',
    slug: 'pouvoir-toucher-therapeutique-bien-etre',
    category: 'Bien-être',
    tags: 'toucher, massage, relaxation, bien-être, corps',
    excerpt:
      "Le toucher est l'un de nos sens les plus anciens et les plus fondamentaux. Pourquoi un massage bien exécuté procure-t-il un tel sentiment d'apaisement ? Éléments de réponse.",
    content: `
<h2>Un besoin ancré depuis la naissance</h2>
<p>Le toucher est le premier sens que nous développons, dès la vie intra-utérine, bien avant la vue ou l'audition. Ce n'est donc pas un hasard si un contact bienveillant, qu'il s'agisse d'une étreinte ou d'un massage, procure si souvent un sentiment immédiat d'apaisement. Le toucher reste, tout au long de la vie, un vecteur essentiel de réassurance et de connexion.</p>
<h2>Pourquoi un massage procure une telle sensation de détente</h2>
<h3>Une attention exclusive portée au corps</h3>
<p>Le temps d'un massage, l'attention est entièrement tournée vers les sensations corporelles : la pression des mains, le rythme des mouvements, la chaleur du contact. Cette focalisation sensorielle aide à mettre de côté, temporairement, les pensées qui occupent habituellement l'esprit.</p>
<h3>Un relâchement musculaire progressif</h3>
<p>Les tensions musculaires s'accumulent souvent sans que l'on en ait pleinement conscience, en particulier au niveau de la nuque, des épaules et de la mâchoire. Les pressions et pétrissages exercés lors d'un massage aident à relâcher progressivement ces zones, ce qui contribue à une sensation générale de légèreté.</p>
<h2>Le toucher, un besoin trop souvent négligé au quotidien</h2>
<p>Dans une vie rythmée par les écrans et les échanges à distance, le contact physique bienveillant se fait parfois rare. Beaucoup de femmes actives redécouvrent, lors d'une première séance de massage ou de Kobido, à quel point ce type de contact leur manquait, sans qu'elles en aient pleinement conscience auparavant.</p>
<ul>
<li>Le toucher favorise un sentiment de sécurité et d'apaisement</li>
<li>Un massage régulier aide à mieux repérer ses propres tensions corporelles</li>
<li>L'attention portée aux sensations physiques permet une vraie coupure mentale</li>
<li>Le contact humain reste un besoin fondamental, à tout âge</li>
</ul>
<h2>Intégrer le toucher dans sa routine de bien-être</h2>
<p>Il n'est pas nécessaire de multiplier les séances pour bénéficier de ces effets : même un rendez-vous mensuel avec un massage ou un soin du visage comme le Kobido permet de renouer régulièrement avec cette dimension essentielle du bien-être. Ce moment devient alors un repère, un rituel que l'on attend et qui structure, à sa façon, l'équilibre du mois.</p>
<h2>Une dimension à ne pas sous-estimer</h2>
<p>Loin d'être un simple plaisir superflu, le toucher bienveillant participe pleinement à l'équilibre global évoqué par l'approche holistique. C'est cette conviction qui anime chaque soin corporel ou facial proposé chez Holisya : un geste précis, mais surtout une présence et une attention réelles portées à chaque cliente.</p>
`,
  },
  {
    title: 'Pourquoi le self-care n\'est pas un luxe mais une nécessité',
    slug: 'self-care-nest-pas-un-luxe-mais-une-necessite',
    category: 'Self-care',
    tags: 'self-care, self-care femmes, priorité, équilibre',
    excerpt:
      "Trop souvent perçu comme accessoire ou réservé aux moments de vacances, le self-care mérite d'être repensé comme un pilier essentiel de l'équilibre au quotidien.",
    content: `
<h2>Un mot souvent mal compris</h2>
<p>Le terme « self-care » est parfois réduit, à tort, à des bains moussants et des masques de beauté ponctuels. En réalité, le self-care désigne quelque chose de bien plus large : l'ensemble des gestes, grands ou petits, que l'on pose consciemment pour préserver sa santé physique et mentale. Cela peut aller d'une nuit de sommeil suffisante à un rendez-vous chez le kinésithérapeute, en passant par un soin du visage ou une séance de sport.</p>
<h2>Pourquoi tant de femmes le relèguent-elles au second plan ?</h2>
<h3>La charge mentale et le sentiment de culpabilité</h3>
<p>De nombreuses femmes actives, notamment celles qui jonglent entre vie professionnelle et vie familiale, ont intégré l'idée que s'occuper de soi viendrait « après » avoir répondu à tous les besoins des autres. Ce réflexe, souvent inconscient, conduit à repousser indéfiniment les moments de soin personnel, jusqu'à ce que la fatigue ou l'épuisement s'installent durablement.</p>
<h3>Une hiérarchie des priorités à revoir</h3>
<p>Considérer le self-care comme une simple option, activable seulement quand « tout le reste est réglé », revient à ne jamais vraiment y accéder, tant la liste des obligations quotidiennes semble sans fin. Le repenser comme une nécessité, au même titre que le sommeil ou l'alimentation, change fondamentalement son statut dans l'organisation du quotidien.</p>
<h2>Ce que le self-care apporte réellement</h2>
<p>Prendre soin de soi régulièrement, ce n'est pas seulement s'accorder un plaisir ponctuel : c'est aussi se donner les moyens de mieux gérer le stress, de retrouver de l'énergie, et in fine, d'être plus disponible pour les autres. Une femme qui prend soin d'elle-même a souvent davantage de ressources émotionnelles à offrir à son entourage.</p>
<ul>
<li>Le self-care aide à prévenir l'épuisement lié à la surcharge mentale</li>
<li>Il permet de mieux identifier ses propres limites avant qu'elles ne soient dépassées</li>
<li>Il ne s'oppose pas à la disponibilité pour les autres, il la renforce</li>
<li>Il peut prendre des formes très variées : sommeil, alimentation, soins, mouvement, moments de silence</li>
</ul>
<h2>Passer de l'intention à l'action</h2>
<p>Le principal obstacle au self-care n'est pas le manque d'information, mais le manque de temps réellement réservé. Bloquer un créneau dans son agenda, au même titre qu'un rendez-vous professionnel, est souvent le moyen le plus efficace de transformer une bonne intention en habitude concrète.</p>
<h2>Une nécessité, pas une récompense</h2>
<p>Le self-care ne devrait jamais être perçu comme une récompense méritée seulement après avoir « tout accompli ». C'est au contraire une condition pour tenir dans la durée, un socle sur lequel s'appuient toutes les autres responsabilités du quotidien. Chez Holisya, chaque rituel proposé, du Kobido au coaching nutritionnel, s'inscrit dans cette conviction : prendre soin de soi n'est jamais un luxe, c'est une nécessité.</p>
`,
  },
  {
    title: 'Femmes actives : comment (re)trouver du temps pour soi',
    slug: 'femmes-actives-retrouver-temps-pour-soi',
    category: 'Self-care',
    tags: 'femmes actives, temps pour soi, organisation, self-care',
    excerpt:
      "Entre vie professionnelle, vie de famille et charge mentale, trouver du temps pour soi peut sembler impossible. Quelques pistes concrètes pour se le réapproprier, sans culpabilité.",
    content: `
<h2>Le constat : un temps qui semble ne jamais suffire</h2>
<p>Entre les responsabilités professionnelles, la gestion du foyer, les enfants pour certaines, et les innombrables petites tâches invisibles du quotidien, beaucoup de femmes actives ont le sentiment que le temps pour elles-mêmes se réduit à peau de chagrin. Ce constat n'est pas une fatalité, mais il demande souvent une réorganisation consciente, plutôt qu'un simple vœu pieux.</p>
<h2>Repenser la notion de « temps pour soi »</h2>
<h3>Il ne s'agit pas forcément de grandes plages horaires</h3>
<p>L'idée reçue selon laquelle le temps pour soi nécessiterait des heures entières freine souvent le passage à l'action. En réalité, dix minutes de calme le matin, une pause déjeuner sans écran, ou un trajet en silence sans podcast peuvent déjà constituer un vrai moment de respiration, à condition d'être pleinement habités.</p>
<h3>Accepter de ne pas tout faire</h3>
<p>Trouver du temps pour soi implique souvent de renoncer à autre chose : une tâche ménagère repoussée, une sollicitation déclinée, un mail qui attendra le lendemain. Cet arbitrage, bien qu'inconfortable au début, est indispensable pour dégager un espace réel dans son emploi du temps.</p>
<h2>Des pistes concrètes pour se réapproprier son temps</h2>
<ul>
<li>Bloquer un créneau fixe et récurrent dans son agenda, comme un rendez-vous non négociable</li>
<li>Déléguer ou simplifier certaines tâches du quotidien, même partiellement</li>
<li>Identifier les moments de la journée où l'énergie est la plus disponible pour soi</li>
<li>Accepter de dire non à certaines sollicitations sans se justifier longuement</li>
<li>Profiter des temps de trajet ou d'attente pour un vrai moment de pause, plutôt que de les remplir automatiquement</li>
</ul>
<h2>Le rôle des rituels de soin dans cette réappropriation</h2>
<p>Prendre un rendez-vous régulier, que ce soit pour un soin du visage, un massage ou une séance de coaching nutritionnel, présente un avantage souvent sous-estimé : celui de fixer un rendez-vous avec soi-même dans son agenda, au même titre qu'un rendez-vous professionnel. Ce cadre extérieur aide à sanctuariser un temps qui, autrement, serait facilement grignoté par d'autres priorités.</p>
<h2>Se libérer de la culpabilité</h2>
<p>Le principal frein n'est pas toujours le manque de temps, mais le sentiment de culpabilité associé à l'idée de s'accorder ce temps. Se rappeler qu'une femme reposée et apaisée est aussi une femme plus disponible pour son entourage peut aider à dépasser ce frein psychologique, souvent plus tenace que la contrainte pratique elle-même.</p>
<p>Retrouver du temps pour soi n'est donc pas qu'une question d'organisation : c'est aussi, et peut-être avant tout, un changement de regard sur sa propre légitimité à en avoir besoin.</p>
`,
  },
  {
    title: 'Créer un rituel du soir pour mieux se ressourcer',
    slug: 'creer-rituel-du-soir-se-ressourcer',
    category: 'Self-care',
    tags: 'rituel du soir, sommeil, self-care, routine, détente',
    excerpt:
      "La qualité du soir influence souvent celle de la nuit qui suit. Voici comment construire un rituel du soir simple, apaisant, et réellement tenable dans la durée.",
    content: `
<h2>Pourquoi le rituel du soir mérite toute son attention</h2>
<p>La transition entre la journée active et la nuit de sommeil est souvent négligée : on enchaîne les dernières tâches, on consulte ses écrans jusqu'à la dernière minute, puis on se couche en espérant que le sommeil suivra naturellement. Or, cette transition joue un rôle important dans la qualité du repos qui suit. Construire un rituel du soir, même court, permet d'envoyer à son corps et à son esprit un signal clair : la journée touche à sa fin.</p>
<h2>Les ingrédients d'un rituel du soir efficace</h2>
<h3>Réduire progressivement les stimulations</h3>
<p>Tamiser les lumières, réduire le volume sonore ambiant et limiter l'exposition aux écrans dans la dernière heure avant le coucher aident le corps à amorcer naturellement sa phase de ralentissement.</p>
<h3>Un geste de soin pour le corps</h3>
<p>Appliquer une crème avec des gestes lents, pratiquer un auto-massage du visage ou des mains, ou simplement s'accorder quelques minutes d'étirements doux : ces gestes participent à la sensation de détente physique qui favorise l'endormissement.</p>
<h3>Un moment pour l'esprit</h3>
<p>Noter trois choses positives de la journée, lire quelques pages d'un livre, ou simplement respirer profondément pendant quelques minutes permet de clore la journée sur une note plus apaisée, plutôt que de s'endormir avec la charge mentale encore pleinement active.</p>
<ul>
<li>Tamiser les lumières une heure avant le coucher</li>
<li>Réduire l'exposition aux écrans, ou au moins activer un mode nuit</li>
<li>Appliquer un soin du visage avec des gestes lents et conscients</li>
<li>Prendre trois à cinq minutes pour respirer ou noter ses pensées</li>
<li>Se coucher à un horaire aussi régulier que possible</li>
</ul>
<h2>Adapter le rituel à sa réalité</h2>
<p>Il n'existe pas de rituel du soir universel : une mère de jeunes enfants n'aura pas la même disponibilité qu'une femme vivant seule. L'important est de construire un rituel réaliste, quitte à ce qu'il ne dure que cinq minutes, plutôt qu'un rituel idéal mais impossible à tenir dans la durée.</p>
<h2>Un rituel qui se construit avec le temps</h2>
<p>Comme toute nouvelle habitude, le rituel du soir demande un peu de constance avant de devenir naturel. Les premiers jours peuvent sembler artificiels, voire contraignants ; avec la répétition, ce moment devient souvent l'un des plus attendus de la journée, un vrai sas de décompression avant la nuit.</p>
`,
  },
  {
    title: 'Culpabilité et self-care : apprendre à se donner la permission',
    slug: 'culpabilite-self-care-se-donner-la-permission',
    category: 'Self-care',
    tags: 'culpabilité, self-care, permission, bien-être émotionnel',
    excerpt:
      "Pourquoi tant de femmes ressentent-elles de la culpabilité à l'idée de s'accorder du temps pour elles-mêmes ? Comprendre ce frein pour mieux le dépasser.",
    content: `
<h2>Un frein plus psychologique que pratique</h2>
<p>S'il est vrai que le manque de temps constitue un obstacle réel au self-care, la culpabilité qui accompagne souvent l'idée même de s'occuper de soi représente un frein tout aussi puissant, sinon davantage. Beaucoup de femmes rapportent ressentir un malaise diffus lorsqu'elles s'accordent un moment pour elles, comme si ce temps était volé à quelqu'un d'autre.</p>
<h2>D'où vient cette culpabilité ?</h2>
<h3>Des schémas culturels profondément ancrés</h3>
<p>Historiquement, le rôle de la femme a souvent été associé au soin des autres avant celui de soi-même : enfants, conjoint, parents, collègues. Ce conditionnement, transmis parfois sur plusieurs générations, laisse des traces profondes, même chez les femmes qui, intellectuellement, savent que prendre soin d'elles est légitime.</p>
<h3>La comparaison sociale</h3>
<p>Les réseaux sociaux et les injonctions à la performance permanente ajoutent une couche supplémentaire de pression : il faudrait réussir sa carrière, sa vie de famille, son couple, tout en gardant du temps pour soi sans jamais paraître en manquer. Cette accumulation d'exigences rend le self-care presque suspect, comme s'il révélait un manque d'organisation ailleurs.</p>
<h2>Se donner la permission : un exercice qui se travaille</h2>
<p>La bonne nouvelle, c'est que cette permission intérieure se cultive, un peu comme un muscle. Elle ne repose pas sur une décision unique et définitive, mais sur une série de petits choix répétés, qui rééduquent progressivement le rapport à soi-même.</p>
<ul>
<li>Reconnaître consciemment le moment où la culpabilité apparaît, sans la juger</li>
<li>Se rappeler que prendre soin de soi bénéficie aussi à son entourage</li>
<li>Commencer par de petits moments de self-care, plus faciles à s'autoriser</li>
<li>Éviter de justifier systématiquement ses moments pour soi auprès des autres</li>
<li>S'entourer de personnes qui respectent et valorisent ce temps personnel</li>
</ul>
<h2>Le rôle des rituels extérieurs</h2>
<p>Un rendez-vous fixé à l'extérieur, comme une séance de massage ou un soin du visage, présente un avantage psychologique intéressant : il est plus difficile à annuler ou à repousser qu'une simple intention personnelle. Ce cadre extérieur peut ainsi devenir un allié précieux pour dépasser la culpabilité, en donnant une forme concrète et engageante au temps que l'on s'accorde.</p>
<h2>Une permission qui se renforce avec le temps</h2>
<p>Plus l'on s'autorise régulièrement ces moments, plus la culpabilité associée tend à s'estomper. Ce cheminement demande de la patience et de la bienveillance envers soi-même, mais il ouvre progressivement la voie à un rapport plus apaisé et plus durable au self-care.</p>
`,
  },
  {
    title: 'Le drainage lymphatique, qu\'est-ce que c\'est et à quoi ça sert',
    slug: 'drainage-lymphatique-quest-ce-que-cest',
    category: 'Drainage',
    tags: 'drainage lymphatique, système lymphatique, bien-être, technique',
    excerpt:
      "Souvent recommandé pour la sensation de légèreté qu'il procure, le drainage lymphatique reste mal connu. Voici les bases pour comprendre ce soin et ses principes.",
    content: `
<h2>Le système lymphatique, un réseau méconnu</h2>
<p>Le corps humain dispose, en complément du système sanguin, d'un réseau parallèle appelé système lymphatique. Il transporte la lymphe, un liquide qui participe notamment à l'élimination des déchets cellulaires et au bon fonctionnement du système immunitaire. Contrairement au sang, la lymphe ne circule pas grâce à une pompe centrale comme le cœur : sa circulation dépend en grande partie du mouvement musculaire et de la respiration.</p>
<p>Or, un mode de vie sédentaire, de longues heures passées assise, ou certaines périodes de fatigue peuvent ralentir cette circulation naturelle, ce qui peut donner une sensation de lourdeur ou de gonflement, en particulier au niveau des jambes ou du visage.</p>
<h2>Le principe du drainage lymphatique manuel</h2>
<h3>Des gestes doux et rythmés</h3>
<p>Le drainage lymphatique manuel repose sur des mouvements légers, lents et rythmés, très différents des pressions profondes d'un massage musculaire classique. L'objectif n'est pas de « pétrir » les tissus, mais d'accompagner la circulation de la lymphe vers les ganglions, en suivant des trajets précis.</p>
<h3>Une technique qui demande une vraie formation</h3>
<p>Contrairement à ce que sa douceur apparente pourrait laisser penser, le drainage lymphatique manuel est une technique exigeante, qui nécessite une bonne connaissance de l'anatomie du système lymphatique pour être pratiquée efficacement.</p>
<h2>Ce que l'on ressent après une séance</h2>
<p>De nombreuses personnes rapportent une sensation de légèreté et de confort après une séance de drainage lymphatique, en particulier au niveau des jambes ou du visage. Il est important de rester prudent dans les termes employés : le drainage lymphatique est un soin de bien-être, et non un traitement médical. Toute problématique de santé liée au système lymphatique (lymphœdème, pathologie circulatoire) doit être évaluée par un professionnel de santé.</p>
<ul>
<li>Le drainage lymphatique accompagne la circulation naturelle de la lymphe</li>
<li>Ses gestes sont doux, lents et rythmés, à l'opposé d'un massage profond</li>
<li>Il procure souvent une sensation de légèreté et de détente</li>
<li>Ce n'est pas un acte médical : il complète, sans jamais remplacer, un avis de santé si nécessaire</li>
</ul>
<h2>Pour qui ce soin est-il particulièrement apprécié ?</h2>
<p>Le drainage lymphatique est souvent plébiscité par les personnes qui passent de longues heures en position assise ou debout, celles qui voyagent fréquemment, ou celles qui ressentent une sensation de jambes lourdes en fin de journée. C'est également un soin apprécié en complément d'autres rituels de bien-être, comme le Kobido, pour une approche plus complète de la détente corporelle.</p>
<h2>Un soin à intégrer dans une routine bien-être globale</h2>
<p>Comme pour beaucoup de rituels corporels, la régularité est souvent la clé pour ressentir des effets durables. Associé à une hydratation suffisante et à une activité physique régulière, le drainage lymphatique s'inscrit pleinement dans une démarche de bien-être holistique.</p>
`,
  },
  {
    title: 'Drainage lymphatique du visage : pour un teint plus léger et reposé',
    slug: 'drainage-lymphatique-visage-teint-leger',
    category: 'Drainage',
    tags: 'drainage lymphatique, visage, teint, gonflement, éclat',
    excerpt:
      "Paupières gonflées, traits tirés, teint terne : le drainage lymphatique du visage propose une réponse douce à ces sensations d'inconfort passagères.",
    content: `
<h2>Pourquoi le visage se marque-t-il autant après une nuit difficile ?</h2>
<p>Le visage est une zone particulièrement sensible aux variations de circulation, notamment autour des yeux où la peau est plus fine. Une nuit courte, une consommation élevée de sel la veille, ou simplement la position allongée prolongée peuvent favoriser une sensation de gonflement au réveil, en particulier au niveau des paupières.</p>
<h2>Comment le drainage lymphatique agit sur le visage</h2>
<h3>Des gestes ciblés autour des zones sensibles</h3>
<p>Le drainage lymphatique du visage suit des trajets précis, qui accompagnent la circulation depuis le centre du visage vers les ganglions situés au niveau du cou. Les gestes, très doux, sont adaptés à la finesse de la peau du visage et du contour des yeux.</p>
<h3>Une sensation immédiate de légèreté</h3>
<p>À l'issue d'une séance, de nombreuses clientes rapportent une sensation de traits plus détendus et de teint plus lumineux. Cette sensation de légèreté est souvent l'un des effets les plus recherchés, en particulier avant un événement important.</p>
<h2>Drainage lymphatique et Kobido : une association complémentaire</h2>
<p>Le drainage lymphatique du visage se marie particulièrement bien avec le Kobido : le premier accompagne la circulation et allège les tissus, tandis que le second travaille davantage la tonicité musculaire et l'éclat global du teint. Ensemble, ces deux approches offrent une expérience de soin du visage particulièrement complète.</p>
<ul>
<li>Sensation de légèreté au niveau des paupières et des traits</li>
<li>Teint qui paraît plus lumineux et reposé</li>
<li>Détente du contour des yeux, souvent marqué par la fatigue</li>
<li>Complémentarité naturelle avec le massage Kobido</li>
</ul>
<h2>Quelques gestes simples à reproduire chez soi</h2>
<p>Entre deux séances en institut, quelques gestes très doux peuvent être reproduits à la maison : de légers tapotements du bout des doigts autour des yeux, ou de petits mouvements circulaires vers l'extérieur du visage, en veillant à toujours rester extrêmement délicate sur cette zone fragile. Ces gestes ne remplacent pas une séance professionnelle, mais peuvent contribuer à prolonger la sensation de légèreté entre deux rendez-vous.</p>
<h2>Un soin à considérer avec prudence en cas de doute</h2>
<p>Si un gonflement du visage est inhabituel, persistant ou associé à d'autres symptômes, il est essentiel de consulter un professionnel de santé plutôt que de se limiter à un soin de bien-être. Le drainage lymphatique du visage s'adresse aux sensations d'inconfort passagères et à la recherche de confort, non à des problématiques médicales.</p>
`,
  },
  {
    title: 'Drainage lymphatique et sensation de jambes lourdes : ce qu\'il faut savoir',
    slug: 'drainage-lymphatique-jambes-lourdes',
    category: 'Drainage',
    tags: 'drainage lymphatique, jambes lourdes, circulation, confort',
    excerpt:
      "Chaleur, station debout prolongée, fatigue accumulée : la sensation de jambes lourdes touche de nombreuses femmes. Le point sur le rôle du drainage lymphatique dans ce contexte.",
    content: `
<h2>Une sensation courante, en particulier en fin de journée</h2>
<p>La sensation de jambes lourdes est l'une des plaintes les plus fréquentes exprimées par les femmes actives, en particulier après une journée passée debout ou assise sans réelle pause. Cette sensation peut s'accentuer avec la chaleur, la fatigue, ou certaines périodes du cycle hormonal.</p>
<h2>Le rôle du mouvement dans la circulation</h2>
<p>Contrairement au sang, propulsé par le cœur, la circulation lymphatique et une partie de la circulation veineuse dépendent largement de la contraction des muscles, en particulier ceux des mollets. Un mode de vie sédentaire ou de longues stations statiques peuvent ainsi ralentir cette circulation naturelle et favoriser la sensation d'inconfort.</p>
<h2>Comment le drainage lymphatique peut aider</h2>
<h3>Un accompagnement doux de la circulation</h3>
<p>Les gestes du drainage lymphatique, appliqués sur les jambes, suivent des trajets précis, du pied vers le haut de la cuisse, pour accompagner la circulation vers les ganglions. Cette technique est appréciée pour la sensation de légèreté qu'elle procure, en particulier après une séance en fin de journée.</p>
<h3>Une routine à associer à d'autres bonnes pratiques</h3>
<p>Le drainage lymphatique gagne à s'inscrire dans une routine plus large : marcher régulièrement, surélever les jambes en fin de journée, éviter une station debout prolongée sans pause, et maintenir une bonne hydratation participent également au confort ressenti.</p>
<ul>
<li>Marcher au moins quelques minutes toutes les heures en cas de travail sédentaire</li>
<li>Surélever les jambes quelques minutes en fin de journée</li>
<li>Éviter les vêtements trop serrés qui peuvent gêner la circulation</li>
<li>Privilégier une hydratation suffisante tout au long de la journée</li>
<li>Intégrer une séance de drainage lymphatique en période de forte chaleur ou de fatigue accrue</li>
</ul>
<h2>Une sensation à ne pas négliger si elle persiste</h2>
<p>Si la sensation de jambes lourdes devient chronique, s'accompagne de douleurs marquées, de rougeurs ou d'un gonflement inhabituel, il est important de consulter un médecin. Le drainage lymphatique reste un soin de confort et de bien-être, qui ne se substitue jamais à un avis médical en cas de doute sur une problématique circulatoire ou veineuse.</p>
<h2>Un rituel saisonnier particulièrement apprécié</h2>
<p>Beaucoup de femmes choisissent d'intégrer des séances de drainage lymphatique en particulier durant les mois les plus chauds de l'année, période où la sensation de jambes lourdes tend à s'intensifier. Associé à une routine de mouvement régulier, ce rituel peut devenir un allié précieux du confort quotidien.</p>
`,
  },
  {
    title: 'Nutrition et bien-être : le lien entre alimentation et énergie',
    slug: 'nutrition-bien-etre-alimentation-energie',
    category: 'Nutrition',
    tags: 'nutrition, énergie, alimentation, bien-être, équilibre',
    excerpt:
      "Coups de fatigue en milieu d'après-midi, difficulté à se concentrer : et si une partie de la réponse se trouvait dans l'assiette ? Le point sur le lien entre alimentation et énergie.",
    content: `
<h2>L'alimentation, un carburant trop souvent négligé</h2>
<p>Beaucoup de femmes actives gèrent leur alimentation au fil de l'eau, entre repas pris sur le pouce et grignotages liés au stress. Pourtant, ce que l'on mange influence directement le niveau d'énergie ressenti au fil de la journée, bien plus qu'on ne l'imagine souvent.</p>
<h2>Comprendre les variations d'énergie liées à l'alimentation</h2>
<h3>Les repas trop riches en sucres rapides</h3>
<p>Un petit-déjeuner ou un déjeuner très riche en sucres rapides (viennoiseries, boissons sucrées, pain blanc) peut procurer un regain d'énergie immédiat, souvent suivi d'une baisse marquée une à deux heures plus tard. Cette alternance peut expliquer une partie des fameux « coups de barre » de milieu d'après-midi.</p>
<h3>L'importance des protéines et des fibres</h3>
<p>Associer des protéines (œufs, légumineuses, poisson, volaille) et des fibres (légumes, céréales complètes) à chaque repas permet généralement une énergie plus stable et durable dans le temps, en évitant les pics et les chutes trop marqués.</p>
<h2>L'hydratation, souvent sous-estimée</h2>
<p>La fatigue et la baisse de concentration peuvent également être liées à une hydratation insuffisante. Boire de l'eau régulièrement tout au long de la journée, plutôt que de grandes quantités ponctuelles, contribue à un meilleur niveau d'énergie général.</p>
<h2>Quelques principes simples à intégrer</h2>
<ul>
<li>Privilégier un petit-déjeuner associant protéines et fibres plutôt que des sucres rapides isolés</li>
<li>Répartir les apports en protéines sur l'ensemble de la journée plutôt que sur un seul repas</li>
<li>Boire régulièrement de l'eau tout au long de la journée</li>
<li>Limiter les excès de caféine en fin de journée, qui peuvent perturber le sommeil et donc l'énergie du lendemain</li>
<li>Éviter les repas trop copieux le soir, qui peuvent nuire à la qualité du sommeil</li>
</ul>
<h2>Une approche individuelle avant tout</h2>
<p>Il n'existe pas de régime alimentaire universel, valable pour toutes les femmes en toutes circonstances. Le rythme de vie, les activités physiques, le cycle hormonal ou encore les sensibilités digestives de chacune influencent les besoins réels. C'est pourquoi un accompagnement personnalisé, comme le coaching nutritionnel, permet souvent d'aller plus loin qu'une liste générique de conseils.</p>
<h2>Nutrition et bien-être global</h2>
<p>L'alimentation ne doit pas être envisagée isolément : elle s'inscrit pleinement dans l'approche holistique du bien-être, aux côtés du sommeil, de l'activité physique et de la gestion du stress. Retrouver une énergie stable au quotidien passe souvent par un ajustement de plusieurs de ces leviers à la fois, plutôt que par la seule modification de l'assiette.</p>
`,
  },
  {
    title: "Les aliments alliés d'une peau éclatante",
    slug: 'aliments-allies-peau-eclatante',
    category: 'Nutrition',
    tags: 'nutrition, peau, alimentation, éclat, hydratation',
    excerpt:
      "La qualité de la peau ne dépend pas uniquement des soins appliqués localement : l'alimentation joue elle aussi un rôle, souvent sous-estimé, dans l'aspect du teint.",
    content: `
<h2>La peau, un reflet de l'équilibre général</h2>
<p>La peau est le plus grand organe du corps, et comme les autres organes, elle bénéficie d'un apport nutritionnel adapté. Si les soins cosmétiques et les rituels comme le Kobido agissent en surface pour stimuler la circulation et l'éclat, l'alimentation contribue elle aussi, de façon plus diffuse, à l'aspect général du teint.</p>
<h2>Quelques familles d'aliments à privilégier</h2>
<h3>Les aliments riches en eau</h3>
<p>Concombre, courgette, pastèque, tomate : ces aliments riches en eau participent à l'hydratation globale de l'organisme, un facteur qui peut influencer la sensation de confort cutané, en complément d'une bonne hydratation par les boissons.</p>
<h3>Les bonnes graisses</h3>
<p>Les acides gras présents dans l'huile d'olive, les avocats, les noix ou les poissons gras participent au bon fonctionnement des membranes cellulaires, y compris celles de la peau. Une alimentation trop pauvre en graisses de qualité peut donner une sensation de peau plus terne et moins souple.</p>
<h3>Les fruits et légumes colorés</h3>
<p>Les fruits et légumes riches en pigments (carottes, poivrons, agrumes, fruits rouges) apportent une diversité de nutriments intéressants pour l'équilibre général de l'organisme. Il convient toutefois de rester prudent et de ne pas leur attribuer de vertus « anti-âge » miraculeuses : ils s'inscrivent dans une alimentation équilibrée globale, sans effet immédiat ni garanti sur la peau.</p>
<h2>Ce qu'il vaut mieux limiter</h2>
<ul>
<li>Les excès de sucres raffinés, associés par certaines études à une sensation de peau moins ferme sur le long terme</li>
<li>Les excès d'alcool, qui peuvent perturber l'hydratation générale de l'organisme</li>
<li>Une consommation insuffisante d'eau au quotidien</li>
<li>Un sommeil de mauvaise qualité, qui influence également la régénération cutanée nocturne</li>
</ul>
<h2>Une approche complémentaire, pas une solution isolée</h2>
<p>Il serait excessif de considérer l'alimentation comme le seul facteur déterminant de l'aspect de la peau : la génétique, l'exposition solaire, le stress, le sommeil et les soins appliqués localement jouent également un rôle important. L'alimentation doit être vue comme un facteur parmi d'autres, à intégrer dans une approche globale plutôt que comme une solution miracle isolée.</p>
<h2>Associer nutrition et soins du visage</h2>
<p>Chez Holisya, nous encourageons une vision complémentaire du bien-être : les soins du visage comme le Kobido agissent en surface, sur la circulation et la tonicité, tandis qu'une alimentation équilibrée soutient l'organisme dans sa globalité. C'est la combinaison de ces approches qui permet d'obtenir les résultats les plus satisfaisants et les plus durables, ressentis dans le temps.</p>
`,
  },
  {
    title: 'Manger en pleine conscience : une clé du bien-être durable',
    slug: 'manger-en-pleine-conscience-bien-etre-durable',
    category: 'Nutrition',
    tags: 'pleine conscience, alimentation, nutrition, digestion, bien-être',
    excerpt:
      "Manger vite, devant un écran, en pensant à autre chose : cette routine, devenue courante, prive souvent de sensations essentielles. Découvrez les bases de l'alimentation en pleine conscience.",
    content: `
<h2>Un repas mangé sans y penser vraiment</h2>
<p>Combien de repas prenons-nous chaque semaine sans réellement y prêter attention, happées par un écran, une conversation ou nos propres pensées ? Cette façon de manger, devenue la norme pour beaucoup de femmes actives, tend à couper le lien entre les sensations corporelles de faim et de satiété et le geste de manger lui-même.</p>
<h2>Qu'est-ce que l'alimentation en pleine conscience ?</h2>
<h3>Un principe simple</h3>
<p>L'alimentation en pleine conscience consiste à porter une attention réelle à ce que l'on mange : les couleurs, les textures, les saveurs, mais aussi les sensations physiques de faim avant le repas et de satiété au fil des bouchées. Il ne s'agit pas d'un régime, mais d'une façon différente d'aborder chaque repas.</p>
<h3>Ralentir, sans culpabiliser</h3>
<p>Cela ne signifie pas qu'il faille manger extrêmement lentement à chaque repas, ce qui serait peu réaliste au quotidien. Il s'agit plutôt de retrouver, ne serait-ce que pour un repas par jour, ce contact réel avec ses sensations alimentaires.</p>
<h2>Les bénéfices ressentis</h2>
<p>De nombreuses personnes qui pratiquent l'alimentation en pleine conscience rapportent une meilleure reconnaissance des signaux de satiété, ce qui peut aider à éviter les sensations d'inconfort digestif liées à un repas trop copieux. Cette pratique participe également à un rapport plus apaisé à l'alimentation, moins marqué par la culpabilité ou la restriction.</p>
<ul>
<li>Manger sans écran, au moins pour un repas par jour</li>
<li>Observer les couleurs et les textures de son assiette avant de commencer</li>
<li>Poser ses couverts entre les bouchées pour ralentir le rythme du repas</li>
<li>S'interroger sur sa sensation de faim avant de manger, et de satiété en cours de repas</li>
<li>Éviter de manger sous le coup d'une émotion forte sans en avoir conscience</li>
</ul>
<h2>Une pratique accessible à toutes</h2>
<p>Il n'est pas nécessaire de bouleverser toute son organisation pour intégrer cette pratique. Commencer par un seul repas par semaine, pris dans le calme et sans distraction, permet déjà de retrouver progressivement ce contact avec ses sensations alimentaires, avant d'étendre cette habitude si l'envie s'en fait sentir.</p>
<h2>Un pont entre nutrition et bien-être émotionnel</h2>
<p>L'alimentation en pleine conscience illustre parfaitement l'approche holistique du bien-être : elle ne se limite pas à la seule question nutritionnelle, mais touche aussi à la gestion du stress, à l'écoute de soi et à l'apaisement émotionnel. C'est cette vision globale que nous portons chez Holisya à travers l'accompagnement en coaching nutritionnel.</p>
`,
  },
  {
    title: 'Rituels de saison : adapter sa routine bien-être à chaque période de l\'année',
    slug: 'rituels-de-saison-adapter-routine-bien-etre',
    category: 'Bien-être',
    tags: 'saisonnalité, rituels, routine, conseils pratiques, bien-être',
    excerpt:
      "Notre corps et notre énergie évoluent au fil des saisons. Voici comment ajuster sa routine bien-être, entre soins, alimentation et rythme de vie, selon les périodes de l'année.",
    content: `
<h2>Pourquoi adapter sa routine au fil des saisons</h2>
<p>La luminosité, la température, le rythme social et même nos envies alimentaires évoluent naturellement au fil de l'année. Plutôt que de conserver une routine bien-être figée toute l'année, il peut être intéressant d'observer ces variations et d'ajuster ses rituels en conséquence, pour rester en phase avec les besoins réels de chaque période.</p>
<h2>À l'automne : accompagner la transition</h2>
<p>La baisse de la luminosité et le retour à un rythme plus soutenu après l'été peuvent générer une certaine fatigue. C'est une période propice pour renforcer les rituels de soin du visage, comme le Kobido, qui aide à contrer la sensation de traits tirés, et pour porter une attention particulière à la qualité du sommeil.</p>
<h2>En hiver : privilégier la chaleur et le réconfort</h2>
<h3>Des soins plus enveloppants</h3>
<p>Le froid et le chauffage intérieur peuvent assécher la peau. C'est le moment de privilégier des soins plus nourrissants et des rituels qui apportent une sensation de chaleur et de réconfort, comme un massage relaxant du corps entier.</p>
<h3>Une alimentation plus réconfortante, sans excès</h3>
<p>Les envies de plats plus riches et réconfortants sont naturelles en hiver. L'enjeu n'est pas de les bannir, mais de veiller à conserver un équilibre global, en associant ces plaisirs à une consommation suffisante de légumes et à une bonne hydratation, souvent négligée quand il fait froid.</p>
<h2>Au printemps : la période du renouveau</h2>
<p>Le retour de la lumière est souvent associé à un regain d'énergie naturel. C'est une période propice pour intégrer de nouvelles habitudes, reprendre une activité physique plus régulière, ou entamer une cure de soins comme le Kobido ou le drainage lymphatique pour accompagner ce renouveau.</p>
<h2>En été : miser sur la légèreté</h2>
<p>La chaleur accentue souvent la sensation de jambes lourdes et le besoin de fraîcheur. Le drainage lymphatique devient alors un allié particulièrement apprécié, tout comme une alimentation plus riche en fruits et légumes riches en eau, en cohérence avec les envies naturelles de cette saison.</p>
<ul>
<li>Automne : renforcer les soins du visage et la qualité du sommeil</li>
<li>Hiver : privilégier des soins nourrissants et une alimentation réconfortante mais équilibrée</li>
<li>Printemps : profiter du regain d'énergie pour initier de nouvelles habitudes</li>
<li>Été : miser sur la légèreté, l'hydratation et le drainage lymphatique</li>
</ul>
<h2>Une routine vivante, à l'écoute de soi</h2>
<p>Au-delà de ces grandes tendances saisonnières, chaque femme reste unique dans ses besoins et ses ressentis. L'essentiel est de rester à l'écoute de son propre corps et de ses propres envies, en laissant les saisons guider, sans les imposer, les ajustements de sa routine de bien-être.</p>
`,
  },
];

async function main() {
  let count = 0;
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const publishedAt = new Date(START_DATE.getTime() + i * WEEK_MS);
    const authorName = article.authorName ?? 'Lamyae';

    await prisma.blogPost.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        tags: article.tags,
        authorName,
        imageUrl: '',
        isPublished: true,
        publishedAt,
      },
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        tags: article.tags,
        authorName,
        imageUrl: '',
        isPublished: true,
        publishedAt,
      },
    });

    count += 1;
    console.log(`Seeded (${count}/${articles.length}): ${article.slug} -> publishedAt ${publishedAt.toISOString()}`);
  }

  console.log('Blog articles seed completed!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
