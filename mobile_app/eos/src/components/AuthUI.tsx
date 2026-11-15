import React, { useEffect, useRef, useState, ReactNode } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator, Image, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withTiming, withSpring, withRepeat,
  interpolateColor, Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, bgGradient, bgLocations } from '../theme/dark';

export const ui = { bg: colors.bg, ink: colors.white, fill: colors.charcoal2, track: 'rgba(245,244,240,0.12)' };
export const linkStyle = {
  color: ui.ink,
  fontWeight: '700' as const,
  textDecorationLine: 'underline' as const,
  textDecorationColor: colors.gold,
};

export function Enter({ i = 0, style, children }: { i?: number; style?: ViewStyle; children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.delay(60 + i * 70).duration(420)} style={style}>
      {children}
    </Animated.View>
  );
}

export function AuthShell({ children, onBack }: { children: ReactNode; onBack?: () => void }) {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: ui.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={bgGradient} locations={bgLocations} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      {onBack && (
        <Animated.View entering={FadeInDown.duration(350)} style={[s.back, { top: top + 12 }]}>
          <Pressable onPress={onBack} style={s.backBtn} hitSlop={8}>
            <Feather name="arrow-left" size={20} color={ui.ink} />
          </Pressable>
        </Animated.View>
      )}
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: top + (onBack ? 64 : 24), paddingBottom: bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthHeader({ title, sub, icon, tone = 'gold' }: { title: string; sub: ReactNode; icon?: keyof typeof Feather.glyphMap; tone?: 'gold' | 'green' }) {
  const accent = tone === 'green' ? colors.green : colors.gold;
  const rgb = tone === 'green' ? '106,154,68' : '201,162,39';
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (icon) pulse.value = withRepeat(withTiming(1.1, { duration: 1700, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [icon]);
  const halo = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <Enter style={s.header}>
      {icon ? (
        <Animated.View entering={ZoomIn.springify().damping(14)} style={s.iconWrap}>
          <Animated.View style={[s.halo, { backgroundColor: `rgba(${rgb},0.14)` }, halo]} />
          <View style={[s.iconCore, { backgroundColor: `rgba(${rgb},0.22)` }]}><Feather name={icon} size={28} color={accent} /></View>
        </Animated.View>
      ) : (
        <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />
      )}
      <Text style={s.h1}>{title}</Text>
      <Text style={s.sub}>{sub}</Text>
    </Enter>
  );
}

type FieldProps = TextInputProps & { label: string; prefix?: string; right?: ReactNode; error?: string };
export function Field({ label, prefix, right, error, value, onFocus, onBlur, ...rest }: FieldProps) {
  const f = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);
  const l = useSharedValue(value ? 1 : 0);
  const [focused, setFocused] = useState(false);
  const floated = focused || !!value;
  useEffect(() => {
    l.value = withTiming(floated ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
  }, [floated]);

  const box = useAnimatedStyle(() => ({
    borderColor: interpolateColor(f.value, [0, 1], ['rgba(201,162,39,0)', colors.gold]),
  }));
  const lab = useAnimatedStyle(() => ({
    color: interpolateColor(f.value, [0, 1], [colors.gray, colors.gold]),
    transform: [{ translateY: -11 * l.value }, { scale: 1 - 0.22 * l.value }],
  }));
  const pre = useAnimatedStyle(() => ({ opacity: l.value }));

  return (
    <View style={{ gap: 6 }}>
      <Pressable onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[s.box, box]}>
        <Animated.Text style={[s.floatLabel, lab]} pointerEvents="none">{label}</Animated.Text>
        <View style={s.row}>
          {prefix && <Animated.Text style={[s.prefix, pre]}>{prefix}</Animated.Text>}
          <TextInput
            ref={inputRef}
            style={s.input}
            value={value}
            onFocus={(e) => { setFocused(true); f.value = withTiming(1, { duration: 160 }); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); f.value = withTiming(0, { duration: 160 }); onBlur?.(e); }}
            {...rest}
          />
          {right}
        </View>
      </Animated.View>
      </Pressable>
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

export function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} hitSlop={12}>
      <Feather name={show ? 'eye' : 'eye-off'} size={18} color={colors.gray} />
    </Pressable>
  );
}

