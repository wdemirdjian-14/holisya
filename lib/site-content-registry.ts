export type SiteContentField = {
  key: string;
  label: string;
  page: string;
  defaultValue: string;
  multiline?: boolean;
};

export const SITE_CONTENT_REGISTRY: SiteContentField[] = [
  // Accueil - Hero
  { key: 'home.hero_overline', label: 'Sur-titre du hero', page: 'Accueil', defaultValue: 'Bien-être Holistique Féminin' },
  { key: 'home.hero_title', label: 'Titre du hero', page: 'Accueil', defaultValue: 'Éveillez votre beauté intérieure, rayonnez à l\'extérieur' },
  { key: 'home.hero_subtitle', label: 'Sous-titre du hero', page: 'Accueil', defaultValue: 'Approche holistique du bien-être féminin alliant soins ancestraux et nutrition personnalisée.', multiline: true },

  // À propos
  { key: 'about.overline', label: 'Sur-titre', page: 'À propos', defaultValue: 'Notre Histoire' },
  { key: 'about.title', label: 'Titre principal', page: 'À propos', defaultValue: 'À propos de Holisya' },
  { key: 'about.signature', label: 'Signature (manuscrite)', page: 'À propos', defaultValue: 'by Lamyae' },
  { key: 'about.founder_heading', label: 'Titre section fondatrice', page: 'À propos', defaultValue: 'Lamyae, fondatrice de Holisya' },
  { key: 'about.founder_paragraph_1', label: 'Paragraphe 1', page: 'À propos', defaultValue: 'Énergique, sportive et passionnée par le bien-être, Lamyae a toujours été attirée par les activités qui nourrissent le corps et l\'esprit — yoga, course à pied, méditation.', multiline: true },
  { key: 'about.founder_paragraph_2', label: 'Paragraphe 2', page: 'À propos', defaultValue: 'Sa vision est claire : les soins haut de gamme comme le Kobido sont extrêmement efficaces, mais la beauté et la santé vont de pair. C\'est pourquoi elle a intégré le coaching nutritionnel personnalisé à sa pratique.', multiline: true },
  { key: 'about.founder_paragraph_3', label: 'Paragraphe 3', page: 'À propos', defaultValue: 'Chez Holisya, chaque rituel est conçu pour créer un équilibre parfait entre beauté extérieure et santé intérieure, pour un bien-être durable et profond.', multiline: true },
  { key: 'about.values_title', label: 'Titre section valeurs', page: 'À propos', defaultValue: 'Nos Valeurs' },
  { key: 'about.value_1_title', label: 'Valeur 1 - titre', page: 'À propos', defaultValue: 'Bienveillance' },
  { key: 'about.value_1_desc', label: 'Valeur 1 - description', page: 'À propos', defaultValue: 'Un espace d\'accueil chaleureux où chaque cliente est unique.' },
  { key: 'about.value_2_title', label: 'Valeur 2 - titre', page: 'À propos', defaultValue: 'Naturalité' },
  { key: 'about.value_2_desc', label: 'Valeur 2 - description', page: 'À propos', defaultValue: 'Des techniques ancestrales respectueuses du corps et de la nature.' },
  { key: 'about.value_3_title', label: 'Valeur 3 - titre', page: 'À propos', defaultValue: 'Excellence' },
  { key: 'about.value_3_desc', label: 'Valeur 3 - description', page: 'À propos', defaultValue: 'Des soins d\'exception pour des résultats visibles et durables.' },
  { key: 'about.value_4_title', label: 'Valeur 4 - titre', page: 'À propos', defaultValue: 'Holistique' },
  { key: 'about.value_4_desc', label: 'Valeur 4 - description', page: 'À propos', defaultValue: 'Une approche globale alliant beauté, nutrition et équilibre.' },

  // Footer
  { key: 'footer.description', label: 'Description (colonne 1)', page: 'Pied de page', defaultValue: 'Approche holistique du bien-être féminin. Kobido, drainage lymphatique, nutrition et programmes personnalisés.', multiline: true },
  { key: 'footer.signature', label: 'Signature (bas de page, avant l\'icône cœur)', page: 'Pied de page', defaultValue: 'Fait avec' },
];

export function getDefaultValue(key: string): string {
  return SITE_CONTENT_REGISTRY.find((f) => f.key === key)?.defaultValue ?? '';
}
