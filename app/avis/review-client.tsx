'use client';
import { useEffect, useState } from 'react';
import { Star, Loader2, Heart, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewClient({ token }: { token: string }) {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<any>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`/api/review?t=${token}`).then((r) => r.json()).then((d) => { setInfo(d); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  const submit = async () => {
    if (!rating) { toast.error('Choisissez une note'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, rating, comment }) });
      const d = await res.json();
      if (res.ok) { setDone(d); if (d?.googleReviewUrl) setTimeout(() => { window.location.href = d.googleReviewUrl; }, 2500); }
      else toast.error(d?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={30} className="animate-spin text-[#C98F79]" /></div>;

  if (!token || info?.error) return (
    <div className="max-w-md mx-auto px-4 text-center">
      <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Lien invalide</h1>
      <p className="text-[#3B312D]/60 mt-2 text-sm">Ce lien d'avis n'est plus valide.</p>
    </div>
  );

  if (info?.alreadyReviewed || done) return (
    <div className="max-w-md mx-auto px-4 text-center">
      <div className="w-14 h-14 bg-[#AAB7A0]/20 rounded-full flex items-center justify-center mx-auto mb-4"><Heart size={24} className="text-[#AAB7A0]" /></div>
      <h1 className="font-playfair text-2xl font-bold text-[#3B312D]">Merci infiniment !</h1>
      <p className="text-[#3B312D]/60 mt-2 text-sm">Votre retour compte énormément pour nous.</p>
      {done?.googleReviewUrl && (
        <div className="mt-6">
          <p className="text-sm text-[#3B312D]/70 mb-3">Vous allez être redirigée vers Google pour partager votre avis…</p>
          <a href={done.googleReviewUrl} className="inline-flex items-center gap-2 px-6 py-3 bg-[#C98F79] text-white text-sm font-medium rounded-lg">Laisser un avis Google <ExternalLink size={14} /></a>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <p className="text-[#AAB7A0] text-xs uppercase tracking-[0.2em] font-medium">Votre ressenti</p>
        <h1 className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">Bonjour {info?.firstName || ''} 🌸</h1>
        <p className="text-[#3B312D]/60 mt-2 text-sm">Comment s'est passé votre soin{info?.serviceType ? ` « ${info.serviceType} »` : ''} ?</p>

        <div className="flex justify-center gap-1.5 my-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
              <Star size={34} className={(hover || rating) >= n ? 'text-[#C98F79] fill-[#C98F79]' : 'text-[#3B312D]/20'} />
            </button>
          ))}
        </div>

        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Un mot sur votre expérience (facultatif)…"
          className="w-full px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" />

        <button onClick={submit} disabled={submitting || !rating} className="w-full mt-4 py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">
          {submitting ? 'Envoi…' : 'Envoyer mon avis'}
        </button>
      </div>
    </div>
  );
}