export function ErrorBanner({ text }: { text: string }) {
  return (
    <Animated.View entering={FadeInDown.duration(250)} style={s.banner}>
      <Feather name="alert-circle" size={16} color={colors.red} />
      <Text style={s.bannerText}>{text}</Text>
    </Animated.View>
  );
}

export function PrimaryButton({ label, onPress, loading }: { label: string; onPress: () => void; loading?: boolean }) {
  const sc = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  return (
    <Animated.View style={[s.btnShadow, st]}>
      <Pressable
        style={[s.btn, loading && { opacity: 0.7 }]}
        onPress={onPress}
        disabled={loading}
        onPressIn={() => { sc.value = withSpring(0.97); }}
        onPressOut={() => { sc.value = withSpring(1); }}
      >
        <LinearGradient
          colors={[colors.gold, '#a8841a']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? <ActivityIndicator color={colors.black} /> : <Text style={s.btnText}>{label}</Text>}
      </Pressable>
    </Animated.View>
  );
}

export function Checkbox({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable style={[s.checkbox, value && s.checkboxOn]} onPress={() => onChange(!value)} hitSlop={8}>
      {value && <Feather name="check" size={14} color={colors.black} />}
    </Pressable>
  );
}

export function Footer({ text, link, onPress }: { text: string; link: string; onPress: () => void }) {
  return (
    <Text style={s.footer}>
      {text} <Text style={linkStyle} onPress={onPress}>{link}</Text>
    </Text>
  );
}

function CodeBox({ char, active }: { char?: string; active: boolean }) {
  const a = useSharedValue(0);
  useEffect(() => { a.value = withTiming(active ? 1 : 0, { duration: 160 }); }, [active]);
  const st = useAnimatedStyle(() => ({
    borderColor: interpolateColor(a.value, [0, 1], ['rgba(201,162,39,0)', colors.gold]),
    backgroundColor: interpolateColor(a.value, [0, 1], [ui.fill, colors.charcoal]),
    transform: [{ scale: 1 + 0.06 * a.value }],
  }));
  return <Animated.View style={[s.codeBox, st]}><Text style={s.codeChar}>{char}</Text></Animated.View>;
}

export function CodeInput({ value, onChange, length = 4 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable onPress={() => ref.current?.focus()} style={s.codeRow}>
      {Array.from({ length }).map((_, i) => (
        <CodeBox key={i} char={value[i]} active={focused && i === Math.min(value.length, length - 1)} />
      ))}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={s.hidden}
      />
    </Pressable>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 22 },
  back: { position: 'absolute', left: 20, zIndex: 5 },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: ui.fill, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  header: { alignItems: 'center', gap: 10 },
  logo: { width: 110, height: 34, marginBottom: 6 },
  iconWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  halo: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(201,162,39,0.12)' },
  iconCore: { width: 66, height: 66, borderRadius: 33, backgroundColor: 'rgba(201,162,39,0.2)', alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 26, fontWeight: '800', color: ui.ink, letterSpacing: -0.4, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.gray, lineHeight: 20, textAlign: 'center' },
  box: { height: 58, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: ui.fill, borderWidth: 1.5, borderRadius: 16 },
  floatLabel: { position: 'absolute', left: 16, top: 18, fontSize: 14, color: colors.gray, transformOrigin: 'left center', pointerEvents: 'none' } as any,
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 58 },
  prefix: { marginTop: 18, color: colors.gray, fontWeight: '700', fontSize: 15 },
  input: { flex: 1, height: 28, marginTop: 18, padding: 0, color: ui.ink, fontSize: 15, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}) },
  error: { color: colors.red, fontSize: 12, marginLeft: 4 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: 'rgba(224,53,90,0.08)' },
  bannerText: { flex: 1, color: colors.red, fontSize: 13 },
  btnShadow: {
    borderRadius: 28, backgroundColor: colors.gold,
    shadowColor: colors.gold, shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  btn: { height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.black, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  checkbox: { width: 24, height: 24, borderRadius: 8, marginTop: 1, borderWidth: 1.5, borderColor: 'rgba(245,244,240,0.25)', backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  footer: { textAlign: 'center', color: colors.gray, fontSize: 13.5 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  codeBox: { width: 58, height: 64, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  codeChar: { fontSize: 24, fontWeight: '800', color: ui.ink },
  hidden: { position: 'absolute', width: '100%', height: '100%', opacity: 0 },
});
