import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
  interpolate, Extrapolate, withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const GRADIENT_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAEACAYAAACZCaebAAAAU0lEQVR4nN2MwRHAMAjDFK4v9h84nwyQBGpoefmw5OHuABjr7sIDjARYUAXhkk8JHKwEuhJO1wWDfw7WbPBOP7J24CbMe/pRVbIThNP1D32UugFM0KYEw9WWSpoAAAAASUVORK5CYII=';

const SLIDES = [
  {
    title1: 'Train Smarter With', title2: 'Real Coaching',
    desc: 'Strength training and reformer pilates, guided by coaches who track your form and your progress.',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    title1: 'Track Every', title2: 'Rep & Result',
    desc: 'Log your workouts, book classes, and watch your progress add up week after week.',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
  },
  {
    title1: 'Stay Motivated And', title2: 'Reach Your Goals',
    desc: 'A community and coaching staff that actually knows your name and your targets.',
    img: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?auto=format&fit=crop&w=800&q=80',
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [index, setIndex] = useState(0);
  const listRef = React.useRef<any>(null);
  const scrollX = useSharedValue(0);
  const isLast = index === SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { scrollX.value = e.contentOffset.x; },
  });

  const onMomentumEnd = (e: any) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (isLast) return navigation.navigate('Login');
    listRef.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <View style={s.root}>
      <AnimatedFlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_: any, i: number) => String(i)}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        renderItem={({ item, index: i }: any) => <Slide item={item} index={i} scrollX={scrollX} />}
      />

      <View style={s.bottom}>
        <View style={s.dots}>
          {SLIDES.map((_, i) => <Dot key={i} i={i} scrollX={scrollX} />)}
        </View>

        {!isLast ? (
          <View style={s.row}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={10}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
            <ArrowButton onPress={next} />
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity style={s.cta} onPress={() => navigation.navigate('Signup')}>
              <Text style={s.ctaText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={s.loginLink}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// One slide's text fades + rises in as it becomes centered, and the image
// gets a subtle parallax drift — driven entirely by scrollX (UI thread).
function Slide({ item, index, scrollX }: { item: (typeof SLIDES)[number]; index: number; scrollX: Animated.SharedValue<number> }) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP),
    transform: [{ translateY: interpolate(scrollX.value, inputRange, [18, 0, 18], Extrapolate.CLAMP) }],
  }));
  const imgStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(scrollX.value, inputRange, [-width * 0.12, 0, width * 0.12], Extrapolate.CLAMP) }],
  }));

  return (
    <View style={{ width, height }}>
      <Animated.Image source={{ uri: item.img }} style={[s.image, imgStyle]} />
      <Animated.Image source={{ uri: GRADIENT_URI }} style={s.gradient} resizeMode="stretch" pointerEvents="none" />
      <View style={s.greenRing} pointerEvents="none" />
      <Animated.View style={[s.textBlock, textStyle]}>
        <Text style={s.title}>{item.title1} <Text style={s.titleBold}>{item.title2}</Text></Text>
        <Text style={s.desc}>{item.desc}</Text>
      </Animated.View>
    </View>
  );
}

function Dot({ i, scrollX }: { i: number; scrollX: Animated.SharedValue<number> }) {
  const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
  const style = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, inputRange, [20, 28, 20], Extrapolate.CLAMP),
    opacity: interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolate.CLAMP),
  }));
  return <Animated.View style={[s.dot, style]} />;
}

function ArrowButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.9, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
    >
      <Animated.View style={[s.arrowBtn, style]}>
        <Feather name="arrow-right" size={20} color={colors.black} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  image: { width: '100%', height: '68%' },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: '68%' },
  greenRing: {
    position: 'absolute', bottom: -60, alignSelf: 'center',
    width: 260, height: 260, borderRadius: 130,
    borderWidth: 24, borderColor: 'rgba(143,194,95,0.18)',
  },
  textBlock: { position: 'absolute', bottom: 190, left: 28, right: 28 },
  title: { color: colors.white, fontSize: 28, fontWeight: '400', lineHeight: 34, textAlign: 'center' },
  titleBold: { fontWeight: '700' },
  desc: { color: colors.gray, fontSize: 14, lineHeight: 20, marginTop: 12, textAlign: 'center' },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 28, paddingBottom: 44 },
  dots: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginBottom: 24 },
  dot: { height: 3, borderRadius: 2, backgroundColor: colors.gold },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skipText: { color: colors.white, fontSize: 14, fontWeight: '600', opacity: 0.85 },
  arrowBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  cta: { backgroundColor: colors.gold, borderRadius: 27, paddingVertical: 15, paddingHorizontal: 90 },
  ctaText: { color: colors.black, fontWeight: '700', fontSize: 15, textTransform: 'uppercase', letterSpacing: 0.6 },
  loginLink: { color: colors.gray, fontSize: 13, marginTop: 16 },
});
