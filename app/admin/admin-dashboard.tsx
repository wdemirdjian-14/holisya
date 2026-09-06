'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, Gift, Crown, Tag, FileText, MessageSquare, BarChart3, Loader2, Euro, TrendingUp, Download, Bell, Search, Plus, Edit, Trash2, X, Check, Eye, Send, Minus, ShoppingBag, Image as ImageIcon, Mail, Type, Video, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import ClientPicker from './client-picker';
import GiftCardPicker from './giftcard-picker';
import RichTextEditor from './rich-text-editor';

const AdminCharts = dynamic(() => import('./admin-charts'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });
const EmailsTab = dynamic(() => import('./emails-tab'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });
const GalleryTab = dynamic(() => import('./gallery-tab'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });
const ClientDetail = dynamic(() => import('./client-detail'), { ssr: false });
const CaisseTab = dynamic(() => import('./caisse-tab'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });
const VideosTab = dynamic(() => import('./videos-tab'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });
const PlanityTasks = dynamic(() => import('./planity-tasks'), { ssr: false });
const BookingTab = dynamic(() => import('./booking-tab'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });
const SiteContentTab = dynamic(() => import('./site-content-tab'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });
const AgendaCalendar = dynamic(() => import('./agenda-calendar'), { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> });

const GIFT_CARD_STATUS_LABEL: Record<string, string> = { ACTIVE: 'Active', USED: 'Utilisée', PARTIALLY_USED: 'Partiellement utilisée', EXPIRED: 'Expirée' };
const GIFT_CARD_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-[#AAB7A0]/20 text-[#AAB7A0]',
  USED: 'bg-[#C98F79]/20 text-[#C98F79]',
  PARTIALLY_USED: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-red-100 text-red-600',
};

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Tab = 'overview' | 'caisse' | 'clients' | 'appointments' | 'booking' | 'giftcards' | 'subscriptions' | 'promos' | 'blog' | 'contacts' | 'testimonials' | 'services' | 'videos' | 'emails' | 'gallery' | 'content';

