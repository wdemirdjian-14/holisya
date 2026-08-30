'use client';
import { useMemo } from 'react';
import { Euro, Banknote, CreditCard, Gift, Calendar } from 'lucide-react';

const PAY_LABEL: Record<string, string> = { CASH: 'Espèces', CARD: 'Carte bleue', GIFT_CARD: 'Carte cadeau' };

function isToday(d: string | Date): boolean {
  const date = new Date(d);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

export default function CaisseTab({ appointments }: { appointments: any[] }) {
  const { totals, total, todayAppts, payments } = useMemo(() => {
    const allPayments = (appointments ?? []).flatMap((a: any) => (a.payments ?? []).map((p: any) => ({ ...p, appt: a })));
    const payments = allPayments.filter((p: any) => isToday(p.createdAt));
    const totals: Record<string, number> = { CASH: 0, CARD: 0, GIFT_CARD: 0 };
    payments.forEach((p: any) => { totals[p.method] = (totals[p.method] ?? 0) + (p.amount ?? 0); });
    const total = payments.reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
    const todayAppts = (appointments ?? []).filter((a: any) => a.date && isToday(a.date)).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { totals, total, todayAppts, payments };
  }, [appointments]);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Caisse du jour</h2>
        <p className="text-sm text-[#3B312D]/50 mt-1 capitalize">{today}</p>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#3B312D] rounded-xl p-5 text-white col-span-2 lg:col-span-1">
          <Euro size={20} className="text-[#C98F79]" />
          <p className="font-playfair text-3xl font-bold mt-2">{total.toFixed(0)}€</p>
          <p className="text-sm text-white/60">Total encaissé</p>
        </div>
        <TotalCard icon={Banknote} label="Espèces" value={totals.CASH} />
        <TotalCard icon={CreditCard} label="Carte bleue" value={totals.CARD} />
        <TotalCard icon={Gift} label="Cartes cadeaux" value={totals.GIFT_CARD} />
      </div>

      {/* Rendez-vous du jour */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#3B312D] mb-3 flex items-center gap-2"><Calendar size={15} className="text-[#C98F79]" />Rendez-vous du jour ({todayAppts.length})</h3>
        {todayAppts.length === 0 ? (
          <p className="text-sm text-[#3B312D]/40 py-4 text-center">Aucun rendez-vous aujourd'hui</p>
        ) : (
          <div className="divide-y divide-[#F8F4EF]">
            {todayAppts.map((a: any) => {
              const paid = (a.payments ?? []).reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
              return (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-[#3B312D]">{new Date(a.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {a.serviceType || 'Soin'}</p>
                    <p className="text-xs text-[#3B312D]/50">{a.user?.firstName ?? ''} {a.user?.lastName ?? ''}</p>
                  </div>
                  <div className="text-right">
                    {paid > 0 ? <span className="text-sm font-semibold text-[#AAB7A0]">{paid}€ encaissé</span> : <span className="text-xs text-[#3B312D]/40">Non encaissé</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Détail des encaissements */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3B312D] mb-3">Encaissements du jour ({payments.length})</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-[#3B312D]/40 py-4 text-center">Aucun encaissement enregistré aujourd'hui</p>
        ) : (
          <div className="divide-y divide-[#F8F4EF]">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <span className="text-[#3B312D]">{p.appt?.user?.firstName ?? ''} {p.appt?.user?.lastName ?? ''}</span>
                  <span className="text-[#3B312D]/40 ml-2 text-xs">{PAY_LABEL[p.method]}{p.giftCardCode ? ` · ${p.giftCardCode}` : ''}</span>
                </div>
                <span className="font-semibold text-[#3B312D]">{p.amount}€</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TotalCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <Icon size={18} className="text-[#AAB7A0]" />
      <p className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">{(value ?? 0).toFixed(0)}€</p>
      <p className="text-xs text-[#3B312D]/60">{label}</p>
    </div>
  );
}
