'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, Leaf, Heart, Star, Clock, Euro, Calendar, Loader2 } from 'lucide-react';

const defaultServices = [
  {
    name: 'Soin du Visage Kobido',
    category: 'L\'art ancestral japonais du lifting naturel',
    description: 'Le Kobido est un massage facial japonais ancestral qui stimule la microcirculation, tonifie les muscles du visage et booste naturellement la production de collagène. Ce rituel d\'exception offre un véritable lifting naturel tout en procurant une relaxation profonde.',
    benefits: 'Lifting naturel et éclat du teint,Stimulation du collagène,Réduction des rides et ridules,Relaxation profonde,Amélioration de la circulation',
    duration: 60, price: 120,
    imageUrl: 'https://cdn.abacus.ai/images/d121ee1c-0b2c-446b-a09c-e8e4056259e2.png',
  },
  {
    name: 'Cure Rituel Kobido',
    category: 'Programme anti-âge intensif en plusieurs séances',
    description: 'Un programme premium de soins Kobido en cure pour des résultats visibles et durables. La cure combine lifting, stimulation musculaire et relaxation profonde pour un bien-être global et un rajeunissement naturel du visage.',
    benefits: 'Résultats visibles et durables,Programme personnalisé,Suivi entre les séances,Lifting global du visage,Bien-être profond',
    duration: 180, price: 320,
    imageUrl: 'https://cdn.abacus.ai/images/d177b15c-5aa8-43de-866f-68b1d3782977.png',
  },
  {
    name: 'Drainage Lymphatique + Kobido',
    category: 'Le duo détox et éclat',
    description: 'Un soin hybride ciblé qui associe les bienfaits du drainage lymphatique aux techniques de massage Kobido. Ce rituel détoxifie, raffermit et illumine le teint tout en offrant une détente absolue.',
    benefits: 'Détoxification profonde,Raffermissement cutané,Teint lumineux et unifié,Réduction des tensions,Relaxation complète',
    duration: 75, price: 140,
    imageUrl: 'https://cdn.abacus.ai/images/ff2bf51d-329d-4313-9391-bdfb3cec24d1.png',
  },
  {
    name: 'Coaching en Nutrition',
    category: 'Votre accompagnement santé personnalisé',
    description: 'Un accompagnement nutritionnel sur-mesure pour atteindre vos objectifs de santé durablement. Conseils alimentaires personnalisés, suivi régulier, recettes adaptées et motivation au quotidien.',
    benefits: 'Programme alimentaire sur-mesure,Suivi régulier et motivé,Recettes personnalisées,Approche holistique,Résultats durables',
    duration: 45, price: 80,
    imageUrl: 'https://cdn.abacus.ai/images/d458a545-d760-4201-896b-52acc9921cb4.png',
  },
];

const iconMap: Record<string, any> = { 'Visage': Sparkles, 'Corps': Leaf, 'Nutrition': Heart, 'Programme': Star };
function getIcon(category: string) {
  for (const [key, Icon] of Object.entries(iconMap)) {
    if ((category ?? '').toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Sparkles;
}

export default function ServicesClient() {
  const [services, setServices] = useState<any[]>(defaultServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => {
      if (d?.services && d.services.length > 0) setServices(d.services);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Nos Expertises</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Des soins d’exception</h1>
            <p className="text-[#3B312D]/60 mt-4 max-w-2xl mx-auto">Chaque rituel est conçu pour harmoniser corps et esprit, alliant techniques ancestrales et approche holistique du bien-être.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 space-y-20">
          {services.map((s: any, i: number) => {
            const Icon = getIcon(s?.category ?? '');
            const isEven = i % 2 === 0;
            const benefitsList = (s?.benefits ?? '').split(',').map((b: string) => b.trim()).filter(Boolean);
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F8F4EF]">
                    {s?.imageUrl && <Image src={s.imageUrl} alt={s?.name ?? 'Soin'} fill className="object-cover" />}
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={20} className="text-[#C98F79]" />
                    <span className="text-[#C98F79] text-sm font-medium uppercase tracking-wider">{s?.category ?? ''}</span>
                  </div>
                  <h2 className="font-playfair text-3xl font-bold text-[#3B312D] mb-4">{s?.name ?? ''}</h2>
                  <p className="text-[#3B312D]/60 leading-relaxed mb-6">{s?.description ?? ''}</p>
                  {benefitsList.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {benefitsList.map((b: string, j: number) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-[#3B312D]/70">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#AAB7A0]" />{b}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-sm text-[#3B312D]/60"><Clock size={16} className="text-[#AAB7A0]" />{s?.duration ?? 60} min</div>
                    <div className="flex items-center gap-2 text-sm text-[#3B312D]/60"><Euro size={16} className="text-[#AAB7A0]" />{s?.price ?? 0}€</div>
                  </div>
                  <Link href="/rendez-vous" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all">
                    <Calendar size={16} />Réserver ce soin
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
