import { api } from './api';
import type { VehicleCardT } from '../types';

export interface BuddyTurn { role: 'user' | 'assistant'; text: string }
export interface BuddyReply {
  reply: string;
  vehicles: VehicleCardT[];
  total: number;
  findPath: string | null;
  noResults: boolean;
  degraded: boolean;
}

/** Ask Buddy, the chat helper. `history` is the earlier conversation (the server keeps nothing). */
export async function askBuddy(message: string, history: BuddyTurn[]): Promise<BuddyReply> {
  const res = await api.post('/chat', { message, history });
  return res.data.data;
}
