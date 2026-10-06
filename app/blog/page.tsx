import Header from '@/components/header';
import Footer from '@/components/footer';
import BlogClient from './blog-client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/blog', {
    title: 'Blog bien-être',
    description: "Conseils bien-être Holisya : Kobido et lifting naturel, self-care, drainage lymphatique, nutrition. Nos articles pour prendre soin de vous à Boulogne-Billancourt et Paris.",
    alternates: { canonical: '/blog' },
  });
}

export default async function BlogPage() {
  let posts: any[] = [];
  try { posts = await prisma.blogPost.findMany({ where: { isPublished: true, publishedAt: { lte: new Date() } }, orderBy: { publishedAt: 'desc' }, take: 20 }); } catch {}
  return (<><Header /><main className="pt-20"><BlogClient posts={JSON.parse(JSON.stringify(posts ?? []))} /></main><Footer /></>);
}
