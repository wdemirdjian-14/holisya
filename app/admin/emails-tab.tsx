'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Send, X, Loader2, Mail, History, FileText, Bell, Users, Filter, Save } from 'lucide-react';
import { toast } from 'sonner';

const VARIABLES = [
  { key: 'prenom', label: 'Prénom' },
  { key: 'nom', label: 'Nom' },
  { key: 'email', label: 'Email' },
];

export default function EmailsTab({ clients }: { clients: any[] }) {
  const [section, setSection] = useState<'templates' | 'send' | 'history' | 'push' | 'lists' | 'newsletter'>('send');
  const [newsletterSubs, setNewsletterSubs] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignDetail, setCampaignDetail] = useState<any>(null);
  const [emailWindow, setEmailWindow] = useState({ start: 8, end: 21 });

  const emptyFilters = { activity: 'any', minAppointments: 0, subscription: 'any', source: 'any', newAccount: 'any', region: 'any' };
  const [filters, setFilters] = useState<any>(emptyFilters);
  const [preview, setPreview] = useState<{ count: number; ids: string[]; clients: any[] }>({ count: 0, ids: [], clients: [] });
  const [previewing, setPreviewing] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [segName, setSegName] = useState('');
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [pushInfo, setPushInfo] = useState<any>(null);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushUrl, setPushUrl] = useState('/');
  const [pushSending, setPushSending] = useState(false);

  const loadPush = () => fetch('/api/admin/push/send').then(r => r.json()).then(setPushInfo).catch(() => {});

  const sendPushBroadcast = async () => {
    if (!pushTitle || !pushBody) { toast.error('Titre et message requis'); return; }
    if (!confirm(`Envoyer cette notification à ${pushInfo?.subscribers ?? 0} abonné(s) ?`)) return;
    setPushSending(true);
    try {
      const res = await fetch('/api/admin/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl }) });
      const d = await res.json();
      if (res.ok) { toast.success(`Envoyé à ${d.sent} destinataire(s)`); setPushTitle(''); setPushBody(''); } else toast.error(d?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setPushSending(false);
  };
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<any>({ name: '', subject: '', body: '' });

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientMode, setRecipientMode] = useState<'single' | 'selected' | 'all' | 'liste' | 'newsletter'>('single');
  const [recipientRows, setRecipientRows] = useState<any[]>([]);
  const [loadingRecips, setLoadingRecips] = useState(false);
  const [recipSearch, setRecipSearch] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [maxPerDay, setMaxPerDay] = useState(250);
  const RECOMMENDED_MAX = 250; // envois/jour au départ, domaine jeune + IP mutualisée Ionos (puis montée progressive)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Nombre de jours d'envoi avec montée en puissance (250, 350, 490, …) — identique au serveur.
  const rampDays = (total: number, start: number) => { let cap = start, cum = 0, d = 0; while (cum < total && d < 90) { cum += Math.min(2000, Math.round(cap)); cap *= 1.4; d++; } return Math.max(1, d); };
  const [singleEmail, setSingleEmail] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/email-templates').then(r => r.json()),
      fetch('/api/admin/email-logs').then(r => r.json()),
    ]).then(([t, l]) => { setTemplates(t?.templates ?? []); setLogs(l?.logs ?? []); setLoading(false); }).catch(() => setLoading(false));
  };

  const loadSegments = () => fetch('/api/admin/segments').then(r => r.json()).then(d => setSegments(d?.segments ?? [])).catch(() => {});
  const loadNewsletter = () => fetch('/api/admin/newsletter?list=antibes').then(r => r.json()).then(d => setNewsletterSubs(d?.subscribers ?? [])).catch(() => {});
  const loadCampaigns = () => fetch('/api/admin/campaigns').then(r => r.json()).then(d => setCampaigns(d?.campaigns ?? [])).catch(() => {});
  const loadWindow = () => fetch('/api/admin/booking-settings').then(r => r.json()).then(d => { if (d?.settings) setEmailWindow({ start: d.settings.emailWindowStart ?? 8, end: d.settings.emailWindowEnd ?? 21 }); }).catch(() => {});

  useEffect(() => { load(); loadPush(); loadSegments(); loadNewsletter(); loadCampaigns(); loadWindow(); }, []);

  const openCampaign = (id: string) => fetch(`/api/admin/campaigns/${id}`).then(r => r.json()).then(setCampaignDetail).catch(() => {});
  const campaignAction = async (id: string, action: 'pause' | 'resume' | 'cancel') => {
    if (action === 'cancel' && !confirm("Annuler l'envoi des emails restants de cette campagne ?")) return;
    const res = await fetch('/api/admin/campaigns', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    if (res.ok) { toast.success(action === 'pause' ? 'Campagne en pause' : action === 'resume' ? 'Campagne reprise' : 'Campagne annulée'); loadCampaigns(); openCampaign(id); } else toast.error('Erreur');
  };
  const saveWindow = async (w: { start: number; end: number }) => {
    setEmailWindow(w);
    await fetch('/api/admin/booking-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailWindowStart: w.start, emailWindowEnd: w.end }) }).catch(() => {});
    toast.success('Plage horaire enregistrée');
  };

  // Rafraîchit la progression des campagnes tant qu'il y en a en cours (dans l'onglet Historique).
  useEffect(() => {
    if (section !== 'history') return;
    const hasActive = campaigns.some((c: any) => c.status !== 'done');
    if (!hasActive) return;
    const t = setInterval(loadCampaigns, 15000);
    return () => clearInterval(t);
  }, [section, campaigns]);

  // Charge le tableau des destinataires quand on choisit une liste / la newsletter.
  useEffect(() => {
    if (recipientMode === 'liste' && selectedSegmentId) {
      const seg = segments.find((s: any) => s.id === selectedSegmentId);
      if (!seg) { setRecipientRows([]); return; }
      setLoadingRecips(true);
      fetch('/api/admin/segments/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filters: seg.filters }) })
        .then((r) => r.json())
        .then((d) => { setRecipientRows((d?.clients ?? []).map((c: any) => ({ email: c.email, firstName: c.firstName, lastName: c.lastName, userId: c.id, lastVisit: c.lastVisit }))); setLoadingRecips(false); })
        .catch(() => setLoadingRecips(false));
    } else if (recipientMode === 'newsletter') {
      setRecipientRows(newsletterSubs.map((s: any) => ({ email: s.email, firstName: '', lastName: '', userId: null, lastVisit: null })));
    } else {
      setRecipientRows([]);
    }
  }, [recipientMode, selectedSegmentId, newsletterSubs]);

  const addRecipient = () => {
    const em = addEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(em)) { toast.error('Email invalide'); return; }
    if (recipientRows.some((r: any) => (r.email ?? '').toLowerCase() === em)) { toast.error('⚠️ Ce contact est déjà dans la liste'); return; }
    setRecipientRows((prev) => [{ email: em, firstName: '', lastName: '', userId: null, lastVisit: null, added: true }, ...prev]);
    setAddEmail('');
    toast.success('Contact ajouté');
  };
  const removeRecipient = (email: string) => setRecipientRows((prev) => prev.filter((r: any) => r.email !== email));
  const usesTable = recipientMode === 'liste' || recipientMode === 'newsletter';

  const exportNewsletterCsv = () => {
    const rows = [['email', 'liste', 'source', 'date'], ...newsletterSubs.map((s: any) => [s.email, s.list, s.source, new Date(s.createdAt).toLocaleString('fr-FR')])];
    const csv = rows.map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'newsletter-antibes.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const deleteNewsletterSub = async (id: string) => {
    const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' });
    if (res.ok) { setNewsletterSubs((prev) => prev.filter((s: any) => s.id !== id)); }
  };

  const runPreview = async (f: any) => {
    setPreviewing(true);
    try {
      const res = await fetch('/api/admin/segments/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filters: f }) });
      const d = await res.json();
      setPreview({ count: d?.count ?? 0, ids: d?.ids ?? [], clients: d?.clients ?? [] });
    } catch { /* noop */ }
    setPreviewing(false);
  };

  // Aperçu en direct quand on ajuste les filtres (dans la section Listes).
  useEffect(() => {
    if (section !== 'lists') return;
    const t = setTimeout(() => runPreview(filters), 350);
    return () => clearTimeout(t);
  }, [filters, section]);

  const saveSegment = async () => {
    if (!segName.trim()) { toast.error('Donnez un nom à la liste'); return; }
    const res = await fetch('/api/admin/segments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: segName.trim(), filters }) });
    if (res.ok) { toast.success('Liste enregistrée'); setSegName(''); loadSegments(); } else toast.error('Erreur');
  };

  const deleteSegment = async (id: string) => {
    if (!confirm('Supprimer cette liste ?')) return;
    const res = await fetch(`/api/admin/segments?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Liste supprimée'); loadSegments(); }
  };

  const campaignToSegment = (seg: any) => {
    setFilters({ ...emptyFilters, ...(seg?.filters ?? {}) });
    setSelectedSegmentId(seg?.id ?? '');
    setRecipientMode('liste');
    setSection('send');
  };

  const ACTIVITY_LABELS: Record<string, string> = {
    any: 'Peu importe', never: 'Jamais venue', recent1m: 'Venue récemment (< 1 mois)',
    gt1m: 'Sans RDV depuis > 1 mois', gt3m: 'Sans RDV depuis > 3 mois', gt6m: 'Sans RDV depuis > 6 mois',
  };
  const REGION_LABELS: Record<string, string> = { any: 'Toutes', idf: 'Île-de-France', other: 'Autres régions' };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: modalData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalData),
      });
      if (res.ok) { toast.success('Template enregistré'); setShowModal(false); load(); } else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Supprimer ce template ?')) return;
    const res = await fetch(`/api/admin/email-templates?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Supprimé'); load(); }
  };

  const applyTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find((tpl: any) => tpl?.id === id);
    if (t) { setSubject(t.subject); setBody(t.body); }
  };

  const send = async () => {
    if (!subject || !body) { toast.error('Sujet et contenu requis'); return; }
    let recipientIds: string[] = [];
    let rawEmails: string[] = [];
    if (usesTable) {
      // Liste / newsletter : on utilise le tableau édité (ordre de priorité conservé).
      recipientIds = recipientRows.filter((r: any) => r.userId).map((r: any) => r.userId);
      rawEmails = recipientRows.filter((r: any) => !r.userId).map((r: any) => r.email);
      const total = recipientIds.length + rawEmails.length;
      if (total === 0) { toast.error('Aucun destinataire dans la liste'); return; }
      const days = rampDays(total, maxPerDay);
      const msg = total > maxPerDay
        ? `Envoyer à ${total} destinataires ? L'envoi démarre à ${maxPerDay}/jour puis augmente progressivement (≈ ${days} jours au total), clientes les plus récentes d'abord — pour protéger votre réputation.`
        : `Envoyer cet email à ${total} destinataire(s) ?`;
      if (!confirm(msg)) return;
    } else {
      if (recipientMode === 'single') {
        const client = clients.find((c: any) => (c?.email ?? '').toLowerCase() === singleEmail.toLowerCase());
        if (!client) { toast.error('Aucun client trouvé avec cet email'); return; }
        recipientIds = [client.id];
      } else if (recipientMode === 'selected') {
        recipientIds = selectedClientIds;
      } else {
        recipientIds = clients.map((c: any) => c?.id).filter(Boolean);
      }
      if (recipientIds.length === 0) { toast.error('Aucun destinataire'); return; }
      if (recipientMode !== 'single' && !confirm(`Envoyer cet email à ${recipientIds.length} destinataire(s) ?`)) return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplateId, subject, body, recipientIds, rawEmails, maxPerDay }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.queued) {
          toast.success(data.days > 1
            ? `Campagne en file : ${data.total} emails, démarrage à ${data.startPerDay}/j puis montée en puissance (~${data.days} j), clientes récentes d'abord.`
            : `Campagne mise en file : ${data.total} emails envoyés progressivement pour protéger votre réputation.`);
          loadCampaigns(); setSection('history');
        } else {
          toast.success(`Envoyé : ${data.sent}/${data.total} (${data.skippedOptOut} désinscrit(s), ${data.failed} échec(s))`);
        }
        load();
      } else toast.error(data?.error ?? 'Erreur envoi');
    } catch { toast.error('Erreur envoi'); }
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {[{ id: 'send', label: 'Envoyer', icon: Send }, { id: 'lists', label: 'Listes', icon: Users }, { id: 'newsletter', label: `Newsletter Antibes (${newsletterSubs.length})`, icon: Mail }, { id: 'templates', label: 'Templates', icon: FileText }, { id: 'push', label: 'Notifications push', icon: Bell }, { id: 'history', label: 'Historique', icon: History }].map((s: any) => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${section === s.id ? 'bg-[#C98F79] text-white' : 'bg-white text-[#3B312D]/70'}`}>
              <Icon size={14} />{s.label}
            </button>
          );
        })}
      </div>

      {section === 'send' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 max-w-2xl">
          <div>
            <label className="text-sm font-medium text-[#3B312D]/70">Partir d'un template (optionnel)</label>
            <select value={selectedTemplateId} onChange={(e: any) => applyTemplate(e.target?.value ?? '')} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
              <option value="">Aucun (rédiger librement)</option>
              {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#3B312D]/70">Destinataires</label>
            <div className="flex gap-2 mt-1">
              {[{ id: 'single', label: 'Un contact' }, { id: 'liste', label: 'Une liste' }, { id: 'newsletter', label: `Newsletter (${newsletterSubs.length})` }, { id: 'selected', label: 'Sélection' }, { id: 'all', label: `Tous (${clients.length})` }].map((m: any) => (
                <button key={m.id} onClick={() => setRecipientMode(m.id)} className={`px-3 py-2 text-xs rounded-lg font-medium ${recipientMode === m.id ? 'bg-[#AAB7A0] text-white' : 'bg-[#F8F4EF] text-[#3B312D]/70'}`}>{m.label}</button>
              ))}
            </div>
          </div>
          {recipientMode === 'single' && (
            <input type="email" value={singleEmail} onChange={(e: any) => setSingleEmail(e.target?.value ?? '')} placeholder="email@client.fr"
              className="w-full px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
          )}
          {recipientMode === 'liste' && (
            <div>
              {segments.length === 0
                ? <p className="text-xs text-[#3B312D]/50">Aucune liste enregistrée. Créez-en une dans l'onglet <strong>Listes</strong>.</p>
                : <select value={selectedSegmentId} onChange={(e: any) => setSelectedSegmentId(e.target?.value ?? '')} className="w-full px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                    <option value="">Choisir une liste…</option>
                    {segments.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>}
              <p className="text-[11px] text-[#3B312D]/40 mt-1">Les destinataires s'affichent ci-dessous — vous pouvez en retirer ou en ajouter avant l'envoi.</p>
            </div>
          )}
          {recipientMode === 'newsletter' && (
            <p className="text-xs text-[#3B312D]/60">Liste <strong>Ouverture Antibes</strong> — {newsletterSubs.length} inscrit(e)s (emails du pop-up, non-clients).</p>
          )}

          {/* Tableau des destinataires (liste / newsletter) : recherche, ajout, retrait */}
          {usesTable && (
            <div className="border border-[#F8F4EF] rounded-xl p-3 bg-[#F8F4EF]/30">
              {loadingRecips ? (
                <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-[#C98F79]" /></div>
              ) : (() => {
                const q = recipSearch.trim().toLowerCase();
                const filtered = q ? recipientRows.filter((r: any) => (r.email + ' ' + (r.firstName ?? '') + ' ' + (r.lastName ?? '')).toLowerCase().includes(q)) : recipientRows;
                const total = recipientRows.length;
                const days = rampDays(total, maxPerDay);
                return (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <span className="text-sm font-medium text-[#3B312D]">{total} destinataire(s){q ? ` · ${filtered.length} affiché(s)` : ''}</span>
                      {total > maxPerDay && <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Envoi progressif sur ~{days} j</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <input value={recipSearch} onChange={(e: any) => setRecipSearch(e.target.value)} placeholder="Rechercher un email / nom…" className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-white text-[#3B312D]" />
                      <div className="flex gap-1">
                        <input value={addEmail} onChange={(e: any) => setAddEmail(e.target.value)} onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(); } }} placeholder="Ajouter un email" className="px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-white text-[#3B312D]" />
                        <button onClick={addRecipient} className="px-3 py-2 bg-[#AAB7A0] text-white text-sm rounded-lg">Ajouter</button>
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto bg-white rounded-lg border border-[#F8F4EF] divide-y divide-[#F8F4EF]">
                      {filtered.length === 0 ? <p className="text-xs text-[#3B312D]/40 text-center py-6">Aucun destinataire.</p> : filtered.slice(0, 300).map((r: any) => (
                        <div key={r.email} className="px-3 py-1.5 flex items-center justify-between gap-2 text-sm">
                          <div className="min-w-0">
                            <span className="text-[#3B312D] truncate">{(r.firstName || r.lastName) ? `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() + ' · ' : ''}{r.email}</span>
                            {r.added && <span className="ml-1 text-[10px] text-[#AAB7A0]">(ajouté)</span>}
                          </div>
                          <div className="flex items-center gap-2 flex-none">
                            {r.lastVisit && <span className="text-[10px] text-[#3B312D]/40 whitespace-nowrap">vu {new Date(r.lastVisit).toLocaleDateString('fr-FR')}</span>}
                            <button onClick={() => removeRecipient(r.email)} className="p-1 rounded hover:bg-red-50" title="Retirer"><X size={13} className="text-red-400" /></button>
                          </div>
                        </div>
                      ))}
                      {filtered.length > 300 && <p className="text-[10px] text-[#3B312D]/40 text-center py-2">… {filtered.length - 300} autres (utilisez la recherche)</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <label className="text-xs text-[#3B312D]/60">Envois/jour au départ</label>
                      <input type="number" min={20} max={2000} value={maxPerDay} onChange={(e: any) => setMaxPerDay(parseInt(e.target.value || '250') || 250)} className="w-24 px-2 py-1.5 text-sm border border-[#F8F4EF] rounded-lg bg-white text-[#3B312D]" />
                      <span className="text-[11px] text-[#3B312D]/40">On démarre à {maxPerDay}/jour puis on augmente progressivement (montée en puissance) pour préserver votre réputation. Clientes récentes d'abord.</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          {recipientMode === 'selected' && (
            <div className="max-h-40 overflow-y-auto border border-[#F8F4EF] rounded-lg p-2 space-y-1">
              {clients.map((c: any) => (
                <label key={c?.id} className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-[#F8F4EF]/50 rounded">
                  <input type="checkbox" checked={selectedClientIds.includes(c?.id)} onChange={(e: any) => {
                    setSelectedClientIds((prev) => e.target?.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id));
                  }} />
                  {c?.firstName ?? ''} {c?.lastName ?? ''} ({c?.email ?? ''})
                </label>
              ))}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-[#3B312D]/70">Sujet</label>
            <input value={subject} onChange={(e: any) => setSubject(e.target?.value ?? '')} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#3B312D]/70">Contenu (HTML)</label>
            <p className="text-xs text-[#3B312D]/40 mb-1">Variables disponibles : {VARIABLES.map(v => `{{${v.key}}}`).join(', ')}</p>
            <textarea value={body} onChange={(e: any) => setBody(e.target?.value ?? '')} rows={8} className="w-full px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none font-mono text-[#3B312D]" />
          </div>
          <button onClick={send} disabled={sending} className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}{sending ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </div>
      )}

      {section === 'newsletter' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">Liste « Ouverture Antibes »</h3>
              <p className="text-xs text-[#3B312D]/50 mt-1">{newsletterSubs.length} inscrit(e)s via le pop-up d'accueil. Ces emails ne sont pas des comptes clients.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportNewsletterCsv} disabled={newsletterSubs.length === 0} className="px-3 py-2 text-xs rounded-lg border border-[#C98F79] text-[#C98F79] hover:bg-[#C98F79]/10 disabled:opacity-40">Exporter CSV</button>
              <button onClick={() => { setRecipientMode('newsletter'); setSection('send'); }} disabled={newsletterSubs.length === 0} className="px-3 py-2 text-xs rounded-lg bg-[#C98F79] text-white disabled:opacity-40">Envoyer une campagne</button>
            </div>
          </div>
          {newsletterSubs.length === 0 ? (
            <p className="text-sm text-[#3B312D]/40 py-8 text-center">Aucun inscrit pour l'instant.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-[#F8F4EF] rounded-lg divide-y divide-[#F8F4EF]">
              {newsletterSubs.map((s: any) => (
                <div key={s.id} className="px-4 py-2.5 flex items-center justify-between gap-2 text-sm">
                  <span className="text-[#3B312D] truncate">{s.email}</span>
                  <div className="flex items-center gap-3 flex-none">
                    <span className="text-[11px] text-[#3B312D]/40">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</span>
                    <button onClick={() => deleteNewsletterSub(s.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {section === 'lists' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Constructeur de liste */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2"><Filter size={16} className="text-[#C98F79]" /><h3 className="font-playfair text-lg font-semibold text-[#3B312D]">Créer une liste (filtres)</h3></div>

            <div>
              <label className="text-sm font-medium text-[#3B312D]/70">Dernier rendez-vous</label>
              <select value={filters.activity} onChange={(e: any) => setFilters({ ...filters, activity: e.target.value })} className="w-full mt-1 px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Nb de RDV min.</label>
                <input type="number" min={0} value={filters.minAppointments} onChange={(e: any) => setFilters({ ...filters, minAppointments: parseInt(e.target.value || '0') || 0 })} className="w-full mt-1 px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Abonnement</label>
                <select value={filters.subscription} onChange={(e: any) => setFilters({ ...filters, subscription: e.target.value })} className="w-full mt-1 px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                  <option value="any">Peu importe</option><option value="active">Abonnées actives</option><option value="none">Sans abonnement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Région (via tél.)</label>
                <select value={filters.region} onChange={(e: any) => setFilters({ ...filters, region: e.target.value })} className="w-full mt-1 px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                  {Object.entries(REGION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Ancienneté</label>
                <select value={filters.newAccount} onChange={(e: any) => setFilters({ ...filters, newAccount: e.target.value })} className="w-full mt-1 px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                  <option value="any">Peu importe</option><option value="lt1m">Nouvelles (&lt; 1 mois)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Provenance</label>
                <select value={filters.source} onChange={(e: any) => setFilters({ ...filters, source: e.target.value })} className="w-full mt-1 px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]">
                  <option value="any">Toutes</option>
                  <option value="planity">Base Planity (Départ Paris)</option>
                  <option value="signup">Inscription site</option>
                </select>
              </div>
            </div>

            <div className="bg-[#F8F4EF]/70 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[#3B312D]">
                {previewing ? <span className="flex items-center gap-2 text-[#3B312D]/60"><Loader2 size={14} className="animate-spin" />Calcul…</span>
                  : <><strong className="text-[#C98F79] text-lg">{preview.count}</strong> cliente(s) correspondent</>}
              </span>
              <button onClick={() => runPreview(filters)} className="text-xs px-3 py-1.5 rounded-lg border border-[#C98F79] text-[#C98F79] hover:bg-[#C98F79]/10">Rafraîchir</button>
            </div>

            {preview.clients.length > 0 && (
              <div className="max-h-44 overflow-y-auto text-xs border border-[#F8F4EF] rounded-lg divide-y divide-[#F8F4EF]">
                {preview.clients.slice(0, 60).map((c: any) => (
                  <div key={c.id} className="px-3 py-1.5 flex items-center justify-between gap-2">
                    <span className="text-[#3B312D] truncate">{c.firstName} {c.lastName}</span>
                    <span className="text-[#3B312D]/40 whitespace-nowrap">{c.lastVisit ? 'vu ' + new Date(c.lastVisit).toLocaleDateString('fr-FR') : 'jamais venue'}{c.region === 'idf' ? ' · IDF' : ''}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-[#F8F4EF]">
              <input value={segName} onChange={(e: any) => setSegName(e.target?.value ?? '')} placeholder="Nom de la liste (ex : IDF inactives 3 mois)" className="flex-1 px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
              <button onClick={saveSegment} className="px-4 py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap"><Save size={14} />Enregistrer</button>
            </div>
            <button onClick={() => setFilters({ ...emptyFilters })} className="text-xs text-[#3B312D]/50 hover:text-[#3B312D]">Réinitialiser les filtres</button>
          </div>

          {/* Listes enregistrées */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mb-4">Mes listes</h3>
            {segments.length === 0 ? (
              <p className="text-sm text-[#3B312D]/40">Aucune liste enregistrée. Réglez les filtres à gauche et cliquez « Enregistrer ».</p>
            ) : (
              <div className="space-y-2">
                {segments.map((s: any) => {
                  const f = s.filters ?? {};
                  const desc = [f.source === 'planity' ? 'Base Planity' : f.source === 'signup' ? 'Inscrites site' : '', ACTIVITY_LABELS[f.activity] !== 'Peu importe' ? ACTIVITY_LABELS[f.activity] : '', f.region && f.region !== 'any' ? REGION_LABELS[f.region] : '', f.subscription === 'active' ? 'abonnées' : f.subscription === 'none' ? 'sans abo' : '', f.minAppointments ? `≥ ${f.minAppointments} RDV` : '', f.newAccount === 'lt1m' ? 'nouvelles' : ''].filter(Boolean).join(' · ') || 'Toutes les clientes';
                  return (
                    <div key={s.id} className="border border-[#F8F4EF] rounded-lg p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-[#3B312D] text-sm truncate">{s.name}</p>
                        <p className="text-[11px] text-[#3B312D]/50 mt-0.5 truncate">{desc}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-none">
                        <button onClick={() => { setFilters({ ...emptyFilters, ...f }); }} className="text-xs px-2.5 py-1.5 rounded-lg border border-[#F8F4EF] text-[#3B312D]/70 hover:bg-[#F8F4EF]">Charger</button>
                        <button onClick={() => campaignToSegment(s)} className="text-xs px-2.5 py-1.5 rounded-lg bg-[#AAB7A0] text-white">Campagne</button>
                        <button onClick={() => deleteSegment(s.id)} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-500" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {section === 'templates' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setModalData({ name: '', subject: '', body: '' }); setShowModal(true); }} className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouveau template</button>
          </div>
          <div className="space-y-3">
            {templates.length === 0 && <p className="text-center text-[#3B312D]/40 py-10">Aucun template pour l'instant</p>}
            {templates.map((t: any) => (
              <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div><p className="font-medium text-[#3B312D]">{t.name}</p><p className="text-xs text-[#3B312D]/60 mt-1">{t.subject}</p></div>
                <div className="flex gap-1">
                  <button onClick={() => { setModalData(t); setShowModal(true); }} className="p-1.5 rounded hover:bg-[#C98F79]/10"><Edit size={14} className="text-[#C98F79]" /></button>
                  <button onClick={() => deleteTemplate(t.id)} className="p-1.5 rounded hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'push' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 max-w-2xl">
          {!pushInfo?.enabled ? (
            <p className="text-sm text-[#3B312D]/60">Les notifications push ne sont pas encore configurées sur le serveur.</p>
          ) : (
            <>
              <p className="text-sm text-[#3B312D]/60"><strong>{pushInfo?.subscribers ?? 0}</strong> cliente(s) ont activé les notifications.</p>
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Titre</label>
                <input value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} placeholder="Ex : Nouvelle vidéo disponible 🌸" className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Message</label>
                <textarea value={pushBody} onChange={(e) => setPushBody(e.target.value)} rows={3} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Lien à ouvrir</label>
                <input value={pushUrl} onChange={(e) => setPushUrl(e.target.value)} placeholder="/espace-membre/videos" className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
              </div>
              <button onClick={sendPushBroadcast} disabled={pushSending} className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {pushSending ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}{pushSending ? 'Envoi…' : 'Envoyer à toutes les abonnées'}
              </button>
            </>
          )}
        </div>
      )}

      {section === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[#3B312D]">Campagnes (envoi par lots)</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#3B312D]/60">
                <span>Plage d'envoi</span>
                <select value={emailWindow.start} onChange={(e: any) => saveWindow({ ...emailWindow, start: parseInt(e.target.value) })} className="px-2 py-1 border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50">{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h}h</option>)}</select>
                <span>→</span>
                <select value={emailWindow.end} onChange={(e: any) => saveWindow({ ...emailWindow, end: parseInt(e.target.value) })} className="px-2 py-1 border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50">{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h}h</option>)}</select>
              </div>
            </div>
            {campaigns.length === 0 ? (
              <p className="text-sm text-[#3B312D]/40 py-4 text-center">Aucune campagne par lots pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c: any) => {
                  const done = (c.sentCount ?? 0) + (c.failedCount ?? 0);
                  const pct = c.total ? Math.round((done / c.total) * 100) : 0;
                  return (
                    <button key={c.id} onClick={() => openCampaign(c.id)} className="w-full text-left border border-[#F8F4EF] rounded-lg p-3 hover:border-[#C98F79]/40 transition-colors">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#3B312D] truncate">{c.subject}</p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${c.status === 'done' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : c.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-[#C98F79]/15 text-[#C98F79]'}`}>{c.status === 'done' ? 'Terminée' : c.status === 'paused' ? 'En pause' : c.status === 'sending' ? 'En cours…' : 'En file'}</span>
                      </div>
                      <div className="mt-2 h-2 bg-[#F8F4EF] rounded-full overflow-hidden"><div className="h-full bg-[#C98F79]" style={{ width: `${pct}%` }} /></div>
                      <p className="text-[11px] text-[#3B312D]/50 mt-1">{c.sentCount ?? 0} envoyé(s){c.failedCount ? ` · ${c.failedCount} échec(s)` : ''} sur {c.total} · {pct}% · cliquez pour gérer</p>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-[10px] text-[#3B312D]/40 mt-3">Envoi étalé (≈ 50 emails / 5 min, uniquement dans la plage horaire). Cliquez une campagne pour la mettre en pause, l'annuler et voir les échecs.</p>
          </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#F8F4EF]">
                <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Destinataire</th>
                <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Sujet</th>
                <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-[#3B312D]/70">Date</th>
              </tr></thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} className="border-t border-[#F8F4EF]">
                    <td className="px-4 py-3 text-[#3B312D]">{l.recipientName || l.recipientEmail}</td>
                    <td className="px-4 py-3 text-[#3B312D]/60">{l.subject}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.status === 'SENT' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : 'bg-red-100 text-red-600'}`}>{l.status === 'SENT' ? 'Envoyé' : 'Échec'}</span></td>
                    <td className="px-4 py-3 text-xs text-[#3B312D]/60">{new Date(l.createdAt).toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={4} className="text-center text-[#3B312D]/40 py-10">Aucun email envoyé pour l'instant</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">{modalData?.id ? 'Modifier le template' : 'Nouveau template'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-[#3B312D]/70">Nom du template</label>
                <input value={modalData?.name ?? ''} onChange={(e: any) => setModalData({ ...modalData, name: e.target?.value ?? '' })} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
              <div><label className="text-sm font-medium text-[#3B312D]/70">Sujet</label>
                <input value={modalData?.subject ?? ''} onChange={(e: any) => setModalData({ ...modalData, subject: e.target?.value ?? '' })} className="w-full mt-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" /></div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]/70">Contenu (HTML)</label>
                <p className="text-xs text-[#3B312D]/40 mb-1">Variables disponibles : {VARIABLES.map(v => `{{${v.key}}}`).join(', ')}</p>
                <textarea value={modalData?.body ?? ''} onChange={(e: any) => setModalData({ ...modalData, body: e.target?.value ?? '' })} rows={8} className="w-full px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none font-mono text-[#3B312D]" />
              </div>
              <button onClick={saveTemplate} disabled={saving} className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      {campaignDetail?.campaign && (() => {
        const c = campaignDetail.campaign;
        const n = campaignDetail.counts ?? {};
        const total = c.total ?? ((n.pending ?? 0) + (n.sent ?? 0) + (n.failed ?? 0) + (n.skipped ?? 0));
        const done = (n.sent ?? 0) + (n.failed ?? 0);
        const pct = total ? Math.round((done / total) * 100) : 0;
        const next = campaignDetail.nextScheduled ? new Date(campaignDetail.nextScheduled) : null;
        const failedList: string[] = campaignDetail.failedList ?? [];
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCampaignDetail(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e: any) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">{c.subject}</h3>
                  <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${c.status === 'done' ? 'bg-[#AAB7A0]/20 text-[#AAB7A0]' : c.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-[#C98F79]/15 text-[#C98F79]'}`}>{c.status === 'done' ? 'Terminée' : c.status === 'paused' ? 'En pause' : c.status === 'sending' ? 'En cours…' : 'En file'}</span>
                </div>
                <button onClick={() => setCampaignDetail(null)} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={18} /></button>
              </div>

              <div className="h-2.5 bg-[#F8F4EF] rounded-full overflow-hidden mb-2"><div className="h-full bg-[#C98F79]" style={{ width: `${pct}%` }} /></div>
              <p className="text-xs text-[#3B312D]/60 mb-4">{done} / {total} traité(s) · {pct}%</p>

              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                <div className="bg-[#F8F4EF]/60 rounded-lg py-2"><p className="text-base font-semibold text-[#AAB7A0]">{n.sent ?? 0}</p><p className="text-[10px] text-[#3B312D]/50">Envoyés</p></div>
                <div className="bg-[#F8F4EF]/60 rounded-lg py-2"><p className="text-base font-semibold text-[#3B312D]">{n.pending ?? 0}</p><p className="text-[10px] text-[#3B312D]/50">En attente</p></div>
                <div className="bg-[#F8F4EF]/60 rounded-lg py-2"><p className="text-base font-semibold text-[#C98F79]">{n.failed ?? 0}</p><p className="text-[10px] text-[#3B312D]/50">Échecs</p></div>
                <div className="bg-[#F8F4EF]/60 rounded-lg py-2"><p className="text-base font-semibold text-[#3B312D]/40">{n.skipped ?? 0}</p><p className="text-[10px] text-[#3B312D]/50">Ignorés</p></div>
              </div>

              {next && (n.pending ?? 0) > 0 && (
                <p className="text-xs text-[#3B312D]/60 mb-4">Prochain envoi prévu : <span className="font-medium text-[#3B312D]">{next.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></p>
              )}

              <div className="flex gap-2 mb-4">
                {(c.status === 'sending' || c.status === 'queued') && (
                  <button onClick={() => campaignAction(c.id, 'pause')} className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200">Mettre en pause</button>
                )}
                {c.status === 'paused' && (
                  <button onClick={() => campaignAction(c.id, 'resume')} className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-[#AAB7A0]/20 text-[#AAB7A0] hover:bg-[#AAB7A0]/30">Reprendre</button>
                )}
                {c.status !== 'done' && (
                  <button onClick={() => { if (confirm('Annuler définitivement les envois restants de cette campagne ?')) campaignAction(c.id, 'cancel'); }} className="flex-1 py-2.5 text-sm font-medium rounded-lg bg-[#C98F79]/10 text-[#C98F79] hover:bg-[#C98F79]/20">Annuler les restants</button>
                )}
              </div>

              {failedList.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#3B312D]/70 mb-1">Adresses en échec ({failedList.length}{failedList.length >= 100 ? '+' : ''})</p>
                  <div className="max-h-40 overflow-y-auto bg-[#F8F4EF]/40 rounded-lg p-2 text-[11px] text-[#3B312D]/60 space-y-0.5">
                    {failedList.map((e, i) => <p key={i} className="truncate">{e}</p>)}
                  </div>
                  <p className="text-[10px] text-[#3B312D]/40 mt-1">Ces contacts sont marqués « email en échec » dans leur fiche.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
