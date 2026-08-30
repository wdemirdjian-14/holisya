'use client';
import { useEffect, useState } from 'react';
import { X, Loader2, Calendar, Euro, Gift, Crown, Mail, Save, Phone, Award, Smile } from 'lucide-react';
import { toast } from 'sonner';

const PAY_LABEL: Record<string, string> = { CASH: 'Espèces', CARD: 'CB', GIFT_CARD: 'Carte cadeau' };

export default function ClientDetail({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/client?id=${clientId}`).then((r) => r.json()).then((d) => {
      setData(d); setNotes(d?.client?.privateNotes ?? ''); setLoading(false);
    }).catch(() => setLoading(false));
  }, [clientId]);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch('/api/admin/client', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: clientId, privateNotes: notes }) });
      if (res.ok) toast.success('Notes enregistrées'); else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSavingNotes(false);
  };

  const c = data?.client;
  const stats = data?.stats;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#F8F4EF] w-full sm:max-w-2xl sm:rounded-2xl min-h-full sm:min-h-0 sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-[#F8F4EF] z-10">
          <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">Fiche client</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>
        ) : !c ? (
          <p className="text-center text-[#3B312D]/40 py-20">Client introuvable</p>
        ) : (
          <div className="p-5 space-y-5">
            {/* En-tête */}
            <div className="bg-white rounded-xl p-5">
              <p className="font-playfair text-xl font-semibold text-[#3B312D]">{c.firstName} {c.lastName}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#3B312D]/60">
                <span className="flex items-center gap-1"><Mail size={13} />{c.email}</span>
                {c.phone && <span className="flex items-center gap-1"><Phone size={13} />{c.phone}</span>}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <Stat label="Dépensé" value={`${(stats?.totalSpent ?? 0).toFixed(0)}€`} />
                <Stat label="Soins réalisés" value={stats?.completedCount ?? 0} />
                <Stat label="Crédits" value={c.credits ?? 0} />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#3B312D]/60">
                {stats?.lastVisit && <span>Dernière visite : {new Date(stats.lastVisit).toLocaleDateString('fr-FR')}</span>}
                <span className="flex items-center gap-1"><Award size={12} className="text-[#C98F79]" />{c.loyaltyPoints ?? 0} points fidélité</span>
              </div>
            </div>

            {/* Notes privées */}
            <div className="bg-white rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[#3B312D]">Notes privées</h4>
                <button onClick={saveNotes} disabled={savingNotes} className="text-xs px-3 py-1.5 bg-[#C98F79] text-white rounded-lg flex items-center gap-1 disabled:opacity-50"><Save size={12} />Enregistrer</button>
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Préférences, allergies, remarques… (visibles par vous uniquement)"
                className="w-full px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" />
            </div>

            {/* Rendez-vous */}
            <Section icon={Calendar} title={`Rendez-vous (${c.appointments?.length ?? 0})`}>
              {(c.appointments ?? []).length === 0 ? <Empty /> : (c.appointments ?? []).slice(0, 15).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#F8F4EF] last:border-0 text-sm">
                  <div>
                    <p className="text-[#3B312D]">{a.serviceType || 'Soin'}</p>
                    <p className="text-xs text-[#3B312D]/50">{new Date(a.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={a.status} />
                    {a.payments?.length > 0 && <p className="text-xs text-[#AAB7A0] mt-1">{a.payments.reduce((s: number, p: any) => s + p.amount, 0)}€ · {a.payments.map((p: any) => PAY_LABEL[p.method]).join(', ')}</p>}
                  </div>
                </div>
              ))}
            </Section>

            {/* Cartes cadeaux */}
            <Section icon={Gift} title={`Cartes cadeaux achetées (${c.giftCardsPurchased?.length ?? 0})`}>
              {(c.giftCardsPurchased ?? []).length === 0 ? <Empty /> : (c.giftCardsPurchased ?? []).map((g: any) => (
                <div key={g.id} className="flex items-center justify-between py-2 border-b border-[#F8F4EF] last:border-0 text-sm">
                  <span className="font-mono text-xs text-[#3B312D]">{g.code}</span>
                  <span className="text-[#3B312D]/60">{g.remainingAmount}€ / {g.amount}€</span>
                </div>
              ))}
            </Section>

            {/* Abonnements */}
            {(c.subscriptions ?? []).length > 0 && (
              <Section icon={Crown} title="Abonnements">
                {c.subscriptions.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#F8F4EF] last:border-0 text-sm">
                    <span className="text-[#3B312D]">{s.planName}</span>
                    <span className="text-[#3B312D]/60">{s.creditsRemaining} crédits · {s.status}</span>
                  </div>
                ))}
              </Section>
            )}

            {/* Journal bien-être */}
            {(data?.wellness ?? []).length > 0 && (
              <Section icon={Smile} title={`Journal bien-être (${data.wellness.length})`}>
                {data.wellness.map((w: any) => (
                  <div key={w.id} className="flex items-start gap-3 py-2 border-b border-[#F8F4EF] last:border-0 text-sm">
                    <span className="text-lg">{w.mood <= 2 ? '😌' : w.mood === 3 ? '🙂' : '😍'}</span>
                    <div>
                      {w.note && <p className="text-[#3B312D]">{w.note}</p>}
                      <p className="text-xs text-[#3B312D]/40">{new Date(w.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Emails reçus */}
            <Section icon={Mail} title={`Emails reçus (${data?.emailLogs?.length ?? 0})`}>
              {(data?.emailLogs ?? []).length === 0 ? <Empty /> : (data.emailLogs ?? []).slice(0, 10).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-[#F8F4EF] last:border-0 text-sm">
                  <span className="text-[#3B312D] truncate mr-2">{e.subject}</span>
                  <span className="text-xs text-[#3B312D]/50 whitespace-nowrap">{new Date(e.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              ))}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-[#F8F4EF] rounded-lg p-3 text-center">
      <p className="font-playfair text-lg font-bold text-[#C98F79]">{value}</p>
      <p className="text-[10px] text-[#3B312D]/50 mt-0.5">{label}</p>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5">
      <h4 className="text-sm font-semibold text-[#3B312D] mb-2 flex items-center gap-2"><Icon size={15} className="text-[#C98F79]" />{title}</h4>
      <div>{children}</div>
    </div>
  );
}

function Empty() {
  return <p className="text-xs text-[#3B312D]/40 py-2">Aucun élément</p>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-[#AAB7A0]/20 text-[#AAB7A0]', COMPLETED: 'bg-[#C98F79]/20 text-[#C98F79]',
    CANCELLED: 'bg-red-100 text-red-600', PENDING: 'bg-yellow-100 text-yellow-700',
  };
  const label: Record<string, string> = { CONFIRMED: 'Confirmé', COMPLETED: 'Terminé', CANCELLED: 'Annulé', PENDING: 'En attente' };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{label[status] ?? status}</span>;
}
