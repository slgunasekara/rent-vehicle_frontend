import type { Place } from '../components/common/CityPicker';

export interface Filters {
  category: string; make: string; model: string; fuel: string; driver: string; condition: string;
  place: Place; payment: 'daily' | 'monthly'; minPrice: string; maxPrice: string; sort: string;
}
export const EMPTY_FILTERS: Filters = { category: '', make: '', model: '', fuel: '', driver: '', condition: '', place: { district: '', city: '' }, payment: 'daily', minPrice: '', maxPrice: '', sort: 'newest' };

/** Filters -> the query string of /find (empty values are left out) */
export function toParams(f: Filters, page = 1): URLSearchParams {
  const q = new URLSearchParams();
  const put = (k: string, v: string) => { if (v.trim()) q.set(k, v.trim()); };
  put('category', f.category); put('make', f.make); put('model', f.model); put('fuel', f.fuel); put('driver', f.driver); put('condition', f.condition);
  put('district', f.place.district); put('city', f.place.city);
  if (f.minPrice || f.maxPrice) { q.set('payment', f.payment); put('minPrice', f.minPrice); put('maxPrice', f.maxPrice); } else if (f.payment === 'monthly') q.set('payment', 'monthly');
  if (f.sort && f.sort !== 'newest') q.set('sort', f.sort);
  if (page > 1) q.set('page', String(page));
  return q;
}

export function fromParams(q: URLSearchParams): Filters {
  const g = (k: string) => q.get(k) ?? '';
  return { category: g('category'), make: g('make'), model: g('model'), fuel: g('fuel'), driver: g('driver'), condition: g('condition'), place: { district: g('district'), city: g('city') }, payment: g('payment') === 'monthly' ? 'monthly' : 'daily', minPrice: g('minPrice'), maxPrice: g('maxPrice'), sort: g('sort') || 'newest' };
}
