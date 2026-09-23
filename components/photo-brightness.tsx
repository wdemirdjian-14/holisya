'use client';
import { useState } from 'react';
import { Sun, Loader2, Wand2, Check } from 'lucide-react';
import { toast } from 'sonner';

/** Réglage de luminosité/qualité d'une photo déjà importée (aperçu live + application serveur via sharp). */
export default function PhotoBrightness({ url, onApplied }: { url: string; onApplied?: () => void }) {
  const [b, setB] = useState(1);
  const [busy, setBusy] = useState(false);
  const [bust, setBust] = useState(0);

  const src = bust ? `${url}${url.includes('?') ? '&' : '?'}v=${bust}` : url;

  const apply = async (opts: { auto?: boolean }) => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/image/enhance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, brightness: opts.auto ? 1 : b, auto: !!opts.auto }),
      });
      if (res.ok) { setB(1); setBust(Date.now()); toast.success('Photo mise à jour'); onApplied?.(); }
      else { const d = await res.json().catch(() => ({})); toast.error(d?.error ?? 'Erreur'); }
    } catch { toast.error('Erreur'); }
    setBusy(false);
  };

  return (
    <div>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-[#F8F4EF]">
        <img src={src} alt="Aperçu" className="w-full h-full object-cover transition-[filter]" style={{ filter: `brightness(${b})` }} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Sun size={16} className="text-[#C98F79] flex-none" />
        <input type="range" min={0.8} max={1.8} step={0.05} value={b} onChange={(e) => setB(parseFloat(e.target.value))}
          className="flex-1 accent-[#C98F79]" />
        <span className="text-xs text-[#3B312D]/60 w-12 text-right tabular-nums">{Math.round(b * 100)}%</span>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => apply({})} disabled={busy || b === 1}
          className="flex-1 py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}Appliquer la luminosité
        </button>
        <button onClick={() => apply({ auto: true })} disabled={busy}
          className="px-4 py-2.5 border border-[#C98F79] text-[#C98F79] text-sm font-medium rounded-lg hover:bg-[#C98F79]/10 disabled:opacity-50 flex items-center gap-1.5">
          <Wand2 size={14} />Auto
        </button>
      </div>
      <p className="text-[10px] text-[#3B312D]/40 mt-2">« Auto » corrige automatiquement contraste et luminosité. Chaque application s'ajoute à la précédente.</p>
    </div>
  );
}
