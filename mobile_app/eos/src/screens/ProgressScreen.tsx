import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const MEAL_PLAN = [
  { name: 'Breakfast', item: 'Oats, banana & whey protein', kcal: 420 },
  { name: 'Lunch', item: 'Grilled chicken, rice & veg', kcal: 610 },
  { name: 'Snack', item: 'Greek yogurt & almonds', kcal: 240 },
  { name: 'Dinner', item: 'Salmon, quinoa & salad', kcal: 520 },
];

export default function ProgressScreen({ onBack }: { onBack: () => void }) {
  const [log, setLog] = useState([
    { date: '2026-08-20', weight: 74.2 },
    { date: '2026-08-27', weight: 73.6 },
    { date: '2026-09-03', weight: 73.1 },
  ]);
  const [weight, setWeight] = useState('');

  const addEntry = () => {
    const v = parseFloat(weight);
    if (!v) return;
    setLog((l) => [...l, { date: new Date().toISOString().slice(0, 10), weight: v }]);
    setWeight('');
  };

  const first = log[0]?.weight ?? 0;
  const last = log[log.length - 1]?.weight ?? 0;
  const change = (last - first).toFixed(1);
  const maxW = Math.max(...log.map((l) => l.weight));
  const minW = Math.min(...log.map((l) => l.weight));

  return (
    <View style={{ gap: 16 }}>
      <View style={s.statsRow}>
        <View style={s.stat}><Text style={s.statN}>{last}kg</Text><Text style={s.statL}>Current</Text></View>
        <View style={s.stat}><Text style={[s.statN, { color: last < first ? '#8fc25f' : colors.goldLight }]}>{change}kg</Text><Text style={s.statL}>Change</Text></View>
        <View style={s.stat}><Text style={s.statN}>{log.length}</Text><Text style={s.statL}>Entries</Text></View>
      </View>

      <View style={s.widget}>
        <Text style={s.widgetTitle}>Weight over time</Text>
        <View style={s.chartRow}>
          {log.map((l, i) => {
            const range = Math.max(maxW - minW, 1);
            const h = 10 + ((l.weight - minW) / range) * 70;
            return (
              <View key={i} style={s.barCol}>
                <View style={[s.bar, { height: h }]} />
                <Text style={s.barLabel}>{l.date.slice(5)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={s.widget}>
        <Text style={s.widgetTitle}>Log today's weight</Text>
        <View style={s.formRow}>
          <TextInput
            style={s.input}
            placeholder="e.g. 72.5"
            placeholderTextColor={colors.grayDim}
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
          <TouchableOpacity style={s.saveBtn} onPress={addEntry}>
            <Text style={s.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
        {log.slice().reverse().map((l, i) => (
          <View key={i} style={s.logRow}>
            <Text style={s.logDate}>{l.date}</Text>
            <Text style={s.logWeight}>{l.weight} kg</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>TODAY'S MEAL PLAN</Text>
      <View style={{ gap: 10 }}>
        {MEAL_PLAN.map((m) => (
          <View key={m.name} style={s.mealCard}>
            <View>
              <Text style={s.mealName}>{m.name}</Text>
              <Text style={s.mealItem}>{m.item}</Text>
            </View>
            <Text style={s.mealKcal}>{m.kcal} kcal</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  back: { color: colors.gray, fontSize: 13 },
  title: { color: colors.white, fontSize: 20, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  stat: { flex: 1, backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 12, alignItems: 'center' },
  statN: { color: colors.white, fontSize: 16, fontWeight: '700' },
  statL: { color: colors.gray, fontSize: 10.5, marginTop: 2 },
  widget: { backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 16, gap: 10 },
  widgetTitle: { color: colors.white, fontSize: 14, fontWeight: '600' },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 100, paddingTop: 10 },
  barCol: { alignItems: 'center', gap: 6 },
  bar: { width: 18, borderRadius: 5, backgroundColor: colors.gold },
  barLabel: { color: colors.grayDim, fontSize: 9 },
  formRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.white },
  saveBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center' },
  saveBtnText: { color: colors.black, fontWeight: '700', fontSize: 13 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  logDate: { color: colors.gray, fontSize: 12 },
  logWeight: { color: colors.white, fontSize: 12, fontWeight: '700' },
  sectionTitle: { color: colors.white, fontSize: 15, fontWeight: '600', letterSpacing: 0.4 },
  mealCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14 },
  mealName: { color: colors.goldLight, fontSize: 12, fontWeight: '700' },
  mealItem: { color: colors.white, fontSize: 13, marginTop: 2 },
  mealKcal: { color: colors.gray, fontSize: 12 },
});
