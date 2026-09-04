'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Leaf, Heart, Star, Calendar, Gift, Users, ChevronRight, BookOpen } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import GalleryCarousel from '@/components/gallery-carousel';

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 2000;
    const step = Math.ceil(end / (dur / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const services = [
  { title: 'Soin Kobido', desc: 'Massage facial japonais anti-âge, lifting naturel et éclat du teint.', icon: Sparkles, img: '/images/kobido.jpg', href: '/services' },
  { title: 'Drainage Lymphatique', desc: 'Détoxification profonde, réduction des tensions et revitalisation.', icon: Leaf, img: '/images/drainage.jpg', href: '/services' },
  { title: 'Coaching Nutrition', desc: 'Accompagnement personnalisé pour une santé durable et rayonnante.', icon: Heart, img: '/images/nutrition.jpg', href: '/services' },
  { title: 'Programmes Sur-Mesure', desc: 'Rituels holistiques adaptés à vos besoins spécifiques.', icon: Star, img: '/images/programme.jpg', href: '/services' },
];

const testimonials = [
  { name: 'Camille V.', text: 'Le soin allie douceur et efficacité. Mon visage semble plus tonique et mon stress a disparu. Un rituel unique !', rating: 5 },
  { name: 'Cléa B.', text: 'Merci encore pour ce massage extraordinaire, j\'ai passé un super moment pour mon anniversaire.', rating: 5 },
  { name: 'Gigi D.', text: 'Après ma séance de Kobido, ma peau était visiblement plus lumineuse. Une détente profonde qui dure plusieurs jours !', rating: 5 },
];

export default function HomeClient({ galleryPhotos = [], latestPosts = [], content = {} }: { galleryPhotos?: { id: string; imageUrl: string; caption?: string }[]; latestPosts?: any[]; content?: Record<string, string> }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Vidéo légère (~1,9 Mo) sur mobile, version HD sur desktop. Image seule si "économie de données".
  const videoElRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoSrc, setVideoSrc] = useState('/videos/hero-mobile.mp4');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const conn = (navigator as any)?.connection;
    const saveData = conn?.saveData === true;
    const verySlow = conn && ['slow-2g', '2g'].includes(conn.effectiveType);
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    setVideoSrc(isDesktop ? '/videos/hero.mp4' : '/videos/hero-mobile.mp4');
    if (!saveData && !verySlow) setShowVideo(true);
  }, []);

  // Autoplay fiable (iOS exige muted + playsInline + appel play() explicite).
  useEffect(() => {
    const v = videoElRef.current;
    if (!showVideo || !v) return;
    v.muted = true;
    (v as any).playsInline = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener('canplay', tryPlay, { once: true });
    return () => v.removeEventListener('canplay', tryPlay);
  }, [showVideo, videoSrc]);

  return (
    <main>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[100svh] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {showVideo ? (
            <video ref={videoElRef} autoPlay muted loop playsInline preload="auto" className="w-full h-full object-cover" poster="/images/hero-wellness.jpg">
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <Image src="/images/hero-wellness.jpg" alt="" fill priority className="object-cover" sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#3B312D]/50 via-[#3B312D]/30 to-[#3B312D]/60" />
        </motion.div>
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-[#AAB7A0] text-sm uppercase tracking-[0.3em] font-medium mb-4">{content['home.hero_overline']}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight">
            {content['home.hero_title']}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="text-white/70 text-lg mt-6 max-w-xl">{content['home.hero_subtitle']}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link href="/rendez-vous" className="px-8 py-4 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
              <Calendar size={18} />Prendre rendez-vous
            </Link>
            <Link href="/services" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20">
              Découvrir nos programmes<ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"><div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-bounce" /></div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[{ n: 500, s: '+', l: 'Clientes satisfaites' }, { n: 98, s: '%', l: 'Taux de satisfaction' }, { n: 5, s: '+', l: 'Ans d\'expérience' }, { n: 12, s: '', l: 'Soins proposés' }].map((s: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <p className="font-playfair text-3xl md:text-4xl font-bold text-[#C98F79]"><CountUp end={s.n} suffix={s.s} /></p>
              <p className="text-sm text-[#3B312D]/60 mt-2">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Nos Expertises</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D] mt-3">Des soins d'exception</h2>
            <p className="text-[#3B312D]/60 mt-4 max-w-lg mx-auto">Chaque rituel est conçu pour harmoniser corps et esprit, révéler votre éclat naturel.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s: any, i: number) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={s.href} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative aspect-[4/3] bg-[#F8F4EF]">
                      <Image src={s.img} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={16} className="text-[#C98F79]" />
                        <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">{s.title}</h3>
                      </div>
                      <p className="text-sm text-[#3B312D]/60 leading-relaxed">{s.desc}</p>
                      <span className="inline-flex items-center gap-1 text-[#C98F79] text-sm font-medium mt-3 group-hover:gap-2 transition-all">En savoir plus <ChevronRight size={14} /></span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Le Blog</p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D] mt-3">Nos derniers articles</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post: any, i: number) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/blog/${post.slug}`} className="group block bg-[#F8F4EF] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    {post.imageUrl && (
                      <div className="relative aspect-[4/3] bg-white">
                        <Image src={post.imageUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-5">
                      {post.category && <p className="text-[#AAB7A0] text-xs uppercase tracking-wider font-medium mb-2">{post.category}</p>}
                      <h3 className="font-playfair text-lg font-semibold text-[#3B312D] line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-[#3B312D]/60 mt-2 line-clamp-2">{post.excerpt}</p>
                      <span className="inline-flex items-center gap-1 text-[#C98F79] text-sm font-medium mt-3 group-hover:gap-2 transition-all">Lire l'article <ChevronRight size={14} /></span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#C98F79] font-medium rounded-lg hover:bg-[#C98F79] hover:text-white transition-all border border-[#C98F79]">
                <BookOpen size={16} />Tous les articles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Carte Cadeau */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="relative bg-[#3B312D] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <Image src="/images/ambiance.jpg" alt="Ambiance spa" fill className="object-cover" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-14">
              <div className="flex-1">
                <Gift size={32} className="text-[#C98F79] mb-4" />
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white">Offrez un moment de <span className="text-[#C98F79]">bien-être</span></h2>
                <p className="text-white/60 mt-4 max-w-md">Découvrez nos cartes cadeaux personnalisables. Le cadeau parfait pour vos proches.</p>
                <Link href="/cartes-cadeaux" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all">
                  Découvrir <ArrowRight size={16} />
                </Link>
              </div>
              <div className="relative w-full md:w-72 aspect-[4/3] rounded-xl overflow-hidden">
                <Image src="/images/gift-card.jpg" alt="Cartes cadeaux Holisya" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery / Instagram */}
      {galleryPhotos.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Instants Holisya</p>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D] mt-3">L'univers Holisya en images</h2>
              <a href="https://www.instagram.com/holisya_/" target="_blank" rel="noopener noreferrer" className="inline-block text-[#C98F79] text-sm font-medium mt-4 hover:underline">Suivez-nous sur Instagram @holisya_</a>
            </motion.div>
            <GalleryCarousel photos={galleryPhotos} />
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Témoignages</p>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D] mt-3">Ce qu'elles en disent</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-1 mb-4">{Array.from({ length: t.rating }).map((_: any, j: number) => <Star key={j} size={16} className="text-[#C98F79] fill-[#C98F79]" />)}</div>
                <p className="text-[#3B312D]/70 text-sm leading-relaxed italic">"{t.text}"</p>
                <p className="font-medium text-[#3B312D] mt-4 text-sm">- {t.name}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/temoignages" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#C98F79] font-medium rounded-lg hover:bg-[#C98F79] hover:text-white transition-all border border-[#C98F79]">
              Tous les témoignages <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Users size={32} className="text-[#AAB7A0] mx-auto mb-4" />
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D]">Rejoignez l'univers Holisya</h2>
            <p className="text-[#3B312D]/60 mt-4 max-w-lg mx-auto">Créez votre espace membre pour accéder à vos soins, gérer vos crédits et profiter d'offres exclusives.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/inscription" className="px-8 py-4 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all shadow-sm">Créer mon compte</Link>
              <Link href="/abonnements" className="px-8 py-4 bg-[#AAB7A0] text-white font-medium rounded-lg hover:bg-[#96a58c] transition-all shadow-sm">Voir les abonnements</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
