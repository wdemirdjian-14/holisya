'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.phone) { toast.error('Veuillez remplir les champs obligatoires'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setSent(true); setForm({ firstName: '', phone: '', message: '' }); toast.success('Demande envoyée !'); }
      else toast.error('Erreur lors de l\'envoi');
    } catch { toast.error('Erreur de connexion'); }
    setLoading(false);
  };

  return (
    <>
      <button onClick={() => { setOpen(!open); setSent(false); }}
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 w-12 h-12 lg:w-14 lg:h-14 bg-[#C98F79] text-white rounded-full shadow-lg hover:bg-[#b87d68] transition-all flex items-center justify-center hover:scale-105">
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 lg:bottom-24 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-[340px] bg-white rounded-2xl shadow-xl border border-[#F8F4EF] overflow-hidden">
            <div className="bg-[#3B312D] px-5 py-4">
              <h3 className="font-playfair text-lg font-semibold text-white">Demande de rappel</h3>
              <p className="text-white/60 text-xs mt-1">Nous vous recontactons rapidement</p>
            </div>
            {sent ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-[#AAB7A0]/20 rounded-full flex items-center justify-center mx-auto mb-3"><Phone size={20} className="text-[#AAB7A0]" /></div>
                <p className="font-playfair text-lg font-semibold text-[#3B312D]">Merci !</p>
                <p className="text-sm text-[#3B312D]/60 mt-2">Nous vous rappelons très bientôt.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#3B312D]/70">Prénom *</label>
                  <input type="text" value={form.firstName} onChange={(e: any) => setForm({ ...form, firstName: e.target?.value ?? '' })}
                    className="w-full mt-1 px-3 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="Votre prénom" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#3B312D]/70">Téléphone *</label>
                  <input type="tel" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target?.value ?? '' })}
                    className="w-full mt-1 px-3 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="06 XX XX XX XX" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#3B312D]/70">Message</label>
                  <textarea value={form.message} onChange={(e: any) => setForm({ ...form, message: e.target?.value ?? '' })}
                    rows={3} className="w-full mt-1 px-3 py-2.5 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 resize-none text-[#3B312D]" placeholder="Votre message (optionnel)" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#C98F79] text-white text-sm font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
