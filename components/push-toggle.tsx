'use client';
import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const ok = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setSupported(ok);
    if (!ok) return;
    fetch('/api/push/vapid').then((r) => r.json()).then((d) => setAvailable(!!d?.enabled)).catch(() => setAvailable(false));
    navigator.serviceWorker.ready.then((reg) => reg.pushManager.getSubscription()).then((sub) => setEnabled(!!sub)).catch(() => {});
  }, []);

  const enable = async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { toast.error('Notifications refusées'); setLoading(false); return; }
      const { publicKey } = await fetch('/api/push/vapid').then((r) => r.json());
      if (!publicKey) { toast.error('Notifications indisponibles'); setLoading(false); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      const res = await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
      if (res.ok) { setEnabled(true); toast.success('Notifications activées'); } else toast.error('Erreur');
    } catch (e) { toast.error('Impossible d\'activer'); }
    setLoading(false);
  };

  const disable = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) { await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe(); }
      setEnabled(false); toast.success('Notifications désactivées');
    } catch { toast.error('Erreur'); }
    setLoading(false);
  };

  if (!supported || !available) return null;

  return (
    <button onClick={enabled ? disable : enable} disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${enabled ? 'bg-[#F8F4EF] text-[#3B312D]' : 'bg-[#C98F79] text-white'}`}>
      {loading ? <Loader2 size={15} className="animate-spin" /> : enabled ? <BellOff size={15} /> : <Bell size={15} />}
      {enabled ? 'Désactiver les notifications' : 'Activer les notifications'}
    </button>
  );
}
