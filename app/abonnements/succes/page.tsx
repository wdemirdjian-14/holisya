import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = { title: 'Abonnement activé' };

export default function SubscriptionSuccessPage() {
  return (
    <><Header /><main className="pt-24 pb-20 min-h-screen bg-[#F8F4EF]">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-[#AAB7A0]/20 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✨</span></div>
          <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Abonnement activé !</h1>
          <p className="text-[#3B312D]/60 mt-3">Bienvenue dans votre programme bien-être. Vos crédits sont disponibles dans votre espace membre.</p>
          <a href="/espace-membre" className="inline-block mt-6 px-6 py-3 bg-[#C98F79] text-white font-medium rounded-lg">Mon espace membre</a>
        </div>
      </div>
    </main><Footer /></>
  );
}
