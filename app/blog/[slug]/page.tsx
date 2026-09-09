import Header from '@/components/header';
import Footer from '@/components/footer';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, User, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { SITE_URL } from '@/lib/business';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params?.slug ?? '' } });
  if (!post) return { title: 'Article' };
  const description = post.excerpt || post.title;
  const canonical = `/blog/${post.slug}`;
  return {
    title: post.title,
    description,
    alternates: { canonical },
    keywords: post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.imageUrl ? [{ url: post.imageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params?.slug ?? '' } });
  if (!post || !post.isPublished || !post.publishedAt || post.publishedAt > new Date()) return notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.imageUrl ? `${SITE_URL}${post.imageUrl}` : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: { '@type': 'Person', name: post.authorName },
    publisher: {
      '@type': 'Organization',
      name: 'Holisya',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo-holisya.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    articleSection: post.category || undefined,
    inLanguage: 'fr-FR',
  };

  return (
    <><Header /><main className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
