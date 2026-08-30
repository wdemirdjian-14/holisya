'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if ((password?.length ?? 0) < 6) { toast.error('Min. 6 caractères'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (res.ok) { setDone(true); } else { toast.error(data?.error ?? 'Erreur'); }
    } catch { toast.error('Erreur'); }
    setLoading(false);
  };

  if (done) return (
    <div className="max-w-md mx-auto px-4 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <CheckCircle size={48} className="text-[#AAB7A0] mx-auto mb-4" />
        <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Mot de passe mis à jour</h1>
        <Link href="/connexion" className="inline-block mt-6 px-6 py-3 bg-[#C98F79] text-white font-medium rounded-lg">Se connecter</Link>
      </div>
    </div>
  );

  if (!token) return (
    <div className="max-w-md mx-auto px-4 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Lien invalide</h1>
        <p className="text-[#3B312D]/60 mt-3">Ce lien de réinitialisation est invalide ou a expiré.</p>
        <Link href="/mot-de-passe-oublie" className="inline-block mt-6 text-[#C98F79] font-medium hover:underline">Demander un nouveau lien</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl font-bold text-[#3B312D]">Nouveau mot de passe</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-5">
        <div><label className="text-sm font-medium text-[#3B312D]/70">Nouveau mot de passe</label>
          <div className="relative mt-1"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="password" value={password} onChange={(e: any) => setPassword(e.target?.value ?? '')} className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Min. 6 caractères" />
          </div>
        </div>
        <div><label className="text-sm font-medium text-[#3B312D]/70">Confirmer</label>
          <div className="relative mt-1"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="password" value={confirm} onChange={(e: any) => setConfirm(e.target?.value ?? '')} className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Confirmez" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}{loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  );
}
