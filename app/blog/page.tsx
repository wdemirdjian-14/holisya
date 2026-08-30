import Header from '@/components/header';
import Footer from '@/components/footer';
import BlogClient from './blog-client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blog' };

export default async function BlogPage() {
  let posts: any[] = [];
  try { posts = await prisma.blogPost.findMany({ where: { isPublished: true, publishedAt: { lte: new Date() } }, orderBy: { publishedAt: 'desc' }, take: 20 }); } catch {}
  return (<><Header /><main className="pt-20"><BlogClient posts={JSON.parse(JSON.stringify(posts ?? []))} /></main><Footer /></>);
}
