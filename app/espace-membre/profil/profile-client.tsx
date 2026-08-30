'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, Heart, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProfileClient() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', carePreferences: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.replace('/connexion'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/member/profile').then(r => r.json()).then(d => {
      if (d?.profile) setForm({ firstName: d.profile.firstName ?? '', lastName: d.profile.lastName ?? '', phone: d.profile.phone ?? '', carePreferences: d.profile.carePreferences ?? '' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/member/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) toast.success('Profil mis à jour !'); else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  if (status === 'loading' || loading) return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-[#C98F79]" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/espace-membre" className="inline-flex items-center gap-2 text-[#C98F79] text-sm font-medium mb-6 hover:underline"><ArrowLeft size={16} />Retour</Link>
      <h1 className="font-playfair text-3xl font-bold text-[#3B312D] mb-8">Mon Profil</h1>
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-[#3B312D]/70">Prénom</label>
            <div className="relative mt-1"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
              <input value={form.firstName} onChange={(e: any) => setForm({...form, firstName: e.target?.value ?? ''})}
                className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div></div>
          <div><label className="text-sm font-medium text-[#3B312D]/70">Nom</label>
            <div className="relative mt-1"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
              <input value={form.lastName} onChange={(e: any) => setForm({...form, lastName: e.target?.value ?? ''})}
                className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div></div>
        </div>
        <div><label className="text-sm font-medium text-[#3B312D]/70">Email</label>
          <div className="relative mt-1"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input value={session?.user?.email ?? ''} disabled className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/30 text-[#3B312D]/50 cursor-not-allowed" /></div></div>
        <div><label className="text-sm font-medium text-[#3B312D]/70">Téléphone</label>
          <div className="relative mt-1"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B312D]/30" />
            <input value={form.phone} onChange={(e: any) => setForm({...form, phone: e.target?.value ?? ''})}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div></div>
        <div><label className="text-sm font-medium text-[#3B312D]/70">Préférences de soins</label>
          <div className="relative mt-1"><Heart size={16} className="absolute left-3 top-3 text-[#3B312D]/30" />
            <textarea value={form.carePreferences} onChange={(e: any) => setForm({...form, carePreferences: e.target?.value ?? ''})}
              rows={3} className="w-full pl-10 pr-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 resize-none text-[#3B312D]" placeholder="Vos préférences de soins..." /></div></div>
        <button type="submit" disabled={saving} className="px-6 py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
