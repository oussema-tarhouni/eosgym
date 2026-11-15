import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, cardShadow } from '../theme/dark';

type Gender = 'Men' | 'Women';
type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type Exercise = { name: string; sets: number; reps: string };
type Program = {
  id: number; title: string; gender: Gender; level: Level; focus: string; minutes: number;
  icon: string; tag?: string; description: string; exercises: Exercise[];
};

const GENDERS: Gender[] = ['Men', 'Women'];
const LEVELS: ('All' | Level)[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const PROGRAMS: Program[] = [
  // ───────── MEN ─────────
  {
    id: 1, title: 'Full Body Foundations', gender: 'Men', level: 'Beginner', focus: 'Full body', minutes: 40, icon: 'activity', tag: 'Popular',
    description: 'Learn the main movement patterns with simple, safe exercises. Train three times a week with a rest day between sessions and add a little weight each week.',
    exercises: [
      { name: 'Goblet Squat', sets: 3, reps: '12' },
      { name: 'Push-ups (or knee push-ups)', sets: 3, reps: '8-10' },
      { name: 'Seated Cable Row', sets: 3, reps: '12' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10' },
      { name: 'Romanian Deadlift (light)', sets: 3, reps: '10' },
      { name: 'Plank', sets: 3, reps: '30 sec' },
    ],
  },
  {
    id: 2, title: 'Chest & Arms Starter', gender: 'Men', level: 'Beginner', focus: 'Chest, arms', minutes: 35, icon: 'target',
    description: 'A first upper-body routine to build a base of strength in the chest, shoulders and arms using machines and dumbbells.',
    exercises: [
      { name: 'Machine Chest Press', sets: 3, reps: '12' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10' },
      { name: 'Lat Pulldown', sets: 3, reps: '12' },
      { name: 'Dumbbell Curl', sets: 3, reps: '12' },
      { name: 'Triceps Rope Pushdown', sets: 3, reps: '12' },
    ],
  },
  {
    id: 3, title: 'Push Day', gender: 'Men', level: 'Intermediate', focus: 'Chest, shoulders, triceps', minutes: 55, icon: 'trending-up', tag: 'New',
    description: 'The push session of a push / pull / legs split. Focus on controlled reps, a full range of motion and progressive overload.',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8' },
      { name: 'Overhead Press', sets: 4, reps: '8-10' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10' },
      { name: 'Lateral Raise', sets: 4, reps: '15' },
      { name: 'Dips', sets: 3, reps: '10' },
      { name: 'Overhead Triceps Extension', sets: 3, reps: '12' },
    ],
  },
  {
    id: 4, title: 'Pull Day', gender: 'Men', level: 'Intermediate', focus: 'Back, biceps', minutes: 55, icon: 'anchor',
    description: 'The pull session of a push / pull / legs split. Build a wide, strong back and balanced arms.',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '5' },
      { name: 'Pull-ups (or assisted)', sets: 4, reps: '6-8' },
      { name: 'Barbell Row', sets: 4, reps: '8' },
      { name: 'Face Pull', sets: 3, reps: '15' },
      { name: 'Barbell Curl', sets: 3, reps: '10' },
      { name: 'Hammer Curl', sets: 3, reps: '12' },
    ],
  },
  {
    id: 5, title: 'Leg Day Power', gender: 'Men', level: 'Advanced', focus: 'Quads, hamstrings, glutes', minutes: 70, icon: 'zap', tag: 'Popular',
    description: 'A heavy, high-volume lower-body session for experienced lifters. Warm up thoroughly and use a spotter on the heaviest sets.',
    exercises: [
      { name: 'Back Squat', sets: 5, reps: '5' },
      { name: 'Romanian Deadlift', sets: 4, reps: '8' },
      { name: 'Walking Lunges', sets: 3, reps: '12 / leg' },
      { name: 'Leg Press', sets: 4, reps: '12' },
      { name: 'Leg Curl', sets: 3, reps: '12' },
      { name: 'Standing Calf Raise', sets: 4, reps: '15' },
    ],
  },
  {
    id: 6, title: 'Upper / Lower Strength', gender: 'Men', level: 'Advanced', focus: 'Strength', minutes: 75, icon: 'award',
    description: 'Heavy compound lifts built around low reps and long rest periods to maximise maximal strength.',
    exercises: [
      { name: 'Barbell Bench Press', sets: 5, reps: '3-5' },
      { name: 'Weighted Pull-ups', sets: 5, reps: '5' },
      { name: 'Front Squat', sets: 4, reps: '5' },
      { name: 'Push Press', sets: 4, reps: '5' },
      { name: 'Barbell Row', sets: 4, reps: '6' },
      { name: 'Hanging Leg Raise', sets: 3, reps: '12' },
    ],
  },

  // ───────── WOMEN ─────────
  {
    id: 7, title: 'Full Body Starter', gender: 'Women', level: 'Beginner', focus: 'Full body', minutes: 40, icon: 'heart', tag: 'Popular',
    description: 'A gentle full-body routine to build confidence in the gym. Learn good form first, then slowly increase the weight.',
    exercises: [
      { name: 'Bodyweight Squat', sets: 3, reps: '15' },
      { name: 'Dumbbell Chest Press', sets: 3, reps: '12' },
      { name: 'Lat Pulldown', sets: 3, reps: '12' },
      { name: 'Glute Bridge', sets: 3, reps: '15' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10' },
      { name: 'Dead Bug', sets: 3, reps: '10 / side' },
    ],
  },
  {
    id: 8, title: 'Glutes & Legs Basics', gender: 'Women', level: 'Beginner', focus: 'Glutes, legs', minutes: 35, icon: 'sun',
    description: 'Introduction to lower-body training with simple movements that build strong glutes and legs.',
    exercises: [
      { name: 'Leg Press', sets: 3, reps: '12' },
      { name: 'Hip Thrust (bodyweight or light)', sets: 3, reps: '12' },
      { name: 'Step-ups', sets: 3, reps: '10 / leg' },
      { name: 'Leg Curl', sets: 3, reps: '12' },
      { name: 'Cable Kickback', sets: 3, reps: '12 / leg' },
    ],
  },
  {
    id: 9, title: 'Glute Builder', gender: 'Women', level: 'Intermediate', focus: 'Glutes, hamstrings', minutes: 55, icon: 'star', tag: 'New',
    description: 'A glute-focused session with heavy hip thrusts and unilateral work. Add weight whenever you hit the top of the rep range.',
    exercises: [
      { name: 'Barbell Hip Thrust', sets: 4, reps: '8-10' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '10 / leg' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10' },
      { name: 'Cable Pull-Through', sets: 3, reps: '12' },
      { name: 'Hip Abduction Machine', sets: 3, reps: '15' },
      { name: 'Side Plank', sets: 3, reps: '30 sec' },
    ],
  },
  {
    id: 10, title: 'Upper Body Tone', gender: 'Women', level: 'Intermediate', focus: 'Back, shoulders, arms', minutes: 50, icon: 'shield',
    description: 'Strengthen and shape the back, shoulders and arms with a balanced mix of pushing and pulling.',
    exercises: [
      { name: 'Seated Cable Row', sets: 4, reps: '12' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10' },
      { name: 'Incline Push-ups', sets: 3, reps: '12' },
      { name: 'Lateral Raise', sets: 3, reps: '15' },
      { name: 'Dumbbell Curl', sets: 3, reps: '12' },
      { name: 'Triceps Kickback', sets: 3, reps: '12' },
    ],
  },
  {
    id: 11, title: 'Lower Body Sculpt', gender: 'Women', level: 'Advanced', focus: 'Quads, glutes, hamstrings', minutes: 65, icon: 'flag', tag: 'Popular',
    description: 'A demanding lower-body session using heavier loads and higher volume. Rest 90 seconds between the main lifts.',
    exercises: [
      { name: 'Back Squat', sets: 5, reps: '6' },
      { name: 'Barbell Hip Thrust', sets: 4, reps: '8' },
      { name: 'Walking Lunges', sets: 3, reps: '12 / leg' },
      { name: 'Stiff-Leg Deadlift', sets: 4, reps: '8' },
      { name: 'Leg Extension', sets: 3, reps: '15' },
      { name: 'Seated Calf Raise', sets: 4, reps: '15' },
    ],
  },
  {
    id: 12, title: 'Strength & Power', gender: 'Women', level: 'Advanced', focus: 'Strength', minutes: 70, icon: 'wind',
    description: 'Compound lifts and power movements for experienced lifters who want to get seriously strong.',
    exercises: [
      { name: 'Deadlift', sets: 5, reps: '3-5' },
      { name: 'Barbell Bench Press', sets: 4, reps: '6' },
      { name: 'Front Squat', sets: 4, reps: '5' },
      { name: 'Pull-ups', sets: 4, reps: '6-8' },
      { name: 'Push Press', sets: 4, reps: '5' },
      { name: 'Hanging Leg Raise', sets: 3, reps: '12' },
    ],
  },
];

export default function TutorialsScreen() {
  const [gender, setGender] = useState<Gender>('Men');
  const [level, setLevel] = useState<'All' | Level>('All');
  const [fav, setFav] = useState<number[]>([]);
  const [detail, setDetail] = useState<Program | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const list = useMemo(
    () => PROGRAMS.filter((p) => p.gender === gender && (level === 'All' || p.level === level)),
    [gender, level],
  );

  const toggleFav = (id: number) => setFav((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const toggleDone = (id: number, i: number) => setDone((d) => ({ ...d, [`${id}:${i}`]: !d[`${id}:${i}`] }));
  const doneCount = (p: Program) => p.exercises.filter((_, i) => done[`${p.id}:${i}`]).length;

  const Chip = ({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) => (
    <TouchableOpacity style={[s.chip, on && s.chipOn]} onPress={onPress}>
      <Text style={[s.chipText, on && { color: colors.black }]}>{label}</Text>
    </TouchableOpacity>
  );

  const Card = ({ p }: { p: Program }) => (
    <Pressable style={s.card} onPress={() => setDetail(p)}>
      <View style={[s.thumb, { height: 130 }]}>
        <Feather name={p.icon as any} size={46} color={colors.goldLight} />
        {!!p.tag && <View style={s.tag}><Text style={s.tagText}>{p.tag}</Text></View>}
      </View>
      <Text style={s.pName} numberOfLines={1}>{p.title}</Text>
      <Text style={s.sub} numberOfLines={1}>{p.level} · {p.focus}</Text>
      <View style={s.priceRow}>
        <Text style={s.price}>{p.minutes} min</Text>
        <TouchableOpacity style={s.heartBtn} onPress={() => toggleFav(p.id)} hitSlop={6}>
          <Ionicons name="heart" size={16} color={fav.includes(p.id) ? colors.red : colors.white} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <View style={{ gap: 18, paddingBottom: 110 }}>
      {/* Gender */}
      <View style={s.wrap}>
        {GENDERS.map((g) => <Chip key={g} on={gender === g} label={g} onPress={() => setGender(g)} />)}
      </View>

      {/* Levels */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {LEVELS.map((l) => <Chip key={l} on={level === l} label={l} onPress={() => setLevel(l)} />)}
      </ScrollView>

      {list.length === 0 ? (
        <View style={s.empty}>
          <Feather name="search" size={26} color={colors.grayDim} />
          <Text style={s.emptyText}>No tutorials for this level yet.</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginHorizontal: -4 }}>
          <View style={{ flex: 1, gap: 12 }}>{list.filter((_, i) => i % 2 === 0).map((p) => <Card key={p.id} p={p} />)}</View>
          <View style={{ flex: 1, gap: 12 }}>{list.filter((_, i) => i % 2 === 1).map((p) => <Card key={p.id} p={p} />)}</View>
        </View>
      )}

      {/* Tutorial detail */}
      <Modal visible={!!detail} animationType="slide" statusBarTranslucent onRequestClose={() => setDetail(null)}>
        {detail && (
          <View style={s.fullBleed}>
            <View style={s.topRow}>
              <TouchableOpacity style={s.roundBtn} onPress={() => setDetail(null)}><Feather name="arrow-left" size={18} color={colors.white} /></TouchableOpacity>
              <Text style={s.topTitle}>{detail.gender} · {detail.level}</Text>
              <TouchableOpacity style={s.roundBtn} onPress={() => toggleFav(detail.id)}>
                <Ionicons name="heart" size={20} color={fav.includes(detail.id) ? colors.red : colors.white} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 130, gap: 16 }} showsVerticalScrollIndicator={false}>
              <View style={s.hero}>
                <Feather name={detail.icon as any} size={80} color={colors.goldLight} />
              </View>

              <View style={s.tiles}>
                {[
                  { i: 'bar-chart-2', l: detail.level },
                  { i: 'clock', l: `${detail.minutes} min` },
                  { i: 'target', l: detail.focus },
                ].map((x) => (
                  <View key={x.l} style={s.tile}>
                    <Feather name={x.i as any} size={20} color={colors.goldLight} />
                    <Text style={s.tileText} numberOfLines={1}>{x.l}</Text>
                  </View>
                ))}
              </View>

              <View style={s.detailCard}>
                <Text style={s.dName}>{detail.title}</Text>
                <Text style={s.sub}>{detail.gender} · {detail.level} · {detail.focus}</Text>
                <Text style={s.descTitle}>About this workout</Text>
                <Text style={s.desc}>{detail.description}</Text>

                <View style={[s.rowBetween, { marginTop: 18 }]}>
                  <Text style={s.descTitle2}>Exercises</Text>
                  <Text style={s.progress}>{doneCount(detail)} / {detail.exercises.length} done</Text>
                </View>

                <View style={{ gap: 10, marginTop: 10 }}>
                  {detail.exercises.map((e, i) => {
                    const on = !!done[`${detail.id}:${i}`];
                    return (
                      <TouchableOpacity key={e.name} style={s.exRow} onPress={() => toggleDone(detail.id, i)} activeOpacity={0.8}>
                        <View style={[s.check, on && s.checkOn]}>
                          {on && <Feather name="check" size={14} color={colors.black} />}
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={[s.exName, on && { color: colors.gray, textDecorationLine: 'line-through' }]}>{e.name}</Text>
                          <Text style={s.sub}>{e.sets} sets × {e.reps}</Text>
                        </View>
                        <Text style={s.exNum}>{String(i + 1).padStart(2, '0')}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={s.bottomBar}>
              <TouchableOpacity
                style={s.cartBtn}
                onPress={() => Alert.alert('Workout started', `${detail.title} — good luck!`)}
              >
                <Text style={s.cartBtnText}>Start Workout · {detail.minutes} min</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.goldLight, borderColor: colors.goldLight },
  chipText: { color: colors.gray, fontSize: 12.5, fontWeight: '700' },

  card: { backgroundColor: colors.charcoal2, borderRadius: 28, padding: 12, gap: 4, borderWidth: 1, borderColor: colors.lineSoft, ...cardShadow },
  thumb: { borderRadius: 20, backgroundColor: 'rgba(245,244,240,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tag: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.greenLight, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { color: colors.black, fontSize: 9.5, fontWeight: '800' },
  pName: { color: colors.white, fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },
  sub: { color: colors.gray, fontSize: 11.5, paddingHorizontal: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 },
  price: { color: colors.goldLight, fontSize: 15, fontWeight: '800' },
  heartBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { color: colors.gray, fontSize: 13 },

  fullBleed: { flex: 1, backgroundColor: colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 54 },
  topTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  roundBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#3b3a36', alignItems: 'center', justifyContent: 'center' },
  hero: { height: 200, borderRadius: 32, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.lineSoft },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, height: 74, borderRadius: 20, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 6 },
  tileText: { color: colors.gray, fontSize: 11, fontWeight: '600' },
  detailCard: { backgroundColor: colors.charcoal2, borderRadius: 32, padding: 22, gap: 4, borderWidth: 1, borderColor: colors.lineSoft },
  dName: { color: colors.white, fontSize: 18, fontWeight: '800' },
  descTitle: { color: colors.white, fontSize: 15, fontWeight: '700', marginTop: 16 },
  descTitle2: { color: colors.white, fontSize: 15, fontWeight: '700' },
  desc: { color: colors.gray, fontSize: 13, lineHeight: 19, marginTop: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  progress: { color: colors.goldLight, fontSize: 12.5, fontWeight: '700' },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg, borderRadius: 18, padding: 12 },
  exName: { color: colors.white, fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },
  exNum: { color: colors.grayDim, fontSize: 12, fontWeight: '800' },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: colors.grayDim, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.greenLight, borderColor: colors.greenLight },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.lineSoft },
  cartBtn: { height: 52, borderRadius: 16, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  cartBtnText: { color: colors.black, fontWeight: '800', fontSize: 14 },
});
