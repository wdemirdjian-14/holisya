'use client';
import { motion } from 'framer-motion';
import { Star, Quote, ExternalLink } from 'lucide-react';

export default function TestimonialsClient({ testimonials, googleReviewUrl }: { testimonials: any[]; googleReviewUrl?: string }) {
  const items = testimonials ?? [];
  const hardcoded = [
    { name: 'Camille V.', comment: 'Le soin allie douceur et efficacité. Mon visage semble plus tonique et mon stress a disparu. Un rituel unique à refaire sans hésitation.', rating: 5, serviceType: 'Kobido' },
    { name: 'Cléa B.', comment: 'Merci encore pour ce massage extraordinaire, j\'ai passé un super moment pour mon anniversaire.', rating: 5, serviceType: 'Kobido' },
    { name: 'Gigi D.', comment: 'Après ma séance de Kobido, ma peau était visiblement plus lumineuse et raffermi. Une détente profonde qui dure plusieurs jours. Je recommande 100% !', rating: 5, serviceType: 'Kobido' },
    { name: 'Marie L.', comment: 'Le coaching nutrition a transformé mes habitudes. Je me sens tellement mieux dans mon corps et dans ma tête.', rating: 5, serviceType: 'Nutrition' },
    { name: 'Sophie M.', comment: 'Le drainage lymphatique combiné au Kobido est une expérience unique. Ma peau n\'a jamais été aussi belle.', rating: 5, serviceType: 'Drainage + Kobido' },
  ];
  const all = items.length > 0 ? items : hardcoded;

  return (
    <>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Avis Clients</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Ce qu'elles en disent</h1>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {all.map((t: any, i: number) => (
            <motion.div key={t?.id ?? i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }}
              className="bg-[#F8F4EF] rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <Quote size={24} className="text-[#C98F79]/30 mb-3" />
              <div className="flex gap-1 mb-3">{Array.from({ length: t?.rating ?? 5 }).map((_: any, j: number) => <Star key={j} size={14} className="text-[#C98F79] fill-[#C98F79]" />)}</div>
              <p className="text-[#3B312D]/70 text-sm leading-relaxed italic">"{t?.comment ?? ''}"</p>
              <div className="mt-4 pt-3 border-t border-[#3B312D]/5">
                <p className="font-medium text-[#3B312D] text-sm">{t?.name ?? ''}</p>
                {t?.serviceType && <p className="text-xs text-[#AAB7A0]">{t.serviceType}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {googleReviewUrl && (
        <section className="py-12 bg-[#F8F4EF]">
          <div className="max-w-[600px] mx-auto px-4 text-center">
            <p className="text-[#3B312D]/70 text-sm">Vous avez apprécié votre soin chez Holisya ?</p>
            <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#C98F79] text-white text-sm font-medium rounded-lg hover:bg-[#b87d68] transition-all">
              Laisser un avis Google <ExternalLink size={14} />
            </a>
          </div>
        </section>
      )}
    </>
  );
}
