'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, X, Loader2, Euro, Clock, Copy, Ban, Sparkles, Trash2, Lock, GripVertical } from 'lucide-react';
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
const HOUR_END = 21;
const ROW_HEIGHT = 56; // px per hour
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const GRID_HEIGHT = (HOUR_END - HOUR_START) * ROW_HEIGHT;

function minutesSinceStart(date: Date): number {
  return (date.getHours() - HOUR_START) * 60 + date.getMinutes();
}
function toMin(hhmm: string): number {
  const [h, m] = (hhmm || '0:0').split(':').map((x) => parseInt(x) || 0);
  return h * 60 + m;
}
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// Résumé horaires affiché sous la date (ex : « 10:30–21:00 » ou « Fermé »)
function daySummary(wins: { startTime: string; endTime: string }[]): string {
  if (!wins.length) return 'Fermé';
  const sorted = [...wins].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  if (sorted.length === 1) return `${sorted[0].startTime}–${sorted[0].endTime}`;
  return `${sorted[0].startTime}–${sorted[sorted.length - 1].endTime} (${sorted.length})`;
}

// Segments FERMÉS = complément des plages d'ouverture dans [HOUR_START, HOUR_END]
function closedSegments(wins: { startTime: string; endTime: string }[]): { s: number; e: number }[] {
  const lo = HOUR_START * 60, hi = HOUR_END * 60;
  const open = wins
    .map((w) => ({ s: Math.max(toMin(w.startTime), lo), e: Math.min(toMin(w.endTime), hi) }))
    .filter((o) => o.e > o.s)
    .sort((a, b) => a.s - b.s);
  const closed: { s: number; e: number }[] = [];
  let cursor = lo;
  for (const o of open) {
    if (o.s > cursor) closed.push({ s: cursor, e: o.s });
    cursor = Math.max(cursor, o.e);
  }
  if (cursor < hi) closed.push({ s: cursor, e: hi });
  return closed;
}

type Win = { id: string; weekday: number; startTime: string; endTime: string };
type Closure = { id: string; date: string };
type Block = { id: string; date: string; duration: number; reason: string };

