'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { Loader2, Download, QrCode, Check, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';

type TargetType = 'site' | 'planity' | 'booking' | 'page' | 'custom';

const OPTIONS: { type: TargetType; label: string; hint: string }[] = [
  { type: 'site', label: 'Site web', hint: 'Page d\'accueil de holisya.fr' },
  { type: 'planity', label: 'Planity', hint: 'Votre page de réservation Planity' },
  { type: 'booking', label: 'Page de rendez-vous', hint: 'La prise de rendez-vous du site' },
  { type: 'page', label: 'Une page du site', hint: 'Choisir dans la liste' },
  { type: 'custom', label: 'Lien personnalisé', hint: 'N\'importe quelle adresse web, à vérifier' },
];

const QR_COLOR = { dark: '#3B312D', light: '#FFFFFF' };

export default function SettingsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Réglages</h2>
      </div>
      <QrCodeSettings />
    </div>
  );
}

function QrCodeSettings() {
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<TargetType>('site');
  const [page, setPage] = useState('/');
  const [customUrl, setCustomUrl] = useState('');
  const [verified, setVerified] = useState<{ url: string; ok: boolean; error?: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    fetch('/api/admin/qr').then((r) => r.json()).then((d) => {
      setData(d);
      setType(d?.target?.type ?? 'site');
      if (d?.target?.page) setPage(d.target.page);
      if (d?.target?.url) { setCustomUrl(d.target.url); setVerified({ url: d.target.url, ok: true }); }
    }).catch(() => toast.error('Erreur de chargement'));
  }, []);

  useEffect(() => {
    if (!data?.qrUrl) return;
    QRCode.toDataURL(data.qrUrl, { width: 480, margin: 2, errorCorrectionLevel: 'M', color: QR_COLOR }).then(setPreview).catch(() => {});
  }, [data?.qrUrl]);

  const verify = async () => {
    setVerifying(true);
    try {
      const r = await fetch('/api/admin/qr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: customUrl }) });
      const d = await r.json();
      if (d?.url) setCustomUrl(d.url);
      setVerified({ url: d?.url ?? customUrl, ok: !!d?.ok, error: d?.error });
      if (d?.ok) toast.success('Lien vérifié'); else toast.error(d?.error ?? 'Lien invalide');
    } catch { toast.error('Erreur'); }
    setVerifying(false);
  };

  const customReady = !!verified?.ok && verified.url === customUrl;
  const canSave = !saving && (type !== 'custom' || customReady);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch('/api/admin/qr', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, page, url: customUrl }) });
      const d = await r.json();
      if (r.ok) { setData((prev: any) => ({ ...prev, target: d.target, destination: d.destination })); toast.success('Destination du QR code enregistrée'); }
      else toast.error(d?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const download = async (format: 'png' | 'svg') => {
    if (!data?.qrUrl) return;
    const href = format === 'png'
      ? await QRCode.toDataURL(data.qrUrl, { width: 2048, margin: 4, errorCorrectionLevel: 'M', color: QR_COLOR })
      : URL.createObjectURL(new Blob([await QRCode.toString(data.qrUrl, { type: 'svg', margin: 4, errorCorrectionLevel: 'M', color: QR_COLOR })], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = href;
    a.download = `qr-code-holisya.${format}`;
    a.click();
    if (format === 'svg') setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  if (!data) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  const savedType: TargetType = data?.target?.type ?? 'site';
  const dirty = type !== savedType
    || (type === 'page' && page !== data?.target?.page)
    || (type === 'custom' && customUrl !== data?.target?.url);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-1">
        <QrCode size={18} className="text-[#C98F79]" />
        <h3 className="font-medium text-[#3B312D]">QR code</h3>
      </div>
      <p className="text-xs text-[#3B312D]/50 mb-5">
        Le QR code ne change jamais : vous pouvez l&apos;imprimer une fois, puis modifier ici la page vers laquelle il envoie.
      </p>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center gap-3">
          {preview
            ? <img src={preview} alt="QR code Holisya" className="w-[200px] h-[200px] rounded-lg border border-[#F8F4EF]" />
            : <div className="w-[200px] h-[200px] rounded-lg bg-[#F8F4EF]" />}
          <div className="flex gap-2 w-full max-w-[200px]">
            <button onClick={() => download('png')} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#C98F79] text-white hover:bg-[#b87d68] transition-colors">
              <Download size={14} />PNG
            </button>
            <button onClick={() => download('svg')} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-[#F8F4EF] text-[#3B312D] hover:bg-[#C98F79]/10 transition-colors">
              <Download size={14} />SVG
            </button>
          </div>
          <p className="text-[11px] text-[#3B312D]/40 text-center">PNG pour les réseaux, SVG pour l&apos;imprimeur.</p>
          <p className="text-xs text-[#3B312D]/60">{data.scans} scan{data.scans > 1 ? 's' : ''}</p>
        </div>

        <div className="min-w-0">
          <div className="rounded-lg bg-[#F8F4EF]/60 px-4 py-3 mb-4 text-sm">
            <span className="text-[#3B312D]/60">Envoie actuellement vers : </span>
            <a href={data.qrUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-[#C98F79] break-all inline-flex items-center gap-1">
              {data.destination}<ExternalLink size={12} className="flex-none" />
            </a>
          </div>

          <p className="text-sm font-medium text-[#3B312D]/70 mb-2">Destination</p>
          <div className="space-y-2">
            {OPTIONS.map((o) => (
              <label key={o.type} className={`block rounded-lg border px-4 py-3 cursor-pointer transition-colors ${type === o.type ? 'border-[#C98F79] bg-[#C98F79]/5' : 'border-[#F8F4EF] hover:border-[#C98F79]/40'}`}>
                <div className="flex items-start gap-3">
                  <input type="radio" name="qr-target" checked={type === o.type} onChange={() => setType(o.type)} className="mt-1 accent-[#C98F79]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#3B312D]">{o.label}</p>
                    <p className="text-xs text-[#3B312D]/50">{o.type === 'planity' ? data.planityUrl : o.hint}</p>

                    {o.type === 'page' && type === 'page' && (
                      <select value={page} onChange={(e) => setPage(e.target.value)}
                        className="mt-2 w-full px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-white text-[#3B312D]">
                        {(data.pages ?? []).map((p: any) => <option key={p.path} value={p.path}>{p.label} ({p.path})</option>)}
                      </select>
                    )}

                    {o.type === 'custom' && type === 'custom' && (
                      <div className="mt-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://..."
                            className="flex-1 min-w-0 px-3 py-2 text-sm border border-[#F8F4EF] rounded-lg bg-white text-[#3B312D]" />
                          <button type="button" onClick={verify} disabled={verifying || !customUrl.trim()}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-[#AAB7A0] text-white hover:bg-[#98a68e] disabled:opacity-50 transition-colors">
                            {verifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}Vérifier
                          </button>
                        </div>
                        {verified && verified.url === customUrl && (
                          verified.ok
                            ? <p className="mt-1.5 text-xs text-[#7d8f70] flex items-center gap-1"><Check size={12} />Lien vérifié, il fonctionne.</p>
                            : <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{verified.error}</p>
                        )}
                        {customUrl.trim() && !customReady && !(verified && verified.url === customUrl) && (
                          <p className="mt-1.5 text-xs text-[#3B312D]/50">Cliquez sur Vérifier avant d&apos;enregistrer.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={save} disabled={!canSave || !dirty}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-[#C98F79] text-white hover:bg-[#b87d68] disabled:opacity-50 transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
