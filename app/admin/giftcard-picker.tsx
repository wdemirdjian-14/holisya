'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export default function GiftCardPicker({ giftCards, code, onSelect }: {
  giftCards: any[];
  code: string;
  onSelect: (giftCard: any | null) => void;
}) {
  const [query, setQuery] = useState(code ?? '');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(code ?? ''); }, [code]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = (giftCards ?? []).find((gc: any) => gc?.code === code);
  const q = query.toLowerCase().trim();
  const results = q.length === 0 ? [] : (giftCards ?? []).filter((gc: any) => {
    const s = `${gc?.code ?? ''} ${gc?.purchasedBy?.firstName ?? ''} ${gc?.purchasedBy?.lastName ?? ''} ${gc?.purchasedBy?.email ?? ''}`.toLowerCase();
    return (gc?.status === 'ACTIVE' || gc?.status === 'PARTIALLY_USED') && gc?.remainingAmount > 0 && s.includes(q);
  }).slice(0, 8);

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
        <input
          value={query}
          onChange={(e: any) => { setQuery(e.target?.value ?? ''); setOpen(true); onSelect(null); }}
          onFocus={() => setOpen(true)}
          placeholder="Chercher une carte cadeau (code, nom, email)..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-[#F8F4EF] max-h-48 overflow-y-auto">
          {results.map((gc: any) => (
            <button key={gc.id} type="button" onClick={() => { onSelect(gc); setQuery(gc.code); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-[#F8F4EF] flex items-center justify-between">
              <span className="font-mono text-[#3B312D]">{gc.code}</span>
              <span className="text-[#3B312D]/60">{gc?.purchasedBy?.firstName ?? ''} {gc?.purchasedBy?.lastName ?? ''} · {gc.remainingAmount}€</span>
            </button>
          ))}
        </div>
      )}
      {open && q.length > 0 && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-[#F8F4EF] p-3">
          <p className="text-xs text-[#3B312D]/40">Aucune carte active trouvée</p>
        </div>
      )}
      {selected && (
        <div className="mt-2 flex items-center justify-between bg-[#AAB7A0]/10 rounded-lg px-3 py-2">
          <div className="text-xs text-[#3B312D]">
            <span className="font-medium">{selected?.purchasedBy?.firstName ?? ''} {selected?.purchasedBy?.lastName ?? ''}</span> · Solde : <span className="font-semibold">{selected.remainingAmount}€</span>
          </div>
          <button type="button" onClick={() => { onSelect(null); setQuery(''); }}><X size={12} className="text-[#3B312D]/40" /></button>
        </div>
      )}
    </div>
  );
}
