'use client';
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, MessageSquare, Gift, Star, Check, X } from 'lucide-react';

const ICONS: Record<string, any> = { appointment: Calendar, message: MessageSquare, booking: Calendar, giftcard: Gift, review: Star, info: Bell };

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  return `il y a ${j} j`;
}

export default function NotificationBell({ tone = 'dark' }: { tone?: 'light' | 'dark' }) {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = () => fetch('/api/notifications').then((r) => r.json()).then((d) => { setItems(d?.notifications ?? []); setUnread(d?.unread ?? 0); }).catch(() => {});

  useEffect(() => {
    if (!session?.user) return;
    load();
    const t = setInterval(load, 45000);
    return () => clearInterval(t);
  }, [session?.user]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!session?.user) return null;

  const openItem = async (n: any) => {
    if (!n.read) { await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id }) }); setUnread((u) => Math.max(0, u - 1)); }
    setOpen(false);
    if (n.url) router.push(n.url);
  };

  const markAll = async () => {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    setUnread(0); setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={boxRef} className="relative">
      <button onClick={() => { setOpen(!open); if (!open) load(); }} className={`relative p-2 rounded-lg transition-colors ${tone === 'light' ? 'text-white hover:bg-white/10' : 'text-[#3B312D] hover:bg-[#C98F79]/10'}`} aria-label="Notifications">
        <Bell size={20} />
        {unread > 0 && <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C98F79] text-white text-[10px] font-bold flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-[#F8F4EF] overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F8F4EF]">
            <p className="font-playfair text-sm font-semibold text-[#3B312D]">Notifications</p>
            <div className="flex items-center gap-2">
              {unread > 0 && <button onClick={markAll} className="text-[11px] text-[#C98F79] hover:underline flex items-center gap-1"><Check size={12} />Tout lire</button>}
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-[#F8F4EF]"><X size={14} className="text-[#3B312D]/50" /></button>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-sm text-[#3B312D]/40 py-8">Aucune notification</p>
            ) : items.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <button key={n.id} onClick={() => openItem(n)} className={`w-full text-left px-4 py-3 flex gap-3 border-b border-[#F8F4EF] last:border-0 hover:bg-[#F8F4EF]/50 ${!n.read ? 'bg-[#C98F79]/5' : ''}`}>
                  <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!n.read ? 'bg-[#C98F79]/15 text-[#C98F79]' : 'bg-[#F8F4EF] text-[#3B312D]/40'}`}><Icon size={15} /></div>
                  <div className="min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-[#3B312D]' : 'text-[#3B312D]/80'}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-[#3B312D]/60 mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-[#3B312D]/40 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="ml-auto mt-1 w-2 h-2 rounded-full bg-[#C98F79] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
