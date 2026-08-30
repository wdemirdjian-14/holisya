'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, X, Loader2, Euro } from 'lucide-react';
import { toast } from 'sonner';

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOUR_START = 8;
const HOUR_END = 20;
const ROW_HEIGHT = 56; // px per hour
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const GRID_HEIGHT = (HOUR_END - HOUR_START) * ROW_HEIGHT;

function minutesSinceStart(date: Date): number {
  return (date.getHours() - HOUR_START) * 60 + date.getMinutes();
}

export default function AgendaCalendar({ appointments, onSlotClick, onAppointmentClick, onMoveAppointment }: {
  appointments: any[];
  onSlotClick: (date: Date) => void;
  onAppointmentClick: (apt: any) => void;
  onMoveAppointment: (id: string, date: Date) => void;
}) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<any>({ openDays: '1,2,3,4,5', openTime: '09:00', closeTime: '18:00', breakMinutes: 15 });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [draggingId, setDraggingId] = useState<string>('');

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const appointmentsForDay = (day: Date) => (appointments ?? []).filter((apt: any) => {
    if (!apt?.date) return false;
    const d = new Date(apt.date);
    return d.toDateString() === day.toDateString();
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const loadSettings = () => {
    setLoadingSettings(true);
    fetch('/api/admin/agenda-settings').then(r => r.json()).then(d => { if (d?.settings) setSettings(d.settings); setLoadingSettings(false); }).catch(() => setLoadingSettings(false));
  };

  useEffect(() => { loadSettings(); }, []);
  useEffect(() => { if (showSettings) loadSettings(); }, [showSettings]);

  const saveSettings = async (patch: any) => {
    setSavingSettings(true);
    const merged = { ...settings, ...patch };
    setSettings(merged);
    try {
      const res = await fetch('/api/admin/agenda-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) });
      if (res.ok) toast.success('Réglages enregistrés'); else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSavingSettings(false);
  };

  const toggleDay = (dayIndex: number) => {
    const openDaysArr = (settings.openDays ?? '').split(',').filter(Boolean).map(Number);
    const next = openDaysArr.includes(dayIndex) ? openDaysArr.filter((d: number) => d !== dayIndex) : [...openDaysArr, dayIndex];
    saveSettings({ openDays: next.sort().join(',') });
  };

  const dateFromOffset = (day: Date, offsetY: number, snapMinutes = 15) => {
    const totalMinutes = HOUR_START * 60 + (offsetY / ROW_HEIGHT) * 60;
    const snapped = Math.round(totalMinutes / snapMinutes) * snapMinutes;
    const clamped = Math.min(Math.max(snapped, HOUR_START * 60), HOUR_END * 60 - 15);
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    d.setMinutes(clamped);
    return d;
  };

  const handleColumnClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-appointment-block]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const d = dateFromOffset(day, offsetY);
    onSlotClick(d);
  };

  const handleDrop = (day: Date, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/appointment-id');
    if (!id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const d = dateFromOffset(day, offsetY);
    onMoveAppointment(id, d);
    setDraggingId('');
  };

  const openDaysArr = (settings.openDays ?? '').split(',').filter(Boolean).map(Number);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })} className="p-2 rounded-lg bg-white shadow-sm hover:bg-[#F8F4EF]"><ChevronLeft size={16} /></button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="px-3 py-2 rounded-lg bg-white shadow-sm text-sm text-[#3B312D] hover:bg-[#F8F4EF]">Cette semaine</button>
          <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })} className="p-2 rounded-lg bg-white shadow-sm hover:bg-[#F8F4EF]"><ChevronRight size={16} /></button>
          <span className="text-sm text-[#3B312D]/60 ml-2">{days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — {days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-white text-[#3B312D] text-sm rounded-lg shadow-sm flex items-center gap-2"><Settings size={14} />Paramètres agenda</button>
      </div>

      <p className="text-xs text-[#3B312D]/40 mb-2">Cliquez sur un créneau libre pour créer un RDV. Cliquez sur un RDV pour voir/modifier son détail. Glissez-déposez un RDV pour le déplacer.</p>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="flex min-w-[900px]">
          {/* Time axis */}
          <div className="w-14 flex-shrink-0 border-r border-[#F8F4EF]">
            <div className="h-14 border-b border-[#F8F4EF]" />
            {HOURS.map((h) => (
              <div key={h} style={{ height: ROW_HEIGHT }} className="text-[10px] text-[#3B312D]/40 text-right pr-1.5 -translate-y-2">{h}:00</div>
            ))}
          </div>

          {days.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            return (
            <div key={i} className={`flex-1 min-w-[110px] border-r border-[#F8F4EF] last:border-r-0 ${isToday ? 'bg-[#C98F79]/5' : ''}`}>
              <div className={`h-14 border-b flex flex-col items-center justify-center relative ${isToday ? 'border-[#C98F79]/30 bg-[#C98F79]/10' : 'border-[#F8F4EF]'}`}>
                <p className={`text-[10px] font-medium uppercase ${isToday ? 'text-[#C98F79]' : 'text-[#3B312D]/50'}`}>{DAY_LABELS[i]}</p>
                <p className={`font-playfair text-base font-semibold ${isToday ? 'text-[#C98F79]' : 'text-[#3B312D]'}`}>
                  {isToday ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#C98F79] text-white text-sm">{day.getDate()}</span> : day.getDate()}
                </p>
                <button onClick={() => { const d = new Date(day); d.setHours(9, 0, 0, 0); onSlotClick(d); }} className="absolute top-1 right-1 p-1 rounded hover:bg-[#C98F79]/10"><Plus size={12} className="text-[#C98F79]" /></button>
              </div>
              <div
                className="relative cursor-pointer"
                style={{ height: GRID_HEIGHT }}
                onClick={(e) => handleColumnClick(day, e)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(day, e)}
              >
                {HOURS.map((h, idx) => (
                  <div key={h} style={{ top: idx * ROW_HEIGHT, height: ROW_HEIGHT }} className="absolute left-0 right-0 border-t border-[#F8F4EF] pointer-events-none" />
                ))}
                {appointmentsForDay(day).map((apt: any) => {
                  const d = new Date(apt.date);
                  const top = (minutesSinceStart(d) / 60) * ROW_HEIGHT;
                  const height = Math.max(((apt?.duration ?? 60) / 60) * ROW_HEIGHT, 22);
                  const isPaid = (apt?.payments ?? []).length > 0;
                  const color = apt?.status === 'CONFIRMED' ? 'bg-[#AAB7A0]/25 border-[#AAB7A0]' : apt?.status === 'CANCELLED' ? 'bg-red-50 border-red-200 opacity-60' : apt?.status === 'COMPLETED' ? 'bg-[#3B312D]/10 border-[#3B312D]/20' : 'bg-[#C98F79]/20 border-[#C98F79]';
                  return (
                    <div
                      key={apt.id}
                      data-appointment-block
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData('text/appointment-id', apt.id); setDraggingId(apt.id); }}
                      onDragEnd={() => setDraggingId('')}
                      onClick={(e) => { e.stopPropagation(); onAppointmentClick(apt); }}
                      style={{ top, height, left: 2, right: 2 }}
                      className={`absolute rounded-md border px-1.5 py-1 text-[10px] leading-tight overflow-hidden hover:shadow-md transition-shadow ${color} ${draggingId === apt.id ? 'opacity-40' : ''} ${apt?.status === 'CANCELLED' ? 'line-through' : ''}`}
                    >
                      <p className="font-semibold text-[#3B312D] truncate flex items-center gap-1">
                        {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {apt?.serviceType ?? ''}
                        {isPaid && <Euro size={9} className="text-[#AAB7A0] flex-shrink-0" />}
                      </p>
                      <p className="text-[#3B312D]/70 truncate">{apt?.user?.firstName ?? ''} {apt?.user?.lastName ?? ''}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">Paramètres agenda</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={18} /></button>
            </div>
            {loadingSettings ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C98F79]" /></div> : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#3B312D]/60">Jours d'ouverture</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {DAY_LABELS.map((label, idx) => (
                      <button key={idx} onClick={() => toggleDay(idx)}
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${openDaysArr.includes(idx) ? 'bg-[#AAB7A0] text-white' : 'bg-[#F8F4EF] text-[#3B312D]/50'}`}>
                        {label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-[#3B312D]/60">Ouverture</label>
                    <input type="time" value={settings.openTime} onChange={(e: any) => setSettings({ ...settings, openTime: e.target?.value ?? '09:00' })} onBlur={() => saveSettings({ openTime: settings.openTime })} className="w-full mt-1 px-2 py-1.5 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
                  <div><label className="text-xs text-[#3B312D]/60">Fermeture</label>
                    <input type="time" value={settings.closeTime} onChange={(e: any) => setSettings({ ...settings, closeTime: e.target?.value ?? '18:00' })} onBlur={() => saveSettings({ closeTime: settings.closeTime })} className="w-full mt-1 px-2 py-1.5 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
                  <div><label className="text-xs text-[#3B312D]/60">Pause (min)</label>
                    <input type="number" min={0} value={settings.breakMinutes} onChange={(e: any) => setSettings({ ...settings, breakMinutes: e.target?.value ?? '15' })} onBlur={() => saveSettings({ breakMinutes: settings.breakMinutes })} className="w-full mt-1 px-2 py-1.5 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
                </div>
                {savingSettings && <p className="text-xs text-[#C98F79]">Enregistrement...</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
