'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Sparkles, CalendarPlus, BookOpen, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname() || '/';
  const { data: session } = useSession() || {};

  // Masquer la barre dans l'admin (interface dédiée)
  if (pathname.startsWith('/admin')) return null;

  const spaceHref = session?.user ? '/espace-membre' : '/connexion';
  const items = [
    { href: '/', label: 'Accueil', icon: Home, match: (p: string) => p === '/' },
    { href: '/services', label: 'Soins', icon: Sparkles, match: (p: string) => p.startsWith('/services') },
    { href: '/blog', label: 'Blog', icon: BookOpen, match: (p: string) => p.startsWith('/blog') },
    { href: spaceHref, label: session?.user ? 'Espace' : 'Compte', icon: User, match: (p: string) => p.startsWith('/espace-membre') || p.startsWith('/connexion') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#3B312D]/8 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="relative flex items-end justify-around h-16 px-2">
        {items.slice(0, 2).map((item) => <TabItem key={item.href} item={item} active={item.match(pathname)} />)}

        {/* Bouton central Réserver, surélevé */}
        <Link href="/rendez-vous" className="relative -top-4 flex flex-col items-center" aria-label="Prendre rendez-vous">
          <span className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 ${pathname.startsWith('/rendez-vous') ? 'bg-[#b87d68]' : 'bg-[#C98F79]'} text-white ring-4 ring-white`}>
            <CalendarPlus size={24} />
          </span>
          <span className="text-[10px] font-medium text-[#C98F79] mt-1">Réserver</span>
        </Link>

        {items.slice(2).map((item) => <TabItem key={item.href} item={item} active={item.match(pathname)} />)}
      </div>
    </nav>
  );
}

function TabItem({ item, active }: { item: any; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="flex flex-col items-center justify-center gap-0.5 w-16 h-full pt-2 transition-colors active:scale-95">
      <Icon size={20} className={active ? 'text-[#C98F79]' : 'text-[#3B312D]/50'} strokeWidth={active ? 2.4 : 2} />
      <span className={`text-[10px] font-medium ${active ? 'text-[#C98F79]' : 'text-[#3B312D]/50'}`}>{item.label}</span>
    </Link>
  );
}
