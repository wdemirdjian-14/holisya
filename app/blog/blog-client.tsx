'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';

export default function BlogClient({ posts }: { posts: any[] }) {
  const safeP = posts ?? [];
  return (
    <>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Le Journal</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Blog Bien-être</h1>
            <p className="text-[#3B312D]/60 mt-4 max-w-xl mx-auto">Conseils, rituels et inspirations pour votre bien-être holistique.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          {safeP.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="text-[#AAB7A0] mx-auto mb-4" />
              <p className="text-[#3B312D]/60">Les articles arrivent bientôt...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeP.map((post: any, i: number) => (
                <motion.div key={post?.id ?? i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/blog/${post?.slug ?? ''}`} className="group block bg-[#F8F4EF] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="relative aspect-video bg-[#F8F4EF]">
                      <Image src={post?.imageUrl || 'https://cdn.abacus.ai/images/9f0a8b4c-cfa2-455b-934e-f02b1827e7a2.png'} alt={post?.title ?? 'Article'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      {post?.category && <span className="text-xs font-medium text-[#AAB7A0] uppercase tracking-wider">{post.category}</span>}
                      <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mt-1 line-clamp-2">{post?.title ?? 'Article'}</h3>
                      <p className="text-sm text-[#3B312D]/60 mt-2 line-clamp-2">{post?.excerpt ?? ''}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-[#3B312D]/40 flex items-center gap-1"><Calendar size={12} />{post?.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : ''}</span>
                        <span className="text-[#C98F79] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Lire <ArrowRight size={14} /></span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
