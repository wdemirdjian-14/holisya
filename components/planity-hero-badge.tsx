'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarClock, ArrowUpRight } from 'lucide-react';

/** Gros bouton animé "Réserver sur Planity", affiché sur l'accueil quand la bascule Planity est active. */
export default function PlanityHeroBadge({ url }: { url: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.a href={url} target="_blank" rel="noopener noreferrer" aria-label="Réserver sur Planity"
      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 160, damping: 14 }}
      className="group relative mt-10 inline-flex">
      {/* Halo pulsé */}
      {!reduce && (
        <motion.span aria-hidden className="absolute inset-0 rounded-2xl bg-[#C98F79]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0, 0.55] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }} />
      )}
      <motion.span animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-5 px-7 sm:px-9 py-5 bg-white rounded-2xl shadow-2xl group-hover:shadow-[0_20px_50px_rgba(201,143,121,0.45)] transition-shadow">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#C98F79]/15 text-[#C98F79]"><CalendarClock size={24} /></span>
        <span className="flex flex-col items-center sm:items-start leading-none">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#3B312D]/50 font-medium">Réservez sur</span>
          <span className="mt-1.5 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>planity</span>
        </span>
        <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C98F79] text-white text-sm font-medium group-hover:bg-[#b87d68] transition-colors">
          Prendre RDV<ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </motion.span>
    </motion.a>
  );
}