export default function AdminDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [creditAmount, setCreditAmount] = useState(1);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [appointmentsView, setAppointmentsView] = useState<'calendar' | 'list'>('calendar');
  const [giftCardSearch, setGiftCardSearch] = useState('');
  const [contactReplies, setContactReplies] = useState<Record<string, string>>({});
  const [importingContacts, setImportingContacts] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [deductAmount, setDeductAmount] = useState('');
  const [detailClientId, setDetailClientId] = useState<string | null>(null);

  const importContacts = async (file: File | undefined) => {
    if (!file) return;
    setImportingContacts(true);
    setImportResult(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/contacts/import', { method: 'POST', body });
      const data = await res.json();
      if (res.ok) { setImportResult(data); toast.success(`${data.created} compte(s) créé(s)`); refreshData(); }
      else toast.error(data?.error ?? 'Erreur import');
    } catch { toast.error('Erreur import'); }
    setImportingContacts(false);
  };

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/connexion');
    if (status === 'authenticated' && !isAdmin) router.replace('/espace-membre');
  }, [status, isAdmin, router]);

  const refreshData = () => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => {
      setStats(d?.stats ?? null); setClients(d?.clients ?? []); setAppointments(d?.appointments ?? []);
      setGiftCards(d?.giftCards ?? []); setSubscriptions(d?.subscriptions ?? []);
      setPromos(d?.promos ?? []); setBlogPosts(d?.blogPosts ?? []);
      setContacts(d?.contacts ?? []); setTestimonials(d?.testimonials ?? []);
      setServices(d?.services ?? []);
    });
  };

  useEffect(() => {
    if (status !== 'authenticated' || !isAdmin) return;
    setLoading(true);
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => {
      setStats(d?.stats ?? null); setClients(d?.clients ?? []); setAppointments(d?.appointments ?? []);
      setGiftCards(d?.giftCards ?? []); setSubscriptions(d?.subscriptions ?? []);
      setPromos(d?.promos ?? []); setBlogPosts(d?.blogPosts ?? []);
      setContacts(d?.contacts ?? []); setTestimonials(d?.testimonials ?? []);
      setServices(d?.services ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [status, isAdmin]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setAppointmentsView('list');
    }
  }, []);

  const exportCSV = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/export?type=${type}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${type}_export.csv`; a.click();
      toast.success('Export téléchargé');
    } catch { toast.error('Erreur export'); }
  };

  const handleSave = async (endpoint: string, data: any, method = 'POST') => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/${endpoint}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (res.ok) { toast.success('Enregistré'); setShowModal(null); refreshData(); }
      else { const err = await res.json(); toast.error(err?.error ?? 'Erreur'); }
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const handleDelete = async (endpoint: string, id: string) => {
    if (!confirm('Confirmer la suppression ?')) return;
    try {
      const res = await fetch(`/api/admin/${endpoint}?id=${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Supprimé'); refreshData(); } else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
  };

  const handleCredits = async (userId: string, action: 'add' | 'remove') => {
    try {
      const res = await fetch('/api/admin/credits', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, amount: creditAmount, action }) });
      if (res.ok) { const d = await res.json(); toast.success(`Crédits mis à jour: ${d.credits}`); refreshData(); setShowModal(null); }
      else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
  };

  const uploadServicePhoto = async (serviceId: string, file: File | undefined) => {
    if (!serviceId || !file) return;
    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('serviceId', serviceId);
      const res = await fetch('/api/admin/services/upload', { method: 'POST', body });
      const data = await res.json();
      if (res.ok) { setModalData((prev: any) => ({ ...(prev ?? {}), imageUrl: data.imageUrl })); toast.success('Photo importée'); refreshData(); }
      else toast.error(data?.error ?? 'Erreur upload');
    } catch { toast.error('Erreur upload'); }
    setUploadingPhoto(false);
  };

  const removeServicePhoto = async (serviceId: string) => {
    if (!serviceId) return;
    setUploadingPhoto(true);
    try {
      const res = await fetch(`/api/admin/services/upload?serviceId=${serviceId}`, { method: 'DELETE' });
      if (res.ok) { setModalData((prev: any) => ({ ...(prev ?? {}), imageUrl: '' })); toast.success('Photo supprimée'); refreshData(); }
      else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setUploadingPhoto(false);
  };

  const uploadBlogPhoto = async (postId: string, file: File | undefined) => {
    if (!postId || !file) return;
    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('postId', postId);
      const res = await fetch('/api/admin/blog/upload', { method: 'POST', body });
      const data = await res.json();
      if (res.ok) { setModalData((prev: any) => ({ ...(prev ?? {}), imageUrl: data.imageUrl })); toast.success('Photo importée'); refreshData(); }
      else toast.error(data?.error ?? 'Erreur upload');
    } catch { toast.error('Erreur upload'); }
    setUploadingPhoto(false);
  };

  const removeBlogPhoto = async (postId: string) => {
    if (!postId) return;
    setUploadingPhoto(true);
    try {
      const res = await fetch(`/api/admin/blog/upload?postId=${postId}`, { method: 'DELETE' });
      if (res.ok) { setModalData((prev: any) => ({ ...(prev ?? {}), imageUrl: '' })); toast.success('Photo supprimée'); refreshData(); }
      else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setUploadingPhoto(false);
  };

  const [newPayment, setNewPayment] = useState<any>({ method: 'CASH', amount: '', giftCardCode: '' });

  const addPayment = async (appointmentId: string) => {
    if (!appointmentId || !newPayment?.amount) { toast.error('Montant requis'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newPayment, appointmentId }) });
      const data = await res.json();
      if (res.ok) {
        toast.success('Encaissement enregistré');
        setModalData((prev: any) => ({ ...(prev ?? {}), payments: [data.payment, ...(prev?.payments ?? [])] }));
        setNewPayment({ method: 'CASH', amount: '', giftCardCode: '' });
        refreshData();
      } else toast.error(data?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const deletePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payments?id=${id}`, { method: 'DELETE' });
      if (res.ok) { setModalData((prev: any) => ({ ...(prev ?? {}), payments: (prev?.payments ?? []).filter((p: any) => p?.id !== id) })); refreshData(); }
    } catch { toast.error('Erreur'); }
  };

  const createTestimonial = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modalData) });
      const data = await res.json();
      if (res.ok) {
        setShowModal(null); refreshData();
        if (data?.googleReviewUrl) {
          navigator.clipboard?.writeText(data.googleReviewUrl);
          toast.success('Témoignage enregistré — lien avis Google copié, à partager avec le client', { duration: 6000 });
        } else toast.success('Témoignage enregistré');
      } else toast.error(data?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const sendNotif = async (userId: string, message: string) => {
    try {
      await fetch('/api/admin/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, message }) });
      toast.success('Notification envoyée');
    } catch { toast.error('Erreur'); }
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>;
  if (!isAdmin) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'caisse', label: 'Caisse du jour', icon: Euro },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'booking', label: 'Réservation en ligne', icon: CalendarPlus },
    { id: 'giftcards', label: 'Cartes cadeaux', icon: Gift },
    { id: 'subscriptions', label: 'Abonnements', icon: Crown },
    { id: 'services', label: 'Services', icon: ShoppingBag },
    { id: 'promos', label: 'Codes promo', icon: Tag },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'contacts', label: 'Demandes', icon: MessageSquare },
    { id: 'testimonials', label: 'Témoignages', icon: BarChart3 },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'videos', label: 'Vidéos premium', icon: Video },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'content', label: 'Textes institutionnels', icon: Type },
  ];

  const filteredClients = (clients ?? []).filter((c: any) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (c?.firstName ?? '').toLowerCase().includes(s) || (c?.lastName ?? '').toLowerCase().includes(s) || (c?.email ?? '').toLowerCase().includes(s);
  });

  const filteredGiftCards = (giftCards ?? []).filter((gc: any) => {
    if (!giftCardSearch) return true;
    const s = giftCardSearch.toLowerCase();
    return (gc?.code ?? '').toLowerCase().includes(s) || (gc?.recipientName ?? '').toLowerCase().includes(s) || (gc?.purchasedBy?.email ?? '').toLowerCase().includes(s);
  });

  const moveAppointment = async (id: string, date: Date) => {
    try {
      const res = await fetch('/api/admin/appointments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, date: date.toISOString() }) });
      if (res.ok) { toast.success('Rendez-vous déplacé'); refreshData(); } else toast.error('Erreur lors du déplacement');
    } catch { toast.error('Erreur lors du déplacement'); }
  };

  const deductGiftCard = async (id: string) => {
    const value = parseFloat(deductAmount);
    if (!value || value <= 0) { toast.error('Montant invalide'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/giftcards', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, deductAmount: value }) });
      const data = await res.json();
      if (res.ok) { toast.success(`${value}€ décompté(s) — solde restant : ${data?.giftCard?.remainingAmount ?? 0}€`); setModalData(data.giftCard); setDeductAmount(''); refreshData(); }
      else toast.error(data?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#3B312D] mb-1 sm:mb-2">Administration</h1>
      <p className="text-sm text-[#3B312D]/60 mb-5 sm:mb-8">Tableau de bord Holisya</p>

      {/* Tabs */}
      <div className="sticky top-0 z-20 -mx-3 sm:mx-0 px-3 sm:px-0 py-2 mb-5 sm:mb-8 bg-[#F8F4EF]/95 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab: any) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${activeTab === tab.id ? 'bg-[#C98F79] text-white shadow-sm' : 'bg-white text-[#3B312D]/70 hover:bg-[#C98F79]/10'}`}>
                <Icon size={16} />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Prochains rendez-vous */}
          {(() => {
            const upcoming = (appointments ?? [])
              .filter((a: any) => a?.date && new Date(a.date).getTime() >= Date.now() && a?.status !== 'CANCELLED')
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-playfair text-xl font-semibold text-[#3B312D] flex items-center gap-2"><Calendar size={18} className="text-[#C98F79]" />Prochains rendez-vous</h2>
                  <span className="text-xs text-[#3B312D]/50">{upcoming.length}</span>
                </div>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-[#3B312D]/40 py-6 text-center">Aucun rendez-vous à venir</p>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-[#F8F4EF] -mx-1">
                    {upcoming.map((apt: any) => {
                      const d = new Date(apt.date);
                      const isPaid = (apt?.payments ?? []).length > 0;
                      return (
                        <button key={apt.id} onClick={() => { setModalData(apt); setShowModal('edit-appointment'); }}
                          className="w-full text-left px-1 py-3 hover:bg-[#F8F4EF]/50 rounded-lg transition-colors flex items-center gap-3">
                          <div className="flex-shrink-0 w-14 text-center">
                            <p className="text-[10px] uppercase text-[#3B312D]/40 leading-tight">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                            <p className="font-playfair text-lg font-bold text-[#C98F79] leading-tight">{d.getDate()}</p>
                            <p className="text-[10px] text-[#3B312D]/40 leading-tight">{d.toLocaleDateString('fr-FR', { month: 'short' })}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3B312D] truncate">{d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {apt?.serviceType || 'Soin'} <span className="text-xs font-normal text-[#3B312D]/40">({apt?.duration ?? 60} min)</span></p>
                            <p className="text-xs text-[#3B312D]/60 truncate">{apt?.user?.firstName ?? ''} {apt?.user?.lastName ?? ''}</p>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-1.5">
                            {isPaid && <Euro size={13} className="text-[#AAB7A0]" />}
                            {apt?.source === 'online' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#3B312D] text-white">En ligne</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${apt?.status === 'CONFIRMED' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : 'bg-yellow-100 text-yellow-700'}`}>{apt?.status === 'CONFIRMED' ? 'Confirmé' : 'À confirmer'}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          <PlanityTasks onChange={refreshData} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[{ label: 'CA encaissé (mois)', value: `${stats?.realRevenueThisMonth?.toFixed?.(0) ?? 0}€`, icon: Euro, color: 'text-[#C98F79]' },
              { label: 'CA encaissé (total)', value: `${stats?.realRevenue?.toFixed?.(0) ?? 0}€`, icon: TrendingUp, color: 'text-[#AAB7A0]' },
              { label: 'RDV ce mois', value: stats?.appointmentsThisMonth ?? 0, icon: Calendar, color: 'text-[#C98F79]' },
              { label: 'Clients total', value: stats?.totalClients ?? 0, icon: Users, color: 'text-[#AAB7A0]' },
            ].map((s: any, i: number) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
                  <Icon size={20} className={s.color} />
                  <p className="font-playfair text-xl sm:text-2xl font-bold text-[#3B312D] mt-2">{s.value}</p>
                  <p className="text-xs sm:text-sm text-[#3B312D]/60">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Ligne secondaire : soins populaires + clients inactifs + cartes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm lg:col-span-2">
              <p className="text-sm font-semibold text-[#3B312D] mb-3">Soins les plus demandés</p>
              {(stats?.topServices ?? []).length === 0 ? <p className="text-xs text-[#3B312D]/40">Aucune donnée</p> : (
                <div className="space-y-2">
                  {(stats?.topServices ?? []).map((s: any, i: number) => {
                    const max = stats?.topServices?.[0]?.count ?? 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-[#3B312D]/70 w-40 truncate">{s.name}</span>
                        <div className="flex-1 h-2 bg-[#F8F4EF] rounded-full overflow-hidden"><div className="h-full bg-[#C98F79]" style={{ width: `${(s.count / max) * 100}%` }} /></div>
                        <span className="text-xs font-medium text-[#3B312D] w-8 text-right">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <Gift size={18} className="text-[#AAB7A0]" />
                <p className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">{stats?.totalGiftCards ?? 0}</p>
                <p className="text-xs text-[#3B312D]/60">Cartes vendues</p>
              </div>
              <button onClick={() => setActiveTab('clients')} className="bg-white rounded-xl p-5 shadow-sm text-left hover:shadow-md transition-shadow">
                <Users size={18} className="text-[#C98F79]" />
                <p className="font-playfair text-2xl font-bold text-[#3B312D] mt-2">{stats?.inactiveClients ?? 0}</p>
                <p className="text-xs text-[#3B312D]/60">Clients inactifs (90j+) à relancer</p>
              </button>
            </div>
          </div>

          <AdminCharts stats={stats} />
          <div className="flex gap-3">
            <button onClick={() => exportCSV('clients')} className="px-4 py-2 bg-white text-[#3B312D] text-sm font-medium rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"><Download size={14} />Export Clients</button>
            <button onClick={() => exportCSV('appointments')} className="px-4 py-2 bg-white text-[#3B312D] text-sm font-medium rounded-lg shadow-sm hover:shadow-md flex items-center gap-2"><Download size={14} />Export RDV</button>
          </div>

          {/* Activité récente / notifications */}
          <div>
            <h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-4 flex items-center gap-2"><Bell size={18} className="text-[#C98F79]" />Activité récente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-[#3B312D] text-sm">Nouvelles demandes de contact</p>
                  {(contacts ?? []).filter((c: any) => c?.status === 'new').length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-[#C98F79] text-white rounded-full font-medium">{(contacts ?? []).filter((c: any) => c?.status === 'new').length}</span>
                  )}
                </div>
                {(contacts ?? []).filter((c: any) => c?.status === 'new').length === 0 ? (
                  <p className="text-xs text-[#3B312D]/40">Aucune nouvelle demande</p>
                ) : (
                  <div className="space-y-2">
                    {(contacts ?? []).filter((c: any) => c?.status === 'new').slice(0, 5).map((c: any) => (
                      <button key={c?.id} onClick={() => setActiveTab('contacts')} className="w-full text-left text-xs bg-[#F8F4EF]/60 rounded-lg px-3 py-2 hover:bg-[#F8F4EF]">
                        <span className="font-medium text-[#3B312D]">{c?.firstName ?? ''}</span> • {c?.phone ?? ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-[#3B312D] text-sm">Témoignages en attente</p>
                  {(testimonials ?? []).filter((t: any) => !t?.isApproved).length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-[#AAB7A0] text-white rounded-full font-medium">{(testimonials ?? []).filter((t: any) => !t?.isApproved).length}</span>
                  )}
                </div>
                {(testimonials ?? []).filter((t: any) => !t?.isApproved).length === 0 ? (
                  <p className="text-xs text-[#3B312D]/40">Aucun témoignage en attente</p>
                ) : (
                  <div className="space-y-2">
                    {(testimonials ?? []).filter((t: any) => !t?.isApproved).slice(0, 5).map((t: any) => (
                      <button key={t?.id} onClick={() => setActiveTab('testimonials')} className="w-full text-left text-xs bg-[#F8F4EF]/60 rounded-lg px-3 py-2 hover:bg-[#F8F4EF]">
                        <span className="font-medium text-[#3B312D]">{t?.name ?? ''}</span> — "{(t?.comment ?? '').slice(0, 60)}{(t?.comment ?? '').length > 60 ? '…' : ''}"
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
              <input type="text" value={searchTerm} onChange={(e: any) => setSearchTerm(e.target?.value ?? '')} placeholder="Rechercher un client..."
                className="w-full pl-10 pr-4 py-3 text-sm border border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 shadow-sm text-[#3B312D]" /></div>
            <label className={`px-4 py-3 bg-[#C98F79] text-white text-sm rounded-lg shadow-sm flex items-center gap-2 cursor-pointer ${importingContacts ? 'opacity-50 pointer-events-none' : ''}`}>
              <Plus size={14} />{importingContacts ? 'Import...' : 'Importer CSV/Excel'}
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" disabled={importingContacts} onChange={(e: any) => importContacts(e.target?.files?.[0])} />
            </label>
            <button onClick={() => exportCSV('clients')} className="px-4 py-3 bg-white text-[#3B312D] text-sm rounded-lg shadow-sm flex items-center gap-2"><Download size={14} />CSV</button>
          </div>
          {importResult && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 text-sm text-[#3B312D]">
              Import terminé : {importResult.total} ligne(s), {importResult.created} compte(s) créé(s) (email d'invitation envoyé), {importResult.existing} déjà existant(s).
              {importResult.errors?.length > 0 && (
                <ul className="mt-2 text-xs text-red-500 list-disc list-inside">{importResult.errors.slice(0, 10).map((e: string, i: number) => <li key={i}>{e}</li>)}</ul>
              )}
            </div>
          )}
          {/* Vue tableau (desktop) */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F8F4EF]">
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Téléphone</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Crédits</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Inscription</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {filteredClients.map((c: any) => (
                    <tr key={c?.id ?? ''} className="border-t border-[#F8F4EF] hover:bg-[#F8F4EF]/50 cursor-pointer" onClick={() => setDetailClientId(c?.id ?? null)}>
                      <td className="px-4 py-3 font-medium text-[#3B312D]">
                        {c?.firstName ?? ''} {c?.lastName ?? ''}
                        {c?.source === 'import' && c?.resetToken && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium align-middle">Invitation en attente</span>}
                      </td>
                      <td className="px-4 py-3 text-[#3B312D]/60">{c?.email ?? ''}</td>
                      <td className="px-4 py-3 text-[#3B312D]/60">{c?.phone ?? '-'}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#AAB7A0]/20 text-[#AAB7A0] rounded-full text-xs font-medium">{c?.credits ?? 0}</span></td>
                      <td className="px-4 py-3 text-[#3B312D]/60 text-xs">{c?.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : ''}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button onClick={() => setDetailClientId(c?.id ?? null)} className="p-1.5 rounded hover:bg-[#C98F79]/10" title="Voir la fiche"><Eye size={14} className="text-[#C98F79]" /></button>
                          <button onClick={() => { setCreditAmount(1); setModalData(c); setShowModal('manage-credits'); }} className="p-1.5 rounded hover:bg-[#AAB7A0]/10" title="Gérer crédits"><Euro size={14} className="text-[#AAB7A0]" /></button>
                          <button onClick={() => { setModalData({ ...c, notifMessage: '' }); setShowModal('notify-client'); }} className="p-1.5 rounded hover:bg-[#C98F79]/10" title="Notifier"><Bell size={14} className="text-[#C98F79]" /></button>
                          <button onClick={() => { setModalData(c); setShowModal('edit-client'); }} className="p-1.5 rounded hover:bg-[#C98F79]/10" title="Éditer"><Edit size={14} className="text-[#C98F79]" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vue cartes (mobile) */}
          <div className="md:hidden space-y-2">
            {filteredClients.map((c: any) => (
              <button key={c?.id ?? ''} onClick={() => setDetailClientId(c?.id ?? null)} className="w-full text-left bg-white rounded-xl shadow-sm p-4 active:scale-[0.99] transition-transform">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[#3B312D]">{c?.firstName ?? ''} {c?.lastName ?? ''}</p>
                  <span className="px-2 py-0.5 bg-[#AAB7A0]/20 text-[#AAB7A0] rounded-full text-xs font-medium">{c?.credits ?? 0} cr.</span>
                </div>
                <p className="text-xs text-[#3B312D]/60 mt-1 truncate">{c?.email ?? ''}</p>
                {c?.phone && <p className="text-xs text-[#3B312D]/50 mt-0.5">{c.phone}</p>}
                {c?.source === 'import' && c?.resetToken && <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Invitation en attente</span>}
              </button>
            ))}
            {filteredClients.length === 0 && <p className="text-center text-[#3B312D]/40 py-8 text-sm">Aucun client</p>}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Agenda des rendez-vous</h2>
            <div className="flex items-center gap-2">
              <div className="flex bg-white rounded-lg shadow-sm p-1">
                <button onClick={() => setAppointmentsView('calendar')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${appointmentsView === 'calendar' ? 'bg-[#C98F79] text-white' : 'text-[#3B312D]/60'}`}>Calendrier</button>
                <button onClick={() => setAppointmentsView('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${appointmentsView === 'list' ? 'bg-[#C98F79] text-white' : 'text-[#3B312D]/60'}`}>Liste</button>
              </div>
              <button onClick={() => { setModalData({ serviceType: '', therapist: 'Lamyae', date: '', userId: '', status: 'PENDING', duration: 60 }); setShowModal('add-appointment'); }}
                className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouveau</button>
            </div>
          </div>
          {appointmentsView === 'calendar' ? (
            <AgendaCalendar
              appointments={appointments ?? []}
              onSlotClick={(date: Date) => { setModalData({ serviceType: '', therapist: 'Lamyae', dateLocal: toLocalInputValue(date), userId: '', status: 'PENDING', duration: 60 }); setShowModal('add-appointment'); }}
              onAppointmentClick={(apt: any) => { setModalData(apt); setShowModal('edit-appointment'); }}
              onMoveAppointment={moveAppointment}
            />
          ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F8F4EF]">
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Soin</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {(appointments ?? []).map((apt: any) => (
                    <tr key={apt?.id ?? ''} className="border-t border-[#F8F4EF] hover:bg-[#F8F4EF]/50">
                      <td className="px-4 py-3 text-[#3B312D]">{apt?.user?.firstName ?? ''} {apt?.user?.lastName ?? ''}</td>
                      <td className="px-4 py-3 text-[#3B312D]/60">{apt?.serviceType ?? ''}</td>
                      <td className="px-4 py-3 text-[#3B312D]/60 text-xs">{apt?.date ? new Date(apt.date).toLocaleString('fr-FR') : ''}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apt?.status === 'CONFIRMED' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : apt?.status === 'COMPLETED' ? 'bg-[#C98F79]/20 text-[#C98F79]' : apt?.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{apt?.status ?? ''}</span>
                        {apt?.source === 'online' && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#3B312D] text-white font-medium">En ligne{apt?.imprintSetupId ? ' · CB ✓' : ''}</span>}
                        {apt?.clientRequest && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#C98F79] text-white font-medium">Demande {apt.clientRequest === 'cancel' ? 'annulation' : 'report'}</span>}
                      </td>
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={() => { setModalData(apt); setShowModal('edit-appointment'); }} className="p-1.5 rounded hover:bg-[#C98F79]/10"><Edit size={14} className="text-[#C98F79]" /></button>
                        <button onClick={() => handleDelete('appointments', apt?.id ?? '')} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Gift Cards Tab */}
      {activeTab === 'giftcards' && (
        <div>
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Cartes Cadeaux</h2>
            <button onClick={() => { setModalData({ purchaserEmail: '', purchaserFirstName: '', purchaserLastName: '', amount: 50, paymentMethod: 'CASH', recipientName: '', recipientEmail: '', careType: '', personalMessage: '' }); setShowModal('add-giftcard'); }}
              className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouvelle carte</button>
          </div>
          <div className="relative mb-6"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input type="text" value={giftCardSearch} onChange={(e: any) => setGiftCardSearch(e.target?.value ?? '')} placeholder="Rechercher par code, destinataire ou email acheteur..."
              className="w-full pl-10 pr-4 py-3 text-sm border border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 shadow-sm text-[#3B312D]" /></div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F8F4EF]">
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Montant</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Restant</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Expire</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {filteredGiftCards.map((gc: any) => (
                    <tr key={gc?.id ?? ''} className="border-t border-[#F8F4EF] hover:bg-[#F8F4EF]/50 cursor-pointer" onClick={() => { setModalData(gc); setShowModal('giftcard-detail'); }}>
                      <td className="px-4 py-3 font-mono text-[#3B312D] text-xs">{gc?.code ?? ''}</td>
                      <td className="px-4 py-3 text-[#3B312D]">{gc?.amount ?? 0}€</td>
                      <td className="px-4 py-3 text-[#3B312D]">{gc?.remainingAmount ?? 0}€</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GIFT_CARD_STATUS_COLOR[gc?.status ?? 'ACTIVE']}`}>{GIFT_CARD_STATUS_LABEL[gc?.status ?? 'ACTIVE']}</span></td>
                      <td className="px-4 py-3 text-[#3B312D]/60 text-xs">{gc?.expiresAt ? new Date(gc.expiresAt).toLocaleDateString('fr-FR') : ''}</td>
                      <td className="px-4 py-3"><button className="p-1.5 rounded hover:bg-[#C98F79]/10" title="Voir détails"><Eye size={14} className="text-[#C98F79]" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div>
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-6">Abonnements Actifs</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F8F4EF]">
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Crédits restants</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Renouvellement</th>
                </tr></thead>
                <tbody>
                  {(subscriptions ?? []).map((sub: any) => (
                    <tr key={sub?.id ?? ''} className="border-t border-[#F8F4EF]">
                      <td className="px-4 py-3 text-[#3B312D]">{sub?.user?.firstName ?? ''} {sub?.user?.lastName ?? ''}</td>
                      <td className="px-4 py-3 text-[#3B312D]/60">{sub?.planName ?? ''}</td>
                      <td className="px-4 py-3">{sub?.creditsRemaining ?? 0}/{sub?.creditsPerMonth ?? 0}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub?.status === 'ACTIVE' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : 'bg-red-100 text-red-600'}`}>{sub?.status ?? ''}</span></td>
                      <td className="px-4 py-3 text-xs text-[#3B312D]/60">{sub?.autoRenew ? 'Auto' : 'Manuel'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Gestion des Services</h2>
            <button onClick={() => { setModalData({ name: '', description: '', longDescription: '', duration: 60, price: 0, imageUrl: '', category: '', benefits: '', isActive: true, sortOrder: 0 }); setShowModal('add-service'); }}
              className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouveau service</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(services ?? []).map((s: any) => (
              <div key={s?.id ?? ''} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {s?.imageUrl && (
                  <div className="relative h-40 bg-[#F8F4EF]">
                    <img src={s.imageUrl} alt={s?.name ?? ''} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">{s?.name ?? ''}</h3>
                      <p className="text-sm text-[#3B312D]/60 mt-1">{s?.category ?? ''} • {s?.duration ?? 60} min</p>
                    </div>
                    <span className="text-lg font-bold text-[#C98F79]">{s?.price ?? 0}€</span>
                  </div>
                  <p className="text-sm text-[#3B312D]/60 mt-2 line-clamp-2">{s?.description ?? ''}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s?.isActive ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : 'bg-red-100 text-red-600'}`}>{s?.isActive ? 'Actif' : 'Inactif'}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setModalData(s); setShowModal('edit-service'); }} className="p-1.5 rounded hover:bg-[#C98F79]/10"><Edit size={14} className="text-[#C98F79]" /></button>
                      <button onClick={() => handleDelete('services', s?.id ?? '')} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(!services || services.length === 0) && <p className="text-center text-[#3B312D]/40 py-10">Aucun service. Cliquez sur "Nouveau service" pour en créer.</p>}
        </div>
      )}

      {/* Promos Tab */}
      {activeTab === 'promos' && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Codes Promo</h2>
            <button onClick={() => { setModalData({ code: '', type: 'fixed', value: 0, maxUses: 0, description: '', expiresAt: '' }); setShowModal('add-promo'); }}
              className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouveau code</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F8F4EF]">
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Valeur</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Utilisations</th>
                  <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Actif</th>
                  <th className="px-4 py-3"></th>
                </tr></thead>
                <tbody>
                  {(promos ?? []).map((p: any) => (
                    <tr key={p?.id ?? ''} className="border-t border-[#F8F4EF]">
                      <td className="px-4 py-3 font-mono text-[#3B312D] text-xs">{p?.code ?? ''}</td>
                      <td className="px-4 py-3 text-[#3B312D]/60">{p?.type === 'percentage' ? '%' : '€'}</td>
                      <td className="px-4 py-3 text-[#3B312D]">{p?.value ?? 0}{p?.type === 'percentage' ? '%' : '€'}</td>
                      <td className="px-4 py-3 text-[#3B312D]/60">{p?.currentUses ?? 0}/{p?.maxUses || '∞'}</td>
                      <td className="px-4 py-3">{p?.isActive ? <Check size={14} className="text-[#AAB7A0]" /> : <X size={14} className="text-red-500" />}</td>
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={() => { setModalData(p); setShowModal('edit-promo'); }} className="p-1.5 rounded hover:bg-[#C98F79]/10"><Edit size={14} className="text-[#C98F79]" /></button>
                        <button onClick={() => handleDelete('promos', p?.id ?? '')} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Blog Tab */}
      {activeTab === 'blog' && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Articles de blog</h2>
            <button onClick={() => { setModalData({ title: '', slug: '', excerpt: '', content: '', category: '', imageUrl: '', sourceUrl: '', isPublished: false }); setShowModal('add-blog'); }}
              className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouvel article</button>
          </div>
          <div className="space-y-3">
            {(blogPosts ?? []).map((post: any) => (
              <div key={post?.id ?? ''} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#3B312D]">{post?.title ?? ''}</p>
                  <p className="text-xs text-[#3B312D]/60 mt-1">{post?.category ?? ''} • {post?.isPublished ? 'Publié' : 'Brouillon'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setModalData(post); setShowModal('edit-blog'); }} className="p-1.5 rounded hover:bg-[#C98F79]/10"><Edit size={14} className="text-[#C98F79]" /></button>
                  <button onClick={() => handleDelete('blog', post?.id ?? '')} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div>
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D] mb-6">Demandes de contact</h2>
          <div className="space-y-3">
            {(contacts ?? []).map((c: any) => {
              const statusCycle = ['new', 'in_progress', 'resolved'];
              const statusLabel: any = { new: 'Nouveau', in_progress: 'En cours', resolved: 'Traité' };
              const statusColor: any = { new: 'bg-[#C98F79]/20 text-[#C98F79]', in_progress: 'bg-yellow-100 text-yellow-700', resolved: 'bg-[#AAB7A0]/20 text-[#AAB7A0]' };
              const cycleStatus = () => {
                const next = statusCycle[(statusCycle.indexOf(c?.status ?? 'new') + 1) % statusCycle.length];
                handleSave('contacts', { id: c?.id, status: next }, 'PUT');
              };
              return (
                <div key={c?.id ?? ''} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div><p className="font-medium text-[#3B312D]">{c?.firstName ?? ''} • {c?.phone ?? ''}</p><p className="text-sm text-[#3B312D]/60 mt-1">{c?.message ?? ''}</p></div>
                    <button onClick={cycleStatus} title="Cliquer pour changer le statut"
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c?.status ?? 'new']} hover:opacity-70`}>{statusLabel[c?.status ?? 'new']}</button>
                  </div>
                  <p className="text-xs text-[#3B312D]/40 mt-2">{c?.createdAt ? new Date(c.createdAt).toLocaleString('fr-FR') : ''}</p>
                  {c?.adminReply && (
                    <div className="mt-3 bg-[#F8F4EF]/60 rounded-lg p-3">
                      <p className="text-xs text-[#3B312D]/50 mb-1">Votre réponse ({c?.respondedAt ? new Date(c.respondedAt).toLocaleDateString('fr-FR') : ''})</p>
                      <p className="text-sm text-[#3B312D]">{c.adminReply}</p>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <input value={contactReplies[c?.id] ?? ''} onChange={(e: any) => setContactReplies((prev) => ({ ...prev, [c?.id]: e.target?.value ?? '' }))}
                      placeholder="Répondre / noter le suivi de cet appel (facultatif)..." className="flex-1 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
                    <button onClick={() => { handleSave('contacts', { id: c?.id, adminReply: contactReplies[c?.id] ?? '' }, 'PUT'); setContactReplies((prev) => ({ ...prev, [c?.id]: '' })); }}
                      disabled={!contactReplies[c?.id]} className="px-3 py-2 text-sm bg-[#C98F79] text-white rounded-lg disabled:opacity-40">Envoyer</button>
                    {c?.status !== 'resolved' && (
                      <button onClick={() => handleSave('contacts', { id: c?.id, status: 'resolved' }, 'PUT')}
                        className="px-3 py-2 text-sm bg-[#AAB7A0] text-white rounded-lg flex items-center gap-1.5 whitespace-nowrap"><Check size={14} />Marquer comme traité</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === 'testimonials' && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Témoignages</h2>
            <button onClick={() => { setModalData({ name: '', rating: 5, comment: '', serviceType: '', isApproved: true }); setShowModal('add-testimonial'); }}
              className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouveau témoignage</button>
          </div>
          <div className="space-y-3">
            {(testimonials ?? []).map((t: any) => (
              <div key={t?.id ?? ''} className="bg-white rounded-xl p-4 shadow-sm flex items-start justify-between">
                <div><p className="font-medium text-[#3B312D]">{t?.name ?? ''} - {t?.rating ?? 5}★</p><p className="text-sm text-[#3B312D]/60 mt-1 italic">"{t?.comment ?? ''}"</p></div>
                <div className="flex gap-1">
                  {!t?.isApproved && <button onClick={() => handleSave('testimonials', { id: t?.id, isApproved: true }, 'PUT')} className="p-1.5 rounded hover:bg-[#AAB7A0]/10" title="Approuver"><Check size={14} className="text-[#AAB7A0]" /></button>}
                  <button onClick={() => handleDelete('testimonials', t?.id ?? '')} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emails Tab */}
      {activeTab === 'emails' && <EmailsTab clients={clients ?? []} />}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && <GalleryTab />}

      {/* Site Content Tab */}
      {activeTab === 'content' && <SiteContentTab />}

      {/* Caisse du jour Tab */}
      {activeTab === 'caisse' && <CaisseTab appointments={appointments ?? []} />}

      {/* Vidéos premium Tab */}
      {activeTab === 'videos' && <VideosTab />}

      {/* Réservation en ligne Tab */}
      {activeTab === 'booking' && <BookingTab />}

      {/* Fiche client 360° */}
      {detailClientId && <ClientDetail clientId={detailClientId} onClose={() => { setDetailClientId(null); refreshData(); }} />}

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">
                {showModal === 'add-promo' ? 'Nouveau code promo' : showModal === 'edit-promo' ? 'Modifier code promo' : showModal === 'add-appointment' ? 'Nouveau rendez-vous' : showModal === 'edit-appointment' ? 'Modifier rendez-vous' : showModal === 'add-blog' ? 'Nouvel article' : showModal === 'edit-blog' ? 'Modifier article' : showModal === 'edit-client' ? 'Modifier client' : showModal === 'notify-client' ? 'Envoyer notification' : showModal === 'manage-credits' ? 'Gérer les crédits' : showModal === 'giftcard-detail' ? 'Détails carte cadeau' : showModal === 'add-giftcard' ? 'Nouvelle carte cadeau' : showModal === 'add-service' ? 'Nouveau service' : showModal === 'edit-service' ? 'Modifier le service' : showModal === 'add-testimonial' ? 'Nouveau témoignage' : ''}
              </h3>
              <button onClick={() => setShowModal(null)} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={18} /></button>
            </div>

            {/* Manage Credits Modal */}
            {showModal === 'manage-credits' && (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-[#3B312D]/60">Client: <strong>{modalData?.firstName ?? ''} {modalData?.lastName ?? ''}</strong></p>
                  <p className="font-playfair text-4xl font-bold text-[#C98F79] mt-3">{modalData?.credits ?? 0}</p>
                  <p className="text-sm text-[#3B312D]/60 mt-1">crédits actuels</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3B312D]/70">Nombre de crédits</label>
                  <input type="number" min={1} value={creditAmount} onChange={(e: any) => setCreditAmount(Math.max(1, parseInt(e.target?.value ?? '1')))} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D] text-center text-lg font-semibold" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleCredits(modalData?.id ?? '', 'add')}
                    className="py-3 bg-[#AAB7A0] text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#96a58c] transition-all">
                    <Plus size={16} />Ajouter
                  </button>
                  <button onClick={() => handleCredits(modalData?.id ?? '', 'remove')}
                    className="py-3 bg-[#C98F79] text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#b87d68] transition-all">
                    <Minus size={16} />Retirer
                  </button>
                </div>
              </div>
            )}

            {/* Gift Card Detail Modal */}
            {showModal === 'giftcard-detail' && (
              <div className="space-y-4">
                <div className="bg-[#F8F4EF] rounded-xl p-5 text-center">
                  <p className="font-mono text-lg font-bold text-[#3B312D] tracking-wider">{modalData?.code ?? ''}</p>
                  <p className="mt-2"><span className="font-playfair text-3xl font-bold text-[#C98F79]">{modalData?.amount ?? 0}€</span></p>
                  <p className="text-sm text-[#3B312D]/60 mt-1">Restant: {modalData?.remainingAmount ?? 0}€</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                    <span className="text-sm text-[#3B312D]/60">Statut</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GIFT_CARD_STATUS_COLOR[modalData?.status ?? 'ACTIVE']}`}>{GIFT_CARD_STATUS_LABEL[modalData?.status ?? 'ACTIVE']}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                    <span className="text-sm text-[#3B312D]/60">Acheté par</span>
                    <span className="text-sm font-medium text-[#3B312D]">{modalData?.purchasedBy?.firstName ?? ''} {modalData?.purchasedBy?.lastName ?? ''} ({modalData?.purchasedBy?.email ?? ''})</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                    <span className="text-sm text-[#3B312D]/60">Destinataire</span>
                    <span className="text-sm font-medium text-[#3B312D]">{modalData?.recipientName ?? '-'} {modalData?.recipientEmail ? `(${modalData.recipientEmail})` : ''}</span>
                  </div>
                  {modalData?.receivedBy && (
                    <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                      <span className="text-sm text-[#3B312D]/60">Utilisé par</span>
                      <span className="text-sm font-medium text-[#3B312D]">{modalData.receivedBy.firstName ?? ''} {modalData.receivedBy.lastName ?? ''}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                    <span className="text-sm text-[#3B312D]/60">Type de soin</span>
                    <span className="text-sm text-[#3B312D]">{modalData?.careType || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                    <span className="text-sm text-[#3B312D]/60">Message personnel</span>
                    <span className="text-sm text-[#3B312D] italic max-w-[200px] text-right">{modalData?.personalMessage || '-'}</span>
                  </div>
                  {modalData?.promoCodeUsed && (
                    <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                      <span className="text-sm text-[#3B312D]/60">Code promo utilisé</span>
                      <span className="text-sm font-mono text-[#3B312D]">{modalData.promoCodeUsed}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-[#F8F4EF]">
                    <span className="text-sm text-[#3B312D]/60">Date d'achat</span>
                    <span className="text-sm text-[#3B312D]">{modalData?.createdAt ? new Date(modalData.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-[#3B312D]/60">Expiration</span>
                    <span className="text-sm text-[#3B312D]">{modalData?.expiresAt ? new Date(modalData.expiresAt).toLocaleDateString('fr-FR') : ''}</span>
                  </div>
                  {modalData?.paymentMethod && (
                    <div className="flex justify-between py-2 border-t border-[#F8F4EF]">
                      <span className="text-sm text-[#3B312D]/60">Mode d'encaissement</span>
                      <span className="text-sm text-[#3B312D]">{modalData.paymentMethod === 'CASH' ? 'Espèces' : modalData.paymentMethod === 'CARD' ? 'Carte bleue' : 'Carte cadeau'}</span>
                    </div>
                  )}
                </div>
                {modalData?.status !== 'USED' && modalData?.status !== 'EXPIRED' && (
                  <div className="pt-2">
                    <label className="text-sm font-medium text-[#3B312D]/70">Décompter un montant (solde : {modalData?.remainingAmount ?? 0}€)</label>
                    <div className="flex gap-2 mt-1">
                      <input type="number" min={0.01} step="0.01" max={modalData?.remainingAmount ?? undefined} value={deductAmount} onChange={(e: any) => setDeductAmount(e.target?.value ?? '')}
                        placeholder="Montant utilisé" className="flex-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
                      <button onClick={() => deductGiftCard(modalData?.id)} disabled={saving || !deductAmount}
                        className="px-4 py-3 bg-[#AAB7A0] text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"><Check size={16} />Décompter</button>
                    </div>
                    <p className="text-[10px] text-[#3B312D]/40 mt-1">La carte passe en "Partiellement utilisée" s'il reste un solde, ou "Utilisée" une fois à 0€.</p>
                  </div>
                )}
              </div>
            )}

            {/* Add Gift Card Modal */}
            {showModal === 'add-giftcard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Prénom acheteur</label>
                    <input value={modalData?.purchaserFirstName ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), purchaserFirstName: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Nom acheteur</label>
                    <input value={modalData?.purchaserLastName ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), purchaserLastName: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Email acheteur</label>
                  <input type="email" value={modalData?.purchaserEmail ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), purchaserEmail: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" placeholder="Si le compte n'existe pas, il sera créé et un email d'invitation envoyé" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Montant (€)</label>
                    <input type="number" min={1} step="0.01" value={modalData?.amount ?? 50} onChange={(e: any) => setModalData({...(modalData ?? {}), amount: e.target?.value ?? '50'})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Mode d'encaissement</label>
                    <select value={modalData?.paymentMethod ?? 'CASH'} onChange={(e: any) => setModalData({...(modalData ?? {}), paymentMethod: e.target?.value ?? 'CASH'})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                      <option value="CASH">Espèces</option><option value="CARD">Carte bleue</option><option value="GIFT_CARD">Carte cadeau</option></select></div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Nom destinataire (optionnel)</label>
                  <input value={modalData?.recipientName ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), recipientName: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Type de soin (optionnel)</label>
                  <input value={modalData?.careType ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), careType: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <button onClick={() => handleSave('giftcards', modalData, 'POST')} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Créer la carte cadeau'}</button>
              </div>
            )}

            {/* Promo Modal */}
            {(showModal === 'add-promo' || showModal === 'edit-promo') && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-[#3B312D]/70">Code</label>
                  <input value={modalData?.code ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), code: (e.target?.value ?? '').toUpperCase()})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Type</label>
                    <select value={modalData?.type ?? 'fixed'} onChange={(e: any) => setModalData({...(modalData ?? {}), type: e.target?.value ?? 'fixed'})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                      <option value="fixed">Montant fixe (€)</option><option value="percentage">Pourcentage (%)</option></select></div>
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Valeur</label>
                    <input type="number" value={modalData?.value ?? 0} onChange={(e: any) => setModalData({...(modalData ?? {}), value: parseFloat(e.target?.value ?? '0')})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Max utilisations (0 = illimité)</label>
                  <input type="number" value={modalData?.maxUses ?? 0} onChange={(e: any) => setModalData({...(modalData ?? {}), maxUses: parseInt(e.target?.value ?? '0')})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Description</label>
                  <input value={modalData?.description ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), description: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <button onClick={() => handleSave('promos', modalData, showModal === 'edit-promo' ? 'PUT' : 'POST')} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            )}

            {/* Appointment Modal */}
            {(showModal === 'add-appointment' || showModal === 'edit-appointment') && (
              <div className="space-y-4">
                {modalData?.clientRequest && (
                  <div className="bg-[#C98F79]/10 border border-[#C98F79]/30 rounded-lg px-4 py-3">
                    <p className="text-sm font-medium text-[#C98F79]">Demande de la cliente : {modalData.clientRequest === 'cancel' ? 'annulation' : 'report'}</p>
                    {modalData?.clientRequestNote && <p className="text-xs text-[#3B312D]/70 mt-1">« {modalData.clientRequestNote} »</p>}
                    <p className="text-[10px] text-[#3B312D]/40 mt-1">En enregistrant, cette demande sera marquée comme traitée.</p>
                  </div>
                )}
                <div><label className="text-sm font-medium text-[#3B312D]/70">Client</label>
                  <div className="mt-1">
                    <ClientPicker
                      clients={clients ?? []}
                      email={modalData?.userEmail ?? modalData?.user?.email ?? ''}
                      onSelect={(data) => setModalData({...(modalData ?? {}), userEmail: data.email, userFirstName: data.firstName ?? '', userLastName: data.lastName ?? ''})}
                    />
                  </div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Type de soin</label>
                  <select value={modalData?.serviceType ?? ''} onChange={(e: any) => {
                    const name = e.target?.value ?? '';
                    const matched = (services ?? []).find((s: any) => s?.name === name);
                    setModalData({...(modalData ?? {}), serviceType: name, duration: matched?.duration ?? modalData?.duration ?? 60});
                  }} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                    <option value="">Choisir...</option>
                    {(services ?? []).map((s: any) => <option key={s?.id} value={s?.name}>{s?.name} ({s?.duration ?? 60} min)</option>)}
                    <option value="Soin Kobido">Soin Kobido</option><option value="Cure Rituel Kobido">Cure Rituel Kobido</option><option value="Drainage + Kobido">Drainage + Kobido</option><option value="Coaching Nutrition">Coaching Nutrition</option></select></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Date et heure</label>
                  <input type="datetime-local" value={modalData?.dateLocal ?? (modalData?.date ? new Date(modalData.date).toISOString().slice(0, 16) : '')} onChange={(e: any) => setModalData({...(modalData ?? {}), dateLocal: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Durée (min) — calculée automatiquement selon le soin, modifiable</label>
                  <input type="number" min={5} value={modalData?.duration ?? 60} onChange={(e: any) => setModalData({...(modalData ?? {}), duration: parseInt(e.target?.value ?? '60')})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Statut</label>
                  <select value={modalData?.status ?? 'PENDING'} onChange={(e: any) => setModalData({...(modalData ?? {}), status: e.target?.value ?? 'PENDING'})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                    <option value="PENDING">En attente</option><option value="CONFIRMED">Confirmé</option><option value="COMPLETED">Terminé</option><option value="CANCELLED">Annulé</option></select></div>
                <button onClick={() => handleSave('appointments', { ...modalData, date: modalData?.dateLocal ?? modalData?.date }, showModal === 'edit-appointment' ? 'PUT' : 'POST')} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>

                {showModal === 'edit-appointment' && modalData?.id && (
                  <div className="pt-4 border-t border-[#F8F4EF]">
                    <h4 className="text-sm font-semibold text-[#3B312D] mb-3">Encaissements</h4>
                    <div className="space-y-2 mb-4">
                      {(modalData?.payments ?? []).length === 0 && <p className="text-xs text-[#3B312D]/40">Aucun encaissement enregistré</p>}
                      {(modalData?.payments ?? []).map((p: any) => (
                        <div key={p?.id ?? ''} className="flex items-center justify-between bg-[#F8F4EF]/50 rounded-lg px-3 py-2">
                          <span className="text-sm text-[#3B312D]">{p?.method === 'CASH' ? 'Espèces' : p?.method === 'CARD' ? 'Carte bleue' : `Carte cadeau ${p?.giftCardCode ?? ''}`} — {p?.amount ?? 0}€</span>
                          <button onClick={() => deletePayment(p?.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={12} className="text-red-500" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={newPayment?.method ?? 'CASH'} onChange={(e: any) => setNewPayment({...(newPayment ?? {}), method: e.target?.value ?? 'CASH', giftCardCode: ''})} className="px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                        <option value="CASH">Espèces</option><option value="CARD">Carte bleue</option><option value="GIFT_CARD">Carte cadeau</option></select>
                      <input type="number" step="0.01" placeholder="Montant" value={newPayment?.amount ?? ''} onChange={(e: any) => setNewPayment({...(newPayment ?? {}), amount: e.target?.value ?? ''})} className="px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
                    </div>
                    {newPayment?.method === 'GIFT_CARD' && (
                      <div className="mt-2">
                        <GiftCardPicker
                          giftCards={giftCards ?? []}
                          code={newPayment?.giftCardCode ?? ''}
                          onSelect={(gc) => setNewPayment({...(newPayment ?? {}), giftCardCode: gc?.code ?? '', amount: gc ? gc.remainingAmount : newPayment?.amount})}
                        />
                      </div>
                    )}
                    <button onClick={() => addPayment(modalData?.id)} disabled={newPayment?.method === 'GIFT_CARD' && !newPayment?.giftCardCode}
                      className="w-full mt-2 px-3 py-2 text-sm bg-[#AAB7A0] text-white rounded-lg disabled:opacity-40">Ajouter l'encaissement</button>
                  </div>
                )}
              </div>
            )}

            {/* Blog Modal */}
            {(showModal === 'add-blog' || showModal === 'edit-blog') && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-[#3B312D]/70">Titre</label>
                  <input value={modalData?.title ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), title: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Slug (URL)</label>
                  <input value={modalData?.slug ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), slug: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Catégorie</label>
                  <input value={modalData?.category ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), category: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Extrait</label>
                  <textarea value={modalData?.excerpt ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), excerpt: e.target?.value ?? ''})} rows={2} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Contenu</label>
                  <div className="mt-1"><RichTextEditor value={modalData?.content ?? ''} onChange={(html) => setModalData({...(modalData ?? {}), content: html})} /></div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#3B312D]/70">Photo de l'article</label>
                  {modalData?.imageUrl && (
                    <div className="relative mt-2 h-32 w-full rounded-lg overflow-hidden bg-[#F8F4EF]">
                      <img src={modalData.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeBlogPhoto(modalData?.id)} disabled={!modalData?.id || uploadingPhoto}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <label className={`px-4 py-2 text-sm rounded-lg border border-[#F8F4EF] cursor-pointer flex items-center gap-2 ${!modalData?.id ? 'opacity-40 pointer-events-none' : 'hover:bg-[#F8F4EF]'}`}>
                      <ImageIcon size={14} className="text-[#C98F79]" />
                      {uploadingPhoto ? 'Envoi...' : 'Importer une photo'}
                      <input type="file" accept="image/*,.heic,.heif" className="hidden" disabled={!modalData?.id || uploadingPhoto}
                        onChange={(e: any) => uploadBlogPhoto(modalData?.id, e.target?.files?.[0])} />
                    </label>
                    {!modalData?.id && <span className="text-xs text-[#3B312D]/40">Enregistrez l'article avant d'ajouter une photo</span>}
                  </div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Source (optionnel)</label>
                  <input value={modalData?.sourceUrl ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), sourceUrl: e.target?.value ?? ''})} placeholder="https://..." className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
                  <p className="text-[10px] text-[#3B312D]/40 mt-1">Affiché comme un lien cliquable (nouvel onglet) au bas de l'article</p>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Date de publication</label>
                  <input type="datetime-local" value={modalData?.publishedAtLocal ?? (modalData?.publishedAt ? toLocalInputValue(new Date(modalData.publishedAt)) : toLocalInputValue(new Date()))}
                    onChange={(e: any) => setModalData({...(modalData ?? {}), publishedAtLocal: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
                  <p className="text-[10px] text-[#3B312D]/40 mt-1">Une date future programme la publication automatique de l'article.</p>
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={modalData?.isPublished ?? false} onChange={(e: any) => setModalData({...(modalData ?? {}), isPublished: e.target?.checked ?? false})} className="rounded" />Publier (visible publiquement à la date ci-dessus)</label>
                <button onClick={() => handleSave('blog', { ...modalData, publishedAt: modalData?.publishedAtLocal ?? modalData?.publishedAt }, showModal === 'edit-blog' ? 'PUT' : 'POST')} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            )}

            {/* Notify Client Modal */}
            {showModal === 'notify-client' && (
              <div className="space-y-4">
                <p className="text-sm text-[#3B312D]/60">Envoyer un email à <strong>{modalData?.email ?? ''}</strong></p>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Message</label>
                  <textarea value={modalData?.notifMessage ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), notifMessage: e.target?.value ?? ''})} rows={4} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" /></div>
                <button onClick={() => { sendNotif(modalData?.id ?? '', modalData?.notifMessage ?? ''); setShowModal(null); }} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg flex items-center justify-center gap-2"><Send size={14} />Envoyer</button>
              </div>
            )}

            {/* Edit Client Modal */}
            {showModal === 'edit-client' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Prénom</label>
                    <input value={modalData?.firstName ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), firstName: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Nom</label>
                    <input value={modalData?.lastName ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), lastName: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Crédits</label>
                  <input type="number" value={modalData?.credits ?? 0} onChange={(e: any) => setModalData({...(modalData ?? {}), credits: parseInt(e.target?.value ?? '0')})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <button onClick={() => handleSave('clients', modalData, 'PUT')} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            )}

            {/* Service Modal */}
            {(showModal === 'add-service' || showModal === 'edit-service') && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-[#3B312D]/70">Nom du service</label>
                  <input value={modalData?.name ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), name: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" placeholder="ex: Soin Kobido" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Prix (€)</label>
                    <input type="number" step="0.01" value={modalData?.price ?? 0} onChange={(e: any) => setModalData({...(modalData ?? {}), price: e.target?.value ?? '0'})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Durée (min)</label>
                    <input type="number" value={modalData?.duration ?? 60} onChange={(e: any) => setModalData({...(modalData ?? {}), duration: e.target?.value ?? '60'})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Catégorie</label>
                  <input value={modalData?.category ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), category: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" placeholder="ex: Visage, Corps" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Description courte</label>
                  <textarea value={modalData?.description ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), description: e.target?.value ?? ''})} rows={2} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Description longue</label>
                  <textarea value={modalData?.longDescription ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), longDescription: e.target?.value ?? ''})} rows={4} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Bénéfices (séparés par des virgules)</label>
                  <input value={modalData?.benefits ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), benefits: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" placeholder="Lifting naturel, Relaxation, ..." /></div>
                <div>
                  <label className="text-sm font-medium text-[#3B312D]/70">Photo du service</label>
                  {modalData?.imageUrl && (
                    <div className="relative mt-2 h-32 w-full rounded-lg overflow-hidden bg-[#F8F4EF]">
                      <img src={modalData.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeServicePhoto(modalData?.id)} disabled={!modalData?.id || uploadingPhoto}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white"><Trash2 size={14} className="text-red-500" /></button>
                    </div>
                  )}
                  <label
                    onDragOver={(e) => { if (modalData?.id) { e.preventDefault(); } }}
                    onDrop={(e) => { if (modalData?.id && !uploadingPhoto) { e.preventDefault(); uploadServicePhoto(modalData?.id, e.dataTransfer.files?.[0]); } }}
                    className={`mt-2 flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg py-5 cursor-pointer transition-colors ${!modalData?.id ? 'opacity-40 pointer-events-none border-[#3B312D]/15' : 'border-[#3B312D]/15 hover:border-[#C98F79]/50'}`}>
                    <ImageIcon size={18} className="text-[#C98F79]" />
                    <span className="text-sm text-[#3B312D]/70">{uploadingPhoto ? 'Envoi…' : 'Glissez une photo ici, ou cliquez'}</span>
                    <span className="text-[10px] text-[#3B312D]/40">JPEG, PNG, HEIC (iPhone)… converties automatiquement</span>
                    <input type="file" accept="image/*,.heic,.heif" className="hidden" disabled={!modalData?.id || uploadingPhoto}
                      onChange={(e: any) => uploadServicePhoto(modalData?.id, e.target?.files?.[0])} />
                  </label>
                  {!modalData?.id && <span className="text-xs text-[#3B312D]/40 mt-1 inline-block">Enregistrez le service avant d'ajouter une photo</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Ordre d'affichage</label>
                    <input type="number" value={modalData?.sortOrder ?? 0} onChange={(e: any) => setModalData({...(modalData ?? {}), sortOrder: e.target?.value ?? '0'})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                  <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={modalData?.isActive ?? true} onChange={(e: any) => setModalData({...(modalData ?? {}), isActive: e.target?.checked ?? true})} className="rounded" />Service actif</label></div>
                </div>
                <button onClick={() => handleSave('services', modalData, showModal === 'edit-service' ? 'PUT' : 'POST')} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            )}

            {/* Add Testimonial Modal */}
            {showModal === 'add-testimonial' && (
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-[#3B312D]/70">Nom du client</label>
                  <input value={modalData?.name ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), name: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Note</label>
                    <select value={modalData?.rating ?? 5} onChange={(e: any) => setModalData({...(modalData ?? {}), rating: parseInt(e.target?.value ?? '5')})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}</select></div>
                  <div><label className="text-sm font-medium text-[#3B312D]/70">Type de soin</label>
                    <input value={modalData?.serviceType ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), serviceType: e.target?.value ?? ''})} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" placeholder="ex: Kobido" /></div>
                </div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Témoignage</label>
                  <textarea value={modalData?.comment ?? ''} onChange={(e: any) => setModalData({...(modalData ?? {}), comment: e.target?.value ?? ''})} rows={4} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={modalData?.isApproved ?? true} onChange={(e: any) => setModalData({...(modalData ?? {}), isApproved: e.target?.checked ?? true})} className="rounded" />Publier immédiatement sur le site</label>
                <button onClick={createTestimonial} disabled={saving}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer le témoignage'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
