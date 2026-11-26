import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/dark';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 264;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const M = SIZE / 2;

type Props = {
  /** ring fill right now, 0..1 */
  frac: number;
  /** ring fill one second from now (the ring glides there while running) */
  target: number;
  color: string;
  /** big text in the middle, e.g. "01:30" */
  time: string;
  /** small label under the time, e.g. "REST" */
  hint: string;
  running: boolean;
  /** changes whenever the ring should jump instead of glide (new step / new phase) */
  resetKey: string | number;
  /** the 3-2-1 intro: show one huge digit instead of the time */
  countdown?: boolean;
};

export default function TimerDial({ frac, target, color, time, hint, running, resetKey, countdown }: Props) {
  const ring = useRef(new Animated.Value(frac)).current;
  const last = useRef(frac);
  const pop = useRef(new Animated.Value(1)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = ring.addListener(({ value }) => { last.current = value; });
    return () => ring.removeListener(id);
  }, [ring]);

  // ring: jump on a new step, then glide linearly over one second per tick
  useEffect(() => {
    ring.stopAnimation();
    const jumped = Math.abs(last.current - frac) > 0.2 || frac === 0;
    if (jumped) ring.setValue(frac);
    if (!running) return;
    Animated.timing(ring, { toValue: target, duration: 1000, easing: Easing.linear, useNativeDriver: false }).start();
  }, [resetKey, frac, target, running, ring]);

  // number: small bounce on every change, bigger one for the 3-2-1 intro
  useEffect(() => {
    pop.setValue(countdown ? 1.7 : 1.1);
    Animated.spring(pop, { toValue: 1, friction: countdown ? 5 : 6, tension: 140, useNativeDriver: true }).start();
  }, [time, countdown, pop]);

  // soft breathing halo while the timer runs
  useEffect(() => {
    if (!running) { breathe.stopAnimation(); breathe.setValue(0); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [running, breathe]);

  const offset = ring.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });
  const capOpacity = ring.interpolate({ inputRange: [0, 0.01], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={s.wrap}>
      <Animated.View
        style={[s.halo, { backgroundColor: color, opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.16] }),
          transform: [{ scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.03] }) }] }]}
      />
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={M} cy={M} r={R} stroke="rgba(245,244,240,0.08)" strokeWidth={STROKE} fill="none" />
        <AnimatedCircle
          cx={M} cy={M} r={R} stroke={color} strokeWidth={STROKE} fill="none" strokeLinecap="round"
          strokeDasharray={`${C} ${C}`} strokeDashoffset={offset as any} strokeOpacity={capOpacity as any}
          rotation={-90} origin={`${M}, ${M}`}
        />
      </Svg>

      {/* everything in the middle lives in one centered column, so nothing overlaps */}
      <View style={s.center} pointerEvents="none">
        <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[countdown ? s.digit : s.time, { color, transform: [{ scale: pop }] }]}
        >
          {time}
        </Animated.Text>
        {!countdown && <Text style={s.hint}>{hint}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: SIZE - STROKE * 2, height: SIZE - STROKE * 2, borderRadius: SIZE },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: STROKE + 22 },
  time: { fontSize: 60, fontWeight: '300', fontVariant: ['tabular-nums'], letterSpacing: 1, includeFontPadding: false, textAlign: 'center' },
  digit: { fontSize: 120, fontWeight: '700', includeFontPadding: false, textAlign: 'center' },
  hint: { color: colors.gray, fontSize: 12, fontWeight: '700', letterSpacing: 3, marginTop: 8 },
});
