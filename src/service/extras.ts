import {api, API_URL} from './api';
import type {VehicleCardT} from '../types';

export const shareUrl = (id: string): string => `${API_URL}/share/${id}`;

export const recordView = (id: string): Promise<unknown> => api.post(`/vehicles/${id}/view`).catch(() => undefined);
export const recordCall = (id: string): Promise<unknown> => api.post(`/vehicles/${id}/call-click`).catch(() => undefined);

export const similarAds = async (id: string): Promise<VehicleCardT[]> => (await api.get(`/vehicles/${id}/similar`)).data.data;
export const adsByIds = async (ids: string[]): Promise<VehicleCardT[]> => (ids.length ? (await api.get('/vehicles/by-ids', {params: {ids: ids.join(',')}})).data.data : []);

export interface AdFacts {
    category: string;
    make: string;
    vehicleModel: string;
    year: string;
    fuel: string;
    kmPerLitre: string;
    driver: string;
    condition: string;
    seats: string;
    district: string;
    city: string;
    lang: string
}

export const describeAd = async (facts: AdFacts): Promise<{
    text: string;
    ai: boolean
}> => (await api.post('/vehicles/describe', facts)).data.data;

export const replyToReview = async (adId: string, reviewId: string, text: string): Promise<{
    text: string;
    at: string
}> => (await api.put(`/vehicles/${adId}/reviews/${reviewId}/reply`, {text})).data.data;
export const deleteReply = (adId: string, reviewId: string) => api.delete(`/vehicles/${adId}/reviews/${reviewId}/reply`);

export interface Plan {
    days: number;
    price: number
}

export const topAdPlans = async (): Promise<{
    plans: Plan[];
    mode: 'payhere' | 'demo' | 'off'
}> => (await api.get('/payments/plans')).data.data;
export type StartResult = { mode: 'demo'; orderId: string; amount: number; days: number } | {
    mode: 'payhere';
    orderId: string;
    action: string;
    fields: Record<string, string>
};
export const startTopAd = async (vehicleId: string, days: number): Promise<StartResult> => (await api.post('/payments/featured', {
    vehicleId,
    days
})).data.data;
export const confirmDemoPayment = (orderId: string) => api.post('/payments/demo/confirm', {orderId});
export const paymentStatus = async (orderId: string): Promise<{
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    days: number;
    amount: number;
    adTitle: string;
    featuredUntil?: string
}> => (await api.get(`/payments/status/${orderId}`)).data.data;

export function goToPayHere(action: string, fields: Record<string, string>): void {
    const f = document.createElement('form');
    f.method = 'POST';
    f.action = action;
    for (const [k, v] of Object.entries(fields)) {
        const i = document.createElement('input');
        i.type = 'hidden';
        i.name = k;
        i.value = v;
        f.appendChild(i);
    }
    document.body.appendChild(f);
    f.submit();
}
