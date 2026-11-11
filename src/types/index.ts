import type {Category, Fuel, DriverOpt, Condition, PriceType} from '../data/vehicleOptions';

export type Role = 'user' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    position?: string;
    avatar?: string;
    phone?: string;
}

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
    kmPerLitre?: number;
    views?: number;
    featured?: boolean;
    featuredUntil?: string;
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

export interface Paged<T> {
    data: T[];
    meta: { total: number; page: number; pages: number; pageSize: number }
}

export interface ContactMsg {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    read: boolean;
    readAt: string | null;
    replied: boolean;
    repliedAt: string | null;
    replyText: string;
    createdAt: string;
}
