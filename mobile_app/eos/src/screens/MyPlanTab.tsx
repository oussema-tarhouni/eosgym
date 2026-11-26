import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/dark';
import {
  Exercise, WEEKDAYS, addDays, dateKey, fmtTime, getExercise, nextLevel, nextWorkout, parseKey,
  planStats, weekTip, weekdayIdx, workoutOn,
} from './workoutData';
import { usePlan, toggleTick, checkIn, setReminder, endPlan } from './planStore';
import { ensurePermission } from './reminders';
import { Chip, ExerciseModal, ui } from './workoutUI';

const TIMES: [number, number][] = [[6, 0], [7, 0], [12, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0]];

export default function MyPlanTab({ onBrowse }: { onBrowse: () => void }) {
  const { plan, ready } = usePlan();
  const [ex, setEx] = useState<Exercise | null>(null);
  if (!ready) return null;

  if (!plan) {
    return (
      <View style={ui.empty}>
        <Feather name="calendar" size={28} color={colors.goldLight} />
        <Text style={ui.emptyTitle}>No active program</Text>
        <Text style={ui.emptyText}>Pick a program for your level. You will get a daily reminder and check in after every workout.</Text>
        <TouchableOpacity style={[ui.primaryBtn, { paddingHorizontal: 28, marginTop: 8 }]} onPress={onBrowse}>
          <Text style={ui.primaryText}>Browse programs</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const now = new Date();
  const today = dateKey(now);
  const st = planStats(plan, now);
  const { program } = st;
  const todays = workoutOn(program, now);
  const startKey = dateKey(parseKey(plan.start));
  const trainToday = !!todays && today >= startKey && !st.ended;
  const checked = plan.checkins[today];
  const ticks = plan.ticks[today] ?? [];
  const pct = st.total ? st.done / st.total : 0;
  const upcoming = nextWorkout(plan, now);

  // ───── Program finished: ask the user to update it ─────
  if (st.ended) {
    return (
      <View style={{ gap: 14 }}>
        <View style={[ui.panel, { alignItems: 'center', paddingVertical: 28 }]}>
          <View style={s.bigIcon}><Feather name="award" size={30} color={colors.goldLight} /></View>
          <Text style={ui.emptyTitle}>Program complete</Text>
          <Text style={ui.emptyText}>
            You finished {program.title} and completed {st.done} of {st.total} sessions. Your body has adapted, so it is time to update your program to keep progressing.
          </Text>
          <Text style={[ui.emptyText, { color: colors.goldLight, fontWeight: '700' }]}>
            {st.done / Math.max(1, st.total) >= 0.8 ? `Suggested next level: ${nextLevel(program.level)}` : `Suggested: repeat ${program.level} and aim to complete every session`}
          </Text>
          <TouchableOpacity style={[ui.primaryBtn, { alignSelf: 'stretch', marginTop: 10 }]} onPress={onBrowse}>
            <Text style={ui.primaryText}>Update my program</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const finish = () => {
    if (!todays) return;
    const total = todays.slots.length;
    const done = ticks.length;
    const save = () => checkIn(today, done, total);
    if (done < total) {
      Alert.alert('Finish workout?', `You ticked ${done} of ${total} exercises. Check in anyway?`, [
        { text: 'Keep training', style: 'cancel' },
        { text: 'Check in', onPress: save },
      ]);
    } else save();
  };

  const changeTime = async (h: number, m: number) => {
    setReminder(h, m);
    if (!(await ensurePermission())) Alert.alert('Reminders are off', 'Allow notifications for this app in your phone settings to receive reminders.');
  };

  const leave = () =>
    Alert.alert('Change program?', 'Your progress in this program will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Change', style: 'destructive', onPress: () => { endPlan(); onBrowse(); } },
    ]);

  // Week strip (Monday → Sunday of the current week)
  const monday = addDays(now, -weekdayIdx(now));
  const endKey = dateKey(addDays(parseKey(plan.start), program.weeks * 7 - 1));
  const strip = WEEKDAYS.map((label, i) => {
    const d = addDays(monday, i);
    const k = dateKey(d);
    const inRange = k >= startKey && k <= endKey && !!workoutOn(program, d);
    let state: 'rest' | 'done' | 'missed' | 'today' | 'next' = 'rest';
    if (inRange) state = plan.checkins[k] ? 'done' : k < today ? 'missed' : k === today ? 'today' : 'next';
    return { label, state };
  });

  return (
    <View style={{ gap: 14 }}>
      {/* Summary */}
      <View style={ui.panel}>
        <Text style={s.kicker}>{program.level.toUpperCase()} · WEEK {st.week} OF {program.weeks}</Text>
        <Text style={s.title}>{program.title}</Text>
        <View style={s.barBg}><View style={[s.barFill, { width: `${Math.round(pct * 100)}%` }]} /></View>
        <View style={ui.tiles}>
          {[
            { i: 'zap', v: String(st.streak), l: 'Streak' },
            { i: 'check-circle', v: `${st.done}/${st.total}`, l: 'Completed' },
            { i: 'x-circle', v: String(st.missed), l: 'Missed' },
          ].map((x) => (
            <View key={x.l} style={[ui.tile, { backgroundColor: colors.bg }]}>
              <Feather name={x.i as any} size={16} color={x.l === 'Missed' && st.missed ? colors.red : colors.goldLight} />
              <Text style={s.statV}>{x.v}</Text>
              <Text style={ui.tileText}>{x.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Week strip */}
      <View style={[ui.panel, { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 }]}>
        {strip.map((d) => (
          <View key={d.label} style={{ alignItems: 'center', gap: 6 }}>
            <Text style={s.dayLabel}>{d.label}</Text>
            <View style={[s.dot, d.state === 'done' && s.dotDone, d.state === 'missed' && s.dotMissed, d.state === 'today' && s.dotToday, d.state === 'rest' && { opacity: 0.35 }]}>
              {d.state === 'done' && <Feather name="check" size={14} color={colors.black} />}
              {d.state === 'missed' && <Feather name="x" size={14} color={colors.red} />}
              {d.state === 'today' && <View style={s.dotInner} />}
            </View>
          </View>
        ))}
      </View>

      {/* Today */}
      {trainToday && todays ? (
        <View style={ui.panel}>
          <Text style={s.kicker}>TODAY</Text>
          <Text style={s.title}>{todays.title}</Text>
          <Text style={ui.sub}>{todays.focus}</Text>
          <Text style={[ui.sub, { color: colors.goldLight }]}>{weekTip(st.week, program.weeks)}</Text>
          <View style={s.rowBetween}>
            <Text style={ui.descTitle}>Exercises</Text>
            <Text style={s.progress}>{checked ? 'Completed' : `${ticks.length} / ${todays.slots.length} done`}</Text>
          </View>
          {todays.slots.map(([id, sets, reps], i) => {
            const e = getExercise(id);
            if (!e) return null;
            const on = ticks.includes(i) || !!checked;
            return (
              <TouchableOpacity key={id} style={s.exRow} onPress={() => !checked && toggleTick(today, i)} activeOpacity={0.8}>
                <View style={[s.check, on && s.checkOn]}>{on && <Feather name="check" size={14} color={colors.black} />}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.exName, on && { color: colors.gray, textDecorationLine: 'line-through' }]}>{e.name}</Text>
                  <Text style={s.exMeta}>{sets} sets × {reps}</Text>
                </View>
                <TouchableOpacity onPress={() => setEx(e)} hitSlop={10}>
                  <Feather name={e.video ? 'play-circle' : 'info'} size={20} color={colors.goldLight} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={[ui.primaryBtn, !!checked && ui.primaryBtnOff, { marginTop: 4 }]} onPress={finish} disabled={!!checked}>
            <Text style={[ui.primaryText, !!checked && { color: colors.goldLight }]}>{checked ? 'Workout checked in' : 'I finished my workout'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[ui.panel, { alignItems: 'center' }]}>
          <Feather name="moon" size={24} color={colors.goldLight} />
          <Text style={ui.emptyTitle}>Rest day</Text>
          <Text style={ui.emptyText}>
            Recovery is part of the program.{upcoming ? ` Next workout: ${WEEKDAYS[weekdayIdx(upcoming.date)]} · ${upcoming.workout.title}.` : ''}
          </Text>
        </View>
      )}

      {/* Reminder */}
      <View style={ui.panel}>
        <View style={s.rowBetween}>
          <Text style={ui.descTitle2}>Daily reminder</Text>
          <Text style={s.progress}>{fmtTime(plan.reminder.h, plan.reminder.m)}</Text>
        </View>
        <Text style={ui.sub}>We remind you on every training day and again a few hours later if you have not checked in.</Text>
        <View style={ui.wrap}>
          {TIMES.map(([h, m]) => (
            <Chip key={`${h}${m}`} on={plan.reminder.h === h && plan.reminder.m === m} label={fmtTime(h, m)} onPress={() => changeTime(h, m)} />
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={leave} style={{ alignSelf: 'center', padding: 8 }}>
        <Text style={s.leave}>Change program</Text>
      </TouchableOpacity>

      <ExerciseModal ex={ex} onClose={() => setEx(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  kicker: { color: colors.goldLight, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: colors.white, fontSize: 20, fontWeight: '800' },
  barBg: { height: 8, borderRadius: 4, backgroundColor: colors.bg, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.greenLight },
  statV: { color: colors.white, fontSize: 16, fontWeight: '800' },
  bigIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,162,39,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },

  dayLabel: { color: colors.gray, fontSize: 11, fontWeight: '700' },
  dot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.grayDim, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.greenLight, borderColor: colors.greenLight },
  dotMissed: { borderColor: colors.red },
  dotToday: { borderColor: colors.goldLight },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.goldLight },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  progress: { color: colors.goldLight, fontSize: 12.5, fontWeight: '700' },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg, borderRadius: 18, padding: 12 },
  exName: { color: colors.white, fontSize: 14, fontWeight: '700' },
  exMeta: { color: colors.gray, fontSize: 12, marginTop: 2 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: colors.grayDim, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.greenLight, borderColor: colors.greenLight },
  leave: { color: colors.gray, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
