import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
const STRENGTH_COLORS = ['#e0355a', '#c9a227', '#e6cc7a', '#8fc25f'];
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
  const pwAnim = useRef(new Animated.Value(0)).current;
  const confirmAnim = useRef(new Animated.Value(0)).current;
  const phoneAnim = useRef(new Animated.Value(0)).current;
  const pwBorder = pwAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.gold] });
  const confirmBorder = confirmAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.gold] });
  const phoneBorder = phoneAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.gold] });
  const [agree, setAgree] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useFocusEffect(
    React.useCallback(() => {
      fade.setValue(0);
      slide.setValue(16);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, [])
  );

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

  return (
    <ScrollView contentContainerStyle={s.screen} bounces={false}>
      <View style={s.card}>
        <View style={s.ring} />
        <View style={s.ring2} />

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 16 }}>
        <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />

        <View style={s.tabs}>
          <TouchableOpacity style={s.tab} onPress={() => navigation.navigate('Login')}>
            <Text style={s.tabText}>Log In</Text>
          </TouchableOpacity>
          <View style={[s.tab, s.tabActive]}>
            <Text style={s.tabTextActive}>Sign Up</Text>
          </View>
        </View>

        <Text style={s.h1}>Create your account</Text>
        <Text style={s.sub}>Join EOS to book classes, message your trainer, and track your progress.</Text>

        <Field label="Full name" icon="user" value={name} onChangeText={setName} placeholder="Sarah Aziz" />
        <Field label="Email" icon="mail" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />

        <View style={{ gap: 8 }}>
          <Text style={s.label}>Phone number</Text>
          <Animated.View style={[s.phoneRow, { borderColor: phoneBorder }]}>
            <Feather name="phone" size={16} color={colors.grayDim} />
            <Text style={s.phonePrefix}>+216</Text>
            <TextInput
              style={[s.input, { flex: 1, borderWidth: 0 }]}
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 8))}
              placeholder="20 123 456"
              placeholderTextColor={colors.grayDim}
              keyboardType="numeric"
              maxLength={8}
              onFocus={() => Animated.timing(phoneAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start()}
              onBlur={() => Animated.timing(phoneAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start()}
            />
          </Animated.View>
          {!!phoneError && <Text style={s.error}>{phoneError}</Text>}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <View style={s.leftIcon}><Feather name="lock" size={17} color={colors.grayDim} /></View>
            <AnimatedInput
              style={[s.input, { paddingLeft: 44, paddingRight: 44 }, { borderColor: pwBorder }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              placeholder="Create a password"
              placeholderTextColor={colors.grayDim}
              onFocus={() => Animated.timing(pwAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start()}
              onBlur={() => Animated.timing(pwAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start()}
            />
            <TouchableOpacity style={s.rightIcon} onPress={() => setShowPw((v) => !v)}>
              <Feather name={showPw ? 'eye-off' : 'eye'} size={18} color={colors.goldLight} />
            </TouchableOpacity>
          </View>
          <View style={s.strengthBars}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[s.strengthBar, { backgroundColor: i < strength ? STRENGTH_COLORS[Math.max(strength - 1, 0)] : colors.line }]} />
            ))}
          </View>
          <Text style={s.hint}>{password ? STRENGTH_LABELS[Math.max(strength - 1, 0)] : 'Use 8+ characters with a mix of letters, numbers & symbols'}</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={s.label}>Confirm password</Text>
          <View style={s.inputWrap}>
            <View style={s.leftIcon}><Feather name="lock" size={17} color={colors.grayDim} /></View>
            <AnimatedInput
              style={[s.input, { paddingLeft: 44 }, { borderColor: confirmBorder }]}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showPw}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.grayDim}
              onFocus={() => Animated.timing(confirmAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start()}
              onBlur={() => Animated.timing(confirmAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start()}
            />
          </View>
          {mismatch && <Text style={s.error}>Passwords don't match</Text>}
        </View>

        <View style={s.agreeRow}>
          <Checkbox value={agree} onChange={setAgree} />
          <Text style={s.agreeText}>
            I agree to EOS Fitness & Pilates'{' '}
            <Text style={s.link} onPress={() => navigation.navigate('Terms')}>Terms of Service</Text> and{' '}
            <Text style={s.link} onPress={() => navigation.navigate('Privacy')}>Privacy Policy</Text>
          </Text>
        </View>

        <TouchableOpacity style={[s.submit, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.black} /> : <Text style={s.submitText}>Create Account</Text>}
        </TouchableOpacity>

        <Text style={s.footer}>
          Already a member? <Text style={s.link} onPress={() => navigation.navigate('Login')}>Log in</Text>
        </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function Checkbox({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={[s.checkbox, value && s.checkboxOn]} onPress={() => onChange(!value)}>
      {value && <Feather name="check" size={13} color={colors.black} />}
    </TouchableOpacity>
  );
}

function Field({ label, icon, ...props }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.gold] });
  const onFocus = () => Animated.timing(anim, { toValue: 1, duration: 160, useNativeDriver: false }).start();
  const onBlur = () => Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: false }).start();
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        {icon && <View style={s.leftIcon}><Feather name={icon} size={17} color={colors.grayDim} /></View>}
        <AnimatedInput
          style={[s.input, icon && { paddingLeft: 44 }, { borderColor }]}
          placeholderTextColor={colors.grayDim}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: colors.charcoal },
  card: { flex: 1, width: '100%', backgroundColor: colors.charcoal, padding: 24, paddingTop: 60, gap: 16, overflow: 'hidden', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    top: -60,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  ring2: {
    position: 'absolute',
    bottom: -90,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.18)',
  },
  logo: { width: 68, height: 20, alignSelf: 'center', marginTop: -4 },
  tabs: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 999, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabActive: { backgroundColor: colors.gold },
  tabText: { color: colors.gray, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: colors.black, fontWeight: '700', fontSize: 14 },
  h1: { fontSize: 22, color: colors.white, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  sub: { fontSize: 13.5, color: colors.gray, lineHeight: 19, textAlign: 'center' },
  label: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.gray },
  inputWrap: { justifyContent: 'center' },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, color: colors.white, fontSize: 14.5 },
  leftIcon: { position: 'absolute', left: 16, zIndex: 1 },
  rightIcon: { position: 'absolute', right: 14 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingLeft: 16 },
  phonePrefix: { color: colors.gray, fontWeight: '600', fontSize: 14.5 },
  strengthBars: { flexDirection: 'row', gap: 4, marginTop: 2 },
  strengthBar: { flex: 1, height: 4, borderRadius: 999 },
  hint: { fontSize: 11.5, color: colors.grayDim },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  agreeText: { color: colors.gray, fontSize: 12.5, flex: 1, lineHeight: 18 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7, marginTop: 1,
    borderWidth: 1.5, borderColor: colors.line,
    backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  link: { color: colors.goldLight, fontWeight: '700' },
  submit: { backgroundColor: colors.gold, borderRadius: 999, padding: 15, alignItems: 'center', marginTop: 4 },
  submitText: { color: colors.black, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  footer: { textAlign: 'center', color: colors.gray, fontSize: 13 },
  error: { color: '#e0355a', fontSize: 11.5 },
});
