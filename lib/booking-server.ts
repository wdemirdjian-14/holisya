import { prisma } from '@/lib/db';
import { generateDaySlots, mondayIndex, dateStrToLocal, localDateStr, toMinutes } from '@/lib/booking';

export async function getBookingSettings() {
  return prisma.bookingSettings.upsert({ where: { id: 'global' }, update: {}, create: { id: 'global' } });
}

async function busyForDay(dayStr: string) {
  const start = dateStrToLocal(dayStr, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const appts = await prisma.appointment.findMany({
    where: { status: { in: ['PENDING', 'CONFIRMED'] }, date: { gte: start, lt: end } },
    select: { date: true, duration: true },
  });
  return appts.map((a) => {
    const d = new Date(a.date);
    const startMin = d.getHours() * 60 + d.getMinutes();
    return { startMin, endMin: startMin + (a.duration || 60) };
  });
}

export async function getSlotsForDate(serviceId: string, dateStr: string): Promise<string[]> {
  const settings = await getBookingSettings();
  if (!settings.onlineBookingEnabled) return [];
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) return [];

  const dayDate = dateStrToLocal(dateStr, 0);
  const weekday = mondayIndex(dayDate);
  const windows = await prisma.availabilityWindow.findMany({ where: { weekday }, orderBy: { startTime: 'asc' } });
  const closure = await prisma.availabilityClosure.findUnique({ where: { date: dayDate } }).catch(() => null);

  const busy = await busyForDay(dateStr);

  return generateDaySlots({
    dateStr,
    durationMin: service.duration || 60,
    windows: windows.map((w) => ({ startTime: w.startTime, endTime: w.endTime })),
    busy,
    granularityMin: settings.slotGranularityMin,
    breakMinutes: settings.breakMinutes,
    minNoticeHours: settings.minNoticeHours,
    now: new Date(),
    isClosed: !!closure,
    maxAdvanceDays: settings.maxAdvanceDays,
  });
}

// Jours du mois ayant au moins un créneau (pour marquer le calendrier).
export async function getAvailableDaysInMonth(serviceId: string, year: number, month: number): Promise<string[]> {
  const settings = await getBookingSettings();
  if (!settings.onlineBookingEnabled) return [];
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) return [];

  const windowsAll = await prisma.availabilityWindow.findMany();
  const byWeekday: Record<number, { startTime: string; endTime: string }[]> = {};
  windowsAll.forEach((w) => { (byWeekday[w.weekday] ||= []).push({ startTime: w.startTime, endTime: w.endTime }); });
  const closures = await prisma.availabilityClosure.findMany();
  const closedSet = new Set(closures.map((c) => localDateStr(new Date(c.date))));

  const now = new Date();
  const days: string[] = [];
  const last = new Date(year, month, 0).getDate(); // month is 1-based here
  for (let d = 1; d <= last; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayDate = dateStrToLocal(dateStr, 0);
    const weekday = mondayIndex(dayDate);
    const windows = byWeekday[weekday] || [];
    if (!windows.length || closedSet.has(dateStr)) continue;
    const busy = await busyForDay(dateStr);
    const slots = generateDaySlots({
      dateStr, durationMin: service.duration || 60, windows, busy,
      granularityMin: settings.slotGranularityMin, breakMinutes: settings.breakMinutes,
      minNoticeHours: settings.minNoticeHours, now, isClosed: false, maxAdvanceDays: settings.maxAdvanceDays,
    });
    if (slots.length) days.push(dateStr);
  }
  return days;
}
