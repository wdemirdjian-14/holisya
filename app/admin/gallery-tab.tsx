'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Image as ImageIcon, Sun, X } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { imageAspect, isCroppable } from '@/lib/image-crop-utils';
import PhotoBrightness from '@/components/photo-brightness';

const ImageCropModal = dynamic(() => import('@/components/image-crop-modal'), { ssr: false });

export default function GalleryTab() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [cropReq, setCropReq] = useState<{ file: File; onDone: (f: File) => void } | null>(null);
  const [brightPhoto, setBrightPhoto] = useState<any>(null);
  const [replacing, setReplacing] = useState(false);
  const [view, setView] = useState<'carousel' | 'all'>('carousel');
  const [sitePhotos, setSitePhotos] = useState<any[]>([]);
  const [loadingSite, setLoadingSite] = useState(false);

  const SOURCE_UPLOAD: Record<string, { endpoint: string; fileField: string; idField: string }> = {
    gallery: { endpoint: '/api/admin/gallery/upload', fileField: 'files', idField: 'photoId' },
    service: { endpoint: '/api/admin/services/upload', fileField: 'file', idField: 'serviceId' },
    blog: { endpoint: '/api/admin/blog/upload', fileField: 'file', idField: 'postId' },
    video: { endpoint: '/api/admin/videos/thumbnail', fileField: 'file', idField: 'id' },
  };
  const SOURCE_LABEL: Record<string, string> = { gallery: 'Accueil', service: 'Soin', blog: 'Blog', video: 'Vidéo' };

  const loadSitePhotos = () => {
    setLoadingSite(true);
    fetch('/api/admin/site-photos').then((r) => r.json()).then((d) => { setSitePhotos(d?.items ?? []); setLoadingSite(false); }).catch(() => setLoadingSite(false));
  };
  const refreshCurrent = () => { load(); if (view === 'all') loadSitePhotos(); };

  // Photo unitaire au mauvais format -> recadrage carré ; sinon envoi direct (y compris multi).
  const handleSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    if (arr.length === 1 && isCroppable(arr[0])) {
      try {
        const a = await imageAspect(arr[0]);
        if (a && Math.abs(a - 1) > 0.08) { setCropReq({ file: arr[0], onDone: (f) => upload([f]) }); return; }
      } catch {}
    }
    upload(files);
  };

  const load = () => {
    setLoading(true);
    fetch('/api/admin/gallery').then(r => r.json()).then(d => { setPhotos(d?.photos ?? []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const upload = async (files: File[] | FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const body = new FormData();
      Array.from(files).forEach((f) => body.append('files', f));
      const res = await fetch('/api/admin/gallery/upload', { method: 'POST', body });
      const data = await res.json();
      if (res.ok) { toast.success(`${data.photos?.length ?? 0} photo(s) ajoutée(s)`); load(); } else toast.error(data?.error ?? 'Erreur');
    } catch { toast.error('Erreur upload'); }
    setUploading(false);
  };

  const toggleActive = async (photo: any) => {
    const res = await fetch('/api/admin/gallery', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: photo.id, isActive: !photo.isActive }) });
    if (res.ok) load(); else toast.error('Erreur');
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette photo ?')) return;
    const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Photo supprimée'); load(); setBrightPhoto(null); } else toast.error('Erreur');
  };

  const uploadReplace = async (item: any, file: File) => {
    const cfg = SOURCE_UPLOAD[item?.source];
    if (!cfg) return;
    setReplacing(true);
    try {
      const body = new FormData();
      body.append(cfg.fileField, file);
      body.append(cfg.idField, item.id);
      const res = await fetch(cfg.endpoint, { method: 'POST', body });
      const data = await res.json();
      if (res.ok) {
        toast.success('Photo remplacée');
        const newUrl = data.imageUrl || data.thumbnailUrl || data.photos?.[0]?.imageUrl || item.url;
        setBrightPhoto({ ...item, url: newUrl });
        refreshCurrent();
      } else toast.error(data?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setReplacing(false);
  };

  const handleReplaceSelect = async (item: any, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    // Recadrage carré uniquement pour le carrousel d'accueil.
    if (item?.source === 'gallery' && isCroppable(f)) {
      try { const a = await imageAspect(f); if (a && Math.abs(a - 1) > 0.08) { setCropReq({ file: f, onDone: (cf) => uploadReplace(item, cf) }); return; } } catch {}
    }
    uploadReplace(item, f);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Bibliothèque photo</h2>
          <p className="text-xs text-[#3B312D]/50 mt-1">Gérez les photos du site : cliquez sur une photo pour ajuster la luminosité ou la remplacer.</p>
        </div>
        {view === 'carousel' && (
          <label className={`px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Plus size={14} />{uploading ? 'Import...' : 'Importer des photos'}
            <input type="file" accept="image/*,.heic,.heif" multiple className="hidden" disabled={uploading} onChange={(e: any) => handleSelect(e.target?.files)} />
          </label>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {[{ id: 'carousel', label: 'Carrousel accueil' }, { id: 'all', label: 'Toutes les photos du site' }].map((t: any) => (
          <button key={t.id} onClick={() => { setView(t.id); if (t.id === 'all' && sitePhotos.length === 0) loadSitePhotos(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === t.id ? 'bg-[#C98F79] text-white' : 'bg-white text-[#3B312D]/70 hover:bg-[#C98F79]/10'}`}>{t.label}</button>
        ))}
      </div>

      {view === 'carousel' && (<>
      {/* Zone de glisser-déposer */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleSelect(e.dataTransfer.files); }}
        className={`mb-6 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors ${dragging ? 'border-[#C98F79] bg-[#C98F79]/5' : 'border-[#3B312D]/15 hover:border-[#C98F79]/50'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? <Loader2 size={22} className="animate-spin text-[#C98F79]" /> : <ImageIcon size={22} className="text-[#C98F79]" />}
        <p className="text-sm text-[#3B312D]/70">{uploading ? 'Import en cours…' : 'Glissez vos photos ici, ou cliquez pour les choisir'}</p>
        <p className="text-xs text-[#3B312D]/40">JPEG, PNG, HEIC (iPhone)… converties automatiquement</p>
        <input type="file" accept="image/*,.heic,.heif" multiple className="hidden" disabled={uploading} onChange={(e: any) => handleSelect(e.target?.files)} />
      </label>

      {photos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <ImageIcon size={32} className="text-[#3B312D]/20 mx-auto mb-3" />
          <p className="text-[#3B312D]/40 text-sm">Aucune photo pour l'instant. Importez-en pour alimenter le carrousel de l'accueil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => setBrightPhoto({ source: 'gallery', id: p.id, url: p.imageUrl, isActive: p.isActive, editable: String(p.imageUrl ?? '').startsWith('/uploads/'), title: 'Carrousel accueil' })} title="Gérer la photo" className="relative aspect-square bg-[#F8F4EF] w-full block group">
                <img src={p.imageUrl} alt="" className={`w-full h-full object-cover ${!p.isActive ? 'opacity-40' : ''}`} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/35 transition-colors">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/55 px-3 py-1.5 rounded-full flex items-center gap-1.5"><Sun size={13} />Gérer la photo</span>
                </span>
              </button>
              <div className="p-2.5 flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs text-[#3B312D]/70">
                  <input type="checkbox" checked={p.isActive} onChange={() => toggleActive(p)} className="rounded" />Active
                </label>
                <button onClick={() => remove(p.id)} title="Supprimer" className="p-1 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>)}

      {view === 'all' && (
        loadingSite ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-[#C98F79]" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sitePhotos.map((it: any) => (
              <div key={`${it.source}-${it.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button onClick={() => setBrightPhoto(it)} title="Gérer la photo" className="relative aspect-square bg-[#F8F4EF] w-full block group">
                  <img src={it.url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider text-white bg-black/55 px-2 py-0.5 rounded-full">{SOURCE_LABEL[it.source] ?? it.source}</span>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/35 transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium bg-black/55 px-3 py-1.5 rounded-full flex items-center gap-1.5"><Sun size={13} />Gérer</span>
                  </span>
                </button>
                <div className="p-2.5">
                  <p className="text-xs text-[#3B312D]/70 truncate" title={it.title}>{it.title}</p>
                  {!it.editable && <p className="text-[10px] text-[#3B312D]/35 mt-0.5">Image externe — remplacement possible, luminosité non</p>}
                </div>
              </div>
            ))}
            {sitePhotos.length === 0 && <p className="col-span-full text-center text-[#3B312D]/40 text-sm py-10">Aucune photo trouvée.</p>}
          </div>
        )
      )}

      {cropReq && (
        <ImageCropModal
          file={cropReq.file}
          aspect={1}
          onCancel={() => setCropReq(null)}
          onCropped={(f) => { const req = cropReq; setCropReq(null); req.onDone(f); }}
        />
      )}

      {brightPhoto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setBrightPhoto(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-playfair text-lg font-semibold text-[#3B312D]">Gérer la photo</h3>
              <button onClick={() => setBrightPhoto(null)} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={18} /></button>
            </div>
            <p className="text-xs text-[#3B312D]/50 mb-4">{SOURCE_LABEL[brightPhoto.source] ?? ''}{brightPhoto.title ? ` · ${brightPhoto.title}` : ''}</p>

            {brightPhoto.editable ? (
              <PhotoBrightness key={brightPhoto.url} url={brightPhoto.url} onApplied={() => refreshCurrent()} />
            ) : (
              <div>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[#F8F4EF]"><img src={brightPhoto.url} alt="" className="w-full h-full object-cover" /></div>
                <p className="text-[11px] text-[#3B312D]/45 mt-2">Cette image provient d'une source externe : la luminosité n'est pas modifiable. Remplacez-la par une photo importée pour pouvoir l'ajuster.</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[#F8F4EF] space-y-3">
              <label className={`w-full px-4 py-2.5 border border-[#C98F79] text-[#C98F79] text-sm font-medium rounded-lg hover:bg-[#C98F79]/10 flex items-center justify-center gap-2 cursor-pointer ${replacing ? 'opacity-50 pointer-events-none' : ''}`}>
                {replacing ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}{replacing ? 'Remplacement…' : 'Remplacer la photo'}
                <input type="file" accept="image/*,.heic,.heif" className="hidden" disabled={replacing} onChange={(e: any) => handleReplaceSelect(brightPhoto, e.target?.files)} />
              </label>
              {brightPhoto.source === 'gallery' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[#3B312D]/70">
                    <input type="checkbox" checked={brightPhoto.isActive} onChange={() => { toggleActive({ id: brightPhoto.id, isActive: brightPhoto.isActive }); setBrightPhoto({ ...brightPhoto, isActive: !brightPhoto.isActive }); }} className="rounded" />Afficher dans le carrousel
                  </label>
                  <button onClick={() => remove(brightPhoto.id)} className="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 flex items-center gap-1.5"><Trash2 size={13} />Supprimer</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
