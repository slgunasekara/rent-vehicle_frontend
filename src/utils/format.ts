import { API_URL } from '../service/api';
import type { VehicleCardT } from '../types';
import { CATEGORIES, CONDITIONS, DRIVERS, FUELS } from '../data/vehicleOptions';

export const COMPANY = {
  name: 'Vehicle Buddy',
  phone: '+94754424053',
  email: (import.meta.env.VITE_COMPANY_EMAIL as string | undefined) || '',
  lat: 6.158194,
  lng: 80.099389,
};

export const money = (n: number): string => `Rs. ${Math.round(n).toLocaleString('en-LK')}`;

export const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fmtDate = (iso?: string): string => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }) : '');
/** value for <input type="date"> from a stored date */
export const toDateInput = (iso?: string): string => (iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' }) : '');

export const timeAgo = (iso: string): string => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
};

/** Resize + compress a picked photo so it can be sent as a small data URL */
export function fileToDataUrl(file: File, maxW = 1200, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      const g = c.getContext('2d')!;
      g.fillStyle = '#fff'; // JPEG has no transparency: without this a transparent PNG turns black
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Could not read image'));
    img.src = url;
  });
}

/** a photo address from the API: a Cloudinary URL as it is, or a path of our own API */
export const photo = (p?: string): string | undefined => (p ? (p.startsWith('/') ? `${API_URL}${p}` : p) : undefined);

export const categoryLabel = (k: string): string => CATEGORIES.find((c) => c.key === k)?.one ?? k;
export const categoryPlural = (k: string): string => CATEGORIES.find((c) => c.key === k)?.label ?? k;
export const fuelLabel = (k: string): string => FUELS.find((c) => c.key === k)?.label ?? k;
export const conditionLabel = (k: string): string => CONDITIONS.find((c) => c.key === k)?.label ?? k;
export const driverLabel = (k: string): string => DRIVERS.find((c) => c.key === k)?.label ?? k;

export const vehicleTitle = (v: Pick<VehicleCardT, 'make' | 'vehicleModel' | 'year'>): string => `${v.make} ${v.vehicleModel}${v.year ? ` ${v.year}` : ''}`;

/** the price lines of an ad, e.g. ["Rs. 18,000 / day", "Rs. 120 / km"], or [] when the owner asks to be called */
export const priceLines = (v: Pick<VehicleCardT, 'priceType' | 'pricePerKm' | 'pricePerDay' | 'pricePerMonth'>): string[] => {
  const out: string[] = [];
  if (v.pricePerDay) out.push(`${money(v.pricePerDay)} / day`);
  if (v.pricePerKm) out.push(`${money(v.pricePerKm)} / km`);
  if (v.pricePerMonth) out.push(`${money(v.pricePerMonth)} / month`);
  return out;
};

export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;
export const waLink = (phone: string, text = ''): string => {
  const d = phone.replace(/\D/g, '');
  const intl = d.startsWith('94') ? d : d.startsWith('0') ? '94' + d.slice(1) : d;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export const niceDateTime = (iso?: string | null): string => (iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Colombo' }) : '');
