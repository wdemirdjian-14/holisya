'use client';
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent, MotionValue } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Leaf, Heart, Star, Clock, Euro, Calendar, Loader2 } from 'lucide-react';

const PLACEHOLDER = '/uploads/_placeholder-soin.jpg';

const defaultServices = [
  {
    name: 'Soin du Visage Kobido',
    category: 'L\'art ancestral japonais du lifting naturel',
    description: 'Le Kobido est un massage facial japonais ancestral qui stimule la microcirculation, tonifie les muscles du visage et booste naturellement la production de collagène. Un véritable lifting naturel doublé d\'une relaxation profonde.',
    benefits: 'Lifting naturel et éclat du teint,Stimulation du collagène,Réduction des rides et ridules,Relaxation profonde',
    duration: 60, price: 120,
    imageUrl: 'https://cdn.abacus.ai/images/d121ee1c-0b2c-446b-a09c-e8e4056259e2.png',
  },
  {
    name: 'Cure Rituel Kobido',
    category: 'Programme anti-âge intensif en plusieurs séances',
    description: 'Un programme premium de soins Kobido en cure pour des résultats visibles et durables. Lifting, stimulation musculaire et relaxation profonde pour un rajeunissement naturel du visage.',
    benefits: 'Résultats visibles et durables,Programme personnalisé,Suivi entre les séances,Bien-être profond',
    duration: 180, price: 320,
    imageUrl: 'https://cdn.abacus.ai/images/d177b15c-5aa8-43de-866f-68b1d3782977.png',
  },
  {
    name: 'Drainage Lymphatique + Kobido',
    category: 'Le duo détox et éclat',
    description: 'Un soin hybride qui associe les bienfaits du drainage lymphatique aux techniques de massage Kobido. Détoxifie, raffermit et illumine le teint tout en offrant une détente absolue.',
    benefits: 'Détoxification profonde,Raffermissement cutané,Teint lumineux et unifié,Relaxation complète',
    duration: 75, price: 140,
    imageUrl: 'https://cdn.abacus.ai/images/ff2bf51d-329d-4313-9391-bdfb3cec24d1.png',
  },
  {
    name: 'Coaching en Nutrition',
    category: 'Votre accompagnement santé personnalisé',
    description: 'Un accompagnement nutritionnel sur-mesure pour atteindre vos objectifs de santé durablement. Conseils personnalisés, suivi régulier et recettes adaptées.',
    benefits: 'Programme alimentaire sur-mesure,Suivi régulier et motivé,Recettes personnalisées,Résultats durables',
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

/** Contenu visuel d'une offre (partagé par l'affichage animé et le repli statique). */
function OfferContent({ s, reverse }: { s: any; reverse?: boolean }) {
  const Icon = getIcon(s?.category ?? '');
  const benefits = (s?.benefits ?? '').split(',').map((b: string) => b.trim()).filter(Boolean).slice(0, 4);
  return (
    <div className={`max-w-[1080px] w-full mx-auto grid md:grid-cols-2 gap-6 md:gap-14 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
      <div className="relative w-full aspect-[4/3] max-h-[42vh] md:max-h-none rounded-2xl overflow-hidden bg-[#F8F4EF] shadow-[0_20px_50px_-20px_rgba(59,49,45,0.45)]">
        <Image src={s?.imageUrl || PLACEHOLDER} alt={s?.name ?? 'Soin'} fill className="object-cover" sizes="(max-width:768px) 100vw, 540px" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon size={18} className="text-[#C98F79]" />
          <span className="text-[#C98F79] text-xs sm:text-sm font-medium uppercase tracking-wider">{s?.category ?? ''}</span>
        </div>
        <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#3B312D] mb-3 md:mb-4 leading-tight">{s?.name ?? ''}</h2>
        <p className="text-[#3B312D]/60 leading-relaxed mb-4 md:mb-6 line-clamp-4">{s?.description ?? ''}</p>
        {benefits.length > 0 && (
          <div className="hidden sm:grid grid-cols-1 gap-2 mb-6">
            {benefits.map((b: string, j: number) => (
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
    </div>
  );
}

/** Une "diapo" dont l'opacité/position sont pilotées par le scroll (fondu enchaîné). */
function OfferSlide({ s, i, total, progress }: { s: any; i: number; total: number; progress: MotionValue<number> }) {
  const seg = 1 / total;
  const cf = seg * 0.35;
  const start = i * seg;
  const end = (i + 1) * seg;

  // Animation "page qui se tourne" : rotation 3D autour de l'axe vertical, pilotée au scroll.
  let inp: number[]; let op: number[]; let rot: number[]; let sc: number[];
  if (total === 1) {
    inp = [0, 1]; op = [1, 1]; rot = [0, 0]; sc = [1, 1];
  } else if (i === 0) {
    inp = [0, end - cf, end + cf]; op = [1, 1, 0]; rot = [0, 0, -78]; sc = [1, 1, 0.92];
  } else if (i === total - 1) {
    inp = [start - cf, start + cf, 1]; op = [0, 1, 1]; rot = [78, 0, 0]; sc = [0.92, 1, 1];
  } else {
    inp = [start - cf, start + cf, end - cf, end + cf]; op = [0, 1, 1, 0]; rot = [78, 0, 0, -78]; sc = [0.92, 1, 1, 0.92];
  }

  const opacity = useTransform(progress, inp, op);
  const rotateY = useTransform(progress, inp, rot);
  const scale = useTransform(progress, inp, sc);

  return (
    <motion.div style={{ opacity, rotateY, scale, transformOrigin: 'center center' }} className="absolute inset-0 flex items-center justify-center px-4 sm:px-8 [backface-visibility:hidden]">
      <OfferContent s={s} reverse={i % 2 === 1} />
    </motion.div>
  );
}

export default function ServicesClient() {
  const [services, setServices] = useState<any[]>(defaultServices);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(services.length - 1, Math.max(0, Math.floor(v * services.length)));
    setActive(idx);
  });

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then((d) => {
      if (d?.services && d.services.length > 0) setServices(d.services);
    }).catch(() => {});
  }, []);

  const Intro = (
    <section className="py-16 bg-[#F8F4EF]">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Nos Expertises</p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Des soins d’exception</h1>
          <p className="text-[#3B312D]/60 mt-4 max-w-2xl mx-auto">Chaque rituel est conçu pour harmoniser corps et esprit, alliant techniques ancestrales et approche holistique du bien-être.</p>
          {!reduce && <p className="text-[#3B312D]/40 text-xs mt-6 uppercase tracking-widest">Faites défiler pour découvrir ↓</p>}
        </motion.div>
      </div>
    </section>
  );

  // Repli statique (mouvement réduit) : présentation empilée classique.
  if (reduce) {
    return (
      <>
        {Intro}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 space-y-20">
            {services.map((s: any, i: number) => <OfferContent key={i} s={s} reverse={i % 2 === 1} />)}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {Intro}
      <div ref={containerRef} className="relative bg-white" style={{ height: `${services.length * 62}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center" style={{ perspective: '1800px' }}>
          {services.map((s: any, i: number) => (
            <OfferSlide key={i} s={s} i={i} total={services.length} progress={scrollYProgress} />
          ))}
          {/* Indicateur de progression (points) */}
          <div className="hidden md:flex flex-col gap-2.5 absolute right-6 top-1/2 -translate-y-1/2 z-10">
            {services.map((_: any, i: number) => (
              <span key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-[#C98F79] scale-125' : 'bg-[#3B312D]/15'}`} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
