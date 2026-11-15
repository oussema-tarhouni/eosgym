import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, cardShadow } from '../theme/dark';
import { useAuth } from '../context/AuthContext';
import PlansScreen from './PlansScreen';

const MENU = [
  { key: 'editprofile', icon: 'user', label: 'Edit Profile' },
  { key: 'plan', icon: 'shopping-bag', label: 'My Plan' },
  { key: 'payment', icon: 'credit-card', label: 'Payment Methods' },
  { key: 'bookinghistory', icon: 'clock', label: 'Booking History' },
  { key: 'notifications', icon: 'bell', label: 'Notifications' },
  { key: 'help', icon: 'help-circle', label: 'Help & Support' },
] as const;

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ProfileScreen({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth() as any;
  const name = user?.name || 'Sarah Aziz';
  const [showPlan, setShowPlan] = useState(false);

  if (showPlan) {
    return <PlansScreen onBack={() => setShowPlan(false)} />;
  }

  return (
    <View style={{ gap: 16 }}>
      <View style={s.card}>
        <View style={s.avatar}><Text style={s.avatarText}>{initials(name)}</Text></View>
        <Text style={s.name}>{name}</Text>
        <Text style={s.tier}>Gold Member since 2024</Text>
        <View style={s.statRow}>
          <View style={s.stat}><Text style={s.statN}>128</Text><Text style={s.statL}>Workouts</Text></View>
          <View style={s.stat}><Text style={s.statN}>6</Text><Text style={s.statL}>Streak</Text></View>
          <View style={s.stat}><Text style={s.statN}>2.1y</Text><Text style={s.statL}>Member</Text></View>
        </View>
      </View>

      <View style={s.menu}>
        {MENU.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={s.menuItem}
            onPress={() => (m.key === 'plan' ? setShowPlan(true) : Alert.alert(m.label, 'Coming soon.'))}
          >
            <Feather name={m.icon as any} size={17} color={colors.goldLight} />
            <Text style={s.menuText}>{m.label}</Text>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.menuItem} onPress={() => logout?.()}>
          <Feather name="log-out" size={17} color="#d97d5a" />
          <Text style={[s.menuText, { color: '#d97d5a' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  back: { color: colors.gray, fontSize: 13 },
  title: { color: colors.white, fontSize: 20, fontWeight: '700' },
  card: { backgroundColor: colors.charcoal2, ...cardShadow, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 20, alignItems: 'center', gap: 4, marginTop: 10 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(201,162,39,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  avatarText: { color: colors.goldLight, fontWeight: '700', fontSize: 20 },
  name: { color: colors.white, fontSize: 17, fontWeight: '700' },
  tier: { color: colors.gray, fontSize: 12 },
  statRow: { flexDirection: 'row', gap: 20, marginTop: 14 },
  stat: { alignItems: 'center' },
  statN: { color: colors.white, fontSize: 15, fontWeight: '700' },
  statL: { color: colors.gray, fontSize: 10.5, marginTop: 2 },
  menu: { backgroundColor: colors.charcoal2, ...cardShadow, borderWidth: 1, borderColor: colors.line, borderRadius: 18, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: 'rgba(245,244,240,0.07)' },
  menuText: { flex: 1, color: colors.white, fontSize: 13.5, fontWeight: '500' },
  arrow: { color: colors.gray, fontSize: 18 },
});
