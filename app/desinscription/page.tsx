import Header from '@/components/header';
import Footer from '@/components/footer';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Désinscription' };

export default async function DesinscriptionPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams?.token ?? '';
  let success = false;
  if (token) {
    try {
      const user = await prisma.user.findUnique({ where: { unsubscribeToken: token } });
      if (user) { await prisma.user.update({ where: { id: user.id }, data: { emailOptOut: true } }); success = true; }
    } catch {}
  }

  return (
    <><Header /><main className="pt-24 pb-20 bg-white min-h-[50vh]">
      <div className="max-w-lg mx-auto px-4 text-center">
        <h1 className="font-playfair text-2xl font-bold text-[#3B312D] mb-4">
          {success ? 'Désinscription confirmée' : 'Lien invalide'}
        </h1>
        <p className="text-[#3B312D]/70 text-sm">
          {success
            ? 'Vous ne recevrez plus nos emails de communication. Vous pouvez continuer à utiliser votre espace client normalement.'
            : "Ce lien de désinscription n'est plus valide."}
        </p>
      </div>
    </main><Footer /></>
  );
}
