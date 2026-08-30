'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Loader2, Eye, EyeOff, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState('');

  useEffect(() => { const r = searchParams?.get('ref'); if (r) setRef(r.toUpperCase()); }, [searchParams]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName) { toast.error('Veuillez remplir les champs obligatoires'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if ((form.password?.length ?? 0) < 6) { toast.error('Le mot de passe doit contenir au moins 6 caractères'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, ref }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? 'Erreur lors de l\'inscription'); setLoading(false); return; }
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (result?.error) { toast.error('Compte créé ! Connectez-vous.'); router.replace('/connexion'); }
      else { toast.success('Bienvenue chez Holisya ! Vérifiez votre email pour votre code -15€'); router.replace('/espace-membre'); }
    } catch { toast.error('Erreur de connexion'); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl font-bold text-[#3B312D]">Créer un compte</h1>
        <p className="text-[#3B312D]/60 mt-2">Rejoignez l'univers Holisya</p>
      </div>
      {ref && (
        <div className="mb-4 bg-[#AAB7A0]/15 border border-[#AAB7A0]/30 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-[#3B312D]">
          <Gift size={16} className="text-[#AAB7A0]" />Vous avez été parrainé(e) — code <strong className="font-mono">{ref}</strong> appliqué.
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[#3B312D]/70">Prénom *</label>
            <div className="relative mt-1"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
              <input type="text" value={form.firstName} onChange={(e: any) => update('firstName', e.target?.value ?? '')}
                className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Prénom" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#3B312D]/70">Nom</label>
            <div className="relative mt-1"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
              <input type="text" value={form.lastName} onChange={(e: any) => update('lastName', e.target?.value ?? '')}
                className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Nom" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-[#3B312D]/70">Email *</label>
          <div className="relative mt-1"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="email" value={form.email} onChange={(e: any) => update('email', e.target?.value ?? '')}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="votre@email.com" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-[#3B312D]/70">Téléphone</label>
          <div className="relative mt-1"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="tel" value={form.phone} onChange={(e: any) => update('phone', e.target?.value ?? '')}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="06 XX XX XX XX" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-[#3B312D]/70">Mot de passe *</label>
          <div className="relative mt-1"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e: any) => update('password', e.target?.value ?? '')}
              className="w-full pl-10 pr-10 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Min. 6 caractères" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30"><Eye size={16} /></button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-[#3B312D]/70">Confirmer *</label>
          <div className="relative mt-1"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="password" value={form.confirmPassword} onChange={(e: any) => update('confirmPassword', e.target?.value ?? '')}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Confirmez le mot de passe" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}{loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
        <p className="text-center text-sm text-[#3B312D]/60">Déjà un compte ? <Link href="/connexion" className="text-[#C98F79] font-medium hover:underline">Se connecter</Link></p>
      </form>
    </div>
  );
}
