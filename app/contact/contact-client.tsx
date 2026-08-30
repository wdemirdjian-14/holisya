'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactClient() {
  const [form, setForm] = useState({ firstName: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.phone) { toast.error('Champs requis manquants'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setSent(true); toast.success('Message envoyé !'); } else toast.error('Erreur');
    } catch { toast.error('Erreur'); }
    setLoading(false);
  };

  return (
    <>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#AAB7A0] text-sm uppercase tracking-[0.2em] font-medium">Nous Contacter</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Prenons soin de vous</h1>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-playfair text-2xl font-bold text-[#3B312D] mb-6">Nos Coordonnées</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4"><MapPin size={20} className="text-[#C98F79] mt-1" /><div><p className="font-medium text-[#3B312D]">Adresse</p><p className="text-[#3B312D]/60 text-sm">Nice, France</p></div></div>
              <div className="flex items-start gap-4"><Mail size={20} className="text-[#C98F79] mt-1" /><div><p className="font-medium text-[#3B312D]">Email</p><p className="text-[#3B312D]/60 text-sm">contact@holisya.fr</p></div></div>
              <a href="https://wa.me/33600000000" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20b858] transition-all w-fit">
                <MessageCircle size={18} />Nous écrire sur WhatsApp
              </a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {sent ? (
              <div className="bg-[#F8F4EF] rounded-xl p-8 text-center">
                <Send size={32} className="text-[#AAB7A0] mx-auto mb-4" />
                <h3 className="font-playfair text-xl font-semibold text-[#3B312D]">Message envoyé !</h3>
                <p className="text-[#3B312D]/60 mt-2">Nous vous recontactons rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#F8F4EF] rounded-xl p-8 space-y-4">
                <h3 className="font-playfair text-xl font-semibold text-[#3B312D] mb-4">Demande de rappel</h3>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Prénom *</label>
                  <input type="text" value={form.firstName} onChange={(e: any) => setForm({...form, firstName: e.target?.value ?? ''})}
                    className="w-full mt-1 px-4 py-3 text-sm border border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Téléphone *</label>
                  <input type="tel" value={form.phone} onChange={(e: any) => setForm({...form, phone: e.target?.value ?? ''})}
                    className="w-full mt-1 px-4 py-3 text-sm border border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]/70">Message</label>
                  <textarea value={form.message} onChange={(e: any) => setForm({...form, message: e.target?.value ?? ''})}
                    rows={4} className="w-full mt-1 px-4 py-3 text-sm border border-white rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 resize-none text-[#3B312D]" /></div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
