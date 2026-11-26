import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, GREEN_START } from '../theme/dark';
import { Field } from '../components/AuthUI';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
type Unit = 'metric' | 'imperial';

// Read this in SignupScreen and send it to your API with the signup data.
export const onboardingAnswers: {
  gender?: string; goals?: string[]; experience?: string; daysPerWeek?: number;
  age?: number; heightCm?: number; weightKg?: number;
} = {};

const GOALS: { label: string; icon: any }[] = [
  { label: 'Build Muscle', icon: 'arm-flex' },
  { label: 'Gain Strength', icon: 'dumbbell' },
  { label: 'Lose Weight', icon: 'scale-bathroom' },
  { label: 'Stay in Shape', icon: 'heart-pulse' },
  { label: 'Conditioning', icon: 'run-fast' },
];
const EXPERIENCE = ['Just getting started', 'A few months', 'About a year', 'Several years', 'I train competitively'];
const DAYS = [2, 3, 4, 5, 6];
const TOTAL = 6;
const WEIGHT_STEP = 5;
const KG_PER_LB = 1 / 2.20462;
const RANGE: Record<Unit, [number, number]> = { metric: [30, 300], imperial: [66, 660] };
const DECIMALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ITEM_H = 60;

// Adjust paths if your images are elsewhere
const GENDER_IMG: Record<string, any> = {
  Male: require('../../assets/male.png'),
  Female: require('../../assets/female.png'),
};

function Option({ label, selected, onPress, right, icon }: { label: string; selected: boolean; onPress: () => void; right?: string; icon?: any }) {
  return (
    <Pressable onPress={onPress} style={[s.option, selected && s.optionOn]}>
      {!!icon && (
        <View style={[s.iconWrap, selected && s.iconWrapOn]}>
          <MaterialCommunityIcons name={icon} size={22} color={selected ? colors.greenLight : colors.goldLight} />
        </View>
      )}
      <Text style={[s.optionText, selected && { color: colors.greenLight }]}>{label}</Text>
      {!!right && <Text style={s.optionTag}>{right}</Text>}
      {selected && <Feather name="check-circle" size={18} color={colors.green} />}
    </Pressable>
  );
}

