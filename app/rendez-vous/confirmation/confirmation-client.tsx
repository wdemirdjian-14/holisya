'use client';
import { useEffect, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';

export default function ConfirmationClient({ imprint, cancelled }: { imprint: string; cancelled: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'pending' | 'cancelled' | 'error'>(imprint ? 'loading' : cancelled ? 'cancelled' : 'error');

  useEffect(() => {
    if (imprint) {
      fetch('/api/booking/imprint-complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: imprint }) })
        .then((r) => r.json()).then((d) => setState(d?.success ? (d.status === 'CONFIRMED' ? 'ok' : 'pending') : 'error')).catch(() => setState('error'));
    } else if (cancelled) {
      fetch('/api/booking/release', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId: cancelled }) }).catch(() => {});
    }
  }, [imprint, cancelled]);

  return (
    <div className="max-w-md mx-auto px-4 text-center">
      {state === 'loading' && <div className="py-16"><Loader2 size={30} className="animate-spin text-[#C98F79] mx-auto" /><p className="text-sm text-[#3B312D]/50 mt-3">Validation de votre empreinte…</p></div>}
      {(state === 'ok' || state === 'pending') && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-14 h-14 bg-[#AAB7A0]/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={26} className="text-[#AAB7A0]" /></div>
          <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">{state === 'ok' ? 'Rendez-vous confirmé !' : 'Demande enregistrée !'}</h1>
          <p className="text-[#3B312D]/60 mt-2 text-sm">Votre empreinte bancaire a bien été enregistrée (aucun débit).{state === 'pending' ? ' Nous confirmerons votre créneau rapidement.' : ''}</p>
          <a href="/espace-membre/rendez-vous" className="inline-block mt-6 px-6 py-3 bg-[#C98F79] text-white text-sm font-medium rounded-lg">Voir mes rendez-vous</a>
        </div>
      )}
      {state === 'cancelled' && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><X size={26} className="text-red-400" /></div>
          <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Réservation non finalisée</h1>
          <p className="text-[#3B312D]/60 mt-2 text-sm">L'empreinte n'a pas été enregistrée, le créneau a été libéré. Vous pouvez recommencer.</p>
          <a href="/rendez-vous" className="inline-block mt-6 px-6 py-3 bg-[#C98F79] text-white text-sm font-medium rounded-lg">Reprendre la réservation</a>
        </div>
      )}
      {state === 'error' && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Un souci est survenu</h1>
          <p className="text-[#3B312D]/60 mt-2 text-sm">Réessayez votre réservation.</p>
          <a href="/rendez-vous" className="inline-block mt-6 px-6 py-3 bg-[#C98F79] text-white text-sm font-medium rounded-lg">Retour à la réservation</a>
        </div>
      )}
    </div>
  );
}
