'use client';
import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Calendar, Clock, Ban, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function BookingTab() {
  const [settings, setSettings] = useState<any>(null);
  const [windows, setWindows] = useState<any[]>([]);
  const [closures, setClosures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWin, setNewWin] = useState({ weekday: 1, startTime: '09:00', endTime: '18:00' });
  const [newClosure, setNewClosure] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/booking-settings').then((r) => r.json()),
      fetch('/api/admin/availability').then((r) => r.json()),
    ]).then(([s, a]) => { setSettings(s?.settings ?? null); setWindows(a?.windows ?? []); setClosures(a?.closures ?? []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const saveSettings = async (patch: any) => {
    setSaving(true);
    const merged = { ...settings, ...patch };
    setSettings(merged);
    try {
      const res = await fetch('/api/admin/booking-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) });
      if (res.ok) toast.success('Enregistré'); else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const addWindow = async () => {
    if (newWin.startTime >= newWin.endTime) { toast.error('Heure de fin après le début'); return; }
    const res = await fetch('/api/admin/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'window', ...newWin }) });
    if (res.ok) { toast.success('Créneau ajouté'); load(); } else toast.error('Erreur');
  };
  const delWindow = async (id: string) => { const res = await fetch(`/api/admin/availability?kind=window&id=${id}`, { method: 'DELETE' }); if (res.ok) load(); };

  const addClosure = async () => {
    if (!newClosure) return;
    const res = await fetch('/api/admin/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'closure', date: newClosure }) });
    if (res.ok) { toast.success('Fermeture ajoutée'); setNewClosure(''); load(); } else toast.error('Erreur');
  };
  const delClosure = async (id: string) => { const res = await fetch(`/api/admin/availability?kind=closure&id=${id}`, { method: 'DELETE' }); if (res.ok) load(); };

  if (loading || !settings) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  const num = 'w-full mt-1 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Réservation en ligne</h2>
        <p className="text-xs text-[#3B312D]/50 mt-1">Vos clientes réservent directement sur le site (comme Planity). Vous ouvrez les créneaux et validez les demandes.</p>
      </div>

      {/* Interrupteurs principaux */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-[#3B312D]"><strong>Activer la réservation en ligne</strong><br /><span className="text-xs text-[#3B312D]/50">Les créneaux libres deviennent visibles et réservables sur le site.</span></span>
          <input type="checkbox" checked={settings.onlineBookingEnabled} onChange={(e) => saveSettings({ onlineBookingEnabled: e.target.checked })} className="w-5 h-5 flex-shrink-0" />
        </label>
        <label className="flex items-center justify-between gap-4 pt-3 border-t border-[#F8F4EF]">
          <span className="text-sm text-[#3B312D]"><strong>Confirmation automatique</strong><br /><span className="text-xs text-[#3B312D]/50">Sinon, les réservations arrivent en « à confirmer » et vous les validez.</span></span>
          <input type="checkbox" checked={settings.autoConfirm} onChange={(e) => saveSettings({ autoConfirm: e.target.checked })} className="w-5 h-5 flex-shrink-0" />
        </label>
        <label className="flex items-center justify-between gap-4 pt-3 border-t border-[#F8F4EF]">
          <span className="text-sm text-[#3B312D] flex items-start gap-2"><CreditCard size={16} className="text-[#C98F79] mt-0.5" /><span><strong>Empreinte bancaire pour les nouveaux clients</strong><br /><span className="text-xs text-[#3B312D]/50">Carte enregistrée (non débitée) pour valider le créneau — anti no-show.</span></span></span>
          <input type="checkbox" checked={settings.requireCardImprint} onChange={(e) => saveSettings({ requireCardImprint: e.target.checked })} className="w-5 h-5 flex-shrink-0" />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#F8F4EF]">
          <div><label className="text-xs text-[#3B312D]/60">Pas des créneaux (min)</label><input type="number" min={5} step={5} value={settings.slotGranularityMin} onChange={(e) => setSettings({ ...settings, slotGranularityMin: e.target.value })} onBlur={() => saveSettings({ slotGranularityMin: settings.slotGranularityMin })} className={num} /></div>
          <div><label className="text-xs text-[#3B312D]/60">Pause entre RDV (min)</label><input type="number" min={0} value={settings.breakMinutes} onChange={(e) => setSettings({ ...settings, breakMinutes: e.target.value })} onBlur={() => saveSettings({ breakMinutes: settings.breakMinutes })} className={num} /></div>
          <div><label className="text-xs text-[#3B312D]/60">Délai mini (h)</label><input type="number" min={0} value={settings.minNoticeHours} onChange={(e) => setSettings({ ...settings, minNoticeHours: e.target.value })} onBlur={() => saveSettings({ minNoticeHours: settings.minNoticeHours })} className={num} /></div>
          <div><label className="text-xs text-[#3B312D]/60">Réserv. jusqu'à (jours)</label><input type="number" min={1} value={settings.maxAdvanceDays} onChange={(e) => setSettings({ ...settings, maxAdvanceDays: e.target.value })} onBlur={() => saveSettings({ maxAdvanceDays: settings.maxAdvanceDays })} className={num} /></div>
        </div>
        {saving && <p className="text-xs text-[#C98F79]">Enregistrement…</p>}
      </div>

      {/* Horaires hebdomadaires */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3B312D] mb-3 flex items-center gap-2"><Clock size={15} className="text-[#C98F79]" />Horaires d'ouverture (récurrents)</h3>
        <div className="space-y-3">
          {DAYS.map((day, idx) => {
            const dayWins = windows.filter((w) => w.weekday === idx);
            return (
              <div key={idx} className="flex items-start gap-3 flex-wrap">
                <span className="w-24 text-sm text-[#3B312D]/70 pt-1">{day}</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {dayWins.length === 0 && <span className="text-xs text-[#3B312D]/30 pt-1">Fermé</span>}
                  {dayWins.map((w) => (
                    <span key={w.id} className="inline-flex items-center gap-1.5 text-xs bg-[#AAB7A0]/15 text-[#3B312D] px-2.5 py-1 rounded-full">
                      {w.startTime} – {w.endTime}
                      <button onClick={() => delWindow(w.id)}><Trash2 size={11} className="text-red-400" /></button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-end gap-2 mt-4 pt-4 border-t border-[#F8F4EF]">
          <div><label className="text-xs text-[#3B312D]/60">Jour</label>
            <select value={newWin.weekday} onChange={(e) => setNewWin({ ...newWin, weekday: parseInt(e.target.value) })} className="block mt-1 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select></div>
          <div><label className="text-xs text-[#3B312D]/60">De</label><input type="time" value={newWin.startTime} onChange={(e) => setNewWin({ ...newWin, startTime: e.target.value })} className="block mt-1 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
          <div><label className="text-xs text-[#3B312D]/60">À</label><input type="time" value={newWin.endTime} onChange={(e) => setNewWin({ ...newWin, endTime: e.target.value })} className="block mt-1 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
          <button onClick={addWindow} className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-1.5"><Plus size={14} />Ajouter</button>
        </div>
      </div>

      {/* Fermetures exceptionnelles */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3B312D] mb-3 flex items-center gap-2"><Ban size={15} className="text-[#C98F79]" />Jours de fermeture (vacances, exceptions)</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {closures.length === 0 && <span className="text-xs text-[#3B312D]/30">Aucune fermeture programmée</span>}
          {closures.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
              {new Date(c.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
              <button onClick={() => delClosure(c.id)}><Trash2 size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div><label className="text-xs text-[#3B312D]/60">Date à fermer</label><input type="date" value={newClosure} onChange={(e) => setNewClosure(e.target.value)} className="block mt-1 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
          <button onClick={addClosure} className="px-4 py-2 bg-[#3B312D] text-white text-sm rounded-lg flex items-center gap-1.5"><Calendar size={14} />Fermer ce jour</button>
        </div>
      </div>
    </div>
  );
}
