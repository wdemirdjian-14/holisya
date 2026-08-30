'use client';
import { useEffect, useState } from 'react';
import { UserPlus, X, Loader2, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanityTasks({ onChange }: { onChange?: () => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const load = () => fetch('/api/admin/planity').then((r) => r.json()).then((d) => { setBookings(d?.bookings ?? []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/planity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (res.ok) { toast.success('Fiche cliente et rendez-vous créés'); load(); onChange?.(); } else { const e = await res.json(); toast.error(e?.error ?? 'Erreur'); }
    } catch { toast.error('Erreur'); }
    setBusy('');
  };

  const ignore = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/planity', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (res.ok) load();
    } catch { toast.error('Erreur'); }
    setBusy('');
  };

  if (loading || bookings.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#C98F79]">
      <div className="flex items-center gap-2 mb-3">
        <CalendarCheck size={18} className="text-[#C98F79]" />
        <h2 className="font-playfair text-lg font-semibold text-[#3B312D]">Nouvelles clientes Planity à créer</h2>
        <span className="text-xs px-2 py-0.5 bg-[#C98F79] text-white rounded-full font-medium">{bookings.length}</span>
      </div>
      <div className="space-y-2">
        {bookings.map((b: any) => (
          <div key={b.id} className="flex items-center justify-between bg-[#F8F4EF]/60 rounded-lg px-4 py-3 flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium text-[#3B312D]">{b.firstName} {b.lastName} <span className="text-xs text-[#3B312D]/40 font-normal">· {b.email}</span></p>
              <p className="text-xs text-[#3B312D]/60 mt-0.5">{b.serviceType || 'Soin'} · {new Date(b.date).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} ({b.durationMin} min)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => create(b.id)} disabled={busy === b.id} className="px-3 py-2 text-xs bg-[#C98F79] text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50">
                {busy === b.id ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}Créer la fiche & le RDV
              </button>
              <button onClick={() => ignore(b.id)} disabled={busy === b.id} className="px-2.5 py-2 text-xs bg-white text-[#3B312D]/50 rounded-lg" title="Ignorer"><X size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
