'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2, Play, Upload, Image as ImageIcon, Eye, BarChart3, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function VideosTab() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<any>(null); // édition/création
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [viewsModal, setViewsModal] = useState<any>(null);
  const [views, setViews] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => { setLoading(true); fetch('/api/admin/videos').then((r) => r.json()).then((d) => { setVideos(d?.videos ?? []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const saveMeta = async () => {
    if (!modal?.title) { toast.error('Titre requis'); return; }
    setSaving(true);
    try {
      const method = modal?.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/videos', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modal) });
      const d = await res.json();
      if (res.ok) { toast.success('Enregistré'); setModal({ ...modal, id: d?.video?.id ?? modal.id }); load(); }
      else toast.error(d?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const detectDuration = (file: File): Promise<number> => new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const el = document.createElement('video');
      el.preload = 'metadata';
      el.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(Math.floor(el.duration) || 0); };
      el.onerror = () => resolve(0);
      el.src = url;
    } catch { resolve(0); }
  });

  const uploadVideo = async (file: File) => {
    if (!modal?.id) { toast.error('Enregistrez d\'abord les infos'); return; }
    const duration = await detectDuration(file);
    setUploadPct(0);
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `/api/admin/videos/upload?id=${modal.id}&duration=${duration}`);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100)); };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.responseText)));
        xhr.onerror = () => reject(new Error('network'));
        xhr.send(file);
      });
      toast.success('Vidéo importée');
      setModal((m: any) => ({ ...m, durationSec: duration, fileName: `${m.id}.mp4` }));
      load();
    } catch { toast.error('Échec de l\'upload'); }
    setUploadPct(null);
  };

  const uploadThumb = async (file: File) => {
    if (!modal?.id) return;
    const body = new FormData(); body.append('file', file); body.append('id', modal.id);
    const res = await fetch('/api/admin/videos/thumbnail', { method: 'POST', body });
    const d = await res.json();
    if (res.ok) { setModal((m: any) => ({ ...m, thumbnailUrl: d.thumbnailUrl })); toast.success('Miniature importée'); load(); }
    else toast.error(d?.error ?? 'Erreur');
  };

  const del = async (id: string) => {
    if (!confirm('Supprimer cette vidéo et son fichier ?')) return;
    const res = await fetch(`/api/admin/videos?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Supprimée'); load(); } else toast.error('Erreur');
  };

  const openViews = async (v: any) => {
    setViewsModal(v); setViews([]);
    const d = await fetch(`/api/admin/videos/views?id=${v.id}`).then((r) => r.json());
    setViews(d?.views ?? []);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Vidéos premium</h2>
          <p className="text-xs text-[#3B312D]/50 mt-1">Techniques d'auto-massage réservées aux abonnés ou à l'achat. Fichiers protégés (non téléchargeables).</p>
        </div>
        <button onClick={() => setModal({ title: '', description: '', priceCents: 0, isPremiumOnly: true, isPublished: false, chapters: '', sortOrder: 0 })} className="px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2"><Plus size={14} />Nouvelle vidéo</button>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm"><Play size={28} className="text-[#C98F79]/40 mx-auto mb-2" /><p className="text-[#3B312D]/40 text-sm">Aucune vidéo. Créez-en une pour commencer.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v: any) => (
            <div key={v.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative aspect-video bg-[#3B312D]/5">
                {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Play size={26} className="text-[#C98F79]/40" /></div>}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.isPublished ? 'bg-[#AAB7A0] text-white' : 'bg-yellow-100 text-yellow-700'}`}>{v.isPublished ? 'Publiée' : 'Brouillon'}</span>
                  {v.isPremiumOnly && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#C98F79] text-white flex items-center gap-0.5"><Crown size={9} />Premium</span>}
                </div>
                {!v.fileName && <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-red-500 text-white">Fichier manquant</span>}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-[#3B312D] truncate">{v.title}</h3>
                <div className="flex items-center gap-3 text-xs text-[#3B312D]/50 mt-1">
                  {v.priceCents > 0 && <span>{(v.priceCents / 100).toFixed(2)}€</span>}
                  <span className="flex items-center gap-1"><Eye size={11} />{v._count?.views ?? 0} vues</span>
                  {v._count?.accesses > 0 && <span>{v._count.accesses} achats</span>}
                </div>
                <div className="flex gap-1 mt-3">
                  <button onClick={() => setModal(v)} className="flex-1 py-2 text-xs bg-[#F8F4EF] text-[#3B312D] rounded-lg flex items-center justify-center gap-1"><Edit size={12} />Éditer</button>
                  <button onClick={() => openViews(v)} className="flex-1 py-2 text-xs bg-[#F8F4EF] text-[#3B312D] rounded-lg flex items-center justify-center gap-1"><BarChart3 size={12} />Vues</button>
                  <button onClick={() => del(v.id)} className="px-2.5 py-2 text-xs bg-red-50 text-red-500 rounded-lg"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal édition */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto" onClick={() => { setModal(null); }}>
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl min-h-full sm:min-h-0 sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-[#F8F4EF] z-10">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">{modal?.id ? 'Modifier la vidéo' : 'Nouvelle vidéo'}</h3>
              <button onClick={() => { setModal(null); load(); }} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Titre"><input value={modal?.title ?? ''} onChange={(e) => setModal({ ...modal, title: e.target.value })} className={inp} /></Field>
              <Field label="Description"><textarea value={modal?.description ?? ''} onChange={(e) => setModal({ ...modal, description: e.target.value })} rows={2} className={`${inp} resize-none`} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prix à l'achat (€, 0 = non vendable)"><input type="number" step="0.01" value={(modal?.priceCents ?? 0) / 100} onChange={(e) => setModal({ ...modal, priceCents: Math.round(parseFloat(e.target.value || '0') * 100) })} className={inp} /></Field>
                <Field label="Ordre"><input type="number" value={modal?.sortOrder ?? 0} onChange={(e) => setModal({ ...modal, sortOrder: parseInt(e.target.value || '0') })} className={inp} /></Field>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-[#3B312D]"><input type="checkbox" checked={modal?.isPremiumOnly ?? true} onChange={(e) => setModal({ ...modal, isPremiumOnly: e.target.checked })} />Réservée aux abonnés premium</label>
                <label className="flex items-center gap-2 text-sm text-[#3B312D]"><input type="checkbox" checked={modal?.isPublished ?? false} onChange={(e) => setModal({ ...modal, isPublished: e.target.checked })} />Publiée</label>
              </div>
              <Field label="Chapitres (une ligne par chapitre : mm:ss Titre)"><textarea value={modal?.chapters ?? ''} onChange={(e) => setModal({ ...modal, chapters: e.target.value })} rows={3} placeholder={"00:00 Introduction\n02:30 Échauffement\n05:00 Technique"} className={`${inp} resize-none font-mono text-xs`} /></Field>
              <button onClick={saveMeta} disabled={saving} className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer les infos'}</button>

              {modal?.id && (
                <div className="pt-4 border-t border-[#F8F4EF] space-y-3">
                  <p className="text-sm font-semibold text-[#3B312D]">Fichiers</p>
                  {/* Miniature */}
                  <div className="flex items-center gap-3">
                    {modal?.thumbnailUrl && <img src={modal.thumbnailUrl} alt="" className="w-20 h-12 object-cover rounded" />}
                    <label className="px-3 py-2 text-xs border border-[#F8F4EF] rounded-lg cursor-pointer flex items-center gap-1.5 hover:bg-[#F8F4EF]"><ImageIcon size={13} className="text-[#C98F79]" />Miniature<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadThumb(e.target.files[0])} /></label>
                  </div>
                  {/* Vidéo */}
                  <div>
                    <label className={`px-3 py-2 text-xs rounded-lg cursor-pointer inline-flex items-center gap-1.5 ${uploadPct !== null ? 'bg-[#F8F4EF] pointer-events-none' : 'bg-[#3B312D] text-white'}`}>
                      <Upload size={13} />{modal?.fileName ? 'Remplacer la vidéo' : 'Importer la vidéo (.mp4)'}
                      <input ref={fileRef} type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
                    </label>
                    {modal?.fileName && uploadPct === null && <span className="ml-2 text-xs text-[#AAB7A0]">✓ Fichier présent</span>}
                    {uploadPct !== null && (
                      <div className="mt-2">
                        <div className="h-2 bg-[#F8F4EF] rounded-full overflow-hidden"><div className="h-full bg-[#C98F79] transition-all" style={{ width: `${uploadPct}%` }} /></div>
                        <p className="text-xs text-[#3B312D]/50 mt-1">Envoi… {uploadPct}% (ne fermez pas cette fenêtre)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal monitoring des vues */}
      {viewsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewsModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-[#F8F4EF]">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">Vues · {viewsModal.title}</h3>
              <button onClick={() => setViewsModal(null)} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={20} /></button>
            </div>
            <div className="p-5">
              {views.length === 0 ? <p className="text-sm text-[#3B312D]/40 text-center py-6">Aucune vue pour l'instant</p> : (
                <div className="divide-y divide-[#F8F4EF]">
                  {views.map((v: any) => (
                    <div key={v.id} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <p className="text-[#3B312D]">{v.user ? `${v.user.firstName} ${v.user.lastName}` : 'Client'}</p>
                        <p className="text-xs text-[#3B312D]/50">{v.user?.email}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className={v.completed ? 'text-[#AAB7A0] font-medium' : 'text-[#3B312D]/60'}>{v.completed ? 'Terminée' : `${Math.floor((v.secondsWatched ?? 0) / 60)} min vues`}</p>
                        <p className="text-[#3B312D]/40">{v.viewCount} lecture(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = 'w-full px-4 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-sm font-medium text-[#3B312D]/70">{label}</label><div className="mt-1">{children}</div></div>;
}
