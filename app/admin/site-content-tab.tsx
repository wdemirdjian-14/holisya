'use client';
import { useEffect, useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SiteContentTab() {
  const [fields, setFields] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');

  useEffect(() => {
    fetch('/api/admin/site-content').then((r) => r.json()).then((d) => {
      setFields(d?.fields ?? []);
      const v: Record<string, string> = {};
      (d?.fields ?? []).forEach((f: any) => { v[f.key] = f.value; });
      setValues(v);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async (key: string) => {
    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/site-content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value: values[key] ?? '' }) });
      if (res.ok) toast.success('Texte enregistré'); else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSavingKey('');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-[#C98F79]" /></div>;

  const pages = Array.from(new Set(fields.map((f) => f.page)));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-playfair text-xl font-semibold text-[#3B312D]">Textes institutionnels</h2>
        <p className="text-xs text-[#3B312D]/50 mt-1">Modifiez les textes affichés sur le site. Les changements sont enregistrés champ par champ (quittez le champ pour sauvegarder).</p>
      </div>
      <div className="space-y-8">
        {pages.map((page) => (
          <div key={page}>
            <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mb-3">{page}</h3>
            <div className="bg-white rounded-xl shadow-sm divide-y divide-[#F8F4EF]">
              {fields.filter((f) => f.page === page).map((f) => (
                <div key={f.key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#3B312D]/70">{f.label}</label>
                    {savingKey === f.key && <Check size={14} className="text-[#AAB7A0] animate-pulse" />}
                  </div>
                  {f.multiline ? (
                    <textarea rows={3} value={values[f.key] ?? ''} onChange={(e: any) => setValues((prev) => ({ ...prev, [f.key]: e.target?.value ?? '' }))}
                      onBlur={() => save(f.key)} className="w-full px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 resize-none text-[#3B312D]" />
                  ) : (
                    <input value={values[f.key] ?? ''} onChange={(e: any) => setValues((prev) => ({ ...prev, [f.key]: e.target?.value ?? '' }))}
                      onBlur={() => save(f.key)} className="w-full px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 text-[#3B312D]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
