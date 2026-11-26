import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/dark';
import { EXERCISES, GROUPS, MUSCLES, Exercise, Group } from './workoutData';
import { usePlan, useDailyNotice } from './planStore';
import { MUSCLE_IMG } from './muscleImages';
import { Chip, ExerciseModal, ui } from './workoutUI';
import ProgramsTab from './ProgramsTab';
import MyPlanTab from './MyPlanTab';
import WorkoutSession, { SessionEx } from './WorkoutSession';

// ADAPT to your plan shape: return today's exercises + muscle groups.
function toSession(plan: any): { title: string; exercises: SessionEx[]; groups: string[] } {
  const day = plan?.today ?? plan?.days?.[0] ?? plan;
  const raw: any[] = day?.exercises ?? [];
  return {
    title: plan?.name ?? day?.name ?? 'Workout',
    groups: Array.from(new Set(raw.map((e) => e.group ?? e.part).filter(Boolean))) as string[],
    exercises: raw.map((e) => ({ name: e.name, sets: e.sets ?? 3, reps: String(e.reps ?? '10'), rest: e.rest ?? 60 })),
  };
}

const TABS = ['Exercises', 'Programs', 'My Plan'] as const;
type Tab = (typeof TABS)[number];

export default function TutorialsScreen() {
  const [tab, setTab] = useState<Tab>('Exercises');
  const { plan, ready } = usePlan();
  const picked = useRef(false);
  const [run, setRun] = useState(false);
  const sess = useMemo(() => toSession(plan), [plan]);
  useDailyNotice();

  // Open straight on "My Plan" when the user already has an active program.
  useEffect(() => {
    if (ready && !picked.current) {
      picked.current = true;
      if (plan) setTab('My Plan');
    }
  }, [ready, plan]);

  return (
    <View style={{ gap: 18, paddingBottom: 110 }}>
      <View style={ui.segment}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[ui.segBtn, tab === t && ui.segOn]} onPress={() => setTab(t)}>
            <Text style={[ui.segText, tab === t && { color: colors.black }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Exercises' && <ExercisesTab />}
      {tab === 'Programs' && <ProgramsTab onStarted={() => { setTab('My Plan'); setRun(true); }} />}
      {tab === 'My Plan' && <MyPlanTab onBrowse={() => setTab('Programs')} />}
      <WorkoutSession visible={run} {...sess} onClose={() => setRun(false)} />
    </View>
  );
}

// ───────────── Exercise library: muscle cards → (part) → video tutorials ─────────────

function ExercisesTab() {
  const [group, setGroup] = useState<Group | null>(null);
  const [part, setPart] = useState('Whole');
  const [sel, setSel] = useState<Exercise | null>(null);

  const list = useMemo(
    () => (group ? EXERCISES.filter((e) => e.group === group && (part === 'Whole' || e.part === part)) : []),
    [group, part],
  );
  const open = (g: Group) => { setGroup(g); setPart('Whole'); };

  // 1) Muscle cards
  if (!group) {
    return (
      <View style={{ gap: 14 }}>
        {GROUPS.map((g, i) => {
          const n = EXERCISES.filter((e) => e.group === g).length;
          return (
            <Pressable key={g} style={st.big} onPress={() => open(g)}>
              <Image source={MUSCLE_IMG[g]} style={st.bigImg} resizeMode="contain" />
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={st.bigKicker}>{String(i + 1).padStart(2, '0')}  ·  {n} EXERCISES</Text>
                <Text style={st.bigTitle} numberOfLines={1}>{g}</Text>
                <Text style={st.bigParts} numberOfLines={1}>{MUSCLES[g].length ? MUSCLES[g].join('  ·  ') : 'All exercises'}</Text>
              </View>
              <View style={st.bigArrow}><Feather name="arrow-right" size={20} color={colors.black} /></View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // 2) Exercises of the chosen muscle
  const Card = ({ e }: { e: Exercise }) => (
    <Pressable style={ui.card} onPress={() => setSel(e)}>
      <View style={st.thumb}>
        {e.image
          ? <Image source={typeof e.image === 'string' ? { uri: e.image } : e.image} style={st.thumbImg} resizeMode="cover" />
          : <Ionicons name="barbell" size={40} color={colors.goldLight} />}
        {!!e.video && <View style={st.play}><Ionicons name="play" size={12} color={colors.black} /></View>}
      </View>
      <Text style={st.name} numberOfLines={1}>{e.name}</Text>
      <Text style={ui.sub} numberOfLines={1}>{e.part === e.group ? e.equipment : `${e.part} · ${e.equipment}`}</Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 14 }}>
      <View style={st.header}>
        <TouchableOpacity style={ui.roundBtn} onPress={() => setGroup(null)}><Feather name="arrow-left" size={18} color={colors.white} /></TouchableOpacity>
        <View>
          <Text style={st.headTitle}>{group}</Text>
          <Text style={ui.sub}>{list.length} exercise{list.length === 1 ? '' : 's'}</Text>
        </View>
      </View>

      {MUSCLES[group].length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {['Whole', ...MUSCLES[group]].map((p) => <Chip key={p} on={part === p} label={p} onPress={() => setPart(p)} />)}
        </ScrollView>
      )}

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginHorizontal: -4 }}>
        <View style={{ flex: 1, gap: 12 }}>{list.filter((_, i) => i % 2 === 0).map((e) => <Card key={e.id} e={e} />)}</View>
        <View style={{ flex: 1, gap: 12 }}>{list.filter((_, i) => i % 2 === 1).map((e) => <Card key={e.id} e={e} />)}</View>
      </View>

      <ExerciseModal ex={sel} onClose={() => setSel(null)} />
    </View>
  );
}

const st = StyleSheet.create({
  thumb: { height: 110, borderRadius: 20, backgroundColor: 'rgba(245,244,240,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  thumbImg: { width: '100%', height: '100%', borderRadius: 20 },
  play: { position: 'absolute', right: 8, bottom: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.white, fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },
  big: { height: 136, borderRadius: 30, backgroundColor: colors.charcoal2, borderWidth: 1, borderColor: colors.lineSoft, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' },
  bigImg: { position: 'absolute', right: 58, top: 0, bottom: 0, width: 130, height: '100%' },
  bigArrow: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  bigKicker: { color: colors.goldLight, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bigTitle: { color: colors.white, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  bigParts: { color: colors.gray, fontSize: 13 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headTitle: { color: colors.white, fontSize: 22, fontWeight: '800' },
});
