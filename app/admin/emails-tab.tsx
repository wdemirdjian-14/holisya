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
  const [section, setSection] = useState<'templates' | 'send' | 'history' | 'push' | 'lists'>('send');

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
  const [recipientMode, setRecipientMode] = useState<'single' | 'selected' | 'all' | 'liste'>('single');
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

  useEffect(() => { load(); loadPush(); loadSegments(); }, []);

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
  const REGION_LABELS: Record<string, string> = { any: 'Toutes', idf: 'Île-de-France (01)', other: 'Autres régions (02–05)' };

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
    if (recipientMode === 'single') {
      const client = clients.find((c: any) => (c?.email ?? '').toLowerCase() === singleEmail.toLowerCase());
      if (!client) { toast.error('Aucun client trouvé avec cet email'); return; }
      recipientIds = [client.id];
    } else if (recipientMode === 'selected') {
      recipientIds = selectedClientIds;
    } else if (recipientMode === 'liste') {
      const seg = segments.find((s: any) => s.id === selectedSegmentId);
      if (!seg) { toast.error('Choisissez une liste'); return; }
      const res = await fetch('/api/admin/segments/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filters: seg.filters }) });
      const d = await res.json();
      recipientIds = d?.ids ?? [];
    } else {
      recipientIds = clients.map((c: any) => c?.id).filter(Boolean);
    }
    if (recipientIds.length === 0) { toast.error('Aucun destinataire'); return; }
    if (recipientMode !== 'single' && !confirm(`Envoyer cet email à ${recipientIds.length} destinataire(s) ?`)) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplateId, subject, body, recipientIds }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Envoyé : ${data.sent}/${data.total} (${data.skippedOptOut} désinscrit(s), ${data.failed} échec(s))`);
        load();
      } else toast.error(data?.error ?? 'Erreur envoi');
    } catch { toast.error('Erreur envoi'); }
    setSending(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {[{ id: 'send', label: 'Envoyer', icon: Send }, { id: 'lists', label: 'Listes', icon: Users }, { id: 'templates', label: 'Templates', icon: FileText }, { id: 'push', label: 'Notifications push', icon: Bell }, { id: 'history', label: 'Historique', icon: History }].map((s: any) => {
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
              {[{ id: 'single', label: 'Un contact' }, { id: 'liste', label: 'Une liste' }, { id: 'selected', label: 'Sélection' }, { id: 'all', label: `Tous (${clients.length})` }].map((m: any) => (
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
              <p className="text-[11px] text-[#3B312D]/40 mt-1">La liste est recalculée à l'envoi (clientes à jour selon les critères).</p>
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
                  const desc = [ACTIVITY_LABELS[f.activity] !== 'Peu importe' ? ACTIVITY_LABELS[f.activity] : '', f.region && f.region !== 'any' ? REGION_LABELS[f.region] : '', f.subscription === 'active' ? 'abonnées' : f.subscription === 'none' ? 'sans abo' : '', f.minAppointments ? `≥ ${f.minAppointments} RDV` : '', f.newAccount === 'lt1m' ? 'nouvelles' : ''].filter(Boolean).join(' · ') || 'Toutes les clientes';
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
    </div>
  );
}