export default function AgendaCalendar({ appointments, onSlotClick, onAppointmentClick, onMoveAppointment, onMoveBlock, onBlockClick, onBlockDelete, blockRefresh }: {
  appointments: any[];
  onSlotClick: (date: Date) => void;
  onAppointmentClick: (apt: any) => void;
  onMoveAppointment: (id: string, date: Date) => void;
  onMoveBlock: (id: string, date: Date) => void;
  onBlockClick: (block: Block) => void;
  onBlockDelete: (id: string) => void | Promise<void>;
  blockRefresh?: number;
}) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<any>({ openDays: '1,2,3,4,5', openTime: '09:00', closeTime: '18:00', breakMinutes: 15 });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  // Glisser-déposer : poignée dédiée. Souris = immédiat ; tactile = appui long (anti-scroll accidentel).
  const LONG_PRESS_MS = 550;
  const pending = useRef<{ id: string; kind: 'apt' | 'block'; item: any; startX: number; startY: number; pid: number; armed: boolean; moved: boolean } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDrag = useRef(0); // horodatage de fin de déplacement (anti clic fantôme)
  const [holdingId, setHoldingId] = useState<string>(''); // appui en cours (pas encore armé)
  const [armedId, setArmedId] = useState<string>('');     // prêt à déplacer
  const [ghost, setGhost] = useState<{ item: any; kind: 'apt' | 'block'; x: number; y: number; label: string } | null>(null);
  const [overCol, setOverCol] = useState<number | null>(null);

  // Horaires d'ouverture récurrents (AvailabilityWindow) + fermetures exceptionnelles
  const [windows, setWindows] = useState<Win[]>([]);
  const [closures, setClosures] = useState<Closure[]>([]);
  const [editDay, setEditDay] = useState<{ date: Date; weekday: number } | null>(null);
  const [busyHours, setBusyHours] = useState(false);
  const [custom, setCustom] = useState({ start: '', end: '' });

  // Blocs d'indisponibilité perso (création/édition via la modale unifiée)
  const [blocks, setBlocks] = useState<Block[]>([]);

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

  const blocksForDay = (day: Date) => blocks.filter((b) => new Date(b.date).toDateString() === day.toDateString());

  const winsForWeekday = (wd: number) => windows.filter((w) => w.weekday === wd).sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const closureFor = (day: Date) => closures.find((c) => localDateStr(new Date(c.date)) === localDateStr(day));

  const loadSettings = () => {
    setLoadingSettings(true);
    fetch('/api/admin/agenda-settings').then(r => r.json()).then(d => { if (d?.settings) setSettings(d.settings); setLoadingSettings(false); }).catch(() => setLoadingSettings(false));
  };
  const loadAvailability = () => {
    fetch('/api/admin/availability').then(r => r.json()).then(d => { setWindows(d?.windows ?? []); setClosures(d?.closures ?? []); }).catch(() => {});
  };
  const loadBlocks = () => {
    const from = localDateStr(days[0]);
    const to = localDateStr(days[6]);
    fetch(`/api/admin/agenda-blocks?from=${from}&to=${to}`).then(r => r.json()).then(d => setBlocks(d?.blocks ?? [])).catch(() => {});
  };

  useEffect(() => { loadSettings(); loadAvailability(); }, []);
  useEffect(() => { if (showSettings) loadSettings(); }, [showSettings]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadBlocks(); }, [weekStart, blockRefresh]);
  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

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

  // --- Gestion des horaires d'ouverture (créneaux récurrents) ---
  const addWindow = async (weekday: number, startTime: string, endTime: string) => {
    if (startTime >= endTime) { toast.error('L\'heure de fin doit suivre le début'); return; }
    setBusyHours(true);
    try {
      const res = await fetch('/api/admin/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'window', weekday, startTime, endTime }) });
      if (res.ok) { await loadAvailability(); toast.success('Créneau d\'ouverture ajouté'); } else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setBusyHours(false);
  };
  const delWindow = async (id: string) => {
    setBusyHours(true);
    try { const res = await fetch(`/api/admin/availability?kind=window&id=${id}`, { method: 'DELETE' }); if (res.ok) await loadAvailability(); } catch {}
    setBusyHours(false);
  };
  const copyFromWeekday = async (fromWd: number, toWd: number) => {
    const src = winsForWeekday(fromWd);
    if (!src.length) return;
    setBusyHours(true);
    try {
      for (const w of src) {
        await fetch('/api/admin/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'window', weekday: toWd, startTime: w.startTime, endTime: w.endTime }) });
      }
      await loadAvailability();
      toast.success(`Horaires copiés depuis ${DAY_LABELS[fromWd]}`);
    } catch { toast.error('Erreur'); }
    setBusyHours(false);
  };
  const addClosure = async (day: Date) => {
    setBusyHours(true);
    try {
      const res = await fetch('/api/admin/availability', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'closure', date: localDateStr(day) }) });
      if (res.ok) { await loadAvailability(); toast.success('Journée fermée'); } else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setBusyHours(false);
  };
  const delClosure = async (id: string) => {
    setBusyHours(true);
    try { const res = await fetch(`/api/admin/availability?kind=closure&id=${id}`, { method: 'DELETE' }); if (res.ok) await loadAvailability(); } catch {}
    setBusyHours(false);
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
    if ((e.target as HTMLElement).closest('[data-block-block]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const d = dateFromOffset(day, offsetY);
    onSlotClick(d);
  };

  // Repère la colonne (jour) et l'heure sous le pointeur
  const computeTarget = (clientX: number, clientY: number): { idx: number; date: Date } | null => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const col = el?.closest('[data-day-col]') as HTMLElement | null;
    if (!col) return null;
    const idx = parseInt(col.getAttribute('data-day-col') || '', 10);
    if (isNaN(idx) || !days[idx]) return null;
    const rect = col.getBoundingClientRect();
    return { idx, date: dateFromOffset(days[idx], clientY - rect.top) };
  };

  const clearHold = () => { if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; } };
  const resetDrag = () => { pending.current = null; clearHold(); setHoldingId(''); setArmedId(''); setGhost(null); setOverCol(null); };

  const labelFor = (date: Date) => `${date.toLocaleDateString('fr-FR', { weekday: 'short' })} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

  // Appui sur la POIGNÉE d'un élément (RDV ou blocage)
  const onGripDown = (e: React.PointerEvent, id: string, kind: 'apt' | 'block', item: any) => {
    e.stopPropagation();
    e.preventDefault(); // empêche la sélection de texte / loupe iOS au maintien
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    const isMouse = e.pointerType === 'mouse';
    pending.current = { id, kind, item, startX: e.clientX, startY: e.clientY, pid: e.pointerId, armed: isMouse, moved: false };
    setHoldingId(id);
    if (isMouse) { setArmedId(id); }
    else {
      holdTimer.current = setTimeout(() => {
        if (pending.current && pending.current.id === id) {
          pending.current.armed = true;
          setArmedId(id);
          try { (navigator as any).vibrate?.(25); } catch {}
        }
      }, LONG_PRESS_MS);
    }
  };
  const onGripMove = (e: React.PointerEvent) => {
    const p = pending.current;
    if (!p || p.pid !== e.pointerId) return;
    const dist = Math.hypot(e.clientX - p.startX, e.clientY - p.startY);
    if (!p.armed) {
      // Bouge avant la fin de l'appui long → on annule (évite les déplacements involontaires)
      if (dist > 12) resetDrag();
      return;
    }
    e.preventDefault();
    p.moved = true;
    const t = computeTarget(e.clientX, e.clientY);
    setOverCol(t?.idx ?? null);
    setGhost({ item: p.item, kind: p.kind, x: e.clientX, y: e.clientY, label: t ? labelFor(t.date) : '' });
  };
  const onGripUp = (e: React.PointerEvent) => {
    const p = pending.current;
    const t = p && p.armed && p.moved ? computeTarget(e.clientX, e.clientY) : null;
    if (p && p.moved) lastDrag.current = Date.now();
    if (p && t) {
      if (p.kind === 'apt') onMoveAppointment(p.id, t.date);
      else onMoveBlock(p.id, t.date);
    }
    resetDrag();
  };

  const openDaysArr = (settings.openDays ?? '').split(',').filter(Boolean).map(Number);

  // Suggestions issues de la configuration globale (openTime / closeTime)
  const sugOpen = settings.openTime || '09:00';
  const sugClose = settings.closeTime || '18:00';
  const suggestions = [
    { label: `Journée complète ${sugOpen}–${sugClose}`, start: sugOpen, end: sugClose },
    { label: `Matin ${sugOpen}–13:00`, start: sugOpen, end: '13:00' },
    { label: `Après-midi 14:00–${sugClose}`, start: '14:00', end: sugClose },
  ].filter((s) => s.start < s.end);

  const editWins = editDay ? winsForWeekday(editDay.weekday) : [];
  const editClosure = editDay ? closureFor(editDay.date) : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })} className="p-2 rounded-lg bg-white shadow-sm hover:bg-[#F8F4EF]"><ChevronLeft size={16} /></button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="px-3 py-2 rounded-lg bg-white shadow-sm text-sm text-[#3B312D] hover:bg-[#F8F4EF]">Cette semaine</button>
          <button onClick={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })} className="p-2 rounded-lg bg-white shadow-sm hover:bg-[#F8F4EF]"><ChevronRight size={16} /></button>
          <span className="text-sm text-[#3B312D]/60 ml-2">{days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — {days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <button onClick={() => setShowSettings(true)} className="px-4 py-2 bg-white text-[#3B312D] text-sm rounded-lg shadow-sm flex items-center gap-2"><Settings size={14} />Horaires type</button>
      </div>

      <p className="text-xs text-[#3B312D]/40 mb-2">Cliquez sur l'<strong>en-tête d'un jour</strong> pour gérer ses horaires. Cliquez sur un créneau libre pour créer un RDV (ou le bloquer), sur un RDV pour l'ouvrir. Pour <strong>déplacer</strong> un RDV ou un blocage : attrapez la <strong>poignée</strong> <GripVertical size={11} className="inline -mt-0.5 text-[#3B312D]/60" /> (sur mobile, maintenez le doigt ~½ s dessus jusqu'à la vibration, puis glissez). L'heure cible s'affiche pendant le déplacement.</p>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="flex min-w-[900px] select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
          {/* Time axis */}
          <div className="w-14 flex-shrink-0 border-r border-[#F8F4EF]">
            <div className="h-16 border-b border-[#F8F4EF]" />
            {HOURS.map((h) => (
              <div key={h} style={{ height: ROW_HEIGHT }} className="text-[10px] text-[#3B312D]/40 text-right pr-1.5 -translate-y-2">{h}:00</div>
            ))}
          </div>

          {days.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            const wd = i; // startOfWeek = lundi, donc i correspond à AvailabilityWindow.weekday (0=lundi)
            const dayWins = winsForWeekday(wd);
            const dayClosure = closureFor(day);
            return (
            <div key={i} className={`flex-1 min-w-[110px] border-r border-[#F8F4EF] last:border-r-0 ${isToday ? 'bg-[#C98F79]/5' : ''}`}>
              {/* En-tête de jour cliquable → éditeur d'horaires */}
              <button
                type="button"
                onClick={() => { setEditDay({ date: day, weekday: wd }); setCustom({ start: sugOpen, end: sugClose }); }}
                title="Gérer les horaires d'ouverture de ce jour"
                className={`w-full h-16 border-b flex flex-col items-center justify-center relative hover:bg-[#C98F79]/10 transition-colors ${isToday ? 'border-[#C98F79]/30 bg-[#C98F79]/10' : 'border-[#F8F4EF]'}`}
              >
                <p className={`text-[10px] font-medium uppercase ${isToday ? 'text-[#C98F79]' : 'text-[#3B312D]/50'}`}>{DAY_LABELS[i]}</p>
                <p className={`font-playfair text-base font-semibold leading-none ${isToday ? 'text-[#C98F79]' : 'text-[#3B312D]'}`}>
                  {isToday ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#C98F79] text-white text-sm">{day.getDate()}</span> : day.getDate()}
                </p>
                <span className={`mt-0.5 text-[9px] font-medium ${dayClosure ? 'text-red-500' : dayWins.length ? 'text-[#AAB7A0]' : 'text-[#3B312D]/30'}`}>
                  {dayClosure ? 'Fermé (except.)' : daySummary(dayWins)}
                </span>
                <span className="absolute top-1 right-1 p-1 rounded hover:bg-[#C98F79]/20"><Clock size={12} className="text-[#C98F79]" /></span>
              </button>
              <div
                data-day-col={i}
                className={`relative cursor-pointer transition-colors ${overCol === i ? 'bg-[#C98F79]/10 ring-2 ring-inset ring-[#C98F79]/40' : ''}`}
                style={{ height: GRID_HEIGHT }}
                onClick={(e) => handleColumnClick(day, e)}
              >
                {/* Heures FERMÉES : hachuré */}
                {!dayClosure && closedSegments(dayWins).map((seg, idx) => {
                  const top = ((seg.s - HOUR_START * 60) / 60) * ROW_HEIGHT;
                  const height = ((seg.e - seg.s) / 60) * ROW_HEIGHT;
                  return <div key={`c${idx}`} className="absolute left-0 right-0 pointer-events-none bg-[repeating-linear-gradient(45deg,#f2f0ed,#f2f0ed_6px,#e7e4df_6px,#e7e4df_12px)]" style={{ top, height }} />;
                })}
                {/* Plages OUVERTES : léger vert */}
                {!dayClosure && dayWins.map((w) => {
                  const s = Math.max(toMin(w.startTime), HOUR_START * 60);
                  const e2 = Math.min(toMin(w.endTime), HOUR_END * 60);
                  if (e2 <= s) return null;
                  const top = ((s - HOUR_START * 60) / 60) * ROW_HEIGHT;
                  const height = ((e2 - s) / 60) * ROW_HEIGHT;
                  return <div key={w.id} className="absolute left-0 right-0 bg-[#AAB7A0]/10 border-y border-[#AAB7A0]/25 pointer-events-none" style={{ top, height }} />;
                })}
                {/* Overlay fermeture exceptionnelle */}
                {dayClosure && (
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#f3f1ee,#f3f1ee_8px,#eceae6_8px,#eceae6_16px)] pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-[#3B312D]/40 font-medium rotate-[-8deg]">Fermé</span>
                  </div>
                )}
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
                      onClick={(e) => { e.stopPropagation(); if (Date.now() - lastDrag.current < 400 || armedId === apt.id) return; onAppointmentClick(apt); }}
                      style={{ top, height, left: 2, right: 2 }}
                      className={`absolute rounded-md border pl-1.5 pr-5 py-1 text-[10px] leading-tight overflow-hidden transition-all z-10 select-none ${color} ${apt?.status === 'CANCELLED' ? 'line-through' : ''} ${armedId === apt.id ? 'z-40 scale-[1.04] shadow-xl ring-2 ring-[#C98F79]' : 'hover:shadow-md'} ${holdingId === apt.id && armedId !== apt.id ? 'ring-2 ring-[#C98F79]/50' : ''} ${ghost?.kind === 'apt' && ghost?.item?.id === apt.id ? 'opacity-40' : ''}`}
                    >
                      <p className="font-semibold text-[#3B312D] truncate flex items-center gap-1">
                        {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {apt?.serviceType ?? ''}
                        {isPaid && <Euro size={9} className="text-[#AAB7A0] flex-shrink-0" />}
                      </p>
                      <p className="text-[#3B312D]/70 truncate">{apt?.user?.firstName ?? ''} {apt?.user?.lastName ?? ''}</p>
                      <button type="button" data-grip aria-label="Maintenir pour déplacer le rendez-vous"
                        onPointerDown={(e) => onGripDown(e, apt.id, 'apt', apt)}
                        onPointerMove={onGripMove}
                        onPointerUp={onGripUp}
                        onPointerCancel={resetDrag}
                        onClick={(e) => e.stopPropagation()}
                        style={{ touchAction: 'none' }}
                        className={`absolute top-0 right-0 h-full w-5 flex items-center justify-center cursor-grab active:cursor-grabbing ${armedId === apt.id ? 'bg-[#C98F79]/40' : 'bg-black/5 hover:bg-black/10'}`}>
                        <GripVertical size={12} className="text-[#3B312D]/55" />
                      </button>
                    </div>
                  );
                })}
                {/* Blocs d'indisponibilité perso */}
                {blocksForDay(day).map((b) => {
                  const d = new Date(b.date);
                  const top = (minutesSinceStart(d) / 60) * ROW_HEIGHT;
                  const height = Math.max(((b.duration ?? 60) / 60) * ROW_HEIGHT, 20);
                  const reason = (b.reason || '').trim();
                  return (
                    <div key={b.id} data-block-block style={{ top, height, left: 2, right: 2 }}
                      onClick={(e) => { e.stopPropagation(); if (Date.now() - lastDrag.current < 400 || armedId === b.id) return; onBlockClick(b); }}
                      title="Modifier ce blocage (début, fin, durée)"
                      className={`absolute rounded-md border pl-6 pr-4 py-0.5 text-[10px] text-[#3B312D]/70 overflow-hidden z-20 cursor-pointer transition-all bg-[repeating-linear-gradient(45deg,#e9e6e1,#e9e6e1_5px,#dcd8d2_5px,#dcd8d2_10px)] ${armedId === b.id ? 'z-40 scale-[1.04] shadow-xl ring-2 ring-[#3B312D]/60 border-[#3B312D]/60' : 'border-[#3B312D]/30 hover:border-[#3B312D]/60'} ${holdingId === b.id && armedId !== b.id ? 'ring-2 ring-[#3B312D]/40' : ''} ${ghost?.kind === 'block' && ghost?.item?.id === b.id ? 'opacity-40' : ''}`}>
                      <span className="flex items-center gap-1 font-medium"><Lock size={9} />{d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {reason && <span className="block truncate text-[#3B312D]/55">{reason}</span>}
                      <button type="button" data-grip aria-label="Maintenir pour déplacer le blocage"
                        onPointerDown={(e) => onGripDown(e, b.id, 'block', b)}
                        onPointerMove={onGripMove}
                        onPointerUp={onGripUp}
                        onPointerCancel={resetDrag}
                        onClick={(e) => e.stopPropagation()}
                        style={{ touchAction: 'none' }}
                        className={`absolute top-0 left-0 h-full w-5 flex items-center justify-center cursor-grab active:cursor-grabbing ${armedId === b.id ? 'bg-[#3B312D]/20' : 'bg-black/5 hover:bg-black/10'}`}>
                        <GripVertical size={12} className="text-[#3B312D]/55" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onBlockDelete(b.id); }} data-del className="absolute top-0.5 right-0.5 bg-white/90 text-red-500 rounded-full p-0.5 hover:bg-white" aria-label="Débloquer"><X size={10} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Aperçu flottant pendant le glisser-déposer */}
      {ghost && (
        <div className="fixed z-[60] pointer-events-none" style={{ left: ghost.x + 14, top: ghost.y + 14 }}>
          <div className="rounded-md border border-[#C98F79] bg-white shadow-lg px-2.5 py-1.5 text-[11px] text-[#3B312D]">
            <span className="font-semibold">{ghost.label}</span>
            <span className="block text-[#3B312D]/60 truncate max-w-[180px]">
              {ghost.kind === 'block'
                ? (((ghost.item?.reason ?? '').trim()) || 'Créneau bloqué')
                : `${ghost.item?.serviceType ?? 'Soin'} · ${ghost.item?.user?.firstName ?? ''} ${ghost.item?.user?.lastName ?? ''}`}
            </span>
          </div>
        </div>
      )}

      {/* Éditeur d'horaires d'une journée */}
      {editDay && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditDay(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-playfair text-lg font-semibold text-[#3B312D] flex items-center gap-2"><Clock size={18} className="text-[#C98F79]" />Horaires du {DAY_LABELS[editDay.weekday].toLowerCase()}</h3>
                <p className="text-xs text-[#3B312D]/50 mt-0.5">Ces horaires s'appliquent à <strong>tous les {DAY_LABELS[editDay.weekday].toLowerCase()}s</strong> et pilotent la réservation en ligne.</p>
              </div>
              <button onClick={() => setEditDay(null)} className="p-1.5 rounded hover:bg-[#F8F4EF] flex-none"><X size={18} /></button>
            </div>

            {busyHours && <p className="text-[11px] text-[#C98F79] flex items-center gap-1 mt-2"><Loader2 size={11} className="animate-spin" />Mise à jour…</p>}

            {/* Créneaux actuels */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-[#3B312D]/70 mb-2">Créneaux d'ouverture</p>
              {editWins.length === 0 ? (
                <p className="text-sm text-[#3B312D]/40 bg-[#F8F4EF]/60 rounded-lg px-3 py-2">Fermé ce jour — ajoutez un créneau ci-dessous.</p>
              ) : (
                <div className="space-y-2">
                  {editWins.map((w) => (
                    <div key={w.id} className="flex items-center justify-between gap-2 bg-[#AAB7A0]/12 border border-[#AAB7A0]/30 rounded-lg px-3 py-2">
                      <span className="text-sm text-[#3B312D] font-medium">{w.startTime} – {w.endTime}</span>
                      <button onClick={() => delWindow(w.id)} disabled={busyHours} className="p-1 rounded hover:bg-red-50 disabled:opacity-50" aria-label="Supprimer"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions automatiques (config globale) */}
            {suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#3B312D]/70 mb-2 flex items-center gap-1.5"><Sparkles size={13} className="text-[#C98F79]" />Suggestions (d'après vos horaires type)</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button key={s.label} onClick={() => addWindow(editDay.weekday, s.start, s.end)} disabled={busyHours}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#C98F79]/40 text-[#C98F79] hover:bg-[#C98F79]/10 disabled:opacity-50 flex items-center gap-1">
                      <Plus size={11} />{s.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowSettings(true)} className="text-[11px] text-[#3B312D]/40 underline mt-1.5">Modifier les horaires type</button>
              </div>
            )}

            {/* Créneau sur-mesure */}
            <div className="mt-4 pt-4 border-t border-[#F8F4EF]">
              <p className="text-xs font-semibold text-[#3B312D]/70 mb-2">Créneau sur-mesure</p>
              <div className="flex items-end gap-2 flex-wrap">
                <div><label className="text-[11px] text-[#3B312D]/50">De</label><input type="time" value={custom.start} onChange={(e) => setCustom({ ...custom, start: e.target.value })} className="block mt-1 px-2 py-1.5 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
                <div><label className="text-[11px] text-[#3B312D]/50">À</label><input type="time" value={custom.end} onChange={(e) => setCustom({ ...custom, end: e.target.value })} className="block mt-1 px-2 py-1.5 text-sm border border-[#F8F4EF] rounded-lg text-[#3B312D]" /></div>
                <button onClick={() => { if (custom.start && custom.end) addWindow(editDay.weekday, custom.start, custom.end); }} disabled={busyHours || !custom.start || !custom.end}
                  className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-1.5 disabled:opacity-50"><Plus size={14} />Ajouter</button>
              </div>
            </div>

            {/* Copier depuis un autre jour */}
            <div className="mt-4 pt-4 border-t border-[#F8F4EF]">
              <label className="text-xs font-semibold text-[#3B312D]/70 mb-2 flex items-center gap-1.5"><Copy size={13} className="text-[#C98F79]" />Copier les horaires d'un autre jour</label>
              <select defaultValue="" onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) copyFromWeekday(v, editDay.weekday); e.currentTarget.value = ''; }} disabled={busyHours}
                className="w-full mt-1 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D] disabled:opacity-50">
                <option value="">Choisir un jour à copier…</option>
                {DAY_LABELS.map((label, idx) => idx !== editDay.weekday && winsForWeekday(idx).length > 0 && (
                  <option key={idx} value={idx}>{label} ({daySummary(winsForWeekday(idx))})</option>
                ))}
              </select>
            </div>

            {/* Fermeture de cette date précise */}
            <div className="mt-4 pt-4 border-t border-[#F8F4EF]">
              <p className="text-xs font-semibold text-[#3B312D]/70 mb-1 flex items-center gap-1.5"><Ban size={13} className="text-[#C98F79]" />Ce {editDay.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} uniquement</p>
              {editClosure ? (
                <button onClick={() => delClosure(editClosure.id)} disabled={busyHours} className="text-sm px-3 py-2 rounded-lg bg-[#AAB7A0]/15 text-[#3B312D] hover:bg-[#AAB7A0]/25 disabled:opacity-50">Rouvrir cette date</button>
              ) : (
                <button onClick={() => addClosure(editDay.date)} disabled={busyHours} className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">Fermer cette date (congé, exception)</button>
              )}
              <p className="text-[11px] text-[#3B312D]/40 mt-1">Ferme uniquement ce jour précis, sans toucher aux horaires récurrents.</p>
            </div>

            <button onClick={() => setEditDay(null)} className="w-full mt-5 px-4 py-2.5 bg-[#3B312D] text-white text-sm rounded-lg font-medium">Terminé</button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">Horaires type (suggestions)</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={18} /></button>
            </div>
            <p className="text-xs text-[#3B312D]/50 mb-4">Ces horaires servent de <strong>suggestions</strong> quand vous ouvrez un jour dans l'agenda. Ils ne ferment ni n'ouvrent rien tout seuls — vous appliquez une suggestion d'un clic sur chaque jour.</p>
            {loadingSettings ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C98F79]" /></div> : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#3B312D]/60">Jours habituellement ouverts</label>
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
