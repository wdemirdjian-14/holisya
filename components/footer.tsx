import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getSiteContentMap } from '@/lib/site-content';
import { BUSINESS } from '@/lib/business';

export default async function Footer() {
  const content = await getSiteContentMap(['footer.description', 'footer.signature', 'paris.hours']);
  return (
    <footer className="bg-[#3B312D] text-white/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <img src="/images/logo-holisya.png" alt="Holisya" className="h-10 w-auto brightness-0 invert mb-3" />
            <p className="text-sm leading-relaxed text-white/60">{content['footer.description']}</p>
          </div>
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-3">Nos salons</h4>
            <div className="space-y-3">
              {BUSINESS.locations.map((loc) => (
                <div key={loc.name} className="text-sm text-white/60">
                  <p className="text-white/85 font-medium flex items-center gap-1.5">
                    {loc.name}
                    {loc.primary
                      ? <span className="text-[10px] uppercase tracking-wider text-[#AAB7A0] border border-[#AAB7A0]/40 rounded px-1.5 py-0.5">Réservation en ligne</span>
                      : <span className="text-[10px] uppercase tracking-wider text-white/50 border border-white/20 rounded px-1.5 py-0.5">Sur rendez-vous</span>}
                  </p>
                  <p>{loc.streetAddress}</p>
                  <p>{loc.postalCode} {loc.city}</p>
                  {!loc.primary && content['paris.hours'] && (
                    <p className="text-xs text-white/45 mt-0.5 whitespace-pre-line">{content['paris.hours']}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-3">Navigation</h4>
            <div className="space-y-2">
              <Link href="/services" className="block text-sm hover:text-[#C98F79] transition-colors">Nos Soins</Link>
              <Link href="/cartes-cadeaux" className="block text-sm hover:text-[#C98F79] transition-colors">Cartes Cadeaux</Link>
              <Link href="/a-propos" className="block text-sm hover:text-[#C98F79] transition-colors">À Propos</Link>
              <Link href="/contact" className="block text-sm hover:text-[#C98F79] transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-3">Nos spécialités</h4>
            <div className="space-y-2">
              <Link href="/massage-kobido-antibes" className="block text-sm hover:text-[#C98F79] transition-colors">Massage Kobido Antibes</Link>
              <Link href="/drainage-lymphatique-antibes" className="block text-sm hover:text-[#C98F79] transition-colors">Drainage lymphatique Antibes</Link>
              <Link href="/maderotherapie-antibes" className="block text-sm hover:text-[#C98F79] transition-colors">Madérothérapie Antibes</Link>
              <Link href="/coaching-nutrition-antibes" className="block text-sm hover:text-[#C98F79] transition-colors">Coaching nutrition Antibes</Link>
              <Link href="/massage-kobido-paris" className="block text-sm hover:text-[#C98F79] transition-colors">Massage Kobido Paris</Link>
            </div>
          </div>
          <div>
            <h4 className="font-playfair text-lg font-semibold text-white mb-3">Légal</h4>
            <div className="space-y-2">
              <Link href="/mentions-legales" className="block text-sm hover:text-[#C98F79] transition-colors">Mentions légales</Link>
              <Link href="/politique-confidentialite" className="block text-sm hover:text-[#C98F79] transition-colors">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">© {new Date().getFullYear()} Holisya. Tous droits réservés. <span className="text-white/30 text-xs ml-1">{process.env.APP_VERSION || 'dev'}</span></p>
          <p className="text-sm text-white/50 flex items-center gap-1">{content['footer.signature']} <Heart size={14} className="text-[#C98F79]" /> à {BUSINESS.city}</p>
        </div>
      </div>
    </footer>
  );
}
