import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Ported from pending.component: polls GET /api/auth/me every 15s until
// status === 'approved'. Angular navigated to /dashboard here (a route that
// doesn't actually exist in app.routes.ts — kept as 'Dashboard' since that's
// the real gated screen).
export default function PendingScreen() {
  const { me, logout } = useAuth();

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        // Just refresh the user — AppNavigator's RootSwitch reads user.status
        // and swaps to MainStack on its own once it's 'approved'.
        await me();
      } catch { /* ignore transient errors while polling */ }
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  return (
    <View style={s.screen}>
      <View style={s.card}>
        <Text style={s.h1}>Your account is pending approval</Text>
        <Text style={s.sub}>Thanks for signing up! Our team is reviewing your registration. You'll be able to log in as soon as an admin confirms your account.</Text>
        <TouchableOpacity style={s.btn} onPress={() => logout()}>
          <Text style={s.btnText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { alignItems: 'center', gap: 12, maxWidth: 340 },
  h1: { fontSize: 20, color: colors.white, textAlign: 'center', fontWeight: '600' },
  sub: { color: colors.gray, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 8, borderWidth: 1.5, borderColor: colors.line, borderRadius: 13, paddingVertical: 13, paddingHorizontal: 24 },
  btnText: { color: colors.white, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
});
