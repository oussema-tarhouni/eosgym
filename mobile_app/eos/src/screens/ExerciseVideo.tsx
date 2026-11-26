import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../theme/dark';

// Fullscreen prop name differs between expo-video versions (allowsFullscreen vs fullscreenOptions); pass both.
const FULLSCREEN: any = { allowsFullscreen: true, fullscreenOptions: { enable: true } };

export default function ExerciseVideo({ uri, height = 230 }: { uri?: string; height?: number }) {
  const player = useVideoPlayer(uri ?? null, (p) => { p.loop = true; });
  if (!uri) {
    return (
      <View style={[st.box, { height }]}>
        <Feather name="video-off" size={30} color={colors.grayDim} />
        <Text style={st.text}>Video coming soon</Text>
      </View>
    );
  }
  return <VideoView player={player} style={[st.box, { height }]} nativeControls contentFit="contain" {...FULLSCREEN} />;
}

const st = StyleSheet.create({
  box: { width: '100%', borderRadius: 24, overflow: 'hidden', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.lineSoft },
  text: { color: colors.gray, fontSize: 13, fontWeight: '600' },
});
