import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable, Modal, Alert, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/dark';
import { PROGRAMS, LEVELS, Level, Program, Exercise, WEEKDAYS, avgMinutes, dayMinutes, getExercise, planStats } from './workoutData';
import { usePlan, startPlan } from './planStore';
import { ensurePermission } from './reminders';
import { Chip, ExerciseModal, ui } from './workoutUI';

export default function ProgramsTab({ onStarted }: { onStarted: () => void }) {
  const [level, setLevel] = useState<'All' | Level>('All');
  const [sel, setSel] = useState<Program | null>(null);
  const [ex, setEx] = useState<Exercise | null>(null);
  const { plan } = usePlan();

  const list = PROGRAMS.filter((p) => level === 'All' || p.level === level);
  const active = plan ? planStats(plan) : null;

  const begin = async (p: Program) => {
    const ok = await ensurePermission();
    startPlan(p.id);
    setSel(null);
    onStarted();
    if (!ok) Alert.alert('Reminders are off', 'Allow notifications for this app in your phone settings to get your daily workout reminders.');
  };
  const start = (p: Program) => {
    if (active && !active.ended) {
      Alert.alert('Replace current program?', `Your progress in "${active.program.title}" will be cleared.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', style: 'destructive', onPress: () => begin(p) },
      ]);
    } else begin(p);
  };

  return (
    <View style={{ gap: 14 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {(['All', ...LEVELS] as const).map((l) => <Chip key={l} on={level === l} label={l} onPress={() => setLevel(l)} />)}
      </ScrollView>

      {list.map((p) => (
        <Pressable key={p.id} style={[ui.card, { padding: 16, gap: 10 }]} onPress={() => setSel(p)}>
          <View style={st.row}>
            <View style={st.icon}><Feather name={p.icon as any} size={24} color={colors.goldLight} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={st.level}>{p.level.toUpperCase()}{p.tag ? `  ·  ${p.tag}` : ''}</Text>
              <Text style={st.title}>{p.title}</Text>
              <Text style={st.meta}>{p.weeks} weeks · {p.days.length} days/week · ~{avgMinutes(p)} min</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.grayDim} />
          </View>
          <Text style={st.desc} numberOfLines={2}>{p.description}</Text>
        </Pressable>
      ))}

      <Modal visible={!!sel} animationType="slide" statusBarTranslucent onRequestClose={() => setSel(null)}>
        {sel && (
          <View style={ui.fullBleed}>
            <View style={ui.topRow}>
              <TouchableOpacity style={ui.roundBtn} onPress={() => setSel(null)}><Feather name="arrow-left" size={18} color={colors.white} /></TouchableOpacity>
              <Text style={ui.topTitle}>{sel.level} program</Text>
              <View style={{ width: 42 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 130, gap: 16 }} showsVerticalScrollIndicator={false}>
              <View style={ui.tiles}>
                {[
                  { i: 'calendar', l: `${sel.weeks} weeks` },
                  { i: 'repeat', l: `${sel.days.length} days/week` },
                  { i: 'clock', l: `~${avgMinutes(sel)} min` },
                ].map((x) => (
                  <View key={x.i} style={ui.tile}>
                    <Feather name={x.i as any} size={20} color={colors.goldLight} />
                    <Text style={ui.tileText}>{x.l}</Text>
                  </View>
                ))}
              </View>

              <View style={ui.detailCard}>
                <Text style={ui.dName}>{sel.title}</Text>
                <Text style={ui.desc}>{sel.description}</Text>
                <Text style={[ui.desc, { marginTop: 10 }]}>
                  Your program runs for {sel.weeks} weeks. You will get a reminder on every training day, check in after each workout, and be asked to update your program when it ends.
                </Text>
              </View>

              <Text style={ui.descTitle}>Weekly schedule</Text>
              {sel.days.map((d) => (
                <View key={d.wd} style={ui.panel}>
                  <View style={st.row}>
                    <View style={st.dayBadge}><Text style={st.dayText}>{WEEKDAYS[d.wd].toUpperCase()}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.title}>{d.title}</Text>
                      <Text style={st.meta}>{d.focus} · ~{dayMinutes(d)} min</Text>
                    </View>
                  </View>
                  {d.slots.map(([id, sets, reps], i) => {
                    const e = getExercise(id);
                    if (!e) return null;
                    return (
                      <TouchableOpacity key={id} style={st.exRow} onPress={() => setEx(e)} activeOpacity={0.8}>
                        <Text style={st.exNum}>{String(i + 1).padStart(2, '0')}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={st.exName}>{e.name}</Text>
                          <Text style={st.meta}>{sets} sets × {reps}</Text>
                        </View>
                        <Feather name={e.video ? 'play-circle' : 'info'} size={18} color={colors.goldLight} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            <View style={ui.bottomBar}>
              <TouchableOpacity style={ui.primaryBtn} onPress={() => start(sel)}>
                <Text style={ui.primaryText}>Start program · {sel.weeks} weeks</Text>
              </TouchableOpacity>
            </View>

            <ExerciseModal ex={ex} onClose={() => setEx(null)} />
          </View>
        )}
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(201,162,39,0.15)', alignItems: 'center', justifyContent: 'center' },
  level: { color: colors.goldLight, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: colors.white, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.gray, fontSize: 12 },
  desc: { color: colors.gray, fontSize: 13, lineHeight: 19 },
  dayBadge: { width: 46, height: 36, borderRadius: 10, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  dayText: { color: colors.black, fontSize: 12, fontWeight: '800' },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg, borderRadius: 16, padding: 12 },
  exNum: { color: colors.grayDim, fontSize: 12, fontWeight: '800', width: 20 },
  exName: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
