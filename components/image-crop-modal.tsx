'use client';
import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Loader2, Check, X, ZoomIn } from 'lucide-react';

async function getCroppedFile(src: string, area: { x: number; y: number; width: number; height: number }, name: string): Promise<File> {
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), 'image/jpeg', 0.92));
  const base = (name || 'photo').replace(/\.[^.]+$/, '');
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}

export default function ImageCropModal({ file, aspect, onCancel, onCropped }: {
  file: File; aspect: number; onCancel: () => void; onCropped: (f: File) => void;
}) {
  const [url, setUrl] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);

  const validate = async () => {
    if (!area) return;
    setBusy(true);
    try { onCropped(await getCroppedFile(url, area, file.name)); }
    catch { onCancel(); }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-3" onClick={onCancel}>
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-[#F8F4EF] flex items-center justify-between">
          <div>
            <p className="font-medium text-[#3B312D]">Recadrer la photo</p>
            <p className="text-xs text-[#3B312D]/50">Déplacez et zoomez pour choisir la partie à afficher.</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded hover:bg-[#F8F4EF]"><X size={18} className="text-[#3B312D]/60" /></button>
        </div>
        <div className="relative w-full bg-[#211b19]" style={{ height: 340 }}>
          {url && (
            <Cropper image={url} crop={crop} zoom={zoom} aspect={aspect} minZoom={1} maxZoom={3}
              onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_a, px) => setArea(px)} />
          )}
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <ZoomIn size={16} className="text-[#C98F79]" />
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#C98F79]" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-[#3B312D]/15 text-[#3B312D]/70">Annuler</button>
            <button onClick={validate} disabled={busy || !area} className="px-4 py-2 text-sm rounded-lg bg-[#C98F79] text-white flex items-center gap-2 disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}Valider le cadrage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
