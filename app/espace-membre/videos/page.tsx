import Header from '@/components/header';
import Footer from '@/components/footer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import VideosClient from './videos-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mes rituels vidéo' };

export default async function VideosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/connexion');
  return (
    <><Header /><main className="pt-20 min-h-screen bg-[#F8F4EF]"><VideosClient userEmail={session.user.email ?? ''} /></main><Footer /></>
  );
}
