import Header from '@/components/header';
import Footer from '@/components/footer';
import TestimonialsClient from './testimonials-client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { withSeoOverride } from '@/lib/seo/meta';

export async function generateMetadata() {
  return withSeoOverride('/temoignages', {
    title: 'Témoignages',
    description: "Les avis de nos clientes sur les soins Holisya à Boulogne-Billancourt : Kobido, drainage lymphatique, Madero Sculpt. Découvrez leurs retours d'expérience.",
    alternates: { canonical: '/temoignages' },
  });
}

export default async function TemoignagesPage() {
  let testimonials: any[] = [];
  try { testimonials = await prisma.testimonial.findMany({ where: { isApproved: true }, orderBy: { createdAt: 'desc' } }); } catch {}
  return (<><Header /><main className="pt-20"><TestimonialsClient testimonials={JSON.parse(JSON.stringify(testimonials ?? []))} googleReviewUrl={process.env.GOOGLE_REVIEW_URL ?? ''} /></main><Footer /></>);
}
