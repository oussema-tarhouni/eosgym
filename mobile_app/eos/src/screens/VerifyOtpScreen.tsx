import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'VerifyOtp'>;
type R = RouteProp<RootStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { me } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (code.length < 4) return;
    setError('');
    setLoading(true);
    try {
      await authApi.verifyOtp(code);
      // Refresh the user so phone_verified flips to true — AppNavigator's
      // RootSwitch reads that and advances to plan selection on its own.
      await me();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid code, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.screen}>
      <Text style={s.h1}>Verify your number</Text>
      <Text style={s.sub}>Enter the code we sent to {params.phone}</Text>
      {!!error && <Text style={s.error}>{error}</Text>}
      <TextInput
        style={s.input}
        value={code}
        onChangeText={setCode}
        placeholder="••••"
        placeholderTextColor={colors.grayDim}
        keyboardType="numeric"
        maxLength={6}
      />
      <TouchableOpacity style={s.submit} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.black} /> : <Text style={s.submitText}>Verify</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 80, gap: 16 },
  h1: { color: colors.white, fontSize: 22, fontWeight: '700' },
  sub: { color: colors.gray, fontSize: 13.5 },
  error: { color: '#e5484d', fontSize: 13 },
  input: { backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.line, borderRadius: 999, padding: 14, color: colors.white, fontSize: 18, letterSpacing: 6, textAlign: 'center' },
  submit: { backgroundColor: colors.gold, borderRadius: 999, padding: 15, alignItems: 'center' },
  submitText: { color: colors.black, fontWeight: '700', textTransform: 'uppercase' },
});
