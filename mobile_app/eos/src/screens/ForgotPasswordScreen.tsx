import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import BackButton from '../components/backbtnforspecific';

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const anim = useRef(new Animated.Value(0)).current;
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.gold] });

  const submit = async () => {
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      // TODO: wire to authApi.forgotPassword(email) once available
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.screen} bounces={false}>
      <View style={s.card}>
        <View style={s.ring} />
        <View style={s.ring2} />

        <View style={s.back}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 16 }}>
          <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />

          {sent ? (
            <>
              <View style={s.iconCircle}><Feather name="mail" size={22} color={colors.goldLight} /></View>
              <Text style={s.h1}>Check your email</Text>
              <Text style={s.sub}>We sent a password reset link to {email}.</Text>
              <TouchableOpacity style={s.submit} onPress={() => navigation.goBack()}>
                <Text style={s.submitText}>Back to Log In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.h1}>Reset your password</Text>
              <Text style={s.sub}>Enter the email linked to your account and we'll send you a reset link.</Text>

              {!!error && <Text style={s.error}>{error}</Text>}

              <View style={{ gap: 8 }}>
                <Text style={s.label}>Email</Text>
                <View style={s.inputWrap}>
                  <View style={s.leftIcon}><Feather name="mail" size={17} color={colors.grayDim} /></View>
                  <AnimatedInput
                    style={[s.input, { paddingLeft: 44, borderColor }]}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor={colors.grayDim}
                    onFocus={() => Animated.timing(anim, { toValue: 1, duration: 160, useNativeDriver: false }).start()}
                    onBlur={() => Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: false }).start()}
                  />
                </View>
              </View>

              <TouchableOpacity style={[s.submit, loading && { opacity: 0.6 }]} onPress={submit} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.black} /> : <Text style={s.submitText}>Send reset link</Text>}
              </TouchableOpacity>

              <Text style={s.footer}>
                Remembered it? <Text style={s.link} onPress={() => navigation.goBack()}>Log in</Text>
              </Text>
            </>
          )}
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flexGrow: 1, backgroundColor: colors.charcoal },
  card: { flex: 1, width: '100%', backgroundColor: colors.charcoal, padding: 24, paddingTop: 60, gap: 16, overflow: 'hidden', justifyContent: 'center' },
  ring: { position: 'absolute', top: -60, right: -70, width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' },
  ring2: { position: 'absolute', bottom: -90, left: -80, width: 260, height: 260, borderRadius: 130, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)' },
  back: { position: 'absolute', top: 60, left: 24, zIndex: 2 },
  logo: { width: 68, height: 20, alignSelf: 'center', marginTop: -4 },
  iconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderWidth: 1, borderColor: colors.line },
  h1: { fontSize: 22, color: colors.white, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  sub: { fontSize: 13.5, color: colors.gray, lineHeight: 19, textAlign: 'center' },
  label: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.gray },
  inputWrap: { justifyContent: 'center' },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, color: colors.white, fontSize: 14.5 },
  leftIcon: { position: 'absolute', left: 16, zIndex: 1 },
  link: { color: colors.goldLight, fontWeight: '700' },
  submit: { backgroundColor: colors.gold, borderRadius: 999, padding: 15, alignItems: 'center', marginTop: 4 },
  submitText: { color: colors.black, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  footer: { textAlign: 'center', color: colors.gray, fontSize: 13 },
  error: { color: '#e5484d', fontSize: 14, textAlign: 'center' },
});
