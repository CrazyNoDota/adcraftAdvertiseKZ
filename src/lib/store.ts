'use client';

import { nanoid } from 'nanoid';
import type { Bid, Order } from './types';
import { seedBids, seedOrders } from './seed';

const ORDERS_KEY = 'reklama_kz_orders_v1';
const BIDS_KEY = 'reklama_kz_bids_v1';

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('store-change'));
}

export function listOrders(): Order[] {
  const user = readLS<Order[]>(ORDERS_KEY, []);
  // Seeded orders first, but if the user re-creates one with the same id we prefer theirs
  const userIds = new Set(user.map((o) => o.id));
  const seeded = seedOrders.filter((o) => !userIds.has(o.id));
  return [...user, ...seeded].sort((a, b) => b.created_at - a.created_at);
}

export function getOrder(id: string): Order | undefined {
  return listOrders().find((o) => o.id === id);
}

export function createOrder(input: Omit<Order, 'id' | 'created_at' | 'status'>): Order {
  const order: Order = {
    ...input,
    id: 'o-' + nanoid(8),
    created_at: Date.now(),
    status: 'open_for_bids',
  };
  const all = readLS<Order[]>(ORDERS_KEY, []);
  writeLS(ORDERS_KEY, [order, ...all]);
  return order;
}

export function updateOrder(id: string, patch: Partial<Order>) {
  const all = readLS<Order[]>(ORDERS_KEY, []);
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) {
    // It might be a seeded order — clone it into user storage so we can mutate.
    const seeded = seedOrders.find((o) => o.id === id);
    if (!seeded) return;
    writeLS(ORDERS_KEY, [{ ...seeded, ...patch }, ...all]);
    return;
  }
  const next = [...all];
  next[idx] = { ...next[idx], ...patch };
  writeLS(ORDERS_KEY, next);
}

export function listBids(orderId?: string): Bid[] {
  const user = readLS<Bid[]>(BIDS_KEY, []);
  const combined = [...user, ...seedBids.filter((b) => !user.find((u) => u.id === b.id))];
  const sorted = combined.sort((a, b) => b.created_at - a.created_at);
  return orderId ? sorted.filter((b) => b.order_id === orderId) : sorted;
}

export function createBid(input: Omit<Bid, 'id' | 'created_at' | 'status'>): Bid {
  const bid: Bid = {
    ...input,
    id: 'b-' + nanoid(8),
    created_at: Date.now(),
    status: 'pending',
  };
  const all = readLS<Bid[]>(BIDS_KEY, []);
  writeLS(BIDS_KEY, [bid, ...all]);
  return bid;
}

export function acceptBid(orderId: string, bidId: string) {
  const all = readLS<Bid[]>(BIDS_KEY, []);
  // If the accepted bid is a seeded one, materialize it into user storage as accepted.
  const seeded = seedBids.find((b) => b.id === bidId);
  const exists = all.find((b) => b.id === bidId);
  const base = exists ?? seeded;
  if (!base) return;
  const next = [
    ...all.filter((b) => b.id !== bidId),
    { ...base, status: 'accepted' as const },
  ];
  writeLS(BIDS_KEY, next);
  updateOrder(orderId, { status: 'assigned', winning_bid_id: bidId });
}

/**
 * Simulate the marketplace responding: schedules 1–3 fake bids on a newly
 * published order so the demo doesn't feel empty.
 */
export function simulateIncomingBids(order: Order, agencyPool: { id: string; city_slug: string }[]) {
  const pool = agencyPool.filter((a) => a.city_slug === order.city_slug);
  if (pool.length === 0) return;
  const count = Math.min(pool.length, 2 + Math.floor(Math.random() * 2));
  const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  picks.forEach((agency, idx) => {
    const delay = 1500 + idx * 1800 + Math.random() * 800;
    window.setTimeout(() => {
      const delta = (Math.random() - 0.5) * 0.18; // -9% .. +9%
      createBid({
        order_id: order.id,
        agency_id: agency.id,
        amount_kzt: Math.round((order.estimate_kzt * (1 + delta)) / 1000) * 1000,
        eta_days: 7 + Math.floor(Math.random() * 14),
        message: 'Готовы взяться. Уточним детали при подписании договора.',
      });
    }, delay);
  });
}
