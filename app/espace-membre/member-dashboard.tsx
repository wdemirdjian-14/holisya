'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Calendar, CreditCard, Gift, ArrowRight, Crown, Send, Loader2, RefreshCw, Play, Award, Share2, Copy, Smile, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PushToggle from '@/components/push-toggle';

export default function MemberDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [wellness, setWellness] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMsg, setTransferMsg] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [newMood, setNewMood] = useState(4);
  const [newNote, setNewNote] = useState('');
  const [savingEntry, setSavingEntry] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion');
  }, [status, router]);

  const loadData = () => {
    fetch('/api/member/dashboard').then(r => r.json()).then(d => {
      setProfile(d?.profile ?? null);
      setAppointments(d?.appointments ?? []);
      setGiftCards(d?.giftCards ?? []);
      setSubscriptions(d?.subscriptions ?? []);
      setLoyalty(d?.loyalty ?? null);
      setWellness(d?.wellness ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    loadData();
  }, [status]);

  const referralLink = typeof window !== 'undefined' && profile?.referralCode ? `${window.location.origin}/inscription?ref=${profile.referralCode}` : '';

  const copyReferral = async () => {
    if (!referralLink) return;
    try { await navigator.clipboard.writeText(referralLink); toast.success('Lien de parrainage copié !'); } catch { toast.error('Impossible de copier'); }
  };

  const addWellness = async () => {
    setSavingEntry(true);
    try {
      const res = await fetch('/api/member/wellness', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood: newMood, note: newNote }) });
      if (res.ok) { toast.success('Ressenti enregistré'); setNewNote(''); setNewMood(4); loadData(); } else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSavingEntry(false);
  };

  const deleteWellness = async (id: string) => {
    const res = await fetch(`/api/member/wellness?id=${id}`, { method: 'DELETE' });
    if (res.ok) loadData();
  };

  const handleTransfer = async () => {
    if (!transferEmail || !transferAmount) { toast.error('Champs requis'); return; }
    setTransferLoading(true);
    try {
      const res = await fetch('/api/member/transfer-credits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: transferEmail, amount: parseInt(transferAmount), message: transferMsg }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Crédits transférés !'); setShowTransfer(false); setTransferEmail(''); setTransferAmount(''); setTransferMsg(''); setProfile((p: any) => ({ ...(p ?? {}), credits: (p?.credits ?? 0) - parseInt(transferAmount) })); }
      else toast.error(data?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setTransferLoading(false);
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>;
  if (!session?.user) return null;

  const nextAppointment = (appointments ?? [])
    .filter((apt: any) => apt?.status !== 'CANCELLED' && apt?.date && new Date(apt.date).getTime() >= Date.now())
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#3B312D]">Bonjour, {profile?.firstName ?? session.user?.name?.split(' ')?.[0] ?? ''}</h1>
          <p className="text-[#3B312D]/60 mt-1">Bienvenue dans votre espace bien-être</p>
        </div>
        <PushToggle />
      </motion.div>

      {/* Next Appointment */}
      {nextAppointment && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="mt-6 bg-gradient-to-r from-[#C98F79] to-[#b87d68] rounded-xl p-6 shadow-sm text-white flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3"><Calendar size={22} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">Votre prochain rendez-vous</p>
              <p className="font-playfair text-xl font-semibold mt-0.5">{nextAppointment?.serviceType ?? ''}</p>
              <p className="text-sm opacity-90 mt-0.5">{new Date(nextAppointment.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {new Date(nextAppointment.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-white/20">
            {nextAppointment?.status === 'CONFIRMED' ? 'Confirmé' : 'En attente de confirmation'}
          </span>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 shadow-sm">
          <CreditCard size={20} className="text-[#C98F79]" />
          <p className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">{profile?.credits ?? 0}</p>
          <p className="text-sm text-[#3B312D]/60">Crédits disponibles</p>
          <button onClick={() => setShowTransfer(!showTransfer)} className="text-xs text-[#C98F79] mt-2 hover:underline flex items-center gap-1"><Send size={12} />Transférer</button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl p-5 shadow-sm">
          <Calendar size={20} className="text-[#AAB7A0]" />
          <p className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">{appointments?.length ?? 0}</p>
          <p className="text-sm text-[#3B312D]/60">Rendez-vous</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-5 shadow-sm">
          <Gift size={20} className="text-[#C98F79]" />
          <p className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">{giftCards?.length ?? 0}</p>
          <p className="text-sm text-[#3B312D]/60">Cartes cadeaux</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl p-5 shadow-sm">
          <Crown size={20} className="text-[#AAB7A0]" />
          <p className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">{subscriptions?.filter((s: any) => s?.status === 'ACTIVE')?.length ?? 0}</p>
          <p className="text-sm text-[#3B312D]/60">Abonnements actifs</p>
        </motion.div>
      </div>

      {/* Transfer Credits */}
      {showTransfer && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-xl p-6 shadow-sm mt-4">
          <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mb-4"><Send size={16} className="inline text-[#C98F79] mr-2" />Transférer des crédits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="email" value={transferEmail} onChange={(e: any) => setTransferEmail(e.target?.value ?? '')} placeholder="Email du destinataire"
              className="px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" />
            <input type="number" min={1} max={profile?.credits ?? 0} value={transferAmount} onChange={(e: any) => setTransferAmount(e.target?.value ?? '')} placeholder="Nombre de crédits"
              className="px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" />
            <input type="text" value={transferMsg} onChange={(e: any) => setTransferMsg(e.target?.value ?? '')} placeholder="Message (optionnel)"
              className="px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" />
          </div>
          <button onClick={handleTransfer} disabled={transferLoading} className="mt-4 px-5 py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg hover:bg-[#b87d68] disabled:opacity-50 flex items-center gap-2">
            {transferLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Transférer
          </button>
        </motion.div>
      )}

      {/* Fidélité + Parrainage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Programme fidélité */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Award size={20} className="text-[#C98F79]" /><h2 className="font-playfair text-lg font-semibold text-[#3B312D]">Fidélité</h2></div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#C98F79]/15 text-[#C98F79] font-medium">{loyalty?.current?.name ?? 'Découverte'}</span>
          </div>
          <p className="font-playfair text-3xl font-bold text-[#3B312D] mt-3">{loyalty?.points ?? 0} <span className="text-base font-normal text-[#3B312D]/50">points</span></p>
          {loyalty?.next ? (
            <>
              <div className="h-2 bg-[#F8F4EF] rounded-full overflow-hidden mt-3">
                <div className="h-full bg-[#C98F79]" style={{ width: `${Math.min(100, ((loyalty.points - loyalty.current.min) / (loyalty.next.min - loyalty.current.min)) * 100)}%` }} />
              </div>
              <p className="text-xs text-[#3B312D]/50 mt-2">Plus que <strong>{loyalty.toNext}</strong> points pour le palier <strong>{loyalty.next.name}</strong> — {loyalty.next.perk}</p>
            </>
          ) : <p className="text-xs text-[#AAB7A0] mt-2 font-medium">Palier maximum atteint — merci pour votre fidélité !</p>}
          <p className="text-[11px] text-[#3B312D]/40 mt-3">Vous gagnez 1 point par euro dépensé en institut. Vos avantages sont utilisables sur place.</p>
        </div>

        {/* Parrainage */}
        <div className="bg-gradient-to-br from-[#AAB7A0] to-[#96a58c] rounded-xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-2"><Share2 size={20} /><h2 className="font-playfair text-lg font-semibold">Parrainez vos proches</h2></div>
          <p className="text-sm text-white/80 mt-2">Offrez-leur un accueil privilégié et recevez <strong>{2} crédits</strong> dès leur premier soin.</p>
          <div className="flex items-center gap-2 mt-4">
            <input readOnly value={referralLink} className="flex-1 px-3 py-2.5 text-xs rounded-lg bg-white/15 text-white placeholder-white/50 truncate" />
            <button onClick={copyReferral} className="px-3 py-2.5 bg-white text-[#96a58c] rounded-lg flex items-center gap-1.5 text-sm font-medium whitespace-nowrap"><Copy size={14} />Copier</button>
          </div>
          {profile?.referralCode && <p className="text-xs text-white/70 mt-2">Votre code : <strong className="font-mono">{profile.referralCode}</strong></p>}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Prochains rendez-vous</h2>
          <Link href="/espace-membre/rendez-vous" className="text-sm text-[#C98F79] flex items-center gap-1 hover:underline">Tout voir <ArrowRight size={14} /></Link>
        </div>
        {(appointments ?? []).length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <Calendar size={32} className="text-[#AAB7A0] mx-auto mb-2" />
            <p className="text-[#3B312D]/60 text-sm">Aucun rendez-vous à venir</p>
            <Link href="/contact" className="inline-block mt-3 text-sm text-[#C98F79] hover:underline">Prendre rendez-vous</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(appointments ?? []).slice(0, 3).map((apt: any) => (
              <div key={apt?.id ?? ''} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#3B312D]">{apt?.serviceType ?? ''}</p>
                  <p className="text-sm text-[#3B312D]/60">{apt?.date ? new Date(apt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${apt?.status === 'CONFIRMED' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : apt?.status === 'COMPLETED' ? 'bg-[#C98F79]/20 text-[#C98F79]' : apt?.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                  {apt?.status === 'CONFIRMED' ? 'Confirmé' : apt?.status === 'COMPLETED' ? 'Terminé' : apt?.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gift Cards */}
      {(giftCards ?? []).length > 0 && (
        <div className="mt-8">
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-4">Mes cartes cadeaux</h2>
          <div className="space-y-3">
            {giftCards.map((gc: any) => (
              <div key={gc?.id ?? ''} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                <div>
                  <button onClick={() => { navigator.clipboard?.writeText(gc?.code ?? ''); toast.success('Code copié'); }}
                    className="font-mono text-sm font-semibold text-[#C98F79] hover:underline">{gc?.code ?? ''}</button>
                  <p className="text-xs text-[#3B312D]/60 mt-1">{gc?.amount ?? 0}€ • Restant {gc?.remainingAmount ?? 0}€ • Expire le {gc?.expiresAt ? new Date(gc.expiresAt).toLocaleDateString('fr-FR') : ''}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${gc?.status === 'ACTIVE' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : gc?.status === 'USED' ? 'bg-[#C98F79]/20 text-[#C98F79]' : 'bg-red-100 text-red-600'}`}>
                  {gc?.status === 'ACTIVE' ? 'Active' : gc?.status === 'USED' ? 'Utilisée' : gc?.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal bien-être */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1"><Smile size={20} className="text-[#C98F79]" /><h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Mon journal bien-être</h2></div>
        <p className="text-sm text-[#3B312D]/60 mb-4">Notez votre ressenti après chaque soin. Vos praticiennes pourront personnaliser vos prochains rituels.</p>
        <div className="bg-[#F8F4EF]/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-[#3B312D]/70">Comment vous sentez-vous ?</span>
            {[1, 2, 3, 4, 5].map((m) => (
              <button key={m} onClick={() => setNewMood(m)} className={`text-xl transition-transform ${newMood >= m ? 'scale-110' : 'opacity-30'}`} title={`${m}/5`}>
                {m <= 2 ? '😌' : m === 3 ? '🙂' : '😍'}
              </button>
            ))}
          </div>
          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} placeholder="Votre ressenti, votre énergie, ce que vous avez aimé…"
            className="w-full px-3 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-white resize-none text-[#3B312D]" />
          <button onClick={addWellness} disabled={savingEntry} className="mt-2 px-4 py-2 bg-[#C98F79] text-white text-sm font-medium rounded-lg disabled:opacity-50">{savingEntry ? 'Enregistrement…' : 'Ajouter à mon journal'}</button>
        </div>
        {(wellness ?? []).length > 0 && (
          <div className="mt-4 space-y-2">
            {wellness.map((w: any) => (
              <div key={w.id} className="flex items-start justify-between bg-[#F8F4EF]/40 rounded-lg px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{w.mood <= 2 ? '😌' : w.mood === 3 ? '🙂' : '😍'}</span>
                  <div>
                    {w.note && <p className="text-sm text-[#3B312D]">{w.note}</p>}
                    <p className="text-xs text-[#3B312D]/40 mt-0.5">{new Date(w.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <button onClick={() => deleteWellness(w.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-400" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rituels vidéo */}
      <Link href="/espace-membre/videos" className="block mt-8 bg-gradient-to-r from-[#3B312D] to-[#4a3d37] rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 rounded-full p-3"><Play size={22} /></div>
            <div>
              <p className="font-playfair text-lg font-semibold">Mes rituels vidéo</p>
              <p className="text-sm text-white/60 mt-0.5">Techniques d'auto-massage à pratiquer chez vous</p>
            </div>
          </div>
          <ArrowRight size={20} className="text-[#C98F79]" />
        </div>
      </Link>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link href="/espace-membre/profil" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
          <User size={20} className="text-[#C98F79]" />
          <p className="font-medium text-[#3B312D] mt-2">Mon Profil</p>
          <p className="text-xs text-[#3B312D]/60 mt-1">Modifier mes informations</p>
        </Link>
        <Link href="/cartes-cadeaux" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
          <Gift size={20} className="text-[#C98F79]" />
          <p className="font-medium text-[#3B312D] mt-2">Cartes Cadeaux</p>
          <p className="text-xs text-[#3B312D]/60 mt-1">Offrir un soin</p>
        </Link>
        <Link href="/abonnements" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
          <Crown size={20} className="text-[#C98F79]" />
          <p className="font-medium text-[#3B312D] mt-2">Abonnements</p>
          <p className="text-xs text-[#3B312D]/60 mt-1">Voir les formules</p>
        </Link>
      </div>
    </div>
  );
}
