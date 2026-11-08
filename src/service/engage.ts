import { api } from './api';
import type { VehicleCardT } from '../types';

/** what the signed-in user did with one ad */
export interface MyEngagement { isOwner: boolean; myRating: number; myComment: string; favorite: boolean; reported: boolean }
export interface RatingSummary { ratingAvg: number; ratingCount: number; myRating: number; myComment: string }
export interface Review { id: string; stars: number; comment: string; reply?: { text: string; at: string }; userName: string; userAvatar?: string; createdAt: string; mine: boolean }
export interface ReviewPage { total: number; page: number; pages: number; items: Review[] }

export const myEngagement = async (id: string): Promise<MyEngagement> => (await api.get(`/vehicles/${id}/me`)).data.data;
export const rateAd = async (id: string, stars: number, comment: string): Promise<RatingSummary> => (await api.put(`/vehicles/${id}/rating`, { stars, comment: comment || undefined })).data.data;
export const adReviews = async (id: string, page = 1): Promise<ReviewPage> => (await api.get(`/vehicles/${id}/reviews`, { params: { page } })).data.data;
export const unrateAd = async (id: string): Promise<RatingSummary> => (await api.delete(`/vehicles/${id}/rating`)).data.data;

export const favoriteIds = async (): Promise<string[]> => (await api.get('/favorites/ids')).data.data;
export const savedAds = async (): Promise<VehicleCardT[]> => (await api.get('/favorites')).data.data;
export const saveAd = (id: string) => api.put(`/favorites/${id}`);
export const unsaveAd = (id: string) => api.delete(`/favorites/${id}`);

export const reportAd = async (id: string, reason: string, message: string): Promise<string> => (await api.post(`/vehicles/${id}/report`, { reason, message })).data.message;
