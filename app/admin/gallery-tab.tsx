'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function GalleryTab() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/gallery').then(r => r.json()).then(d => { setPhotos(d?.photos ?? []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | null) => {
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
    if (res.ok) { toast.success('Photo supprimée'); load(); } else toast.error('Erreur');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Bibliothèque photo</h2>
          <p className="text-xs text-[#3B312D]/50 mt-1">Ces photos alimentent le carrousel de la page d'accueil (ordre aléatoire à chaque chargement).</p>
        </div>
        <label className={`px-4 py-2 bg-[#C98F79] text-white text-sm rounded-lg flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Plus size={14} />{uploading ? 'Import...' : 'Importer des photos'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" disabled={uploading} onChange={(e: any) => upload(e.target?.files)} />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <ImageIcon size={32} className="text-[#3B312D]/20 mx-auto mb-3" />
          <p className="text-[#3B312D]/40 text-sm">Aucune photo pour l'instant. Importez-en pour alimenter le carrousel de l'accueil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative aspect-square bg-[#F8F4EF]">
                <img src={p.imageUrl} alt="" className={`w-full h-full object-cover ${!p.isActive ? 'opacity-40' : ''}`} />
              </div>
              <div className="p-2.5 flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs text-[#3B312D]/70">
                  <input type="checkbox" checked={p.isActive} onChange={() => toggleActive(p)} className="rounded" />Active
                </label>
                <button onClick={() => remove(p.id)} className="p-1 rounded hover:bg-red-50"><Trash2 size={13} className="text-red-500" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
