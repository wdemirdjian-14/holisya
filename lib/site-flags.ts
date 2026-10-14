import { getBookingSettings } from '@/lib/booking-server';
import { PLANITY_URL } from '@/lib/config';

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

/** Bascule Planity : quand active, la prise de RDV se fait sur Planity. */
export async function getPlanityMode(): Promise<{ enabled: boolean; url: string }> {
  try {
    const s = await getBookingSettings();
    return { enabled: !!s.planityMode, url: s.planityUrl || PLANITY_URL };
  } catch {
    return { enabled: false, url: PLANITY_URL };
  }
}
