'use client';
import { useEffect, useState } from 'react';
import { X, MapPin, Send, Loader2, Check } from 'lucide-react';

const STORAGE_KEY = 'holisya_antibes_popup_v1';

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(STORAGE_KEY) === '1'; } catch { /* ignore */ }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), list: 'antibes', source: 'popup' }),
      });
      if (res.ok) {
        setDone(true);
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0D1A13]/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Ouverture prochaine à Antibes" onClick={dismiss}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'hgcPop .4s ease-out' }}
      >
        <style>{`@keyframes hgcPop{0%{opacity:0;transform:translateY(16px) scale(.97)}100%{opacity:1;transform:none}}`}</style>

        {/* Bandeau photo */}
        <div className="relative h-44">
          <img src="/images/antibes-salon.jpg" alt="Salon Holisya Antibes" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-[#0D1A13]/25" />
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-white bg-[#0D1A13]/55 backdrop-blur-sm px-2.5 py-1 rounded-full">Ouverture prochaine</span>
          <button onClick={dismiss} aria-label="Fermer" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#3B312D] flex items-center justify-center transition-colors shadow-sm">
            <X size={16} />
          </button>
        </div>

        {/* Contenu sur fond clair (lisible) */}
        <div className="px-7 pt-3 pb-7 text-center">
          <h2 className="font-playfair text-2xl font-bold text-[#3B312D] leading-snug">Holisya arrive à Antibes</h2>
          <p className="flex items-center justify-center gap-1.5 text-[#C98F79] text-sm font-medium mt-2">
            <MapPin size={14} />16 Avenue Guillabert, 06600 Antibes
          </p>

          {done ? (
            <div className="mt-5 bg-[#AAB7A0]/12 rounded-xl px-4 py-5">
              <Check size={26} className="mx-auto text-[#AAB7A0]" />
              <p className="font-playfair text-lg text-[#3B312D] mt-2">Merci, c'est noté !</p>
              <p className="text-[#3B312D]/60 text-sm mt-1">Vous serez parmi les premières informées de l'ouverture. 🌸</p>
              <button onClick={dismiss} className="mt-4 text-xs text-[#3B312D]/50 underline underline-offset-2 hover:text-[#3B312D]">Fermer</button>
            </div>
          ) : (
            <>
              <p className="text-[#3B312D]/65 text-sm mt-3">Laissez votre email pour être informée en avant-première de l'ouverture et des offres de lancement.</p>
              <form onSubmit={submit} className="mt-5 space-y-2.5">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 text-sm rounded-lg border border-[#3B312D]/12 bg-[#F8F4EF]/60 text-[#3B312D] placeholder-[#3B312D]/40 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/40"
                />
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C98F79] hover:bg-[#b87d68] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}Je veux être informée
                </button>
              </form>
              <p className="text-[10px] text-[#3B312D]/40 mt-3">Pas de spam — juste l'info d'ouverture d'Antibes. Désinscription à tout moment.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
