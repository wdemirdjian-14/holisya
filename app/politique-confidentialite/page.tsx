import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = { title: 'Politique de Confidentialité' };

export default function PolitiquePage() {
  return (
    <><Header /><main className="pt-24 pb-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-playfair text-3xl font-bold text-[#3B312D] mb-8">Politique de Confidentialité</h1>
        <div className="space-y-6 text-[#3B312D]/70 text-sm leading-relaxed">
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Collecte des données</h2><p>Holisya collecte les données nécessaires à la gestion des rendez-vous, abonnements et cartes cadeaux : nom, prénom, email, téléphone, préférences de soins.</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Utilisation</h2><p>Vos données sont utilisées pour : la gestion de votre compte, l'envoi de rappels de rendez-vous, les notifications liées à vos soins et la communication d'offres promotionnelles (avec votre consentement).</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Conservation</h2><p>Vos données sont conservées pendant la durée de votre relation client et 3 ans après votre dernière activité.</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Vos droits (RGPD)</h2><p>Vous disposez des droits d'accès, rectification, effacement, portabilité et opposition. Pour exercer vos droits : contact@holisya.fr</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Cookies</h2><p>Ce site utilise des cookies strictement nécessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire n'est utilisé.</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Paiement sécurisé</h2><p>Les paiements sont traités par Stripe. Holisya ne stocke aucune donnée bancaire.</p></div>
        </div>
      </div>
    </main><Footer /></>
  );
}
