'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingBag, Gift, Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '@/components/notification-bell';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Nos Soins' },
  { href: '/rendez-vous', label: 'Rendez-vous' },
  { href: '/cartes-cadeaux', label: 'Cartes Cadeaux' },
  { href: '/abonnements', label: 'Abonnements' },
  { href: '/blog', label: 'Blog' },
  { href: '/a-propos', label: 'À Propos' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { data: session } = useSession() || {};
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isHome = pathname === '/';
  const headerBg = scrolled || !isHome
    ? 'bg-[#F8F4EF]/95 backdrop-blur-md shadow-sm'
    : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-[#3B312D]' : 'text-white';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo-holisya.png" alt="Holisya" width={160} height={48} className={`h-10 md:h-12 w-auto transition-all ${scrolled || !isHome ? '' : 'brightness-0 invert'}`} priority />
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link: any) => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${pathname === link.href ? (scrolled || !isHome ? 'text-[#C98F79] bg-[#C98F79]/10' : 'text-white bg-white/20') : `${textColor} hover:bg-[#C98F79]/10 hover:text-[#C98F79]`}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <NotificationBell tone={scrolled || !isHome ? 'dark' : 'light'} />
            {session?.user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${textColor} hover:bg-[#C98F79]/10`}>
                  <User size={16} />
                  <span className="max-w-[100px] truncate">{session.user?.name?.split(' ')?.[0] ?? 'Compte'}</span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#F8F4EF] overflow-hidden z-50">
                      <Link href="/espace-membre" className="flex items-center gap-3 px-4 py-3 text-sm text-[#3B312D] hover:bg-[#F8F4EF] transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User size={16} className="text-[#C98F79]" />Mon Espace
                      </Link>
                      <Link href="/espace-membre/rendez-vous" className="flex items-center gap-3 px-4 py-3 text-sm text-[#3B312D] hover:bg-[#F8F4EF] transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Calendar size={16} className="text-[#C98F79]" />Mes Rendez-vous
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-[#3B312D] hover:bg-[#F8F4EF] transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <LayoutDashboard size={16} className="text-[#C98F79]" />Administration
                        </Link>
                      )}
                      <button onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full border-t border-[#F8F4EF]">
                        <LogOut size={16} />Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/connexion" className="px-5 py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg hover:bg-[#b87d68] transition-all shadow-sm">
                Se connecter
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            <NotificationBell tone={scrolled || !isHome ? 'dark' : 'light'} />
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`p-2 rounded-lg ${textColor}`}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white backdrop-blur-md border-t border-[#3B312D]/5 shadow-md">
            <div className="max-w-[1200px] mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link: any) => (
                <Link key={link.href} href={link.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? 'bg-[#C98F79]/10 text-[#C98F79]' : 'text-[#3B312D] hover:bg-[#C98F79]/10'}`}>
                  {link.label}
                </Link>
              ))}
              {session?.user ? (
                <>
                  <Link href="/espace-membre" className="block px-4 py-3 rounded-lg text-sm font-medium text-[#3B312D] hover:bg-[#C98F79]/10">Mon Espace</Link>
                  {isAdmin && <Link href="/admin" className="block px-4 py-3 rounded-lg text-sm font-medium text-[#3B312D] hover:bg-[#C98F79]/10">Administration</Link>}
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Déconnexion</button>
                </>
              ) : (
                <Link href="/connexion" className="block px-4 py-3 bg-[#C98F79] text-white text-center text-sm font-medium rounded-lg">Se connecter</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
