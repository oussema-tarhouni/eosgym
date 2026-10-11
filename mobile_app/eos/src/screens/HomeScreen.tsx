import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, ActivityIndicator, RefreshControl, Image, Linking, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboard';
import { contentApi } from '../api/content';
import { colors } from '../theme/colors';
import BottomNavBar from '../components/BottomNavBar';
import ScheduleScreen from './ScheduleScreen';
import ProgressScreen from './ProgressScreen';
import DietScreen from './DietScreen';
import TrainersScreen from './TrainersScreen';
import PlansScreen from './PlansScreen';
import ProfileScreen from './ProfileScreen';
import BackButton from '../components/BackButton';

const LEVEL_RANK: Record<string, number> = { initiation: 1, debutant: 2, intermediaire: 3, avancee: 4, expert: 5 };
const levelKey = (l?: string) => (l || '').toLowerCase().trim();

const QUICK_ACTIONS = [
  { icon: 'calendar', label: 'Book Class', color: colors.goldLight, page: 'schedule' },
  { icon: 'heart', label: 'Diet', color: '#8fc25f', page: 'diet' },
  { icon: 'trending-up', label: 'Progress', color: colors.goldLight, page: 'progress' },
  { icon: 'users', label: 'Trainers', color: '#8fc25f', page: 'trainers' },
];

const EYEBROW: Record<string, string> = {
  home: 'Good morning', schedule: 'Class schedule', progress: 'Home', diet: 'Home',
  trainers: 'Home', plans: 'Membership', profile: 'Account',
};
const TITLE: Record<string, string> = {
  home: '', schedule: 'This Week', progress: 'Weight Progress', diet: 'Diet & Macros',
  trainers: 'Our Trainers', plans: 'Choose Your Plan', profile: 'Profile & Settings',
};

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

type Poster = { id: number; username: string; location: string | null; text: string; image_url: string | null; created_at: string };
type Notif = { id: number; title: string; description: string | null; image_url: string | null; link: string | null; created_at: string };

type DashboardData = {
  membership: {
    status: string;
    auto_renew: number;
    classes_used_this_month: number;
    started_at: string;
    renews_at: string;
    plan_name: string;
    classes_per_month: number;
  } | null;
  trainers: { id: number; name: string; specialty: string }[];
  todays_classes: { id: number; name?: string; class_name?: string; starts_at?: string; ends_at?: string; trainer_name?: string; location?: string; spots_left?: number; level?: string }[];
  week: { workouts: number; calories_burned: string; day_streak: number };
};

