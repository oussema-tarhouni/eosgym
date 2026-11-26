import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/dark';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

// Put your video at assets/welcome.mp4 (adjust path if needed)
const VIDEO = require('../../assets/welcome.mp4');

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const player = useVideoPlayer(VIDEO, (p) => { p.loop = true; p.muted = true; p.play(); });
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />

      {/* Bottom gradient for readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.55, 1]}
        style={s.gradient}
        pointerEvents="none"
      />

      <View style={s.bottom}>
        <Text style={s.title}>Book classes.{'\n'}Track your progress.</Text>

        <Pressable
          onPress={() => navigation.navigate('Onboarding')}
          style={({ pressed }) => [s.primary, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={s.primaryText}>Register</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={10} style={s.linkWrap}>
          <Text style={s.linkText}>I already have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingBottom: 44, gap: 20 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 42, marginBottom: 8 },
  primary: {
    height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  primaryText: { color: '#000', fontSize: 16, fontWeight: '700' },
  linkWrap: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: 'rgba(255,255,255,0.65)', fontSize: 16 },
});
