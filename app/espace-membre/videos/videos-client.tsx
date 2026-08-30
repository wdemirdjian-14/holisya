'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Lock, Crown, Loader2, X, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import VideoPlayer from '@/components/video-player';

function fmtDuration(sec: number) {
  if (!sec) return '';
  const m = Math.floor(sec / 60); const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideosClient({ userEmail }: { userEmail: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<any>(null);
  const [buyingId, setBuyingId] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  const load = () => fetch('/api/videos').then((r) => r.json()).then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => {
    const purchase = searchParams?.get('purchase');
    if (purchase) {
      fetch('/api/videos/fulfill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: purchase }) })
        .then((r) => r.json()).then((res) => { if (res?.success) toast.success('Accès à la vidéo débloqué !'); router.replace('/espace-membre/videos'); load(); });
    } else load();
  }, []);

  const buy = async (video: any) => {
    setBuyingId(video.id);
    try {
      const res = await fetch('/api/videos/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId: video.id }) });
      const d = await res.json();
      if (res.ok && d?.url) window.location.href = d.url; else toast.error(d?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setBuyingId('');
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>;

  const videos = data?.videos ?? [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Espace membre</p>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D] mt-2">Mes rituels vidéo</h1>
        <p className="text-[#3B312D]/60 mt-3 max-w-xl mx-auto">Des techniques d'auto-massage guidées, à pratiquer chez vous quand vous le souhaitez.</p>
      </div>

      {!data?.premium && (
        <div className="bg-gradient-to-r from-[#C98F79] to-[#b87d68] rounded-xl p-5 text-white flex items-center justify-between flex-wrap gap-3 mb-8">
          <div className="flex items-center gap-3">
            <Crown size={22} />
            <p className="text-sm">Accédez à <strong>toutes les vidéos</strong> avec un abonnement premium.</p>
          </div>
          <Link href="/abonnements" className="px-5 py-2.5 bg-white text-[#C98F79] text-sm font-medium rounded-lg whitespace-nowrap">Découvrir les abonnements</Link>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Play size={32} className="text-[#C98F79]/40 mx-auto mb-3" />
          <p className="text-[#3B312D]/50">Les premières vidéos arrivent bientôt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v: any) => (
            <div key={v.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              <button onClick={() => v.hasAccess ? setActive(v) : null} className="relative block w-full aspect-video bg-[#3B312D]/5 text-left">
                {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Play size={30} className="text-[#C98F79]/40" /></div>}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  {v.hasAccess ? (
                    <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center"><Play size={20} className="text-[#C98F79] ml-0.5" /></span>
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-[#3B312D]/70 flex items-center justify-center"><Lock size={18} className="text-white" /></span>
                  )}
                </div>
                {v.durationSec > 0 && <span className="absolute bottom-2 right-2 text-[11px] px-1.5 py-0.5 rounded bg-black/60 text-white flex items-center gap-1"><Clock size={10} />{fmtDuration(v.durationSec)}</span>}
                {v.completed && <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-[#AAB7A0] text-white flex items-center gap-1"><Check size={10} />Vu</span>}
                {!v.completed && v.lastPositionSec > 5 && v.durationSec > 0 && (
                  <span className="absolute bottom-0 left-0 h-1 bg-[#C98F79]" style={{ width: `${Math.min(100, (v.lastPositionSec / v.durationSec) * 100)}%` }} />
                )}
              </button>
              <div className="p-4">
                <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">{v.title}</h3>
                {v.description && <p className="text-sm text-[#3B312D]/60 mt-1 line-clamp-2">{v.description}</p>}
                <div className="mt-3">
                  {v.hasAccess ? (
                    <button onClick={() => setActive(v)} className="w-full py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"><Play size={15} />{v.lastPositionSec > 5 && !v.completed ? 'Reprendre' : 'Regarder'}</button>
                  ) : v.priceCents > 0 ? (
                    <button onClick={() => buy(v)} disabled={buyingId === v.id} className="w-full py-2.5 bg-[#3B312D] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                      {buyingId === v.id ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} />}Acheter · {(v.priceCents / 100).toFixed(2)}€
                    </button>
                  ) : (
                    <Link href="/abonnements" className="w-full py-2.5 bg-[#AAB7A0] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"><Crown size={14} />Réservé aux abonnés</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lecteur */}
      {active && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" onClick={() => setActive(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#F8F4EF]">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D] truncate">{active.title}</h3>
              <button onClick={() => { setActive(null); load(); }} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={20} /></button>
            </div>
            <div className="p-4">
              <VideoPlayer video={active} userEmail={userEmail} />
              {active.description && <p className="text-sm text-[#3B312D]/70 mt-4 leading-relaxed">{active.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
