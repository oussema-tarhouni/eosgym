import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { dashboardApi } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import { colors, cardShadow } from '../theme/dark';

const LEVEL_RANK: Record<string, number> = { initiation: 1, debutant: 2, intermediaire: 3, avancee: 4, expert: 5 };
const levelKey = (l?: string) => (l || '').toLowerCase().trim();

// Class times are stored/typed as plain wall-clock values but tagged UTC ("Z") by the DB driver.
// Reading via UTC getters (instead of toLocaleTimeString, which applies the device's timezone)
// keeps the displayed time identical to what was entered, on any device.
function fmtHM(d: Date): string {
  const h = d.getUTCHours(); const m = d.getUTCMinutes();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')}`;
}
function fmtAmPm(d: Date): string { return d.getUTCHours() >= 12 ? 'PM' : 'AM'; }
function fmtWeekday(d: Date): string { return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }); }

const C = colors;

type ClassItem = {
  id: string; name: string; trainer: string; location: string;
  date: Date; spotsLeft: number; booked: boolean; level: string; category: string;
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CLASS_CATEGORIES = [
  'Pilates', 'Dance Orientale', 'Zumba', 'Dance Tunisienne', 'Body Attack',
  'Body Combat', 'Body Balance', 'Step', 'Lia', 'Yoga', 'Cardio Mix', 'CAF',
  'Abdo', 'Circuit Training', 'Zumba Kids', 'Cross Fit Kids', 'EMOM',
];

function getWeekDays(ref: Date): { date: Date; disabled: boolean }[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return { date: d, disabled: d < today };
  });
}

