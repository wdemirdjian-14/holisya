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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Ouverture prochaine à Antibes" onClick={dismiss}>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-[hgcPop_.4s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        style={{ animationName: 'hgcPop' }}
      >
        <style>{`@keyframes hgcPop{0%{opacity:0;transform:translateY(16px) scale(.97)}100%{opacity:1;transform:none}}`}</style>

        {/* Fond : photo du salon d'Antibes + dégradé */}
        <img src="/images/antibes-salon.jpg" alt="Salon Holisya Antibes" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1A13]/45 via-[#0D1A13]/70 to-[#0D1A13]/92" />

        <button onClick={dismiss} aria-label="Fermer" className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
          <X size={16} />
        </button>

        <div className="relative px-7 pt-24 pb-7 text-center text-white">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#E9C9AC]">Ouverture prochaine</p>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold mt-2 leading-snug">Holisya arrive à Antibes</h2>
          <p className="flex items-center justify-center gap-1.5 text-white/80 text-sm mt-3">
            <MapPin size={14} className="text-[#E9C9AC]" />16 Avenue Guillabert, 06600 Antibes
          </p>

          {done ? (
            <div className="mt-6 bg-white/12 rounded-xl px-4 py-5">
              <Check size={26} className="mx-auto text-[#AAB7A0]" />
              <p className="font-playfair text-lg mt-2">Merci, c'est noté !</p>
              <p className="text-white/70 text-sm mt-1">Vous serez parmi les premières informées de l'ouverture. 🌸</p>
              <button onClick={dismiss} className="mt-4 text-xs text-white/70 underline underline-offset-2 hover:text-white">Fermer</button>
            </div>
          ) : (
            <>
              <p className="text-white/75 text-sm mt-4 max-w-xs mx-auto">Laissez votre email pour être informée en avant-première de l'ouverture et des offres de lancement.</p>
              <form onSubmit={submit} className="mt-5 space-y-2.5">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 text-sm rounded-lg bg-white/95 text-[#3B312D] placeholder-[#3B312D]/40 focus:outline-none focus:ring-2 focus:ring-[#C98F79]"
                />
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C98F79] hover:bg-[#b87d68] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}Je veux être informée
                </button>
              </form>
              <p className="text-[10px] text-white/45 mt-3">Pas de spam — juste l'info d'ouverture d'Antibes. Désinscription à tout moment.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