// Vertical snap wheel showing 3 rows; the middle row is the selected one.
function Wheel({ data, index, onChange, width = 116 }: { data: number[]; index: number; onChange: (i: number) => void; width?: number }) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ y: index * ITEM_H, animated: false }), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    onChange(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <View style={{ width, height: ITEM_H * 3 }}>
      <View pointerEvents="none" style={[s.wheelLine, { top: ITEM_H }]} />
      <View pointerEvents="none" style={[s.wheelLine, { top: ITEM_H * 2 }]} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
      >
        {data.map((d, i) => (
          <View key={d} style={s.wheelItem}>
            <Text style={[s.wheelText, i === index && s.wheelTextOn]}>{d}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [exp, setExp] = useState('');
  const [days, setDays] = useState(0);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  // weight (shown in the chosen unit)
  const [unit, setUnit] = useState<Unit>('metric');
  const [whole, setWhole] = useState(75);
  const [dec, setDec] = useState(0);

  const a = Number(age), h = Number(height);
  const statsOk = a >= 14 && a <= 100 && h >= 100 && h <= 250;
  const valid = [!!gender, goals.length > 0, !!exp, days > 0, statsOk, true][step];

  const [lo, hi] = RANGE[unit];
  const wholeData = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const total = whole + dec / 10;
  const weightKg = Math.round((unit === 'metric' ? total : total * KG_PER_LB) * 10) / 10;

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    const converted = Math.round((u === 'imperial' ? total / KG_PER_LB : total * KG_PER_LB) * 10) / 10;
    const [l, hh] = RANGE[u];
    const c = Math.min(hh, Math.max(l, converted));
    setWhole(Math.floor(c));
    setDec(Math.round((c - Math.floor(c)) * 10) % 10);
    setUnit(u);
  };

  const progress = (step + 1) / TOTAL;
  const goldPct = Math.min(progress, GREEN_START) * 100;
  const greenPct = Math.max(0, progress - GREEN_START) * 100;

  const next = () => {
    if (step < TOTAL - 1) return setStep(step + 1);
    Object.assign(onboardingAnswers, { gender, goals, experience: exp, daysPerWeek: days, age: a, heightCm: h, weightKg });
    navigation.navigate('Signup');
  };
  const back = () => (step === 0 ? navigation.goBack() : setStep(step - 1));
  const toggleGoal = (g: string) => setGoals((l) => (l.includes(g) ? l.filter((x) => x !== g) : [...l, g]));

  const titles = ["What's your gender?", 'What are your goals?', "What's your experience with training?", 'How many days a week do you want to work out?', 'Tell us about your age and height', 'How much do you weigh?'];
  const subs = ['This helps us personalize your experience', "Choose as many as you'd like.", '', 'You can always change it later', 'Used to tailor your plan and calories', ''];

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.top}>
        <Pressable onPress={back} hitSlop={12}><Feather name="arrow-left" size={24} color={colors.gray} /></Pressable>
        <View style={s.track}>
          {/* Gold until GREEN_START, then green for the rest */}
          <View style={[s.fill, { width: `${goldPct}%`, backgroundColor: colors.gold }]} />
          <View style={[s.fill, { width: `${greenPct}%`, backgroundColor: colors.green }]} />
        </View>
      </View>

      {step === WEIGHT_STEP ? (
        <View style={s.weightBody}>
          <Text style={s.title}>{titles[step]}</Text>

          <View style={s.segment}>
            {(['metric', 'imperial'] as Unit[]).map((u) => (
              <Pressable key={u} onPress={() => switchUnit(u)} style={[s.segItem, unit === u && s.segItemOn]}>
                <Text style={[s.segText, unit === u && { color: colors.greenLight }]}>{u === 'metric' ? 'Metric system' : 'Imperial system'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={s.display}>
            <Text style={s.displayNum}>{whole} , {dec}</Text>
            <Text style={s.displayUnit}>{unit === 'metric' ? 'kg' : 'lb'}</Text>
          </View>

          <View style={s.wheels}>
            <Wheel key={`w-${unit}`} data={wholeData} index={whole - lo} onChange={(i) => setWhole(lo + i)} />
            <Text style={s.comma}>,</Text>
            <Wheel key={`d-${unit}`} data={DECIMALS} index={dec} onChange={setDec} />
            <Text style={s.wheelUnit}>{unit === 'metric' ? 'kg' : 'lb'}</Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>{titles[step]}</Text>
          {!!subs[step] && <Text style={s.sub}>{subs[step]}</Text>}

          {step === 0 && (
            <View style={s.genderRow}>
              {['Male', 'Female'].map((g) => (
                <Pressable key={g} onPress={() => setGender(g)} style={[s.genderItem, { opacity: !gender || gender === g ? 1 : 0.4 }]}>
                  <Image source={GENDER_IMG[g]} style={s.genderImg} resizeMode="contain" />
                  <Text style={[s.genderLabel, gender === g && { color: colors.greenLight }]}>{g}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {step === 1 && GOALS.map((g) => <Option key={g.label} icon={g.icon} label={g.label} selected={goals.includes(g.label)} onPress={() => toggleGoal(g.label)} />)}
          {step === 2 && EXPERIENCE.map((e) => <Option key={e} label={e} selected={exp === e} onPress={() => setExp(e)} />)}
          {step === 3 && DAYS.map((d) => <Option key={d} label={`${d} days a week`} selected={days === d} onPress={() => setDays(d)} right={d >= 3 && d <= 5 ? 'Recommended' : undefined} />)}
          {step === 4 && (
            <View style={{ gap: 12 }}>
              {[
                { l: 'Age', v: age, set: setAge, u: 'years' },
                { l: 'Height', v: height, set: setHeight, u: 'cm' },
              ].map((f) => (
                <Field
                  key={f.l}
                  label={f.l}
                  value={f.v}
                  onChangeText={(x: string) => f.set(x.replace(/[^0-9]/g, '').slice(0, 3))}
                  keyboardType="number-pad"
                  right={<Text style={s.optionRight}>{f.u}</Text>}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <View style={s.footer}>
        <Pressable onPress={next} disabled={!valid} style={[s.btn, !valid && { opacity: 0.4 }]}>
          <Text style={s.btnText}>Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 56 },
  track: { flex: 1, flexDirection: 'row', height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  fill: { height: '100%' },
  body: { padding: 20, paddingTop: 36, gap: 12 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  sub: { color: colors.gray, fontSize: 15, textAlign: 'center', marginBottom: 16 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 58, borderRadius: 14, paddingHorizontal: 18,
    backgroundColor: colors.charcoal2, borderWidth: 1, borderColor: 'transparent',
  },
  genderRow: { flexDirection: 'row', gap: 0, marginTop: 8, marginHorizontal: -20 },
  genderItem: { flex: 1, alignItems: 'center', gap: 10 },
  genderImg: { width: '100%', height: 520 },
  genderLabel: { color: '#fff', fontSize: 17, fontWeight: '700' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245,244,240,0.07)', alignItems: 'center', justifyContent: 'center' },
  // Assumes colors.green is a 6-digit hex; "1F" adds ~12% alpha for the tint
  iconWrapOn: { backgroundColor: `${colors.green}33` },
  optionOn: { borderColor: colors.green, backgroundColor: `${colors.green}1F` },
  optionText: { flex: 1, color: '#fff', fontSize: 16 },
  optionRight: { color: colors.gray, fontSize: 13 },
  optionTag: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  footer: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  btn: { alignSelf: 'stretch', height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  btnText: { color: '#000', fontSize: 16, fontWeight: '700' },

  // weight step
  weightBody: { flex: 1, padding: 20, paddingTop: 36 },
  segment: {
    flexDirection: 'row', marginTop: 48, padding: 3, borderRadius: 30, backgroundColor: colors.charcoal2,
    borderWidth: 1, borderColor: colors.line,
  },
  segItem: { flex: 1, height: 48, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  segItemOn: { backgroundColor: '#000', borderColor: colors.green },
  segText: { color: colors.gray, fontSize: 15, fontWeight: '600' },
  display: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 48,
    height: 90, borderRadius: 14, backgroundColor: colors.charcoal2,
  },
  displayNum: { color: '#fff', fontSize: 44, fontWeight: '600', lineHeight: 90 },
  displayUnit: { color: colors.goldLight, fontSize: 22, fontWeight: '700' },
  wheels: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  comma: { color: colors.gray, fontSize: 28, marginHorizontal: 4 },
  wheelUnit: { color: colors.goldLight, fontSize: 22, fontWeight: '700', marginLeft: 12 },
  wheelLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.gold, opacity: 0.7, zIndex: 1 },
  wheelItem: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  wheelText: { color: colors.grayDim, fontSize: 32, fontWeight: '600' },
  wheelTextOn: { color: '#fff' },
});
