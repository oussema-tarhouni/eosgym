import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { colors } from '../theme/colors';

// Order/icons match the target pill design: Home · Schedule · Plans · Progress · Profile.
// labelW = extra width the pill grows by when active. Diet and Trainers stay
// reachable from Home's quick actions / widgets.
const TABS = [
  { key: 'home', icon: 'home', label: 'Home', labelW: 35 },
  { key: 'schedule', icon: 'calendar', label: 'Schedule', labelW: 50 },
  { key: 'diet', icon: 'pie-chart', label: 'Diet', labelW: 25 },
  { key: 'progress', icon: 'trending-up', label: 'Progress', labelW: 50 },
  { key: 'profile', icon: 'user', label: 'Profile', labelW: 40 },
] as const;
const COLLAPSED = 44;

type Props = { active: string; onSelect: (page: string) => void };

export default function BottomNavBar({ active, onSelect }: Props) {
  const [fontsLoaded] = useFonts(Feather.font);
  if (!fontsLoaded) return <View style={s.wrap} pointerEvents="none" />;

  return (
    <View style={s.wrap} pointerEvents="box-none">
      <View style={s.bar}>
        {TABS.map((t) => (
          <TabItem key={t.key} tab={t} isActive={active === t.key} onPress={() => onSelect(t.key)} />
        ))}
      </View>
    </View>
  );
}

function TabItem({
  tab,
  isActive,
  onPress,
}: {
  tab: (typeof TABS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  // Runs on the UI thread via Reanimated — no JS-thread jank/bounce/vibration.
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [isActive]);

  const itemStyle = useAnimatedStyle(() => ({
    width: COLLAPSED + progress.value * tab.labelW,
  }));
  const labelStyle = useAnimatedStyle(() => ({
    width: progress.value * tab.labelW,
    opacity: progress.value,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View style={[s.item, itemStyle, { backgroundColor: isActive ? 'rgba(255,255,255,0.14)' : 'transparent' }]}>
        <Feather name={tab.icon as any} size={17} color={isActive ? colors.white : colors.gray} />
        <Animated.View style={[{ overflow: 'hidden' }, labelStyle]}>
          <Text style={s.label} numberOfLines={1}>{tab.label}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center'},
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 460,
    padding: 10,
    backgroundColor: colors.black,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 15,
    borderRadius: 24,
  },
  label: { color: colors.white, fontSize: 12.5, fontWeight: '700' },
});
