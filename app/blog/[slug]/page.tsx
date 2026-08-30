import Header from '@/components/header';
import Footer from '@/components/footer';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params?.slug ?? '' } });
  if (!post || !post.isPublished || !post.publishedAt || post.publishedAt > new Date()) return notFound();

  return (
    <><Header /><main className="pt-20">
      <article className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#C98F79] text-sm font-medium mb-8 hover:underline"><ArrowLeft size={16} />Retour au blog</Link>
          {post.imageUrl && <div className="relative aspect-video rounded-xl overflow-hidden bg-[#F8F4EF] mb-8"><Image src={post.imageUrl} alt={post.title} fill className="object-cover" /></div>}
          <div className="flex items-center gap-4 text-sm text-[#3B312D]/50 mb-4">
            {post.category && <span className="text-[#AAB7A0] uppercase tracking-wider text-xs font-medium">{post.category}</span>}
            <span className="flex items-center gap-1"><Calendar size={14} />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR') : ''}</span>
            <span className="flex items-center gap-1"><User size={14} />{post.authorName}</span>
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D] mb-6">{post.title}</h1>
          <div className="prose prose-lg max-w-none text-[#3B312D]/70" dangerouslySetInnerHTML={{ __html: post.content ?? '' }} />
          {post.sourceUrl && (
            <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-8 text-sm text-[#C98F79] hover:underline">
              Source <ExternalLink size={14} />
            </a>
          )}
        </div>
      </article>
    </main><Footer /></>
  );
}
