import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, cardShadow } from '../theme/light';

const MUSC = [
  { title: 'Membership', rows: [['1 Month', '90 DT'], ['2 Months', '160 DT'], ['3 Months', '180 DT', '225 DT'], ['6 Months', '340 DT', '420 DT'], ['12 Months', '700 DT']] },
  { title: 'Private Coaching', rows: [['1 Session', '30 DT'], ['8 Sessions', '200 DT'], ['16 Sessions', '320 DT']], note: 'Drop-in floor session — 10 DT' },
];
const PILATES = [
  { title: 'Reformer — Essentiel', rows: [['8 sessions · 30 days', '260 DT'], ['12 sessions · 45 days', '360 DT'], ['24 sessions · 90 days', '550 DT'], ['48 sessions · 180 days', '1050 DT']] },
  { title: 'Reformer + Privé — Premium', rows: [['5R + 3P · 30 days', '290 DT'], ['7R + 5P · 45 days', '420 DT'], ['16R + 8P · 90 days', '750 DT'], ['38R + 10P · 180 days', '1300 DT']] },
  { title: 'Pilates + Musculation — Intégral', rows: [['1 Month · 8 R', '320 DT'], ['3 Months · 24 R', '700 DT'], ['6 Months · 48 R', '1350 DT'], ['12 Months · 100 R', '2650 DT']] },
  { title: 'Private Sessions', rows: [['Reformer', '35 DT'], ['Private (any machine)', '45 DT'], ['8 Private sessions', '340 DT']], note: 'R = Reformer   P = Privé (Cadillac, Wunda Chair, Barrel, Tower)' },
];

export default function PlansScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'musc' | 'pilates'>('musc');
  const blocks = tab === 'musc' ? MUSC : PILATES;

  return (
    <View style={{ gap: 16 }}>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'musc' && s.tabActive]} onPress={() => setTab('musc')}>
          <Text style={[s.tabText, tab === 'musc' && s.tabTextActive]}>Musculation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'pilates' && s.tabActive]} onPress={() => setTab('pilates')}>
          <Text style={[s.tabText, tab === 'pilates' && s.tabTextActive]}>Pilates</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12 }}>
        {blocks.map((b) => (
          <View key={b.title} style={s.card}>
            <Text style={s.cardTitle}>{b.title}</Text>
            {b.rows.map((r, i) => (
              <View key={i} style={s.row}>
                <Text style={s.rowLabel}>{r[0]}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {r[2] && <Text style={s.strike}>{r[2]}</Text>}
                  <Text style={s.rowPrice}>{r[1]}</Text>
                </View>
              </View>
            ))}
            {b.note && <Text style={s.note}>{b.note}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  back: { color: colors.gray, fontSize: 13 },
  title: { color: colors.white, fontSize: 20, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 8, paddingVertical: 11, marginTop: 30},
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  tabActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabText: { color: colors.gray, fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#ffffff', ...cardShadow, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, gap: 6 },
  cardTitle: { color: colors.goldLight, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(22,22,19,0.07)' },
  rowLabel: { color: colors.gray, fontSize: 12.5 },
  rowPrice: { color: colors.white, fontWeight: '700', fontSize: 12.5 },
  strike: { color: colors.grayDim, fontSize: 11, textDecorationLine: 'line-through' },
  note: { color: colors.grayDim, fontSize: 10.5, marginTop: 6 },
});
