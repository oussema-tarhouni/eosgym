import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api/auth';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Tier { key: number; planId: number | null; label: string; price: number; }
interface Group { title: string; tiers: Tier[]; note?: string; }
interface CategoryTab { key: string; label: string; groups: Group[]; }

// TODO: replace placeholder ids (1xx/2xx) with the real plan IDs from your `plans` table.
const CATEGORIES: CategoryTab[] = [
  { key: 'Strength', label: 'Musculation', groups: [
    { title: 'MEMBERSHIP', tiers: [
      { key: 101, planId: null, label: '1 Month', price: 90 },
      { key: 102, planId: null, label: '2 Months', price: 160 },
      { key: 103, planId: null, label: '3 Months', price: 180 },
      { key: 104, planId: null, label: '6 Months', price: 340 },
      { key: 105, planId: null, label: '12 Months', price: 700 },
    ]},
    { title: 'PRIVATE COACHING', tiers: [
      { key: 106, planId: null, label: '1 Session', price: 30 },
      { key: 107, planId: null, label: '8 Sessions', price: 200 },
      { key: 108, planId: null, label: '16 Sessions', price: 320 },
      { key: 109, planId: null, label: 'Drop-in floor session', price: 10 },
    ]},
  ]},
  { key: 'Pilates', label: 'Pilates', groups: [
    { title: 'REFORMER — ESSENTIEL', tiers: [
      { key: 201, planId: null, label: '8 sessions · 30 days', price: 260 },
      { key: 202, planId: null, label: '12 sessions · 45 days', price: 360 },
      { key: 203, planId: null, label: '24 sessions · 90 days', price: 550 },
      { key: 204, planId: null, label: '48 sessions · 180 days', price: 1050 },
    ]},
    { title: 'REFORMER + PRIVÉ — PREMIUM', tiers: [
      { key: 205, planId: null, label: '5R + 3P · 30 days', price: 290 },
      { key: 206, planId: null, label: '7R + 5P · 45 days', price: 420 },
      { key: 207, planId: null, label: '16R + 8P · 90 days', price: 750 },
      { key: 208, planId: null, label: '38R + 10P · 180 days', price: 1300 },
    ]},
    { title: 'PILATES + MUSCULATION — INTÉGRAL', tiers: [
      { key: 209, planId: null, label: '1 Month · 8 R', price: 320 },
      { key: 210, planId: null, label: '3 Months · 24 R', price: 700 },
      { key: 211, planId: null, label: '6 Months · 48 R', price: 1350 },
      { key: 212, planId: null, label: '12 Months · 100 R', price: 2650 },
    ]},
    { title: 'PRIVATE SESSIONS', note: 'R = Reformer  P = Privé (Cadillac, Wunda Chair, Barrel, Tower)', tiers: [
      { key: 213, planId: null, label: 'Reformer', price: 35 },
      { key: 214, planId: null, label: 'Private (any machine)', price: 45 },
      { key: 215, planId: null, label: '8 Private sessions', price: 340 },
    ]},
  ]},
];

type Nav = NativeStackNavigationProp<RootStackParamList, 'SelectPlan'>;

export default function PlanScreen() {
  const navigation = useNavigation<Nav>();
  const [categories, setCategories] = useState(CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>(CATEGORIES[0]);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('signup_category');
      const match = CATEGORIES.find((c) => c.key === saved);
      if (match) setActiveCategory(match);

      try {
        const realPlans = await authApi.getPlans();
        const next = CATEGORIES.map((cat) => ({
          ...cat,
          groups: cat.groups.map((g) => ({
            ...g,
            tiers: g.tiers.map((t) => {
              const found = realPlans.find((p: any) => Number(p.price) === t.price && (!p.category || p.category === cat.key));
              return { ...t, planId: found ? found.id : null };
            }),
          })),
        }));
        setCategories(next);
        const matchNext = next.find((c) => c.key === (match?.key || CATEGORIES[0].key));
        if (matchNext) setActiveCategory(matchNext);
      } catch {
        setError('Could not load plans, please try again');
      }
    })();
  }, []);

  const setCategory = (cat: CategoryTab) => {
    setActiveCategory(cat);
    setSelectedKey(null);
    setSelectedPlanId(null);
    setError('');
  };

  const select = (t: Tier) => {
    if (!t.planId) { setError('This plan is not available right now'); return; }
    setSelectedKey(t.key);
    setSelectedPlanId(t.planId);
    setError('');
  };

  const confirm = async () => {
    if (!selectedPlanId) { setError('Please select a plan'); return; }
    setLoading(true);
    try {
      await authApi.setSubscription(activeCategory.key, selectedPlanId);
      await AsyncStorage.removeItem('signup_category');
      navigation.navigate('Pending');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.screen}>
      <View style={s.card}>
        <Text style={s.h1}>Choose your plan</Text>
        <Text style={s.sub}>Membership is activated once the admin approves your account</Text>

        <View style={s.tabs}>
          {categories.map((c) => (
            <TouchableOpacity key={c.key} style={[s.tab, activeCategory.key === c.key && s.tabActive]} onPress={() => setCategory(c)}>
              <Text style={[s.tabText, activeCategory.key === c.key && s.tabTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeCategory.groups.map((g) => (
          <View key={g.title} style={s.group}>
            <Text style={s.groupTitle}>{g.title}</Text>
            {g.tiers.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[s.row, selectedKey === t.key && s.rowActive, !t.planId && s.rowDisabled]}
                onPress={() => select(t)}
              >
                <Text style={[s.rowLabel, selectedKey === t.key && s.rowLabelActive]}>{t.label}</Text>
                <Text style={[s.rowPrice, selectedKey === t.key && s.rowPriceActive]}>{t.price} DT</Text>
              </TouchableOpacity>
            ))}
            {!!g.note && <Text style={s.groupNote}>{g.note}</Text>}
          </View>
        ))}

        {!!error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity style={[s.submit, loading && { opacity: 0.6 }]} onPress={confirm} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.black} /> : <Text style={s.submitText}>Confirm & Submit</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  card: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: 6 },
  h1: { fontSize: 24, color: colors.white, fontWeight: '400' },
  sub: { fontSize: 13.5, color: colors.gray, marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.charcoal },
  tabActive: { backgroundColor: colors.goldLight, borderColor: colors.goldLight },
  tabText: { color: colors.white, fontWeight: '600', fontSize: 13.5 },
  tabTextActive: { color: '#1a1a1a' },
  group: { borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.charcoal, borderRadius: 12, padding: 16, marginBottom: 12 },
  groupTitle: { color: colors.goldLight, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  groupNote: { color: colors.gray, fontSize: 11.5, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowActive: { backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 6 },
  rowDisabled: { opacity: 0.4 },
  rowLabel: { color: colors.gray, fontSize: 13.5 },
  rowLabelActive: { color: colors.white },
  rowPrice: { color: colors.white, fontWeight: '700', fontSize: 14 },
  rowPriceActive: { color: colors.goldLight },
  error: { color: '#e0355a', fontSize: 11.5, marginVertical: 8 },
  submit: { backgroundColor: colors.gold, borderRadius: 13, padding: 13, alignItems: 'center', marginTop: 8 },
  submitText: { color: colors.black, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
});
