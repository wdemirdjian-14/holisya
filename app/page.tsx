import Header from '@/components/header';
import Footer from '@/components/footer';
import HomeClient from '@/components/home-client';
import PlanityFloat from '@/components/planity-float';
import { prisma } from '@/lib/db';
import { getSiteContentMap } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let galleryPhotos: any[] = [];
  let latestPosts: any[] = [];
  try { galleryPhotos = await prisma.galleryPhoto.findMany({ where: { isActive: true } }); } catch {}
  try { latestPosts = await prisma.blogPost.findMany({ where: { isPublished: true, publishedAt: { lte: new Date() } }, orderBy: { publishedAt: 'desc' }, take: 3 }); } catch {}
  const content = await getSiteContentMap(['home.hero_overline', 'home.hero_title', 'home.hero_subtitle']);
  return (
    <>
      <Header />
      <HomeClient galleryPhotos={JSON.parse(JSON.stringify(galleryPhotos ?? []))} latestPosts={JSON.parse(JSON.stringify(latestPosts ?? []))} content={content} />
      <PlanityFloat />
      <Footer />
    </>
  );
}
