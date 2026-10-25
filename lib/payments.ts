/**
 * Indique si les paiements en ligne sont désactivés.
 * Désactivés automatiquement tant que Stripe est en mode TEST (clé sk_test_),
 * ou si on le force via la variable d'environnement PAYMENTS_DISABLED.
 * Dès qu'une clé Stripe LIVE (sk_live_) est en place, les paiements se réactivent seuls.
 */
export function paymentsDisabled(): boolean {
  const forced = (process.env.PAYMENTS_DISABLED ?? '').toLowerCase();
  if (forced === '1' || forced === 'true') return true;
  if (forced === '0' || forced === 'false') return false;
  const key = process.env.STRIPE_SECRET_KEY ?? '';
  if (!key) return true; // pas de clé configurée = pas de paiement possible
  return key.startsWith('sk_test_'); // mode test = paiements en ligne désactivés
}
