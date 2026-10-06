'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  TrendingUp, Search, Users, Eye, Globe, CheckCircle2, Circle, Save, ChevronDown, ExternalLink, Smartphone, Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from 'recharts';

const BRAND = '#C98F79';
const GREEN = '#AAB7A0';
const PALETTE = ['#C98F79', '#AAB7A0', '#8FA8B7', '#D4B483', '#B79CC9', '#C99CB0'];

const nf = (n: number) => (n ?? 0).toLocaleString('fr-FR');
const pct = (n: number) => `${((n ?? 0) * 100).toFixed(1)} %`;
const dur = (s: number) => `${Math.floor((s ?? 0) / 60)}min ${String(Math.round((s ?? 0) % 60)).padStart(2, '0')}s`;
const shortDate = (d: string) => { const p = d?.split('-'); return p?.length === 3 ? `${p[2]}/${p[1]}` : d; };

export default function SeoTab() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [health, setHealth] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ ga4MeasurementId: '', ga4PropertyId: '', gscSiteUrl: '' });
  const [days, setDays] = useState(28);
  const [traffic, setTraffic] = useState<any>(null);
  const [search, setSearch] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [metaPages, setMetaPages] = useState<any[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const loadBase = async () => {
    try {
      const d = await fetch('/api/admin/seo').then((r) => r.json());
      setConfig(d.config); setHealth(d.health ?? []); setSettings(d.settings ?? {});
    } catch {}
    try {
      const m = await fetch('/api/admin/seo/meta').then((r) => r.json());
      setMetaPages(m.pages ?? []);
    } catch {}
    setLoading(false);
  };

  const loadData = async (d = days) => {
    setLoadingData(true);
    try {
      const [t, s] = await Promise.all([
        fetch(`/api/admin/seo/traffic?days=${d}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/admin/seo/search?days=${d}`).then((r) => r.json()).catch(() => null),
      ]);
      setTraffic(t); setSearch(s);
    } catch {}
    setLoadingData(false);
  };

  useEffect(() => { loadBase(); }, []);
  useEffect(() => { if (!loading) loadData(days); /* eslint-disable-next-line */ }, [loading, days]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/seo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (res.ok) { toast.success('Réglages enregistrés'); await loadBase(); await loadData(days); }
      else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSavingSettings(false);
  };

  const saveMeta = async (page: any) => {
    try {
      const res = await fetch('/api/admin/seo/meta', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: page.path, title: page.title, description: page.description }) });
      if (res.ok) toast.success(`Balises « ${page.label} » enregistrées`); else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C98F79]" size={28} /></div>;

  return (
    <div className="space-y-5">
      {/* En-tête + période */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D] flex items-center gap-2"><TrendingUp size={20} className="text-[#C98F79]" />Référencement & Trafic</h2>
          <p className="text-sm text-[#3B312D]/50 mt-0.5">Visibilité Google & IA, trafic du site et outils SEO.</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          {[7, 28, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg font-medium ${days === d ? 'bg-[#C98F79] text-white' : 'bg-white text-[#3B312D]/60 hover:bg-[#F8F4EF]'}`}>{d} j</button>
          ))}
        </div>
      </div>

      {/* Santé SEO */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3B312D] mb-3">État du référencement</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {health.map((h) => (
            <div key={h.key} className="flex items-center gap-2 text-sm">
              {h.ok ? <CheckCircle2 size={16} className="text-[#AAB7A0] shrink-0" /> : <Circle size={16} className="text-[#3B312D]/25 shrink-0" />}
              <span className={h.ok ? 'text-[#3B312D]/80' : 'text-[#3B312D]/50'}>{h.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-[#F8F4EF] text-[#3B312D]/70 hover:bg-[#F0E9E0] flex items-center gap-1"><ExternalLink size={12} />Search Console</a>
          <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-[#F8F4EF] text-[#3B312D]/70 hover:bg-[#F0E9E0] flex items-center gap-1"><ExternalLink size={12} />Google Analytics</a>
          <a href="https://search.google.com/test/rich-results" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-[#F8F4EF] text-[#3B312D]/70 hover:bg-[#F0E9E0] flex items-center gap-1"><ExternalLink size={12} />Test données structurées</a>
          <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-[#F8F4EF] text-[#3B312D]/70 hover:bg-[#F0E9E0] flex items-center gap-1"><ExternalLink size={12} />Voir /llms.txt</a>
        </div>
      </div>

      {/* TRAFIC GA4 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#3B312D] flex items-center gap-2"><Users size={16} className="text-[#C98F79]" />Trafic du site (Google Analytics)</h3>
          {loadingData && <Loader2 size={15} className="animate-spin text-[#C98F79]" />}
        </div>

        {!traffic?.configured ? (
          <SetupNotice reason={traffic?.reason} type="ga4" onOpen={() => setShowSetup(true)} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
              <Kpi label="Visiteurs" value={nf(traffic.summary.totalUsers)} />
              <Kpi label="Sessions" value={nf(traffic.summary.sessions)} />
              <Kpi label="Nouveaux" value={nf(traffic.summary.newUsers)} />
              <Kpi label="Pages vues" value={nf(traffic.summary.pageViews)} />
              <Kpi label="Durée moy." value={dur(traffic.summary.avgEngagementSec)} />
            </div>

            {traffic.series?.length > 0 && (
              <div className="h-56 mb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={traffic.series} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E9E0" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: '#8a7d75' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#8a7d75' }} allowDecimals={false} />
                    <Tooltip labelFormatter={(l) => shortDate(String(l))} contentStyle={{ borderRadius: 10, border: '1px solid #F0E9E0', fontSize: 12 }} />
                    <Line type="monotone" dataKey="sessions" name="Sessions" stroke={BRAND} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="users" name="Visiteurs" stroke={GREEN} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Canaux */}
              <div>
                <p className="text-xs font-medium text-[#3B312D]/60 mb-2">Sources de trafic</p>
                {traffic.channels?.length ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={traffic.channels} layout="vertical" margin={{ left: 10, right: 16 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="channel" width={110} tick={{ fontSize: 11, fill: '#5c524c' }} />
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #F0E9E0', fontSize: 12 }} />
                        <Bar dataKey="sessions" name="Sessions" radius={[0, 6, 6, 0]}>
                          {traffic.channels.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <Empty />}
              </div>
              {/* Appareils */}
              <div>
                <p className="text-xs font-medium text-[#3B312D]/60 mb-2 flex items-center gap-1"><Smartphone size={12} />Appareils</p>
                {traffic.devices?.length ? (
                  <div className="space-y-2 pt-1">
                    {traffic.devices.map((d: any, i: number) => {
                      const total = traffic.devices.reduce((s: number, x: any) => s + x.sessions, 0) || 1;
                      const p = Math.round((d.sessions / total) * 100);
                      const label = d.device === 'mobile' ? 'Mobile' : d.device === 'desktop' ? 'Ordinateur' : d.device === 'tablet' ? 'Tablette' : d.device;
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs text-[#3B312D]/70 mb-0.5"><span>{label}</span><span>{p}% · {nf(d.sessions)}</span></div>
                          <div className="h-2 bg-[#F8F4EF] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p}%`, background: PALETTE[i % PALETTE.length] }} /></div>
                        </div>
                      );
                    })}
                  </div>
                ) : <Empty />}
              </div>
            </div>

            {/* Pages les plus vues */}
            {traffic.topPages?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium text-[#3B312D]/60 mb-2">Pages les plus vues</p>
                <div className="overflow-hidden rounded-lg border border-[#F8F4EF]">
                  {traffic.topPages.slice(0, 10).map((pg: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm border-b border-[#F8F4EF] last:border-0">
                      <span className="truncate text-[#3B312D]/80" title={pg.title}>{pg.path}</span>
                      <span className="text-[#3B312D]/50 shrink-0">{nf(pg.views)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* RECHERCHE GOOGLE (GSC) */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3B312D] flex items-center gap-2 mb-4"><Search size={16} className="text-[#C98F79]" />Recherche Google (mots-clés)</h3>
        {!search?.configured ? (
          <SetupNotice reason={search?.reason} type="gsc" onOpen={() => setShowSetup(true)} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <Kpi label="Clics" value={nf(search.totals.clicks)} />
              <Kpi label="Impressions" value={nf(search.totals.impressions)} />
              <Kpi label="CTR" value={pct(search.totals.ctr)} />
              <Kpi label="Position moy." value={(search.totals.position ?? 0).toFixed(1)} />
            </div>
            <p className="text-xs font-medium text-[#3B312D]/60 mb-2">Requêtes qui vous amènent du monde</p>
            <div className="overflow-x-auto rounded-lg border border-[#F8F4EF]">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] text-[#3B312D]/45 bg-[#F8F4EF]/50">
                  <th className="px-3 py-2 font-medium">Requête</th><th className="px-3 py-2 font-medium text-right">Clics</th>
                  <th className="px-3 py-2 font-medium text-right">Impr.</th><th className="px-3 py-2 font-medium text-right">CTR</th>
                  <th className="px-3 py-2 font-medium text-right">Pos.</th>
                </tr></thead>
                <tbody>
                  {search.queries.slice(0, 20).map((q: any, i: number) => (
                    <tr key={i} className="border-t border-[#F8F4EF]">
                      <td className="px-3 py-2 text-[#3B312D]/80">{q.query}</td>
                      <td className="px-3 py-2 text-right text-[#3B312D]/70">{nf(q.clicks)}</td>
                      <td className="px-3 py-2 text-right text-[#3B312D]/50">{nf(q.impressions)}</td>
                      <td className="px-3 py-2 text-right text-[#3B312D]/50">{pct(q.ctr)}</td>
                      <td className="px-3 py-2 text-right text-[#3B312D]/50">{(q.position ?? 0).toFixed(1)}</td>
                    </tr>
                  ))}
                  {search.queries.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-[#3B312D]/40">Pas encore de données.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[#3B312D]/40 mt-2">Données Search Console (≈ 3 jours de décalage).</p>
          </>
        )}
      </div>

      {/* BALISES PAR PAGE */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#3B312D] flex items-center gap-2 mb-1"><Globe size={16} className="text-[#C98F79]" />Balises des pages (titre & description Google)</h3>
        <p className="text-xs text-[#3B312D]/45 mb-4">Ce qui s'affiche dans les résultats Google. Laisser vide = texte par défaut. Idéal : titre ≤ 60 car., description ≤ 155 car.</p>
        <div className="space-y-3">
          {metaPages.map((p, idx) => (
            <div key={p.path} className="border border-[#F8F4EF] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#3B312D]">{p.label} <span className="text-[#3B312D]/35 font-normal">{p.path}</span></span>
                <button onClick={() => saveMeta(p)} className="text-xs px-2.5 py-1 rounded-lg bg-[#C98F79] text-white flex items-center gap-1 hover:bg-[#b87d68]"><Save size={11} />Enregistrer</button>
              </div>
              <input value={p.title} onChange={(e) => setMetaPages((m) => m.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))}
                placeholder="Titre (balise <title>)" maxLength={70}
                className="w-full mb-1.5 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/40 text-[#3B312D]" />
              <textarea value={p.description} onChange={(e) => setMetaPages((m) => m.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))}
                placeholder="Description (meta description)" rows={2} maxLength={170}
                className="w-full px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/40 resize-none text-[#3B312D]" />
              <div className="flex justify-end gap-3 text-[10px] text-[#3B312D]/35 mt-1">
                <span className={p.title?.length > 60 ? 'text-[#C98F79]' : ''}>{p.title?.length || 0}/60</span>
                <span className={p.description?.length > 155 ? 'text-[#C98F79]' : ''}>{p.description?.length || 0}/155</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RÉGLAGES / CONNEXIONS */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <button onClick={() => setShowSetup((s) => !s)} className="w-full flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#3B312D] flex items-center gap-2"><Globe size={16} className="text-[#C98F79]" />Connexions & réglages</h3>
          <ChevronDown size={18} className={`text-[#3B312D]/40 transition-transform ${showSetup ? 'rotate-180' : ''}`} />
        </button>

        {showSetup && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-2 text-xs">
              <StatusChip ok={config?.ga4Tag} label="Tag GA4 (site)" />
              <StatusChip ok={config?.serviceAccount} label="Compte de service Google" />
              <StatusChip ok={config?.ga4DataApi && config?.searchConsole} label="APIs lecture (trafic + mots-clés)" />
            </div>

            <div className="space-y-3">
              <Field label="ID de mesure GA4 (tag du site)" hint="Format G-XXXXXXX — pose la mesure d'audience sur le site.">
                <input value={settings.ga4MeasurementId ?? ''} onChange={(e) => setSettings({ ...settings, ga4MeasurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX" className="w-full px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/40 text-[#3B312D]" />
              </Field>
              <Field label="ID de propriété GA4 (API trafic)" hint="Nombre, ex 123456789. GA4 › Admin › Paramètres de la propriété › ID de propriété.">
                <input value={settings.ga4PropertyId ?? ''} onChange={(e) => setSettings({ ...settings, ga4PropertyId: e.target.value })}
                  placeholder="123456789" className="w-full px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/40 text-[#3B312D]" />
              </Field>
              <Field label="Propriété Search Console (API mots-clés)" hint="« sc-domain:holisya.fr » (propriété domaine) ou « https://www.holisya.fr/ » (préfixe URL).">
                <input value={settings.gscSiteUrl ?? ''} onChange={(e) => setSettings({ ...settings, gscSiteUrl: e.target.value })}
                  placeholder="sc-domain:holisya.fr" className="w-full px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/40 text-[#3B312D]" />
              </Field>
              <button onClick={saveSettings} disabled={savingSettings} className="px-4 py-2.5 bg-[#C98F79] text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-1.5"><Save size={14} />{savingSettings ? 'Enregistrement…' : 'Enregistrer les réglages'}</button>
            </div>

            <div className="bg-[#F8F4EF]/60 rounded-lg p-4 text-xs text-[#3B312D]/70 leading-relaxed space-y-1.5">
              <p className="font-semibold text-[#3B312D]">Activer le trafic & les mots-clés dans l'admin (une seule fois)</p>
              <p>1. Sur <a className="underline text-[#C98F79]" href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud</a> : créez un projet, activez « Google Analytics Data API » et « Search Console API ».</p>
              <p>2. Créez un <b>compte de service</b>, puis une <b>clé JSON</b> (téléchargée).</p>
              <p>3. Copiez l'email du compte de service (…@….iam.gserviceaccount.com) et ajoutez-le comme <b>Lecteur</b> : dans GA4 (Admin › Accès à la propriété) <b>et</b> dans Search Console (Paramètres › Utilisateurs).</p>
              <p>4. Envoyez-moi la clé JSON : je l'installe côté serveur (variables <code>GOOGLE_SA_EMAIL</code> / <code>GOOGLE_SA_PRIVATE_KEY</code>) — jamais dans le code.</p>
              <p>5. Renseignez ci-dessus l'ID de propriété GA4 et la propriété Search Console, puis « Enregistrer ».</p>
              {config?.serviceAccountEmail && <p className="pt-1">Compte de service actuel : <code className="text-[#3B312D]">{config.serviceAccountEmail}</code></p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F8F4EF]/60 rounded-lg px-3 py-3 text-center">
      <p className="text-lg font-semibold text-[#3B312D]">{value}</p>
      <p className="text-[11px] text-[#3B312D]/50 mt-0.5">{label}</p>
    </div>
  );
}

function Empty() { return <p className="text-xs text-[#3B312D]/35 py-6 text-center">Pas de données sur la période.</p>; }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#3B312D]/80">{label}</label>
      {hint && <p className="text-[11px] text-[#3B312D]/40 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

function StatusChip({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${ok ? 'bg-[#AAB7A0]/15 text-[#5c6b50]' : 'bg-[#F8F4EF] text-[#3B312D]/45'}`}>
      {ok ? <CheckCircle2 size={14} /> : <Circle size={14} />}<span className="font-medium">{label}</span>
    </div>
  );
}

function SetupNotice({ reason, type, onOpen }: { reason?: string; type: 'ga4' | 'gsc'; onOpen: () => void }) {
  const msg = reason === 'service-account'
    ? "La connexion Google (compte de service) n'est pas encore installée."
    : reason === 'property-id' ? "Il manque l'ID de propriété GA4."
    : reason === 'site-url' ? "Il manque l'adresse de la propriété Search Console."
    : reason === 'api-error' ? "Connexion établie mais l'API a renvoyé une erreur (vérifiez les accès/ID)."
    : "Pas encore connecté.";
  return (
    <div className="bg-[#F8F4EF]/60 rounded-lg p-5 text-center">
      <p className="text-sm text-[#3B312D]/70">{msg}</p>
      <button onClick={onOpen} className="mt-3 text-xs px-4 py-2 rounded-lg bg-[#C98F79] text-white font-medium">Voir comment connecter</button>
      <p className="text-[11px] text-[#3B312D]/40 mt-2">{type === 'ga4' ? 'Le site est déjà suivi par GA4 ; cette étape sert à afficher le trafic ici.' : 'Les mots-clés viennent de Search Console.'}</p>
    </div>
  );
}
