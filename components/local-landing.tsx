import Link from 'next/link';
import { Clock, Euro, Calendar, Check, Sparkles, MapPin } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { BUSINESS, SITE_URL } from '@/lib/business';

export type LocalLandingProps = {
  path: string;               // ex : '/massage-kobido-paris'
  city: string;               // ex : 'Paris'
  eyebrow: string;            // ex : 'Massage Kobido · Paris'
  h1: string;
  intro: string[];            // paragraphes d'introduction (riches en mots-clés)
  locationNote: string;       // phrase sur l'accès / la proximité
  reasons: { title: string; text: string }[];
  faq: { q: string; a: string }[];
};

export default function LocalLanding(props: LocalLandingProps) {
  const { path, city, eyebrow, h1, intro, locationNote, reasons, faq } = props;
  const url = `${SITE_URL}${path}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: h1,
        serviceType: 'Massage du visage Kobido',
        areaServed: { '@type': 'City', name: city },
        provider: { '@id': `${SITE_URL}/#business` },
        url,
        offers: BUSINESS.services.map((s) => ({
          '@type': 'Offer', priceCurrency: 'EUR', price: String(s.price),
          itemOffered: { '@type': 'Service', name: s.name },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: h1, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 sm:py-20 bg-[#F8F4EF]">
          <div className="max-w-[900px] mx-auto px-4 text-center">
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">{eyebrow}</p>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[#3B312D] mt-3 leading-tight">{h1}</h1>
            <p className="text-[#3B312D]/60 mt-5 max-w-2xl mx-auto text-lg">{intro[0]}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link href="/rendez-vous" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all">
                <Calendar size={17} />Réserver un soin
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#C98F79]/40 text-[#3B312D] font-medium rounded-lg hover:bg-white transition-all">
                Voir tous les soins
              </Link>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[#3B312D]/50 text-sm mt-6"><MapPin size={15} className="text-[#C98F79]" />{locationNote}</p>
          </div>
        </section>

        {/* Intro détaillée */}
        <section className="py-14 bg-white">
          <div className="max-w-[760px] mx-auto px-4 space-y-5">
            {intro.slice(1).map((p, i) => (
              <p key={i} className="text-[#3B312D]/70 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>

        {/* Soins & tarifs */}
        <section className="py-14 bg-[#F8F4EF]">
          <div className="max-w-[900px] mx-auto px-4">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#3B312D] text-center mb-3">Nos soins à {city}</h2>
            <p className="text-[#3B312D]/60 text-center mb-10 max-w-xl mx-auto">Des rituels sur-mesure pensés pour révéler votre éclat naturel.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {BUSINESS.services.map((s) => (
                <div key={s.name} className="bg-white rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className="text-[#C98F79] mt-0.5 flex-none" />
                    <div>
                      <p className="font-medium text-[#3B312D]">{s.name}</p>
                      <p className="text-[#3B312D]/50 text-sm flex items-center gap-1 mt-0.5"><Clock size={13} className="text-[#AAB7A0]" />{s.duration} min</p>
                    </div>
                  </div>
                  <p className="font-playfair text-lg font-semibold text-[#C98F79] flex items-center whitespace-nowrap">{s.price}<Euro size={15} className="ml-0.5" /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pourquoi Holisya */}
        <section className="py-14 bg-white">
          <div className="max-w-[900px] mx-auto px-4">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#3B312D] text-center mb-10">Pourquoi choisir Holisya</h2>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
              {reasons.map((r) => (
                <div key={r.title} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#AAB7A0]/15 flex items-center justify-center flex-none mt-0.5"><Check size={14} className="text-[#AAB7A0]" /></span>
                  <div>
                    <p className="font-medium text-[#3B312D]">{r.title}</p>
                    <p className="text-[#3B312D]/60 text-sm mt-1 leading-relaxed">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 bg-[#F8F4EF]">
          <div className="max-w-[760px] mx-auto px-4">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#3B312D] text-center mb-10">Questions fréquentes</h2>
            <div className="space-y-4">
              {faq.map((f) => (
                <details key={f.q} className="bg-white rounded-xl p-5 group">
                  <summary className="font-medium text-[#3B312D] cursor-pointer list-none flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-[#C98F79] text-xl leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-[#3B312D]/65 text-sm mt-3 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16 bg-[#3B312D] text-center">
          <div className="max-w-[700px] mx-auto px-4">
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-white">Offrez-vous un moment rien qu'à vous</h2>
            <p className="text-white/60 mt-3">Réservez votre soin à {city} en quelques clics, 7j/7.</p>
            <Link href="/rendez-vous" className="inline-flex items-center gap-2 px-8 py-4 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all mt-7">
              <Calendar size={18} />Prendre rendez-vous
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
