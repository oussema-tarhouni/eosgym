import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivePlan, dateKey, parseKey, planStats, workoutOn } from './workoutData';
import { syncReminders } from './reminders';
import { pushLocalNotif } from './orderNotifs';

const KEY = 'eos.plan.v1';
let plan: ActivePlan | null = null;
let ready = false;
let loading = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function init() {
  if (loading) return;
  loading = true;
  AsyncStorage.getItem(KEY)
    .then((raw) => { if (raw) plan = JSON.parse(raw); })
    .catch(() => {})
    .finally(() => { ready = true; emit(); syncReminders(plan); });
}

function commit(next: ActivePlan | null, resync = true) {
  plan = next;
  emit();
  (next ? AsyncStorage.setItem(KEY, JSON.stringify(next)) : AsyncStorage.removeItem(KEY)).catch(() => {});
  if (resync) syncReminders(next);
}

export function usePlan() {
  const [, force] = useState(0);
  useEffect(() => {
    init();
    const f = () => force((x) => x + 1);
    subs.add(f);
    return () => { subs.delete(f); };
  }, []);
  return { plan, ready };
}

export const startPlan = (programId: string, reminder = { h: 18, m: 0 }) =>
  commit({ programId, start: dateKey(new Date()), reminder, checkins: {}, ticks: {}, notified: [] });

export const endPlan = () => commit(null);

export const setReminder = (h: number, m: number) => { if (plan) commit({ ...plan, reminder: { h, m } }); };

export function toggleTick(day: string, idx: number) {
  if (!plan) return;
  const cur = plan.ticks[day] ?? [];
  const next = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx];
  commit({ ...plan, ticks: { ...plan.ticks, [day]: next } }, false);
}

// The "check" that proves you trained. Re-syncing reminders cancels today's follow-up notification.
export function checkIn(day: string, done: number, total: number) {
  if (!plan) return;
  commit({ ...plan, checkins: { ...plan.checkins, [day]: { done, total } } });
}

function markNotified(key: string) {
  if (!plan) return;
  commit({ ...plan, notified: [...plan.notified, key].slice(-30) }, false);
}

// Adds one entry per day to the in-app notifications feed. Call it where the app starts for best results.
export function useDailyNotice() {
  const { plan: p, ready: r } = usePlan();
  useEffect(() => {
    if (!r || !p) return;
    const st = planStats(p);
    const now = new Date();
    const today = dateKey(now);
    if (st.ended) {
      if (!p.notified.includes('ended')) {
        pushLocalNotif('Program complete', `You finished ${st.program.title}. Update your program to keep progressing.`);
        markNotified('ended');
      }
      return;
    }
    const w = workoutOn(st.program, now);
    if (w && today >= dateKey(parseKey(p.start)) && !p.checkins[today] && !p.notified.includes(today)) {
      pushLocalNotif(`Today: ${w.title}`, `${st.program.title} · Week ${st.week} of ${st.program.weeks}. ${w.slots.length} exercises are waiting. Open Tutorials to start and check in when you finish.`);
      markNotified(today);
    }
  }, [r, p]);
}
