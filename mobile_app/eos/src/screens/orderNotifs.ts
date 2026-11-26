import { useEffect, useState } from 'react';
import type { Notif } from './NotificationsScreen';

// Tiny shared store for notifications created inside the app (e.g. after an order).
// Local ids are negative so they never collide with server ids.
let items: Notif[] = [];
let nextId = -1;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function pushLocalNotif(title: string, description: string) {
  items = [{
    id: nextId--,
    title,
    description,
    image_url: null,
    link: null,
    created_at: new Date().toISOString(),
  }, ...items];
  emit();
}

export function addOrderNotif(o: { items: { name: string; qty: number }[]; total: number }) {
  pushLocalNotif(
    'Order placed',
    `${o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')} — ${o.total} TND. Our service team will call you soon to confirm your order.`,
  );
}

export function removeLocalNotif(id: number) {
  items = items.filter((n) => n.id !== id);
  emit();
}

export function useLocalNotifs(): Notif[] {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return items;
}
