'use client';
import { CalendarClock } from 'lucide-react';
import { PLANITY_URL } from '@/lib/config';

export default function PlanityFloat() {
  return (
    <a href={PLANITY_URL} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-24 lg:bottom-6 left-4 lg:left-6 z-40 flex items-center gap-2 px-4 py-3 bg-white text-[#3B312D] rounded-full shadow-lg hover:shadow-xl transition-all border border-[#C98F79]/20 text-sm font-medium">
      <CalendarClock size={17} className="text-[#C98F79]" />
      <span className="hidden sm:inline">Réserver via Planity</span>
      <span className="sm:hidden">Planity</span>
    </a>
  );
}
