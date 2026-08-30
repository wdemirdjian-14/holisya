'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Gift, Sparkles, Heart, Tag, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const presets = [50, 100, 200];
const careTypes = ['Soin Kobido', 'Drainage Lymphatique', 'Coaching Nutrition', 'Au choix du bénéficiaire'];

export default function GiftCardsClient() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [careType, setCareType] = useState('Au choix du bénéficiaire');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const finalAmount = isCustom ? (parseFloat(customAmount) || 0) : amount;
  const discount = promoApplied ? (promoApplied.type === 'percentage' ? finalAmount * (promoApplied.value ?? 0) / 100 : (promoApplied.value ?? 0)) : 0;
  const total = Math.max(0, finalAmount - discount);

  const applyPromo = async () => {
    if (!promoCode) return;
    try {
      const res = await fetch(`/api/discount-codes/validate?code=${promoCode}&amount=${finalAmount}`);
      const data = await res.json();
      if (res.ok && data?.valid) { setPromoApplied(data); toast.success('Code promo appliqué !'); }
      else { toast.error(data?.error ?? 'Code invalide'); setPromoApplied(null); }
    } catch { toast.error('Erreur'); }
  };

  const handlePurchase = async () => {
    if (!session?.user) { router.push('/connexion'); return; }
    if (finalAmount < 10) { toast.error('Montant minimum : 10€'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/gift-cards/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, recipientName, recipientEmail, personalMessage: message, careType, promoCode: promoApplied ? promoCode : '' }),
      });
      const data = await res.json();
      if (data?.url) { window.location.href = data.url; }
      else { toast.error(data?.error ?? 'Erreur lors du paiement'); }
    } catch { toast.error('Erreur'); }
    setLoading(false);
  };

  return (
    <>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Gift size={32} className="text-[#C98F79] mx-auto mb-3" />
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Cartes Cadeaux</h1>
            <p className="text-[#3B312D]/60 mt-4 max-w-xl mx-auto">Offrez un moment de bien-être exceptionnel à vos proches. Personnalisez votre carte cadeau.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F8F4EF] mb-6">
                <Image src="https://cdn.abacus.ai/images/1c8e6e93-8cf8-45fe-b73c-221a1c53bf94.png" alt="Carte cadeau Holisya" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B312D]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-80">Carte Cadeau Holisya</p>
                  <p className="font-playfair text-3xl font-bold">{finalAmount}€</p>
                </div>
              </div>
              <div className="bg-[#F8F4EF] rounded-xl p-6">
                <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mb-3"><Sparkles size={16} className="inline text-[#C98F79] mr-2" />Inclus avec votre carte</h3>
                <ul className="space-y-2 text-sm text-[#3B312D]/70">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#AAB7A0]" />Code unique personnalisé</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#AAB7A0]" />Validité 12 mois</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#AAB7A0]" />Message personnalisé</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#AAB7A0]" />Envoi par email au destinataire</li>
                </ul>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-[#3B312D]">Montant</label>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {presets.map((p: number) => (
                    <button key={p} onClick={() => { setAmount(p); setIsCustom(false); }}
                      className={`px-5 py-3 rounded-lg font-medium text-sm transition-all ${!isCustom && amount === p ? 'bg-[#C98F79] text-white shadow-sm' : 'bg-[#F8F4EF] text-[#3B312D] hover:bg-[#C98F79]/10'}`}>
                      {p}€
                    </button>
                  ))}
                  <button onClick={() => setIsCustom(true)}
                    className={`px-5 py-3 rounded-lg font-medium text-sm transition-all ${isCustom ? 'bg-[#C98F79] text-white shadow-sm' : 'bg-[#F8F4EF] text-[#3B312D] hover:bg-[#C98F79]/10'}`}>
                    Montant libre
                  </button>
                </div>
                {isCustom && (
                  <input type="number" min={10} value={customAmount} onChange={(e: any) => setCustomAmount(e.target?.value ?? '')}
                    placeholder="Montant en € (min. 10€)" className="w-full mt-3 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]">Type de soin</label>
                <select value={careType} onChange={(e: any) => setCareType(e.target?.value ?? '')}
                  className="w-full mt-2 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]">
                  {careTypes.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-[#3B312D]">Nom du destinataire</label>
                  <input type="text" value={recipientName} onChange={(e: any) => setRecipientName(e.target?.value ?? '')} className="w-full mt-2 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div>
                <div><label className="text-sm font-medium text-[#3B312D]">Email du destinataire</label>
                  <input type="email" value={recipientEmail} onChange={(e: any) => setRecipientEmail(e.target?.value ?? '')} className="w-full mt-2 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" /></div>
              </div>
              <div><label className="text-sm font-medium text-[#3B312D]">Message personnalisé</label>
                <textarea value={message} onChange={(e: any) => setMessage(e.target?.value ?? '')} rows={3}
                  className="w-full mt-2 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 resize-none text-[#3B312D]" placeholder="Votre message pour le destinataire..." /></div>
              <div>
                <label className="text-sm font-medium text-[#3B312D]"><Tag size={14} className="inline text-[#AAB7A0] mr-1" />Code promo</label>
                <div className="flex gap-2 mt-2">
                  <input type="text" value={promoCode} onChange={(e: any) => setPromoCode((e.target?.value ?? '').toUpperCase())}
                    className="flex-1 px-4 py-3 text-sm border border-[#F8F4EF] rounded-lg bg-[#F8F4EF]/50 focus:outline-none focus:ring-2 focus:ring-[#C98F79]/30 text-[#3B312D]" placeholder="CODE" />
                  <button onClick={applyPromo} className="px-4 py-3 bg-[#AAB7A0] text-white text-sm font-medium rounded-lg hover:bg-[#96a58c] transition-all">Appliquer</button>
                </div>
                {promoApplied && <p className="text-sm text-[#AAB7A0] mt-1">-{promoApplied.type === 'percentage' ? `${promoApplied.value}%` : `${promoApplied.value}€`} appliqué !</p>}
              </div>
              <div className="bg-[#F8F4EF] rounded-xl p-5">
                <div className="flex justify-between text-sm text-[#3B312D]/60"><span>Carte cadeau</span><span>{finalAmount}€</span></div>
                {discount > 0 && <div className="flex justify-between text-sm text-[#AAB7A0] mt-1"><span>Réduction</span><span>-{discount.toFixed(2)}€</span></div>}
                <div className="flex justify-between font-semibold text-[#3B312D] mt-2 pt-2 border-t border-[#3B312D]/10"><span>Total</span><span>{total.toFixed(2)}€</span></div>
              </div>
              <button onClick={handlePurchase} disabled={loading || finalAmount < 10}
                className="w-full py-4 bg-[#C98F79] text-white font-medium rounded-lg hover:bg-[#b87d68] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}{loading ? 'Redirection...' : `Acheter - ${total.toFixed(2)}€`}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
