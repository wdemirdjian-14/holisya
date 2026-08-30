import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata = { title: 'Mentions Légales' };

export default function MentionsLegalesPage() {
  return (
    <><Header /><main className="pt-24 pb-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-playfair text-3xl font-bold text-[#3B312D] mb-8">Mentions Légales</h1>
        <div className="space-y-6 text-[#3B312D]/70 text-sm leading-relaxed">
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Éditeur du site</h2><p>Holisya - Bien-être Holistique Féminin<br/>Nice, France<br/>Email : contact@holisya.fr</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Hébergement</h2><p>Ce site est hébergé par IONOS SARL, 7 place de la Gare, BP 70109, 57200 Sarreguemines Cedex, France.</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Propriété intellectuelle</h2><p>L'ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p></div>
          <div><h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-2">Données personnelles</h2><p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à contact@holisya.fr.</p></div>
        </div>
      </div>
    </main><Footer /></>
  );
}
