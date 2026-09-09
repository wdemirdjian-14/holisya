'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SubscriptionsToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/booking-settings')
      .then((r) => r.json())
      .then((d) => setEnabled(!!d?.settings?.subscriptionsEnabled))
      .catch(() => setEnabled(false));
  }, []);

  const toggle = async () => {
    if (enabled === null) return;
    const next = !enabled;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/booking-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionsEnabled: next }),
      });
      if (r.ok) {
        setEnabled(next);
        toast.success(next ? 'Abonnements affichés sur le site' : 'Abonnements masqués du site');
      } else toast.error('Erreur');
    } catch {
      toast.error('Erreur');
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-[#3B312D]">Afficher les abonnements sur le site public</p>
        <p className="text-xs text-[#3B312D]/50 mt-1">
          {enabled === null
            ? 'Chargement…'
            : enabled
              ? 'La page Abonnements et le lien de navigation sont visibles par les clientes.'
              : 'Les abonnements sont masqués (page inaccessible, lien retiré du menu). Le reste du site fonctionne normalement.'}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={saving || enabled === null}
        aria-pressed={!!enabled}
        className={`relative inline-flex h-7 w-12 flex-none items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? 'bg-[#AAB7A0]' : 'bg-[#3B312D]/20'}`}>
        {saving
          ? <Loader2 size={14} className="animate-spin text-white mx-auto" />
          : <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />}
      </button>
    </div>
  );
}
