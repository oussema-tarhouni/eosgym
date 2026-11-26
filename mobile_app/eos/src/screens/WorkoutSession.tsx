import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Vibration, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/dark';
import TimerDial from '../components/TimerDial';

export type SessionEx = { name: string; sets: number; reps: string; rest?: number; workSec?: number };
type Step = { kind: 'warmup' | 'work' | 'rest'; label: string; sub: string; sec?: number };

// Research-based structure (ACSM/NSCA, Nike, EuropeActive): light general cardio (effort 4-5/10)
// → 4-6 dynamic drills for the trained muscles → core/glute activation → ramp-up set.
// Long static stretching (>60s) is avoided: it reduces strength/power.
const DRILLS: Record<string, string[]> = {
  chest: ['Arm circles', 'Band pull-aparts', 'Scapular push-ups', 'Thoracic rotations'],
  back: ['Cat-cow', 'Band face pulls', 'Scapular pull-ups', 'Thoracic rotations'],
  shoulder: ['Arm circles', 'Shoulder dislocates (band)', 'Wall slides', 'Band external rotations'],
  bicep: ['Wrist & elbow circles', 'Arm swings', 'Light band curls'],
  tricep: ['Arm swings', 'Wrist & elbow circles', 'Light band pushdowns'],
  leg: ['Leg swings', 'Bodyweight squats', 'Walking lunges', 'Hip circles', 'Ankle rocks'],
  glute: ['Hip circles', 'Fire hydrants', 'Bodyweight squats', 'Leg swings'],
  abs: ['Cat-cow', 'Torso twists', 'World’s greatest stretch'],
  core: ['Cat-cow', 'Torso twists', 'World’s greatest stretch'],
};
const ACTIVATION = ['Bird dog', 'Glute bridge'];

export function buildSteps(exercises: SessionEx[], groups: string[]): Step[] {
  const drills = Array.from(new Set(groups.flatMap((g) =>
    Object.entries(DRILLS).filter(([k]) => g.toLowerCase().includes(k)).flatMap(([, v]) => v)))).slice(0, 6);
  const s: Step[] = [{ kind: 'warmup', label: 'Échauffement · Cardio', sub: 'Jog, bike or rope · light effort (4-5/10)', sec: 240 }];
  (drills.length ? drills : ['Full-body mobility', 'Bodyweight squats', 'Arm circles']).forEach((d) =>
    s.push({ kind: 'warmup', label: d, sub: 'Dynamic drill · smooth & controlled', sec: 40 }));
  ACTIVATION.forEach((d) => s.push({ kind: 'warmup', label: d, sub: 'Activation · feel the muscle working', sec: 30 }));
  if (exercises[0]) s.push({ kind: 'warmup', label: `Ramp-up · ${exercises[0].name}`, sub: '10 reps · ~50% of working weight' });
  exercises.forEach((e, ei) => {
    for (let i = 1; i <= e.sets; i++) {
      s.push({ kind: 'work', label: e.name, sub: `Set ${i}/${e.sets} · ${e.reps} reps`, sec: e.workSec });
      if (!(i === e.sets && ei === exercises.length - 1))
        s.push({ kind: 'rest', label: 'Rest', sub: i === e.sets ? 'Next exercise' : `Next: set ${i + 1}`, sec: e.rest ?? 60 });
    }
  });
  return s;
}

const fmt = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const tint = { warmup: '#F5A524', work: colors.goldLight, rest: colors.greenLight } as const;

