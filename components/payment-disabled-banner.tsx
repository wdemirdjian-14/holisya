import { AlertCircle, Phone, Mail } from 'lucide-react';
import { paymentsDisabled } from '@/lib/payments';
import { BUSINESS } from '@/lib/business';

/**
 * Bandeau affiché sur les pages de paiement tant que les paiements en ligne
 * sont désactivés (mode test Stripe). Invite à contacter Lamyae directement.
 * Composant serveur : ne s'affiche que si paymentsDisabled() est vrai.
 */
export default function PaymentDisabledBanner() {
  if (!paymentsDisabled()) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6 flex items-start gap-3">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={22} />
        <div className="text-sm sm:text-[15px] leading-relaxed text-amber-900">
          <p className="font-semibold text-amber-900">Paiements en ligne momentanément indisponibles</p>
          <p className="mt-1 text-amber-800">
            Les paiements en ligne sont désactivés pour le moment. Pour toute réservation, carte cadeau
            ou règlement, merci de contacter directement <strong>Lamyae</strong> — nous nous occupons de tout avec vous.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BUSINESS.phone && (
              <a href={`tel:${BUSINESS.phone}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C98F79] text-white text-sm font-medium hover:bg-[#b87d68] transition-colors">
                <Phone size={15} />{BUSINESS.phoneDisplay || BUSINESS.phone}
              </a>
            )}
            {BUSINESS.email && (
              <a href={`mailto:${BUSINESS.email}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-amber-200 text-amber-900 text-sm font-medium hover:bg-amber-100 transition-colors">
                <Mail size={15} />{BUSINESS.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
