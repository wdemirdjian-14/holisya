import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getSiteContentMap } from '@/lib/site-content';

export default async function Footer() {
  const content = await getSiteContentMap(['footer.description', 'footer.signature']);
  return (
    <footer className="bg-[#3B312D] text-white/80">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/images/logo-holisya.png" alt="Holisya" className="h-10 w-auto brightness-0 invert mb-3" />
            <p className="text-sm leading-relaxed text-white/60">{content['footer.description']}</p>
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
            <h4 className="font-playfair text-lg font-semibold text-white mb-3">Légal</h4>
            <div className="space-y-2">
              <Link href="/mentions-legales" className="block text-sm hover:text-[#C98F79] transition-colors">Mentions légales</Link>
              <Link href="/politique-confidentialite" className="block text-sm hover:text-[#C98F79] transition-colors">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">© {new Date().getFullYear()} Holisya. Tous droits réservés. <span className="text-white/30 text-xs ml-1">{process.env.APP_VERSION || 'dev'}</span></p>
          <p className="text-sm text-white/50 flex items-center gap-1">{content['footer.signature']} <Heart size={14} className="text-[#C98F79]" /> à Nice</p>
        </div>
      </div>
    </footer>
  );
}
