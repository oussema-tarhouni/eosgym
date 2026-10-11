import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BackButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.75}>
      <Feather name="arrow-left" size={20} color="#f5f4f0" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#1d1d1c',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
