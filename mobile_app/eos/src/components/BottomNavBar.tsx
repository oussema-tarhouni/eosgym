import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Animated, Easing, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { colors } from '../theme/dark';

type Icon = keyof typeof Feather.glyphMap;
type Tab = { key: string; icon: Icon; label: string };

const TABS: Tab[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'schedule', icon: 'calendar', label: 'Schedule' },
  { key: 'shop', icon: 'shopping-bag', label: 'Shop' },
  { key: 'tutorials', icon: 'play-circle', label: 'Tutorials' },
];
const PROFILE: Tab = { key: 'profile', icon: 'user', label: 'Profile' };

// One nav item that opens a vertical menu with these two pages.
const GROUP: Tab[] = [
  { key: 'diet', icon: 'pie-chart', label: 'Diet' },
  { key: 'progress', icon: 'trending-up', label: 'Progress' },
];
const MENU_W = 150;

type Props = { active: string; onSelect: (page: string) => void };

function BottomNavBar({ active, onSelect }: Props) {
  const [fontsLoaded] = useFonts(Feather.font);
  const { bottom } = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [gx, setGx] = useState<{ x: number; w: number } | null>(null);
  const menu = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(menu, { toValue: open ? 1 : 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [open]);
  useEffect(() => setOpen(false), [active]);

  if (!fontsLoaded) return <View style={s.wrap} pointerEvents="none" />;

  const current = GROUP.find((g) => g.key === active);
  const groupTab: Tab = current ?? { key: 'group', icon: 'layers', label: 'Track' };
  const select = (key: string) => { setOpen(false); onSelect(key); };

  const left = gx ? Math.max(0, gx.x + gx.w / 2 - MENU_W / 2) : 0;
  const translateY = menu.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <View style={s.wrap}>
      {/* Vertical menu above the bar */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[s.menu, { left, opacity: menu, transform: [{ translateY }] }]}
      >
        {GROUP.map((g) => {
          const on = g.key === active;
          return (
            <Pressable key={g.key} style={[s.menuItem, on && s.menuItemOn]} onPress={() => select(g.key)}>
              <Feather name={g.icon} size={18} color={on ? colors.black : colors.white} />
              <Text style={[s.menuText, on && { color: colors.black }]}>{g.label}</Text>
            </Pressable>
          );
        })}
      </Animated.View>

      <View style={[s.bar, { paddingBottom: 10 + bottom }]}>
        {TABS.map((t) => (
          <TabItem key={t.key} tab={t} isActive={active === t.key} onPress={() => select(t.key)} />
        ))}
        <View onLayout={(e) => setGx({ x: e.nativeEvent.layout.x, w: e.nativeEvent.layout.width })}>
          <TabItem tab={groupTab} isActive={!!current} isOpen={open} onPress={() => setOpen((v) => !v)} />
        </View>
        <TabItem tab={PROFILE} isActive={active === 'profile'} onPress={() => select('profile')} />
      </View>
    </View>
  );
}

function TabItem({ tab, isActive, isOpen, onPress }: { tab: Tab; isActive: boolean; isOpen?: boolean; onPress: () => void }) {
  const color = isActive ? colors.black : isOpen ? colors.goldLight : colors.gray;

  return (
    <Pressable onPress={onPress} hitSlop={4} accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{ selected: isActive, expanded: isOpen }}>
      <View style={[s.item, { backgroundColor: isActive ? colors.gold : 'transparent', paddingHorizontal: isActive ? 16 : 11 }]}>
        <Feather name={tab.icon} size={22} color={color} />
        {isActive && (
          <Text numberOfLines={1} style={[s.label, { color: colors.black }]}>
            {tab.label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.charcoal2,
    borderWidth: 1,
    borderColor: colors.line,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  item: { height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label: { fontSize: 12, fontWeight: '600', marginLeft: 6, flexShrink: 1 },
  menu: {
    position: 'absolute', bottom: '100%', marginBottom: 10, width: MENU_W,
    backgroundColor: colors.charcoal2, borderWidth: 1, borderColor: colors.line, borderRadius: 18,
    padding: 6, gap: 4,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 20,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 14, borderRadius: 14 },
  menuItemOn: { backgroundColor: colors.gold },
  menuText: { color: colors.white, fontSize: 14, fontWeight: '600' },
});

export default React.memo(BottomNavBar);
