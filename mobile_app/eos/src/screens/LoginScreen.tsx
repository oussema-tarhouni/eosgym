import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const pwAnim = useRef(new Animated.Value(0)).current;
  const pwBorder = pwAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.gold] });
  const [error, setError] = useState('');
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

  const submit = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      if (!err?.response) {
        setError('Cannot reach the server — check the console for a network/CORS error.');
      } else {
        setError(err.response.data?.error || `Server error (${err.response.status})`);
      }
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
          <View style={[s.tab, s.tabActive]}>
            <Text style={s.tabTextActive}>Log In</Text>
          </View>
          <TouchableOpacity style={s.tab} onPress={() => navigation.navigate('Signup')}>
            <Text style={s.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.h1}>Welcome back</Text>
        <Text style={s.sub}>Log in to book classes, track your membership, and keep training.</Text>

        {!!error && <Text style={s.error}>{error}</Text>}

        <Field label="Email" icon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />

        <View style={{ gap: 8 }}>
          <Text style={s.label}>Password</Text>
          <View style={s.inputWrap}>
            <View style={s.leftIcon}><Feather name="lock" size={17} color={colors.grayDim} /></View>
            <AnimatedInput
              style={[s.input, { paddingLeft: 44, paddingRight: 44 }, { borderColor: pwBorder }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              placeholder="••••••••"
              placeholderTextColor={colors.grayDim}
              onFocus={() => Animated.timing(pwAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start()}
              onBlur={() => Animated.timing(pwAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start()}
            />
            <TouchableOpacity style={s.rightIcon} onPress={() => setShowPw((v) => !v)}>
              <Feather name={showPw ? 'eye-off' : 'eye'} size={18} color={colors.goldLight} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={s.link}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.submit, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.black} /> : <Text style={s.submitText}>Log In</Text>}
        </TouchableOpacity>

        <Text style={s.footer}>
          New here? <Text style={s.link} onPress={() => navigation.navigate('Signup')}>Create an account</Text>
        </Text>
        </Animated.View>
      </View>
    </ScrollView>
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
        {icon && <Animated.View style={s.leftIcon}><Feather name={icon} size={17} color={colors.grayDim} /></Animated.View>}
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
  forgotRow: { alignItems: 'flex-end', marginTop: -8 },
  link: { color: colors.goldLight, fontWeight: '700' },
  submit: { backgroundColor: colors.gold, borderRadius: 999, padding: 15, alignItems: 'center', marginTop: 4 },
  submitText: { color: colors.black, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  footer: { textAlign: 'center', color: colors.gray, fontSize: 13 },
  error: { color: '#e5484d', fontSize: 14, textAlign: 'center' },
});
