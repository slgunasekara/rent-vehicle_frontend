/** the ads this visitor opened lately (newest first), kept on this device for "Recently viewed" */
const KEY = 'vb:recent';
export const recentIds = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; } };
export function rememberAd(id: string): void {
  try { localStorage.setItem(KEY, JSON.stringify([id, ...recentIds().filter((x) => x !== id)].slice(0, 12))); } catch { /* private mode */ }
}
