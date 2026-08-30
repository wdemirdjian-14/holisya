'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Veuillez saisir votre email'); return; }
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setSent(true);
    } catch { toast.error('Erreur'); }
    setLoading(false);
  };

  if (sent) return (
    <div className="max-w-md mx-auto px-4 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <CheckCircle size={48} className="text-[#AAB7A0] mx-auto mb-4" />
        <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Email envoyé</h1>
        <p className="text-[#3B312D]/60 mt-3">Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.</p>
        <Link href="/connexion" className="inline-flex items-center gap-2 mt-6 text-[#C98F79] font-medium hover:underline"><ArrowLeft size={16} />Retour à la connexion</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl font-bold text-[#3B312D]">Mot de passe oublié</h1>
        <p className="text-[#3B312D]/60 mt-2">Recevez un lien de réinitialisation par email</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-5">
        <div><label className="text-sm font-medium text-[#3B312D]/70">Email</label>
          <div className="relative mt-1"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="email" value={email} onChange={(e: any) => setEmail(e.target?.value ?? '')}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="votre@email.com" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}{loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
        <p className="text-center"><Link href="/connexion" className="text-sm text-[#C98F79] hover:underline">Retour à la connexion</Link></p>
      </form>
    </div>
  );
}