export default function HomeScreen() {
  const { user } = useAuth();
  const userRank = LEVEL_RANK[levelKey((user as any)?.level)] || 0;
  const [page, setPage] = useState('home');
  const [showNotifs, setShowNotifs] = useState(false);
  const notifAnim = useRef(new Animated.Value(0)).current;
  const [data, setData] = useState<DashboardData | null>(null);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [posterRatios, setPosterRatios] = useState<Record<number, number>>({});
  const fade = useRef(new Animated.Value(1)).current;

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [{ data: res }, postersRes, notifsRes] = await Promise.all([
        dashboardApi.getHome(),
        contentApi.listPosters().catch(() => ({ data: [] })),
        contentApi.listNotifications().catch(() => ({ data: [] })),
      ]);
      setData(res);
      setPosters(postersRes.data);
      setNotifs(notifsRes.data);
    } catch (err) {
      console.log('DASHBOARD LOAD ERROR:', err);
      setError('Could not load your dashboard. Pull to refresh to try again.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [page]);

  const openNotifs = () => {
    setShowNotifs((v) => {
      const next = !v;
      if (next) {
        notifAnim.setValue(0);
        Animated.timing(notifAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      }
      return next;
    });
  };

  const bookClass = async (id: string) => {
    try {
      await dashboardApi.bookClass(id);
      load(true);
    } catch (err: any) {
      console.log('BOOK ERROR:', err);
      Alert.alert('Booking failed', err?.response?.data?.error || 'Please try again.');
    }
  };

  const displayName = page === 'home' ? (user?.name || '') : TITLE[page];
  const m = data?.membership;
  const pct = m && m.classes_per_month ? Math.min(100, (m.classes_used_this_month / m.classes_per_month) * 100) : 0;

  if (loading) {
    return (
      <View style={[s.page, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {showNotifs && (
        <Pressable style={s.blurBackdrop} onPress={() => setShowNotifs(false)}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: notifAnim }]}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View
            style={[
              s.notifPanel,
              {
                opacity: notifAnim,
                transform: [
                  { scale: notifAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
                  { translateY: notifAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) },
                ],
              },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Text style={s.notifTitle}>Notifications</Text>
              {notifs.length === 0 && <Text style={s.notifText}>No notifications yet.</Text>}
              {notifs.map((n) => (
                <View key={n.id} style={s.notifRow}>
                  <View style={s.notifDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.notifTitleSmall}>{n.title}</Text>
                    {!!n.description && <Text style={s.notifText}>{n.description}</Text>}
                  </View>
                </View>
              ))}
            </Pressable>
          </Animated.View>
        </Pressable>
      )}

      <ScrollView
        style={s.page}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
      >
        <View style={s.topbar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {page !== 'home' && <BackButton onPress={() => setPage('home')} />}
            <View>
              <Text style={s.eyebrow}>{EYEBROW[page]}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.name}>{displayName}</Text>
                {page === 'home' && !!(user as any)?.level && (
                  <View style={s.levelBadge}><Text style={s.levelBadgeText}>{(user as any).level.toUpperCase()}</Text></View>
                )}
              </View>
            </View>
          </View>
          <View style={s.bellWrap}>
            <TouchableOpacity style={s.bell} onPress={openNotifs}>
              <Feather name="bell" size={18} color={colors.white} />
              {notifs.length > 0 && <View style={s.dot} />}
            </TouchableOpacity>

          </View>
        </View>

        {!!error && <Text style={s.errorBanner}>{error}</Text>}

        <Animated.View style={{
          opacity: fade,
          transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          gap: 20,
        }}>
        {page === 'home' ? (
          <>
            {m && (
              <View style={s.membershipCard}>
                <View style={s.mcTop}>
                  <Text style={s.mcTier}>{m.plan_name.toUpperCase()} MEMBERSHIP</Text>
                  <Text style={s.mcSub}>Member since {new Date(m.started_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {m.auto_renew ? 'Auto-renew enabled' : 'Auto-renew off'}</Text>
                </View>
                <View style={s.mcBottom}>
                  <View style={{ flex: 1 }}>
                    <View style={s.mcProgressLabel}>
                      <Text style={s.mcProgressLabelText}>Classes used this month</Text>
                      <Text style={s.mcProgressLabelBold}>{m.classes_used_this_month} / {m.classes_per_month}</Text>
                    </View>
                    <View style={s.progressTrack}><View style={[s.progressFill, { width: `${pct}%` }]} /></View>
                  </View>
                </View>
                <Text style={s.mcRenew}>Renews on <Text style={s.mcRenewBold}>{new Date(m.renews_at).toLocaleDateString()}</Text></Text>
              </View>
            )}

            <View style={s.quickActions}>
              {QUICK_ACTIONS.map((qa) => (
                <TouchableOpacity key={qa.label} style={s.qaItem} onPress={() => setPage(qa.page)}>
                  <View style={s.qaIcon}><Feather name={qa.icon as any} size={18} color={qa.color} /></View>
                  <Text style={s.qaLabel}>{qa.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>TODAY'S CLASSES</Text>
              <TouchableOpacity onPress={() => setPage('schedule')}><Text style={s.sectionLink}>See all</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {(data?.todays_classes || []).map((c) => {
                const locked = (LEVEL_RANK[levelKey(c.level)] || 0) > userRank;
                return (
                <TouchableOpacity key={c.id} style={s.hclassCard} disabled={locked} onPress={() => bookClass(String(c.id))}>
                  <Text style={s.hclassTime}>{c.starts_at ? new Date(c.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
                  <Text style={s.hclassName}>{c.name || c.class_name}</Text>
                  <Text style={s.hclassMeta}>with {c.trainer_name} · {c.location}</Text>
                  {!!c.level && <Text style={[s.hclassMeta, locked && { color: colors.goldLight }]}>{c.level}{locked ? ' · locked' : ''}</Text>}
                  {typeof c.spots_left === 'number' && (
                    <View style={[s.hclassTag, c.spots_left > 0 ? s.tagGreen : s.tagGold]}>
                      <Text style={[s.hclassTagText, { color: c.spots_left > 0 ? '#8fc25f' : colors.goldLight }]}>
                        {c.spots_left > 0 ? `${c.spots_left} spots` : 'Full'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );})}
              {!data?.todays_classes?.length && <Text style={{ color: colors.gray, fontSize: 12 }}>No classes scheduled today.</Text>}
            </ScrollView>

            <View style={s.barbell}><View style={s.barLine} /><View style={[s.plate, s.plateSmall]} /><View style={s.plate} /><View style={s.plate} /><View style={[s.plate, s.plateSmall]} /><View style={s.barLine} /></View>

            {posters.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { marginBottom: 4 }]}>ANNOUNCEMENTS</Text>
                {posters.map((p) => (
                  <View key={p.id} style={s.posterCard}>
                    <View style={s.posterHead}>
                      <View style={s.posterLogo}><Text style={{ color: colors.gold, fontWeight: '700', fontSize: 10 }}>EOS</Text></View>
                      <View>
                        <Text style={s.posterUser}>{p.username} <Feather name="check-circle" size={12} color={colors.gold} /></Text>
                        {!!p.location && (
                          <TouchableOpacity onPress={() => Linking.openURL(p.location!)}>
                            <Text style={s.posterLocation}>{p.location}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <Text style={s.posterText}>{p.text}</Text>
                    {!!p.image_url && (
                      <Image
                        source={{ uri: p.image_url }}
                        style={[s.posterImage, { aspectRatio: posterRatios[p.id] || 1.6 }]}
                        resizeMode="cover"
                        onLoad={(e: any) => {
                          const { width, height } = e.nativeEvent.source || {};
                          if (width && height) setPosterRatios((r) => ({ ...r, [p.id]: width / height }));
                        }}
                      />
                    )}
                  </View>
                ))}
              </>
            )}
          </>
        ) : page === 'schedule' ? (
          <ScheduleScreen onBack={() => setPage('home')} />
        ) : page === 'progress' ? (
          <ProgressScreen onBack={() => setPage('home')} />
        ) : page === 'diet' ? (
          <DietScreen onBack={() => setPage('home')} />
        ) : page === 'trainers' ? (
          <TrainersScreen onBack={() => setPage('home')} />
        ) : page === 'plans' ? (
          <PlansScreen onBack={() => setPage('home')} />
        ) : page === 'profile' ? (
          <ProfileScreen onBack={() => setPage('home')} />
        ) : null}
        </Animated.View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomNavBar active={page} onSelect={setPage} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 20, paddingTop: 56, gap: 20 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 50, elevation: 50 },
  eyebrow: { color: colors.gray, fontSize: 12 },
  name: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 2 },
  levelBadge: { backgroundColor: 'rgba(90,140,220,0.18)', borderWidth: 1, borderColor: 'rgba(90,140,220,0.45)', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10, marginTop: 2 },
  levelBadgeText: { color: '#7fa8f0', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  bellWrap: { position: 'relative', zIndex: 50, elevation: 50 },
  blurBackdrop: { ...StyleSheet.absoluteFillObject, zIndex: 100, elevation: 100 },
  bell: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold },
  errorBanner: { color: '#e5484d', fontSize: 12.5 },

  notifPanel: {
    position: 'absolute', top: 102, right: 20, width: 260,
    backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line,
    borderRadius: 16, padding: 14, gap: 10, zIndex: 999, elevation: 20,
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  notifTitle: { color: colors.white, fontWeight: '700', fontSize: 13, marginBottom: 2 },
  notifRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  notifDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold, marginTop: 6 },
  notifTitleSmall: { color: colors.white, fontWeight: '700', fontSize: 12.5 },
  notifText: { flex: 1, color: colors.gray, fontSize: 12, lineHeight: 17 },

  membershipCard: { borderRadius: 20, padding: 22, backgroundColor: colors.charcoal, borderWidth: 1, borderColor: 'rgba(201,162,39,0.25)' },
  mcTop: { flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
  mcTier: { color: colors.goldLight, fontSize: 19, fontWeight: '700', letterSpacing: 0.5, maxWidth: '99%' },
  mcSub: { color: colors.gray, fontSize: 12, marginTop: 4, maxWidth: 210 },
  mcStatus: { alignSelf: 'flex-start', backgroundColor: 'rgba(143,194,95,0.15)', borderWidth: 1, borderColor: 'rgba(143,194,95,0.4)', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, marginTop: 2 },
  mcStatusText: { color: '#8fc25f', fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  mcBottom: { marginTop: 20 },
  mcProgressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  mcProgressLabelText: { color: colors.gray, fontSize: 11.5 },
  mcProgressLabelBold: { color: colors.white, fontWeight: '700', fontSize: 11.5 },
  progressTrack: { height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6, backgroundColor: colors.gold },
  mcRenew: { color: colors.gray, fontSize: 11.5, marginTop: 14 },
  mcRenewBold: { color: colors.white, fontWeight: '700' },

  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  qaItem: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 13 },
  qaIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  qaLabel: { color: colors.white, fontWeight: '700', fontSize: 12 },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.white, fontSize: 15, fontWeight: '600', letterSpacing: 0.4 },
  sectionLink: { color: colors.goldLight, fontSize: 12, fontWeight: '700' },

  hclassCard: { backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, width: 220, marginRight: 12, gap: 4 },
  hclassTime: { color: colors.goldLight, fontSize: 11, fontWeight: '700' },
  hclassName: { color: colors.white, fontSize: 15, fontWeight: '600', marginTop: 4 },
  hclassMeta: { color: colors.gray, fontSize: 11 },
  hclassTag: { alignSelf: 'flex-start', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, marginTop: 8 },
  tagGreen: { backgroundColor: 'rgba(143,194,95,0.15)', borderWidth: 1, borderColor: 'rgba(143,194,95,0.35)' },
  tagGold: { backgroundColor: 'rgba(201,162,39,0.15)', borderWidth: 1, borderColor: 'rgba(201,162,39,0.35)' },
  hclassTagText: { fontSize: 10, fontWeight: '700' },

  widget: { backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 18 },
  widgetTitle: { color: colors.white, fontSize: 14.5, fontWeight: '600', marginBottom: 12 },
  trainerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  trainerRowBorder: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  trainerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  trainerAvatarText: { color: colors.goldLight, fontWeight: '700', fontSize: 12.5 },
  trainerName: { color: colors.white, fontSize: 12.5, fontWeight: '700' },
  trainerRole: { color: colors.gray, fontSize: 11 },

  barbell: { flexDirection: 'row', alignItems: 'center', height: 14 },
  barLine: { flex: 1, height: 3, backgroundColor: colors.gold },
  plate: { width: 5, height: 14, backgroundColor: colors.gold, borderRadius: 2, marginHorizontal: 3 },
  plateSmall: { height: 9, opacity: 0.7 },

  posterCard: { backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16, gap: 8 },
  posterHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  posterLogo: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#100c02', alignItems: 'center', justifyContent: 'center' },
  posterUser: { color: colors.white, fontSize: 13, fontWeight: '600' },
  posterLocation: { color: colors.grayDim, fontSize: 11, marginTop: 1 },
  posterImage: { width: '100%', height: undefined, borderRadius: 12, marginTop: 2 },
  posterText: { color: colors.white, fontSize: 13, lineHeight: 19 },
});
