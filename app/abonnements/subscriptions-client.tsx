'use client';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Crown, Sparkles, Star, Check, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  { name: 'Essentiel', desc: '1 soin par mois', price: 99, credits: 1, features: ['1 soin Kobido ou Drainage', 'Accès espace membre', 'Réservation prioritaire', 'Remise 10% boutique'], icon: Sparkles, popular: false },
  { name: 'Harmonie', desc: '2 soins par mois', price: 179, credits: 2, features: ['2 soins au choix', 'Coaching nutrition inclus', 'Réservation prioritaire', 'Remise 15% boutique', 'Accès contenus exclusifs'], icon: Crown, popular: true },
  { name: 'Transformation', desc: '4 soins par mois', price: 329, credits: 4, features: ['4 soins au choix', 'Coaching nutrition complet', 'Programme personnalisé', 'Remise 20% boutique', 'Accès contenus exclusifs', 'Séance découverte offerte'], icon: Star, popular: false },
];

export default function SubscriptionsClient() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'quarterly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: any) => {
    if (!session?.user) { router.push('/connexion'); return; }
    setLoading(plan?.name ?? '');
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: plan.name, billingCycle: billing }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else toast.error(data?.error ?? 'Erreur');
    } catch { toast.error('Erreur'); }
    setLoading(null);
  };

  return (
    <>
      <section className="py-16 bg-[#F8F4EF]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Crown size={32} className="text-[#C98F79] mx-auto mb-3" />
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[#3B312D] mt-3">Nos Abonnements</h1>
            <p className="text-[#3B312D]/60 mt-4 max-w-xl mx-auto">Choisissez la formule qui vous correspond et profitez de soins réguliers à tarif préférentiel.</p>
            <div className="inline-flex bg-white rounded-lg p-1 mt-8 shadow-sm">
              <button onClick={() => setBilling('monthly')} className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-[#C98F79] text-white' : 'text-[#3B312D]/60 hover:text-[#3B312D]'}`}>Mensuel</button>
              <button onClick={() => setBilling('quarterly')} className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${billing === 'quarterly' ? 'bg-[#C98F79] text-white' : 'text-[#3B312D]/60 hover:text-[#3B312D]'}`}>Trimestriel <span className="text-xs">(-10%)</span></button>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan: any, i: number) => {
              const Icon = plan.icon;
              const price = billing === 'quarterly' ? Math.round(plan.price * 0.9) : plan.price;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl p-8 transition-all ${plan.popular ? 'bg-[#3B312D] text-white shadow-lg scale-105' : 'bg-[#F8F4EF] text-[#3B312D] shadow-sm hover:shadow-md'}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C98F79] text-white text-xs font-medium rounded-full">Le plus populaire</div>}
                  <Icon size={28} className={plan.popular ? 'text-[#C98F79]' : 'text-[#C98F79]'} />
                  <h3 className="font-playfair text-2xl font-bold mt-4">{plan.name}</h3>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-white/60' : 'text-[#3B312D]/60'}`}>{plan.desc}</p>
                  <div className="mt-6">
                    <span className="font-playfair text-4xl font-bold">{price}€</span>
                    <span className={`text-sm ${plan.popular ? 'text-white/50' : 'text-[#3B312D]/40'}`}>/{billing === 'quarterly' ? 'mois (x3)' : 'mois'}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {(plan.features ?? []).map((f: string, j: number) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check size={14} className="text-[#AAB7A0]" />
                        <span className={plan.popular ? 'text-white/80' : 'text-[#3B312D]/70'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleSubscribe(plan)} disabled={loading === plan.name}
                    className={`w-full mt-8 py-3 font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${plan.popular ? 'bg-[#C98F79] text-white hover:bg-[#b87d68]' : 'bg-[#C98F79] text-white hover:bg-[#b87d68]'} disabled:opacity-50`}>
                    {loading === plan.name ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    {loading === plan.name ? 'Redirection...' : 'S\'abonner'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
