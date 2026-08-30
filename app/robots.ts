import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '') ?? 'holisya.fr';
  const siteUrl = `https://${host}`;
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/espace-membre/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