function getMonthGrid(ref: Date): (Date | null)[] {
  const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const leading = (first.getDay() + 6) % 7; // Monday-start
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(ref.getFullYear(), ref.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function ClassCard({ children, style, past }: { children: React.ReactNode; style?: any; past?: boolean }) {
  return <View style={[styles.card, past && styles.cardPast, style]}>{children}</View>;
}

export default function ScheduleScreen({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const userRank = LEVEL_RANK[levelKey(user?.level)] || 0;
  const [selected, setSelected] = useState<Date>(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0); return t;
  });
  const days = useMemo(() => getWeekDays(selected), [selected]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calMonth, setCalMonth] = useState<Date>(() => new Date());
  const monthGrid = useMemo(() => getMonthGrid(calMonth), [calMonth]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [pending, setPending] = useState<ClassItem | null>(null);
  const [category, setCategory] = useState<string>('all');

  const load = useCallback(async (day: Date) => {
    setLoading(true);
    setError('');
    try {
      const start = new Date(day); start.setHours(0, 0, 0, 0);
      const end = new Date(day); end.setHours(23, 59, 59, 999);
      const { data } = await dashboardApi.listClasses(start.toISOString(), end.toISOString());
      const mapped: ClassItem[] = (data || []).map((c: any) => ({
        id: String(c.id),
        name: c.name ?? c.class_name,
        trainer: c.trainer_name ?? '',
        location: c.location ?? '',
        date: new Date(c.starts_at),
        spotsLeft: c.spots_left ?? 0,
        booked: !!(c.booked ?? c.is_booked),
        level: c.level ?? '',
        category: c.category ?? '',
      }));
      setClasses(mapped);
    } catch (err) {
      console.log('SCHEDULE LOAD ERROR:', err);
      setError('Could not load classes. Pull to refresh to try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(selected); }, [selected, load]);

  const filteredClasses = useMemo(
    () => (category === 'all' ? classes : classes.filter(c => c.category === category)),
    [classes, category]
  );

  const book = async (id: string) => {
    setBookingId(id);
    try {
      await dashboardApi.bookClass(id);
      await load(selected);
    } catch (err: any) {
      console.log('BOOK ERROR:', err);
      Alert.alert('Booking failed', err?.response?.data?.error || 'Please try again.');
    } finally {
      setBookingId(null);
      setPending(null);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.rangeBtn} onPress={() => { setCalMonth(selected); setCalendarOpen(true); }}>
          <Feather name="calendar" size={13} color={C.goldLight} />
          <Text style={styles.rangeBtnText}>Calendar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
        {days.map(({ date, disabled }) => {
          const isSelected = date.toDateString() === selected.toDateString();
          return (
            <TouchableOpacity
              key={date.toISOString()}
              disabled={disabled}
              onPress={() => setSelected(date)}
              style={[
                styles.dayPill,
                isSelected && styles.dayPillSelected,
                disabled && styles.dayPillDisabled,
              ]}
            >
              <Text style={[styles.dName, isSelected && styles.dTextSelected]}>
                {DAY_NAMES[(date.getDay() + 6) % 7]}
              </Text>
              <Text style={[styles.dNum, isSelected && styles.dTextSelected]}>{date.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {['all', ...CLASS_CATEGORIES].map(cat => {
          const isSelected = cat === category;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {cat === 'all' ? 'All' : cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={C.gold} style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : (
        <ScrollView style={{ marginTop: 16 }}>
          {filteredClasses.length === 0 && <Text style={styles.empty}>No classes match this filter.</Text>}
          {filteredClasses.map(c => {
            const isPast = c.date.getTime() < Date.now();
            const low = c.spotsLeft <= 3;
            const full = c.spotsLeft <= 0;
            const classRank = LEVEL_RANK[levelKey(c.level)] || 0;
            const locked = classRank > userRank;
            const disabled = isPast || full || c.booked || bookingId === c.id || locked;
            const label = c.booked ? 'Booked ✓' : isPast ? 'Ended' : bookingId === c.id ? '...' : locked ? 'Locked' : 'Book';

            return (
              <ClassCard key={c.id} past={isPast} style={{ marginBottom: 12 }}>
                <View style={styles.cardTop}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.t1}>{fmtHM(c.date)}</Text>
                    <Text style={styles.tMeridiem}>{fmtAmPm(c.date)}</Text>
                    <Text style={styles.t2}>{fmtWeekday(c.date)}</Text>
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.cname} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.cmeta} numberOfLines={1}>{c.trainer} · {c.location}</Text>
                  </View>

                  {!!c.category && (
                    <View style={styles.catBadge}>
                      <Text style={styles.catBadgeText} numberOfLines={1}>{c.category}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <View style={[styles.spotsBadge, low ? styles.spotsLow : styles.spotsOk]}>
                    <Text style={[styles.spotsText, { color: low ? C.goldLight : C.greenLight }]}>
                      {full ? 'Full' : `${c.spotsLeft} spots left`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={disabled}
                    onPress={() => setPending(c)}
                    style={[
                      styles.bookBtn,
                      c.booked && styles.bookBtnBooked,
                      disabled && !c.booked && styles.bookBtnDisabled,
                    ]}
                  >
                    <Text style={[styles.bookText, c.booked && { color: C.greenLight }]}>{label}</Text>
                  </TouchableOpacity>
                </View>

                {!!c.level && (
                  <View style={styles.levelRow}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>{c.level.toUpperCase()}</Text>
                    </View>
                    {locked && <Text style={styles.lockedText}>Locked for your level</Text>}
                  </View>
                )}
              </ClassCard>
            );
          })}
        </ScrollView>
      )}

      <Modal visible={!!pending} transparent animationType="fade" onRequestClose={() => setPending(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm your booking</Text>
            <Text style={styles.modalSub}>You're about to reserve a spot in this class.</Text>

            {pending && (
              <View style={styles.modalCard}>
                <Text style={styles.modalClassName}>{pending.name}</Text>
                <Text style={styles.modalClassMeta}>
                  {fmtHM(pending.date)} {fmtAmPm(pending.date)}
                  {' · '}{pending.trainer}{pending.location ? ` · ${pending.location}` : ''}
                </Text>
                <View style={[styles.spotsBadge, styles.spotsOk, { alignSelf: 'flex-start', marginTop: 10 }]}>
                  <Text style={[styles.spotsText, { color: C.greenLight }]}>
                    {pending.spotsLeft} spots left
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setPending(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                disabled={!pending || bookingId === pending.id}
                onPress={() => pending && book(pending.id)}
              >
                <Text style={styles.modalConfirmText}>
                  {pending && bookingId === pending.id ? 'Booking…' : 'Confirm Spot'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCalendarOpen(false)}>
          <View style={styles.calBox}>
            <View style={styles.calHeader}>
              <TouchableOpacity style={styles.calCloseBtn} onPress={() => setCalendarOpen(false)}>
                <Feather name="x" size={18} color={C.white} />
              </TouchableOpacity>
              <Text style={styles.calMonthText}>
                {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <View style={styles.calNavGroup}>
                <TouchableOpacity onPress={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}>
                  <Feather name="chevron-left" size={24} color={C.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
                  <Feather name="chevron-right" size={24} color={C.white} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.calWeekRow}>
              {DAY_NAMES.map(d => <Text key={d} style={styles.calWeekLabel}>{d[0]}</Text>)}
            </View>

            <View style={styles.calGrid}>
              {monthGrid.map((d, i) => {
                if (!d) return <View key={i} style={styles.calCell} />;
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const disabled = d < today;
                const isSelected = d.toDateString() === selected.toDateString();
                return (
                  <TouchableOpacity
                    key={i}
                    disabled={disabled}
                    style={[styles.calCell, isSelected && styles.calCellSelected]}
                    onPress={() => { setSelected(d); setCalendarOpen(false); }}
                  >
                    <Text style={[styles.calCellText, disabled && styles.calCellTextDisabled, isSelected && styles.calCellTextSelected]}>
                      {d.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const NOTCH = 12;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginBottom: 4 },
  rangeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: colors.charcoal2, ...cardShadow, borderWidth: 1, borderColor: 'rgba(201,162,39,0.35)',
  },
  rangeBtnText: { color: C.goldLight, fontSize: 11.5, fontWeight: '700' },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: C.white, fontSize: 12, marginLeft: 2 },
  sectionTitle: { color: C.gray, fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  pillRow: { flexGrow: 0, marginTop: 12 },
  categoryRow: { flexGrow: 0, marginTop: 20, marginRight: 20 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 18, marginRight: 8, borderRadius: 10,
    backgroundColor: C.charcoal, borderWidth: 1, borderColor: C.line,
  },
  chipSelected: { backgroundColor: 'rgba(106,154,68,0.15)', borderColor: C.green },
  chipText: { fontSize: 13, fontWeight: '700', color: C.gray },
  chipTextSelected: { color: C.greenLight },
  catBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(201,162,39,0.15)',
    borderWidth: 1, borderColor: 'rgba(201,162,39,0.35)', borderRadius: 20,
    paddingVertical: 4, paddingHorizontal: 10, marginLeft: 8, flexShrink: 0,
  },
  catBadgeText: { color: C.goldLight, fontSize: 10, fontWeight: '700' },
  dayPill: {
    width: 56, paddingVertical: 11, marginRight: 8, alignItems: 'center',
    backgroundColor: C.charcoal, borderWidth: 1, borderColor: C.line,
    borderTopLeftRadius: NOTCH, borderBottomRightRadius: NOTCH,
    borderTopRightRadius: 6, borderBottomLeftRadius: 6,
  },
  dayPillSelected: { backgroundColor: C.gold, borderColor: C.gold },
  dayPillDisabled: { opacity: 0.35 },
  dName: { fontSize: 10, fontWeight: '700', color: C.gray, textTransform: 'uppercase' },
  dNum: { fontSize: 18, color: C.white, marginTop: 2 },
  dTextSelected: { color: '#100c02' },

  empty: { color: C.gray, textAlign: 'center', marginTop: 20 },

  card: {
    backgroundColor: colors.charcoal2, ...cardShadow, borderWidth: 1, borderColor: C.line,
    borderRadius: 18,
    paddingVertical: 16, paddingHorizontal: 18,
  },
  cardPast: { opacity: 0.4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  timeBlock: { width: 50, alignItems: 'flex-start' },
  t1: { color: C.white, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  tMeridiem: { color: C.white, fontSize: 12, fontWeight: '600', marginTop: -2 },
  t2: { color: C.gray, fontSize: 11, marginTop: 4 },

  info: { flex: 1, alignItems: 'flex-start', gap: 4 },
  cname: { color: C.white, fontSize: 15, fontWeight: '600' },
  cmeta: { color: C.gray, fontSize: 12 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  spotsBadge: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  spotsOk: { backgroundColor: 'rgba(106,154,68,0.15)', borderWidth: 1, borderColor: 'rgba(106,154,68,0.35)' },
  spotsLow: { backgroundColor: 'rgba(201,162,39,0.15)', borderWidth: 1, borderColor: 'rgba(201,162,39,0.35)' },
  spotsText: { fontSize: 11, fontWeight: '700' },

  bookBtn: {
    backgroundColor: C.gold, paddingVertical: 9, paddingHorizontal: 18,
    borderRadius: 10,
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnBooked: { backgroundColor: C.charcoal2, borderWidth: 1, borderColor: 'rgba(106,154,68,0.4)' },
  bookText: { fontSize: 12.5, fontWeight: '700', color: '#0a0a0a' },

  levelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line,
  },
  levelBadge: {
    backgroundColor: 'rgba(90,140,220,0.18)', borderWidth: 1, borderColor: 'rgba(90,140,220,0.45)',
    borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10,
  },
  levelBadgeText: { color: '#7fa8f0', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  lockedText: { color: C.goldLight, fontSize: 11.5, fontWeight: '600' },

  calBox: {
    width: '100%', maxWidth: 460, backgroundColor: colors.charcoal2, ...cardShadow,
    borderRadius: 22, borderWidth: 1, borderColor: C.line, padding: 28,
  },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  calMonthText: { color: C.white, fontSize: 19, fontWeight: '700' },
  calCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.charcoal2, borderWidth: 1, borderColor: C.line,
  },
  calNavGroup: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  calWeekRow: { flexDirection: 'row', marginBottom: 12 },
  calWeekLabel: { flex: 1, textAlign: 'center', color: C.gray, fontSize: 13, fontWeight: '700' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  calCellSelected: { backgroundColor: C.gold, borderRadius: 999 },
  calCellText: { color: C.white, fontSize: 16.5 },
  calCellTextDisabled: { color: C.grayDim },
  calCellTextSelected: { color: '#100c02', fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalBox: {
    width: '100%', maxWidth: 380, backgroundColor: colors.charcoal2, ...cardShadow,
    borderRadius: 18, borderWidth: 1, borderColor: C.line,
    padding: 22,
  },
  modalTitle: { color: C.white, fontSize: 18, fontWeight: '700' },
  modalSub: { color: C.gray, fontSize: 12.5, marginTop: 6, marginBottom: 18 },
  modalCard: {
    backgroundColor: C.charcoal2, borderRadius: 12, borderWidth: 1, borderColor: C.line,
    padding: 14, marginBottom: 22,
  },
  modalClassName: { color: C.white, fontSize: 15, fontWeight: '700' },
  modalClassMeta: { color: C.gray, fontSize: 12, marginTop: 4 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: C.line,
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  modalCancelText: { color: C.white, fontSize: 13.5, fontWeight: '600' },
  modalConfirmBtn: {
    flex: 1, backgroundColor: C.gold, borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  modalConfirmText: { color: '#100c02', fontSize: 13.5, fontWeight: '700' },
});
