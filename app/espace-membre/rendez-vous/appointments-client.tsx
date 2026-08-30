'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Loader2, ArrowLeft, X, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AppointmentsClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ apt: any; type: 'cancel' | 'reschedule' } | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => fetch('/api/member/dashboard').then(r => r.json()).then(d => { setAppointments(d?.appointments ?? []); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => { if (status === 'unauthenticated') router.replace('/connexion'); }, [status, router]);
  useEffect(() => { if (status === 'authenticated') load(); }, [status]);

  const submit = async () => {
    if (!modal) return;
    setSending(true);
    try {
      const res = await fetch('/api/member/appointment-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId: modal.apt.id, type: modal.type, note }) });
      if (res.ok) { toast.success('Votre demande a été transmise. Nous revenons vers vous rapidement.'); setModal(null); setNote(''); load(); }
      else { const e = await res.json(); toast.error(e?.error ?? 'Erreur'); }
    } catch { toast.error('Erreur'); }
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/espace-membre" className="inline-flex items-center gap-2 text-[#C98F79] text-sm font-medium mb-6 hover:underline"><ArrowLeft size={16} />Retour</Link>
      <h1 className="font-playfair text-3xl font-bold text-[#3B312D] mb-8">Mes Rendez-vous</h1>
      {(appointments ?? []).length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <Calendar size={48} className="text-[#AAB7A0] mx-auto mb-4" />
          <p className="text-[#3B312D]/60">Aucun rendez-vous pour le moment</p>
          <Link href="/rendez-vous" className="inline-block mt-4 px-6 py-3 bg-[#C98F79] text-white font-medium rounded-lg">Prendre rendez-vous</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(appointments ?? []).map((apt: any) => {
            const upcoming = apt?.date && new Date(apt.date).getTime() > Date.now() && !['CANCELLED', 'COMPLETED'].includes(apt?.status);
            return (
              <div key={apt?.id ?? ''} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-playfair text-lg font-semibold text-[#3B312D]">{apt?.serviceType ?? ''}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#3B312D]/60 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={14} />{apt?.date ? new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{apt?.date ? new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      <span className="flex items-center gap-1"><User size={14} />{apt?.therapist ?? 'Lamyae'}</span>
                    </div>
                    {(apt?.creditUsed ?? 0) > 0 && <p className="text-xs text-[#AAB7A0] mt-1">{apt.creditUsed} crédit(s) utilisé(s)</p>}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${apt?.status === 'CONFIRMED' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : apt?.status === 'COMPLETED' ? 'bg-[#C98F79]/20 text-[#C98F79]' : apt?.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {apt?.status === 'CONFIRMED' ? 'Confirmé' : apt?.status === 'COMPLETED' ? 'Terminé' : apt?.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                  </span>
                </div>
                {apt?.clientRequest ? (
                  <p className="mt-3 text-xs text-[#C98F79] bg-[#C98F79]/10 rounded-lg px-3 py-2">Demande de {apt.clientRequest === 'cancel' ? 'annulation' : 'report'} envoyée — en cours de traitement.</p>
                ) : upcoming ? (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { setModal({ apt, type: 'reschedule' }); setNote(''); }} className="text-xs px-3 py-2 rounded-lg bg-[#F8F4EF] text-[#3B312D] flex items-center gap-1.5"><CalendarClock size={13} />Demander un report</button>
                    <button onClick={() => { setModal({ apt, type: 'cancel' }); setNote(''); }} className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-500 flex items-center gap-1.5"><X size={13} />Annuler</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">{modal.type === 'cancel' ? 'Demander l\'annulation' : 'Demander un report'}</h3>
            <p className="text-sm text-[#3B312D]/60 mt-1">{modal.apt.serviceType} · {new Date(modal.apt.date).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={modal.type === 'reschedule' ? 'Vos disponibilités souhaitées…' : 'Un mot (facultatif)…'}
              className="w-full mt-4 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm rounded-lg bg-[#F8F4EF] text-[#3B312D]">Retour</button>
              <button onClick={submit} disabled={sending} className="flex-1 py-2.5 text-sm rounded-lg bg-[#C98F79] text-white font-medium disabled:opacity-50">{sending ? 'Envoi…' : 'Envoyer la demande'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
