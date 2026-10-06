/**
 * Section FAQ (serveur) : contenu visible + balisage schema.org FAQPage.
 * Le contenu est rendu dans le DOM (bon pour le SEO et éligible aux résultats enrichis).
 * Utilise <details>/<summary> → accordéon sans JavaScript.
 */
export default function FaqSection({ title = 'Questions fréquentes', items }: { title?: string; items: { q: string; a: string }[] }) {
  if (!items?.length) return null;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return (
    <section className="py-14 bg-white">
      <div className="max-w-[800px] mx-auto px-4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#3B312D] text-center mb-8">{title}</h2>
        <div className="space-y-3">
          {items.map((f, i) => (
            <details key={i} className="group border border-[#F8F4EF] rounded-xl bg-[#F8F4EF]/40 overflow-hidden">
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 text-[#3B312D] font-medium">
                <span>{f.q}</span>
                <span className="text-[#C98F79] text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-[#3B312D]/70 leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
