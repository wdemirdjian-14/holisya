'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Leaf, Sparkles, Star } from 'lucide-react';

export default function AboutClient({ content }: { content: Record<string, string> }) {
  const values = [
    { icon: Heart, title: content['about.value_1_title'], desc: content['about.value_1_desc'] },
    { icon: Leaf, title: content['about.value_2_title'], desc: content['about.value_2_desc'] },
    { icon: Sparkles, title: content['about.value_3_title'], desc: content['about.value_3_desc'] },
    { icon: Star, title: content['about.value_4_title'], desc: content['about.value_4_desc'] },
  ];

  return (
    <>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">{content['about.overline']}</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">{content['about.title']}</h1>
            <p className="font-cursive text-3xl md:text-4xl text-[#C98F79] mt-1">{content['about.signature']}</p>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-5/12">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F8F4EF]">
                <Image src="/images/lamyae-about.jpg" alt="Lamyae, fondatrice de Holisya" fill className="object-cover" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-7/12">
              <h2 className="font-playfair text-3xl font-bold text-[#3B312D] mb-6">{content['about.founder_heading']}</h2>
              <div className="space-y-4 text-[#3B312D]/70 leading-relaxed">
                <p>{content['about.founder_paragraph_1']}</p>
                <p>{content['about.founder_paragraph_2']}</p>
                <p>{content['about.founder_paragraph_3']}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="font-playfair text-3xl font-bold text-[#3B312D] text-center mb-12">{content['about.values_title']}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v: any, i: number) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-all">
                  <Icon size={28} className="text-[#C98F79] mx-auto mb-3" />
                  <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mb-2">{v.title}</h3>
                  <p className="text-sm text-[#3B312D]/60">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
