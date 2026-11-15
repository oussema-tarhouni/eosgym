import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/dark';

const GOALS = ['cut', 'maintain', 'bulk'] as const;
const CAL_MULT: Record<string, number> = { cut: 0.8, maintain: 1, bulk: 1.15 };
const PROTEIN_PER_KG: Record<string, number> = { cut: 2.2, maintain: 2.0, bulk: 1.8 };
const ACTIVITY = [
  { label: 'Sedentary', value: 1.2 },
  { label: 'Light', value: 1.375 },
  { label: 'Moderate', value: 1.55 },
  { label: 'Active', value: 1.725 },
  { label: 'Very active', value: 1.9 },
];

export default function DietScreen({ onBack }: { onBack: () => void }) {
  const [goal, setGoal] = useState<typeof GOALS[number]>('maintain');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('27');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('72.5');
  const [activity, setActivity] = useState(1.55);
  const [result, setResult] = useState<{ kcal: number; protein: number; fat: number; carbs: number } | null>(null);

  const calculate = () => {
    const a = parseFloat(age), h = parseFloat(height), w = parseFloat(weight);
    if (!a || !h || !w) return;
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const kcal = Math.round(bmr * activity * CAL_MULT[goal]);
    const protein = Math.round(w * PROTEIN_PER_KG[goal]);
    const fat = Math.round((kcal * 0.25) / 9);
    const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
    setResult({ kcal, protein, fat, carbs });
  };

  return (
    <View style={{ gap: 16 }}>

      <View style={s.widget}>
        <Text style={s.label}>Goal</Text>
        <View style={s.row}>
          {GOALS.map((g) => (
            <TouchableOpacity key={g} onPress={() => setGoal(g)} style={[s.pill, goal === g && s.pillActive]}>
              <Text style={[s.pillText, goal === g && s.pillTextActive]}>{g[0].toUpperCase() + g.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Sex</Text>
        <View style={s.row}>
          {(['male', 'female'] as const).map((v) => (
            <TouchableOpacity key={v} onPress={() => setSex(v)} style={[s.pill, sex === v && s.pillActive]}>
              <Text style={[s.pillText, sex === v && s.pillTextActive]}>{v[0].toUpperCase() + v.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.grid2}>
          <Field label="Age" value={age} onChangeText={setAge} />
          <Field label="Height (cm)" value={height} onChangeText={setHeight} />
          <Field label="Weight (kg)" value={weight} onChangeText={setWeight} />
        </View>

        <Text style={s.label}>Activity level</Text>
        <View style={{ gap: 6 }}>
          {ACTIVITY.map((a) => (
            <TouchableOpacity key={a.label} onPress={() => setActivity(a.value)} style={[s.activityRow, activity === a.value && s.activityRowActive]}>
              <Text style={[s.activityText, activity === a.value && s.activityTextActive]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={calculate}>
          <Text style={s.saveBtnText}>Calculate My Macros</Text>
        </TouchableOpacity>
      </View>

      <View style={s.widget}>
        {result ? (
          <View style={{ gap: 10 }}>
            <Text style={s.kcalHero}>{result.kcal} kcal/day</Text>
            <View style={s.macroRow}><Text style={s.macroLabel}>Protein</Text><Text style={s.macroVal}>{result.protein} g</Text></View>
            <View style={s.macroRow}><Text style={s.macroLabel}>Fat</Text><Text style={s.macroVal}>{result.fat} g</Text></View>
            <View style={s.macroRow}><Text style={s.macroLabel}>Carbs</Text><Text style={s.macroVal}>{result.carbs} g</Text></View>
          </View>
        ) : (
          <Text style={s.empty}>Fill in your details and hit calculate to get your daily calorie and macro targets.</Text>
        )}
      </View>
    </View>
  );
}

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (t: string) => void }) {
  return (
    <View style={{ flexBasis: '47%', flexGrow: 1 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput style={s.input} value={value} onChangeText={onChangeText} keyboardType="numeric" placeholderTextColor={colors.grayDim} />
    </View>
  );
}

const s = StyleSheet.create({
  back: { color: colors.gray, fontSize: 13 },
  title: { color: colors.white, fontSize: 20, fontWeight: '700' },
  widget: { backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 16, gap: 12 },
  label: { color: colors.gray, fontSize: 11.5, marginBottom: 6, marginTop: 2 },
  fieldLabel: { color: colors.gray, fontSize: 11, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  pillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  pillText: { color: colors.gray, fontSize: 12, fontWeight: '700' },
  pillTextActive: { color: colors.black },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, color: colors.white },
  activityRow: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  activityRowActive: { borderColor: colors.green },
  activityText: { color: colors.gray, fontSize: 12.5 },
  activityTextActive: { color: colors.greenLight, fontWeight: '700' },
  saveBtn: { backgroundColor: colors.greenLight, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: colors.black, fontWeight: '700', fontSize: 13.5 },
  empty: { color: colors.gray, fontSize: 13, lineHeight: 19 },
  kcalHero: { color: colors.goldLight, fontSize: 26, fontWeight: '700' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  macroLabel: { color: colors.gray, fontSize: 13 },
  macroVal: { color: colors.white, fontWeight: '700', fontSize: 13 },
});
