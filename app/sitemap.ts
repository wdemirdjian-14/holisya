import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function sitemap(): MetadataRoute.Sitemap {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') ?? 'holisya.fr';
  const siteUrl = `https://${host}`;
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/cartes-cadeaux`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/abonnements`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/temoignages`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];
}
