import type { Category, Fuel, DriverOpt, Condition, PriceType } from '../data/vehicleOptions';

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  position?: string; // company position (admins)
  isDefaultAdmin?: boolean; // the company's default admin account
}

/** one ad as the lists show it (no photos except the cover) */
export interface VehicleCardT {
  _id: string;
  ratingAvg?: number; // average stars, 0 / missing = not rated yet
  ratingCount?: number;
  category: Category;
  make: string;
  vehicleModel: string;
  year?: number;
  fuel: Fuel;
  driver: DriverOpt;
  condition: Condition;
  seats?: number;
  kmPerLitre?: number; // km per litre (optional)
  views?: number; // how many visitors opened the ad
  featured?: boolean; // a paid "Top ad"
  featuredUntil?: string;
  // only in the owner's own list (My Ads)
  callClicks?: number;
  saves?: number;
  district: string;
  city: string;
  priceType: PriceType;
  pricePerKm?: number;
  pricePerDay?: number;
  pricePerMonth?: number;
  contactNumber: string;
  cover?: string;
  imageCount: number;
  insuranceExpiry: string;
  expiresAt: string;
  createdAt: string;
  daysLeft: number;
  expired: boolean;
  insuranceExpired: boolean;
}

export interface VehicleDetailT extends VehicleCardT {
  description?: string;
  photos: string[];
  owner: { name: string; since?: string };
}

export interface Paged<T> { data: T[]; meta: { total: number; page: number; pages: number; pageSize: number } }

export interface ContactMsg {
  id: string; firstName: string; lastName: string; email: string; phone: string; message: string;
  read: boolean; readAt: string | null; replied: boolean; repliedAt: string | null; replyText: string; createdAt: string;
}
