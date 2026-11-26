import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ActivePlan, addDays, dateKey, getProgram, parseKey, workoutOn } from './workoutData';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL = 'workout';
const WINDOW_DAYS = 14; // schedule the next 14 days; re-synced every time the app opens or a workout is checked in
const NUDGE_HOURS = 3; // follow-up "did you train?" reminder after the main reminder

export async function ensurePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Workout reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

const schedule = (at: Date, title: string, body: string) =>
  Notifications.scheduleNotificationAsync({
    content: { title, body, data: { kind: 'workout' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
  });

async function run(plan: ActivePlan | null) {
  // Remove every workout reminder we scheduled before, then rebuild from the current plan.
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content.data as { kind?: string } | undefined)?.kind === 'workout')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!plan) return;
  const program = getProgram(plan.programId);
  if (!program) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = parseKey(plan.start);
  const end = addDays(start, program.weeks * 7 - 1);

  for (let i = 0; i < WINDOW_DAYS; i++) {
    const day = addDays(today, i);
    if (day > end) break;
    if (day < start) continue;
    const w = workoutOn(program, day);
    if (!w || plan.checkins[dateKey(day)]) continue; // rest day, or already trained

    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), plan.reminder.h, plan.reminder.m);
    const nudge = new Date(at.getTime() + NUDGE_HOURS * 3600 * 1000);
    if (at > now) {
      await schedule(at, `Time to train: ${w.title}`, `${program.title} · ${w.slots.length} exercises today. Open the app to start your workout.`);
    }
    if (nudge > now) {
      await schedule(nudge, 'Did you work out today?', `Open the app and check in your ${w.title} session to keep your streak going.`);
    }
  }

  const endNotice = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1, 9, 0);
  if (endNotice > now) {
    await schedule(endNotice, 'Program complete', `You finished ${program.title}. Open the app to update your program.`);
  }
}

// Calls are chained so two quick changes can never schedule duplicates.
let chain: Promise<void> = Promise.resolve();
export const syncReminders = (plan: ActivePlan | null) => {
  chain = chain.then(() => run(plan)).catch(() => {});
  return chain;
};
