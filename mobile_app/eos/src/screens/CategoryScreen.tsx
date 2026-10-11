import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Category { id: string; name: string; desc: string; }
const CATEGORIES: Category[] = [
  { id: 'Strength', name: 'Musculation', desc: 'Free weights, machines & strength training' },
  { id: 'Pilates', name: 'Pilates', desc: 'Reformer & mat classes for mobility and core' },
];

type Nav = NativeStackNavigationProp<RootStackParamList, 'SelectCategory'>;

export default function CategoryScreen() {
  const navigation = useNavigation<Nav>();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');

  const select = (id: string) => { setSelected(id); setError(''); };

  const continueNext = async () => {
    if (!selected) { setError('Please select a category'); return; }
    // sessionStorage -> AsyncStorage
    await AsyncStorage.setItem('signup_category', selected);
    navigation.navigate('SelectPlan');
  };

  return (
    <View style={s.screen}>
      <View style={s.card}>
        {/* logo.svg needs react-native-svg + react-native-svg-transformer configured to `require` directly; text fallback until then */}
        <Text style={s.logoText}>EOS</Text>
        <Text style={s.h1}>Choose your category</Text>
        <Text style={s.sub}>Select the program you'd like to join</Text>

        <View style={{ gap: 12, marginTop: 8 }}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[s.catCard, selected === c.id && s.catCardActive]}
              onPress={() => select(c.id)}
            >
              <Text style={s.catName}>{c.name}</Text>
              <Text style={s.catDesc}>{c.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity style={s.submit} onPress={continueNext}>
          <Text style={s.submitText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 380, gap: 6 },
  logoText: { color: colors.gold, fontSize: 20, fontWeight: '700', marginBottom: 16, alignSelf: 'center', letterSpacing: 1 },
  h1: { fontSize: 24, fontWeight: '400', color: colors.white },
  sub: { fontSize: 13.5, color: colors.gray, marginBottom: 6 },
  catCard: { padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.charcoal, gap: 4 },
  catCardActive: { borderColor: colors.goldLight, backgroundColor: 'rgba(212,175,55,0.08)' },
  catName: { color: colors.white, fontWeight: '600', fontSize: 16 },
  catDesc: { color: colors.gray, fontSize: 13.5 },
  error: { color: '#e0355a', fontSize: 11.5, marginTop: 8 },
  submit: { marginTop: 16, backgroundColor: colors.gold, borderRadius: 13, padding: 13, alignItems: 'center' },
  submitText: { color: colors.black, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
});
