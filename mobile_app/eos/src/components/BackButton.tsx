import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/dark';

export default function BackButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.75}>
      <Feather name="arrow-left" size={20} color={colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#3b3a36',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
