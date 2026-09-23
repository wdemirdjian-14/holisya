'use client';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Sparkles, Leaf, Heart, Star, Clock, Euro, Calendar } from 'lucide-react';

const PLACEHOLDER = '/uploads/_placeholder-soin.jpg';

const defaultServices = [
  {
    name: 'Soin du Visage Kobido',
    category: 'Lifting naturel japonais',
    description: "Massage facial japonais ancestral qui stimule la microcirculation, tonifie les muscles du visage et relance naturellement la production de collagène. Un véritable lifting naturel doublé d'une relaxation profonde.",
    duration: 60, price: 120,
    imageUrl: 'https://cdn.abacus.ai/images/d121ee1c-0b2c-446b-a09c-e8e4056259e2.png',
  },
  {
    name: 'Cure Rituel Kobido',
    category: 'Programme anti-âge intensif',
    description: 'Un programme premium de soins Kobido en cure pour des résultats visibles et durables : lifting, stimulation musculaire et relaxation profonde pour un rajeunissement naturel du visage.',
    duration: 180, price: 320,
    imageUrl: 'https://cdn.abacus.ai/images/d177b15c-5aa8-43de-866f-68b1d3782977.png',
  },
  {
    name: 'Drainage Lymphatique + Kobido',
    category: 'Le duo détox et éclat',
    description: 'Un soin hybride qui associe les bienfaits du drainage lymphatique aux techniques de massage Kobido. Détoxifie, raffermit et illumine le teint tout en offrant une détente absolue.',
    duration: 75, price: 140,
    imageUrl: 'https://cdn.abacus.ai/images/ff2bf51d-329d-4313-9391-bdfb3cec24d1.png',
  },
  {
    name: 'Coaching en Nutrition',
    category: 'Accompagnement santé personnalisé',
    description: 'Un accompagnement nutritionnel sur-mesure pour atteindre vos objectifs de santé durablement : conseils personnalisés, suivi régulier et recettes adaptées.',
    duration: 45, price: 80,
    imageUrl: 'https://cdn.abacus.ai/images/d458a545-d760-4201-896b-52acc9921cb4.png',
  },
];

const iconMap: Record<string, any> = { Visage: Sparkles, Corps: Leaf, Nutrition: Heart, Programme: Star };
function getIcon(category: string) {
  for (const [key, Icon] of Object.entries(iconMap)) {
    if ((category ?? '').toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Sparkles;
}

export default function ServicesClient() {
  const [services, setServices] = useState<any[]>(defaultServices);
  const reduce = useReducedMotion();

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then((d) => {
      if (d?.services && d.services.length > 0) setServices(d.services);
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Intro */}
      <section className="py-16 sm:py-20 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Nos Expertises</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Des soins d’exception</h1>
          <p className="text-[#3B312D]/60 mt-4 max-w-2xl mx-auto">Chaque rituel est conçu pour harmoniser corps et esprit, alliant techniques ancestrales et approche holistique du bien-être. Choisissez le vôtre.</p>
        </div>
      </section>

      {/* Grille des prestations */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid gap-6 sm:gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s: any, i: number) => {
              const Icon = getIcon(s?.category ?? '');
              return (
                <motion.article
                  key={s?.id ?? i}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-[#3B312D]/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F4EF]">
                    <Image
                      src={s?.imageUrl || PLACEHOLDER}
                      alt={s?.name ?? 'Soin'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 380px"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={14} className="text-[#C98F79] flex-none" />
                      <span className="text-[11px] uppercase tracking-wider text-[#C98F79] font-semibold line-clamp-1">{s?.category ?? ''}</span>
                    </div>
                    <h2 className="font-playfair text-xl font-bold text-[#3B312D] leading-snug">{s?.name ?? ''}</h2>
                    <p className="text-sm text-[#3B312D]/60 mt-2 leading-relaxed line-clamp-3">{s?.description ?? ''}</p>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between border-t border-[#F8F4EF] pt-3">
                        <span className="flex items-center gap-1.5 text-sm text-[#3B312D]/60"><Clock size={15} className="text-[#AAB7A0]" />{s?.duration ?? 60} min</span>
                        <span className="flex items-center gap-0.5 font-playfair text-lg font-bold text-[#C98F79]">{s?.price ?? 0}<Euro size={15} /></span>
                      </div>
                      <Link href="/rendez-vous" className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg hover:bg-[#b87d68] transition-colors">
                        <Calendar size={15} />Réserver ce soin
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
