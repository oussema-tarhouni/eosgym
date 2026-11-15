import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/dark';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  AuthShell, AuthHeader, Field, EyeToggle, PrimaryButton, Checkbox, Footer, Enter, linkStyle, ui,
} from '../components/AuthUI';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
const STRENGTH_COLORS = [colors.red, colors.gold, colors.goldLight, colors.green];
const STRENGTH_LABELS = ['Weak', 'Okay', 'Good', 'Strong'];

export default function SignupScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => (password ? scorePassword(password) : 0), [password]);
  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = async () => {
    const phoneValid = /^[0-9]{8}$/.test(phone);
    setPhoneError(phoneValid ? '' : 'Enter a valid 8-digit Tunisian number');
    if (!name || !email || !password || password !== confirm || !phoneValid || !agree) return;

    setLoading(true);
    try {
      await register(name, email, phone, password);
      // AppNavigator's RootSwitch reads the fresh user.status and advances
      // to plan selection on its own — no explicit navigation needed here.
    } catch (err: any) {
      setPhoneError(err?.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const eye = <EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />;

  return (
    <AuthShell onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome'))}>
      <AuthHeader title="Create account" sub="Join EOS to book classes and track your progress." />

      <Enter i={1} style={{ gap: 14 }}>
        <Field label="Full name" value={name} onChangeText={setName} />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field
          label="Phone number" prefix="+216" value={phone}
          onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 8))}
          keyboardType="numeric" maxLength={8} error={phoneError}
        />
        <View style={{ gap: 8 }}>
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPw} right={eye} />
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1, height: 4, borderRadius: 999,
                  backgroundColor: i < strength ? STRENGTH_COLORS[Math.max(strength - 1, 0)] : ui.track,
                }}
              />
            ))}
          </View>
          <Text style={{ fontSize: 12, color: colors.gray }}>
            {password ? STRENGTH_LABELS[Math.max(strength - 1, 0)] : 'Use 8+ characters with letters, numbers & symbols'}
          </Text>
        </View>
        <Field
          label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry={!showPw}
          error={mismatch ? "Passwords don't match" : undefined}
          right={confirm.length > 0 && !mismatch ? <Feather name="check-circle" size={18} color={colors.green} /> : undefined}
        />
      </Enter>

      <Enter i={2} style={{ gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <Checkbox value={agree} onChange={setAgree} />
          <Text style={{ flex: 1, color: colors.gray, fontSize: 13, lineHeight: 19 }}>
            I agree to EOS Fitness & Pilates'{' '}
            <Text style={linkStyle} onPress={() => navigation.navigate('Terms')}>Terms of Service</Text> and{' '}
            <Text style={linkStyle} onPress={() => navigation.navigate('Privacy')}>Privacy Policy</Text>
          </Text>
        </View>
        <PrimaryButton label="Create account" onPress={submit} loading={loading} />
        <Footer text="Already a member?" link="Log in" onPress={() => navigation.navigate('Login')} />
      </Enter>
    </AuthShell>
  );
}
