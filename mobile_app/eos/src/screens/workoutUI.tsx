import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/dark';
import { Exercise } from './workoutData';
import ExerciseVideo from './ExerciseVideo';

export const Chip = ({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) => (
  <TouchableOpacity style={[ui.chip, on && ui.chipOn]} onPress={onPress}>
    <Text style={[ui.chipText, on && { color: colors.black }]}>{label}</Text>
  </TouchableOpacity>
);

export function ExerciseModal({ ex, onClose }: { ex: Exercise | null; onClose: () => void }) {
  const label = ex ? (ex.part === ex.group ? ex.group : `${ex.group} · ${ex.part}`) : '';
  return (
    <Modal visible={!!ex} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      {ex && (
        <View style={ui.fullBleed}>
          <View style={ui.topRow}>
            <TouchableOpacity style={ui.roundBtn} onPress={onClose}><Feather name="arrow-left" size={18} color={colors.white} /></TouchableOpacity>
            <Text style={ui.topTitle}>{label}</Text>
            <View style={{ width: 42 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
            <ExerciseVideo uri={ex.video} />
            <View style={ui.tiles}>
              {[
                { i: 'bar-chart-2', l: ex.level },
                { i: 'target', l: ex.part },
                { i: 'tool', l: ex.equipment },
              ].map((x) => (
                <View key={x.i} style={ui.tile}>
                  <Feather name={x.i as any} size={20} color={colors.goldLight} />
                  <Text style={ui.tileText} numberOfLines={1}>{x.l}</Text>
                </View>
              ))}
            </View>
            <View style={ui.detailCard}>
              <Text style={ui.dName}>{ex.name}</Text>
              <Text style={ui.sub}>{label} · {ex.equipment}</Text>
              <Text style={ui.descTitle}>How to perform it</Text>
              <Text style={ui.desc}>{ex.how}</Text>
            </View>
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

export const ui = StyleSheet.create({
  segment: { flexDirection: 'row', backgroundColor: colors.charcoal2, borderRadius: 18, padding: 4, borderWidth: 1, borderColor: colors.lineSoft },
  segBtn: { flex: 1, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.goldLight },
  segText: { color: colors.gray, fontSize: 13, fontWeight: '700' },

  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.goldLight, borderColor: colors.goldLight },
  chipText: { color: colors.gray, fontSize: 12.5, fontWeight: '700' },

  card: { backgroundColor: colors.charcoal2, borderRadius: 28, padding: 12, gap: 4, borderWidth: 1, borderColor: colors.lineSoft },
  panel: { backgroundColor: colors.charcoal2, borderRadius: 24, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.lineSoft },
  sub: { color: colors.gray, fontSize: 12, paddingHorizontal: 4 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyTitle: { color: colors.white, fontSize: 16, fontWeight: '800' },
  emptyText: { color: colors.gray, fontSize: 13, textAlign: 'center', lineHeight: 19 },

  fullBleed: { flex: 1, backgroundColor: colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 54 },
  topTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  roundBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#3b3a36', alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, height: 74, borderRadius: 20, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 6 },
  tileText: { color: colors.gray, fontSize: 11, fontWeight: '600' },
  detailCard: { backgroundColor: colors.charcoal2, borderRadius: 32, padding: 22, gap: 4, borderWidth: 1, borderColor: colors.lineSoft },
  dName: { color: colors.white, fontSize: 18, fontWeight: '800' },
  descTitle: { color: colors.white, fontSize: 15, fontWeight: '700', marginTop: 16 },
  descTitle2: { color: colors.white, fontSize: 15, fontWeight: '700' },
  desc: { color: colors.gray, fontSize: 13, lineHeight: 19, marginTop: 4 },

  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.lineSoft },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  primaryBtnOff: { backgroundColor: colors.charcoal2, borderWidth: 1, borderColor: colors.line },
  primaryText: { color: colors.black, fontWeight: '800', fontSize: 14 },
});
