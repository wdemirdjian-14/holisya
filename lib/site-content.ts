import { prisma } from '@/lib/db';
import { getDefaultValue } from '@/lib/site-content-registry';

export async function getSiteContentMap(keys: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  keys.forEach((k) => { map[k] = getDefaultValue(k); });
  try {
    const rows = await prisma.siteContent.findMany({ where: { key: { in: keys } } });
    rows.forEach((row) => { if (row.value) map[row.key] = row.value; });
  } catch {}
  return map;
}
