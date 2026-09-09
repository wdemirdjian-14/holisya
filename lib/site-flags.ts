import { getBookingSettings } from '@/lib/booking-server';

/**
 * Drapeaux de fonctionnalités du site, pilotés depuis l'admin (BookingSettings).
 * Les abonnements sont masqués côté public tant que l'admin ne les active pas.
 */
export async function areSubscriptionsEnabled(): Promise<boolean> {
  try {
    const s = await getBookingSettings();
    return !!(s as any).subscriptionsEnabled;
  } catch {
    return false;
  }
}
