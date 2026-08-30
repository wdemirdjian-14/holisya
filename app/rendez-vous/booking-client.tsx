'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Clock, ChevronLeft, ChevronRight, ArrowLeft, Check, CreditCard, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { PLANITY_URL } from '@/lib/config';

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function pad(n: number) { return String(n).padStart(2, '0'); }
function ds(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}`; }
function todayStr() { const n = new Date(); return ds(n.getFullYear(), n.getMonth() + 1, n.getDate()); }

export default function BookingClient() {
  const { data: session, status: authStatus } = useSession() || {};
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'service' | 'date' | 'slot' | 'done'>('service');
  const [service, setService] = useState<any>(null);

  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 }); // month 1-based
  const [days, setDays] = useState<Set<string>>(new Set());
  const [daysLoading, setDaysLoading] = useState(false);

  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [doneStatus, setDoneStatus] = useState('');

  useEffect(() => { fetch('/api/booking/config').then((r) => r.json()).then((d) => { setConfig(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  // Charge les jours disponibles quand on entre à l'étape date ou change de mois
  useEffect(() => {
    if (step !== 'date' || !service) return;
    setDaysLoading(true);
    fetch(`/api/booking/month?serviceId=${service.id}&year=${view.year}&month=${view.month}`).then((r) => r.json()).then((d) => { setDays(new Set(d?.days ?? [])); setDaysLoading(false); }).catch(() => setDaysLoading(false));
  }, [step, service, view]);

  const pickDate = (dateStr: string) => {
    setDate(dateStr); setSlot(''); setStep('slot'); setSlotsLoading(true);
    fetch(`/api/booking/slots?serviceId=${service.id}&date=${dateStr}`).then((r) => r.json()).then((d) => { setSlots(d?.slots ?? []); setSlotsLoading(false); }).catch(() => setSlotsLoading(false));
  };

  const confirm = async () => {
    if (!session?.user) { router.push(`/connexion?callbackUrl=${encodeURIComponent('/rendez-vous')}`); return; }
    setConfirming(true);
    try {
      const res = await fetch('/api/booking/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: service.id, date, time: slot }) });
      const d = await res.json();
      if (res.status === 401 && d?.needLogin) { router.push(`/connexion?callbackUrl=${encodeURIComponent('/rendez-vous')}`); return; }
      if (res.ok && d?.requiresImprint && d?.url) { window.location.href = d.url; return; }
      if (res.ok) { setDoneStatus(d?.status ?? 'PENDING'); setStep('done'); }
      else toast.error(d?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setConfirming(false);
  };

  const grid = useMemo(() => {
    const first = new Date(view.year, view.month - 1, 1);
    const startPad = (first.getDay() + 6) % 7; // lundi=0
    const last = new Date(view.year, view.month, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= last; d++) cells.push(ds(view.year, view.month, d));
    return cells;
  }, [view]);

  const canPrev = !(view.year === now.getFullYear() && view.month === now.getMonth() + 1);
  const changeMonth = (dir: number) => {
    let m = view.month + dir, y = view.year;
    if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
    setView({ year: y, month: m });
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>;

  // Réservation en ligne désactivée → repli Planity
  if (!config?.enabled) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D]">Prendre rendez-vous</h1>
          <p className="text-[#3B312D]/60 mt-3">Réservez votre créneau via notre agenda en ligne.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ minHeight: 800 }}>
          <iframe src={PLANITY_URL} title="Réservation Planity" className="w-full border-0" style={{ height: 800 }} allow="payment; geolocation" loading="lazy" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[820px] mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Réservation</p>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B312D] mt-2">Prendre rendez-vous</h1>
      </div>

      {/* Fil d'étapes */}
      {step !== 'done' && (
        <div className="flex items-center justify-center gap-2 mb-8 text-xs">
          {['Prestation', 'Date', 'Créneau'].map((label, i) => {
            const active = (step === 'service' && i === 0) || (step === 'date' && i === 1) || (step === 'slot' && i === 2);
            const passed = (step === 'date' && i < 1) || (step === 'slot' && i < 2);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${active ? 'bg-[#C98F79] text-white' : passed ? 'bg-[#AAB7A0] text-white' : 'bg-white text-[#3B312D]/40'}`}>{passed ? <Check size={12} /> : i + 1}</span>
                <span className={active ? 'text-[#3B312D] font-medium' : 'text-[#3B312D]/40'}>{label}</span>
                {i < 2 && <span className="w-6 h-px bg-[#3B312D]/10" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Étape 1 : prestation */}
      {step === 'service' && (
        <div className="space-y-3">
          {(config?.services ?? []).length === 0 && <p className="text-center text-[#3B312D]/50 py-8">Aucune prestation disponible.</p>}
          {(config?.services ?? []).map((s: any) => (
            <button key={s.id} onClick={() => { setService(s); setStep('date'); }} className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between gap-4">
              <div>
                <p className="font-playfair text-lg font-semibold text-[#3B312D]">{s.name}</p>
                <div className="flex items-center gap-3 text-sm text-[#3B312D]/60 mt-1">
                  <span className="flex items-center gap-1"><Clock size={13} />{s.duration} min</span>
                  {s.price > 0 && <span>{s.price}€</span>}
                </div>
              </div>
              <ChevronRight size={18} className="text-[#C98F79]" />
            </button>
          ))}
        </div>
      )}

      {/* Étape 2 : date */}
      {step === 'date' && service && (
        <div>
          <button onClick={() => setStep('service')} className="text-sm text-[#C98F79] flex items-center gap-1 mb-4"><ArrowLeft size={15} />{service.name} · {service.duration} min</button>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} disabled={!canPrev} className="p-2 rounded-lg hover:bg-[#F8F4EF] disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="font-playfair text-lg font-semibold text-[#3B312D] capitalize">{MONTHS[view.month - 1]} {view.year}</span>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-[#F8F4EF]"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#3B312D]/40 mb-1">{DOW.map((d) => <span key={d}>{d}</span>)}</div>
            {daysLoading ? <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#C98F79]" /></div> : (
              <div className="grid grid-cols-7 gap-1">
                {grid.map((cell, i) => {
                  if (!cell) return <span key={i} />;
                  const day = parseInt(cell.split('-')[2]);
                  const available = days.has(cell) && cell >= todayStr();
                  return (
                    <button key={i} disabled={!available} onClick={() => pickDate(cell)}
                      className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${available ? 'bg-[#AAB7A0]/15 text-[#3B312D] hover:bg-[#C98F79] hover:text-white font-medium' : 'text-[#3B312D]/20'}`}>
                      {day}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-[#3B312D]/40 mt-3 text-center">Les jours en vert ont des créneaux disponibles.</p>
          </div>
        </div>
      )}

      {/* Étape 3 : créneau */}
      {step === 'slot' && service && (
        <div>
          <button onClick={() => setStep('date')} className="text-sm text-[#C98F79] flex items-center gap-1 mb-4"><ArrowLeft size={15} />Changer de date</button>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="font-playfair text-lg font-semibold text-[#3B312D] mb-1">{service.name}</p>
            <p className="text-sm text-[#3B312D]/60 mb-4 capitalize">{new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            {slotsLoading ? <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#C98F79]" /></div> : slots.length === 0 ? (
              <p className="text-center text-[#3B312D]/50 py-6 text-sm">Aucun créneau disponible ce jour.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((t) => (
                  <button key={t} onClick={() => setSlot(t)} className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${slot === t ? 'bg-[#C98F79] text-white' : 'bg-[#F8F4EF] text-[#3B312D] hover:bg-[#C98F79]/20'}`}>{t}</button>
                ))}
              </div>
            )}
            {slot && (
              <div className="mt-6 pt-5 border-t border-[#F8F4EF]">
                {!session?.user && authStatus !== 'loading' && (
                  <p className="text-xs text-[#3B312D]/60 mb-3 text-center">Vous devez être connectée pour finaliser. Vous serez redirigée puis pourrez confirmer.</p>
                )}
                {config?.requireCardImprint && (
                  <p className="text-xs text-[#3B312D]/60 mb-3 flex items-center justify-center gap-1.5"><CreditCard size={13} className="text-[#C98F79]" />Une empreinte bancaire (non débitée) pourra être demandée pour les nouvelles clientes.</p>
                )}
                <button onClick={confirm} disabled={confirming} className="w-full py-3.5 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {confirming ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Réserver le {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {slot}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Étape finale */}
      {step === 'done' && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-[#AAB7A0]/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={26} className="text-[#AAB7A0]" /></div>
          <h2 className="font-playfair text-2xl font-bold text-[#3B312D]">{doneStatus === 'CONFIRMED' ? 'Rendez-vous confirmé !' : 'Demande enregistrée !'}</h2>
          <p className="text-[#3B312D]/60 mt-2 text-sm">{service?.name} — {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {slot}.</p>
          <p className="text-[#3B312D]/50 mt-2 text-sm">{doneStatus === 'CONFIRMED' ? 'Un email de confirmation vous a été envoyé.' : 'Nous confirmerons votre créneau très rapidement.'}</p>
          <a href="/espace-membre/rendez-vous" className="inline-block mt-6 px-6 py-3 bg-[#C98F79] text-white text-sm font-medium rounded-lg">Voir mes rendez-vous</a>
        </div>
      )}

      {/* Repli Planity discret */}
      {step !== 'done' && (
        <p className="text-center text-xs text-[#3B312D]/40 mt-8">
          Vous préférez Planity ? <a href={PLANITY_URL} target="_blank" rel="noopener noreferrer" className="text-[#C98F79] hover:underline inline-flex items-center gap-0.5">Réserver via Planity <ExternalLink size={11} /></a>
        </p>
      )}
    </div>
  );
}