export default function WorkoutSession({ visible, title, exercises, groups, onClose }:
  { visible: boolean; title?: string; exercises: SessionEx[]; groups: string[]; onClose: () => void }) {
  const steps = useMemo(() => buildSteps(exercises, groups), [exercises, groups]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'count' | 'run'>('ready');
  const [cd, setCd] = useState(3);
  const [left, setLeft] = useState(0);
  const [up, setUp] = useState(0);
  const [total, setTotal] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = steps[idx];
  const done = idx >= steps.length;

  const reset = () => { setPhase(step?.kind === 'rest' ? 'run' : 'ready'); setCd(3); setLeft(step?.sec ?? 0); setUp(0); setPaused(false); };
  useEffect(() => { if (visible) { setIdx(0); setTotal(0); } }, [visible]);
  useEffect(() => { reset(); if (idx > 0) Vibration.vibrate(250); }, [idx, visible]);

  useEffect(() => {
    if (!visible || paused || done || phase === 'ready') return;
    const t = setInterval(() => {
      if (phase === 'count') { setCd((x) => x - 1); return; }
      setTotal((x) => x + 1); setUp((x) => x + 1); if (step?.sec) setLeft((x) => x - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [visible, paused, done, phase, step]);

  useEffect(() => { if (phase === 'count' && cd <= 0) { setPhase('run'); Vibration.vibrate(120); } }, [cd]);
  useEffect(() => { if (phase === 'run' && step?.sec && left <= 0) setIdx((i) => i + 1); }, [left]);

  const next = () => setIdx((i) => Math.min(i + 1, steps.length));
  const prev = () => setIdx((i) => Math.max(i - 1, 0));
  const c = step ? tint[step.kind] : colors.goldLight;
  const frac = !step ? 1 : phase === 'count' ? cd / 3 : step.sec ? Math.max(left, 0) / step.sec : (up % 60) / 60;
  const label = step ? (step.sec ? fmt(Math.max(left, 0)) : fmt(up)) : '';
  // where the ring will be one second from now, so it glides instead of ticking
  const target = !step ? 1 : phase === 'count' ? Math.max(cd - 1, 0) / 3 : step.sec ? Math.max(left - 1, 0) / step.sec : ((up % 60) + 1) / 60;
  const running = (phase === 'run' || phase === 'count') && !paused;
  const urgent = phase === 'run' && !!step?.sec && left > 0 && left <= 5;
  const hint = phase === 'ready' ? 'READY' : paused ? 'PAUSED' : step?.kind === 'rest' ? 'REST' : step?.sec ? 'REMAINING' : 'ELAPSED';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <View style={s.top}>
          <TouchableOpacity onPress={onClose}><Feather name="x" size={24} color={colors.white} /></TouchableOpacity>
          <Text style={s.title}>{title ?? 'Workout'}</Text>
          <Text style={s.total}>{fmt(total)}</Text>
        </View>
        <View style={s.bar}><View style={[s.fill, { width: `${Math.min(idx / steps.length, 1) * 100}%`, backgroundColor: c }]} /></View>

        {done ? (
          <View style={s.center}>
            <Feather name="check-circle" size={72} color={colors.greenLight} />
            <Text style={s.name}>Session complete 💪</Text>
            <Text style={s.sub}>Total time {fmt(total)}</Text>
            <TouchableOpacity style={[s.btn, { backgroundColor: c }]} onPress={onClose}><Text style={s.btnT}>Finish</Text></TouchableOpacity>
          </View>
        ) : (
          <View style={s.center}>
            <Text style={[s.kind, { color: c }]}>{step.kind === 'warmup' ? 'ÉCHAUFFEMENT' : step.kind === 'work' ? 'WORK' : 'REST'} · {idx + 1}/{steps.length}</Text>
            <Text style={s.name}>{step.label}</Text>
            <Text style={s.sub}>{step.sub}</Text>

            <TimerDial
              frac={frac} target={target} running={running} resetKey={`${idx}-${phase}`}
              color={urgent ? colors.red : c}
              time={phase === 'count' ? String(Math.max(cd, 1)) : label}
              hint={hint} countdown={phase === 'count'}
            />

            <View style={s.row}>
              <TouchableOpacity style={s.round} onPress={prev}><Feather name="skip-back" size={20} color={colors.white} /></TouchableOpacity>
              <TouchableOpacity style={s.round} onPress={reset}><Feather name="rotate-ccw" size={20} color={colors.white} /></TouchableOpacity>
              {phase === 'ready'
                ? <TouchableOpacity style={[s.round, s.main, { backgroundColor: c }]} onPress={() => { setCd(3); setPhase('count'); }}>
                    <Feather name="play" size={30} color={colors.black} />
                  </TouchableOpacity>
                : <TouchableOpacity style={[s.round, s.main, { backgroundColor: c }]} disabled={phase === 'count'} onPress={() => setPaused((p) => !p)}>
                    <Feather name={paused ? 'play' : 'pause'} size={30} color={colors.black} />
                  </TouchableOpacity>}
              {!!step.sec && phase === 'run' && <TouchableOpacity style={s.round} onPress={() => setLeft((x) => x + 15)}><Text style={s.pillT}>+15</Text></TouchableOpacity>}
              <TouchableOpacity style={s.round} onPress={next}><Feather name="skip-forward" size={20} color={colors.white} /></TouchableOpacity>
            </View>
            {!step.sec && phase === 'run' && (
              <TouchableOpacity style={[s.btn, { backgroundColor: c }]} onPress={next}><Text style={s.btnT}>Set done</Text></TouchableOpacity>
            )}
            {steps[idx + 1] && <Text style={s.next}>Next: {steps[idx + 1].label}</Text>}
          </View>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.charcoal2, paddingTop: 54, paddingHorizontal: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.white, fontSize: 16, fontWeight: '700' },
  total: { color: colors.gray, fontSize: 15, fontVariant: ['tabular-nums'] },
  bar: { height: 5, borderRadius: 3, backgroundColor: 'rgba(245,244,240,0.08)', marginTop: 16, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  kind: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  name: { color: colors.white, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  sub: { color: colors.gray, fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  round: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(245,244,240,0.08)', alignItems: 'center', justifyContent: 'center' },
  main: { width: 72, height: 72, borderRadius: 36 },
  pillT: { color: colors.white, fontWeight: '700' },
  btn: { paddingHorizontal: 44, paddingVertical: 14, borderRadius: 28, marginTop: 6 },
  btnT: { color: colors.black, fontSize: 16, fontWeight: '800' },
  next: { color: colors.gray, fontSize: 13, marginTop: 10 },
});
