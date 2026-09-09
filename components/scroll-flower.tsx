'use client';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

/** Petite fleur (5 pétales) — marqueur de progression. */
function Flower() {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="drop-shadow-sm">
      {petals.map((a) => (
        <ellipse key={a} cx="12" cy="6.4" rx="3" ry="5.4" fill="#C98F79" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3.1" fill="#E7B85C" />
    </svg>
  );
}

/**
 * Barre de défilement fixée en bas de page : une ligne qui se remplit et une fleur
 * qui avance (et tourne) selon la progression du scroll de la page.
 */
export default function ScrollFlower() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.35 });
  const left = useTransform(p, [0, 1], ['0%', '100%']);
  const rotate = useTransform(p, [0, 1], [0, 540]);

  return (
    <div className="fixed inset-x-0 bottom-16 lg:bottom-0 z-30 pointer-events-none">
      <div className="relative h-[3px] bg-[#3B312D]/10">
        <motion.div style={{ scaleX: p }} className="absolute inset-0 origin-left bg-gradient-to-r from-[#C98F79] via-[#D6A491] to-[#AAB7A0]" />
        <motion.div style={{ left }} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div style={{ rotate }}>
            <Flower />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
