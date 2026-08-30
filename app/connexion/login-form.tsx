'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { toast.error('Email ou mot de passe incorrect'); }
      else { router.replace('/espace-membre'); }
    } catch { toast.error('Erreur de connexion'); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl font-bold text-[#3B312D]">Connexion</h1>
        <p className="text-[#3B312D]/60 mt-2">Accédez à votre espace bien-être</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-5">
        <div>
          <label className="text-sm font-medium text-[#3B312D]/70">Email</label>
          <div className="relative mt-1">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="email" value={email} onChange={(e: any) => setEmail(e.target?.value ?? '')}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="votre@email.com" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-[#3B312D]/70">Mot de passe</label>
          <div className="relative mt-1">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={(e: any) => setPassword(e.target?.value ?? '')}
              className="w-full pl-10 pr-10 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Votre mot de passe" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30 hover:text-[#3B312D]/60">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="text-right">
          <Link href="/mot-de-passe-oublie" className="text-sm text-[#C98F79] hover:underline">Mot de passe oublié ?</Link>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className="text-center text-sm text-[#3B312D]/60">
          Pas encore de compte ? <Link href="/inscription" className="text-[#C98F79] font-medium hover:underline">S'inscrire</Link>
        </p>
      </form>
    </div>
  );
}
