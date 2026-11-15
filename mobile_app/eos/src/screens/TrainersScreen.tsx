import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, ScrollView, Linking } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { dashboardApi } from '../api/dashboard';
import { colors, cardShadow } from '../theme/dark';

type Trainer = { id: number; name: string; specialty: string; bio?: string };

const WHATSAPP_NUMBER = '21654088881';

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function openWhatsapp(name: string) {
  const message = `I want to connect the trainer Mr/Mrs ${name}`;
  Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
}

export default function TrainersScreen({ onBack }: { onBack: () => void }) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const { data } = await dashboardApi.getHome();
      setTrainers(data.trainers || []);
    } catch (err) {
      console.log('TRAINERS LOAD ERROR:', err);
      setError('Could not load trainers. Pull to refresh to try again.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ gap: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />}
    >
      <Text style={s.title}>Our Trainers</Text>

      {!!error && <Text style={s.errorBanner}>{error}</Text>}

      <View style={{ gap: 12, marginTop: 12 }}>
        {trainers.map((t) => (
          <View key={t.id} style={s.card}>
            <View style={s.avatar}><Text style={s.avatarText}>{initials(t.name)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{t.name}</Text>
              <Text style={s.role}>{t.specialty}</Text>
              {!!t.bio && <Text style={s.bio}>{t.bio}</Text>}
            </View>
            <TouchableOpacity style={s.connectBtn} onPress={() => openWhatsapp(t.name)}>
              <FontAwesome5 name="whatsapp" size={15} color="#1a1a1a" />
              <Text style={s.connectText}>Connect</Text>
            </TouchableOpacity>
          </View>
        ))}
        {!trainers.length && <Text style={{ color: colors.gray, fontSize: 12 }}>No trainers found.</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  back: { color: colors.gray, fontSize: 13 },
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 8 },
  errorBanner: { color: '#e5484d', fontSize: 12.5, marginTop: 8 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, backgroundColor: colors.charcoal2, ...cardShadow, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(245,244,240,0.07)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.goldLight, fontWeight: '700', fontSize: 14 },
  name: { color: colors.white, fontSize: 14, fontWeight: '700' },
  role: { color: colors.goldLight, fontSize: 11.5, marginTop: 2 },
  bio: { color: colors.gray, fontSize: 12, marginTop: 6, lineHeight: 17 },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#25D366', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14,
  },
  connectText: { color: '#1a1a1a', fontWeight: '700', fontSize: 12.5 },
});
