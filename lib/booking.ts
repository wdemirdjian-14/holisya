// Moteur de disponibilités façon Planity. Le process tourne en TZ Europe/Paris
// (PM2 ecosystem), donc getHours()/new Date(y,m,d,h,mn) sont en heure de Paris.

export function toMinutes(hhmm: string): number {
  const [h, m] = (hhmm || '0:0').split(':').map((x) => parseInt(x));
  return (h || 0) * 60 + (m || 0);
}

export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// JS getDay: 0=dimanche..6=samedi → 0=lundi..6=dimanche
export function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function dateStrToLocal(dateStr: string, minutesOfDay = 0): Date {
  const [y, m, d] = dateStr.split('-').map((x) => parseInt(x));
  const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  dt.setMinutes(minutesOfDay);
  return dt;
}

export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Window = { startTime: string; endTime: string };
type Busy = { startMin: number; endMin: number };

export function generateDaySlots(opts: {
  dateStr: string;
  durationMin: number;
  windows: Window[];         // fenêtres du jour de la semaine
  busy: Busy[];              // RDV existants ce jour (minutes locales)
  granularityMin: number;
  breakMinutes: number;
  minNoticeHours: number;
  now: Date;
  isClosed: boolean;
  maxAdvanceDays: number;
}): string[] {
  const { dateStr, durationMin, windows, busy, granularityMin, breakMinutes, minNoticeHours, now, isClosed, maxAdvanceDays } = opts;
  if (isClosed || !windows.length || durationMin <= 0) return [];

  const dayStart = dateStrToLocal(dateStr, 0);
  const todayStr = localDateStr(now);
  const isToday = dateStr === todayStr;

  // Bornes passé / avance max
  const diffDays = Math.floor((dayStart.getTime() - dateStrToLocal(todayStr, 0).getTime()) / 86400000);
  if (diffDays < 0 || diffDays > maxAdvanceDays) return [];

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const earliest = isToday ? nowMin + minNoticeHours * 60 : -1;

  const slots: string[] = [];
  for (const w of windows) {
    const ws = toMinutes(w.startTime);
    const we = toMinutes(w.endTime);
    for (let s = ws; s + durationMin <= we; s += granularityMin) {
      if (s < earliest) continue;
      const e = s + durationMin;
      // Chevauchement avec un RDV existant (+ pause de part et d'autre)
      const conflict = busy.some((b) => s < b.endMin + breakMinutes && e + breakMinutes > b.startMin);
      if (!conflict) slots.push(minutesToHHMM(s));
    }
  }
  return Array.from(new Set(slots)).sort();
}
