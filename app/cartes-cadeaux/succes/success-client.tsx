'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Gift, CheckCircle, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? '';
  const [giftCard, setGiftCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    fetch('/api/gift-cards/fulfill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then(r => r.json()).then(d => { setGiftCard(d?.giftCard ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const copyCode = () => {
    navigator.clipboard?.writeText?.(giftCard?.code ?? '');
    setCopied(true);
    toast.success('Code copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div className="max-w-md mx-auto px-4 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <CheckCircle size={56} className="text-[#AAB7A0] mx-auto mb-4" />
        <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Merci pour votre achat !</h1>
        <p className="text-[#3B312D]/60 mt-3">Votre carte cadeau a été créée avec succès.</p>
        {giftCard && (
          <div className="mt-6 bg-[#F8F4EF] rounded-xl p-5">
            <Gift size={24} className="text-[#C98F79] mx-auto mb-2" />
            <p className="text-sm text-[#3B312D]/60">Votre code :</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="font-mono text-lg font-bold text-[#3B312D]">{giftCard?.code ?? ''}</p>
              <button onClick={copyCode} className="p-1 rounded hover:bg-[#C98F79]/10">{copied ? <Check size={16} className="text-[#AAB7A0]" /> : <Copy size={16} className="text-[#C98F79]" />}</button>
            </div>
            <p className="text-sm text-[#3B312D]/60 mt-2">Montant : <strong>{giftCard?.amount ?? 0}€</strong></p>
            <p className="text-xs text-[#3B312D]/40 mt-1">Valide jusqu'au {giftCard?.expiresAt ? new Date(giftCard.expiresAt).toLocaleDateString('fr-FR') : ''}</p>
          </div>
        )}
        <div className="flex gap-3 mt-6 justify-center">
          <Link href="/espace-membre" className="px-5 py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg">Mon espace</Link>
          <Link href="/" className="px-5 py-2.5 bg-[#F8F4EF] text-[#3B312D] text-sm font-medium rounded-lg">Accueil</Link>
        </div>
      </div>
    </div>
  );
}
