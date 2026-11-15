import React, { useEffect, useRef } from 'react';
import { Text, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { AuthShell, AuthHeader, Enter, ui } from '../components/AuthUI';

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
    <AuthShell>
      <AuthHeader
        icon="clock"
        title="Your account is pending approval"
        sub="Thanks for signing up! Our team is reviewing your registration. You'll be able to log in as soon as an admin confirms your account."
      />
      <Enter i={1}>
        <Pressable
          onPress={() => logout()}
          style={({ pressed }) => ({
            height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
            backgroundColor: ui.fill, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.charcoal, fontSize: 16, fontWeight: '700' }}>Log out</Text>
        </Pressable>
      </Enter>
    </AuthShell>
  );
}
