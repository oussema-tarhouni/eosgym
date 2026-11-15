import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/dark';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  AuthShell, AuthHeader, Field, EyeToggle, ErrorBanner, Checkbox, PrimaryButton, Footer, Enter, linkStyle,
} from '../components/AuthUI';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('remember_email').then((v) => {
      if (v) { setEmail(v); setRemember(true); }
    });
  }, []);

  const submit = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    if (remember) await AsyncStorage.setItem('remember_email', email);
    else await AsyncStorage.removeItem('remember_email');
    try {
      await login(email, password);
    } catch (err: any) {
      if (!err?.response) {
        setError('Cannot reach the server — check the console for a network/CORS error.');
      } else {
        setError(err.response.data?.error || `Server error (${err.response.status})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome'))}>
      <AuthHeader title="Welcome back" sub="Please enter your details." />

      <Enter i={1} style={{ gap: 14 }}>
        {!!error && <ErrorBanner text={error} />}
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field
          label="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPw}
          right={<EyeToggle show={showPw} onToggle={() => setShowPw((v) => !v)} />}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => setRemember((v) => !v)}>
            <Checkbox value={remember} onChange={setRemember} />
            <Text style={{ color: colors.gray, fontSize: 13.5 }}>Remember me</Text>
          </Pressable>
          <Text style={linkStyle} onPress={() => navigation.navigate('ForgotPassword')}>Forgot password</Text>
        </View>
      </Enter>

      <Enter i={2}>
        <PrimaryButton label="Sign in" onPress={submit} loading={loading} />
      </Enter>

      <Enter i={3}>
        <Footer text="Don't have an account?" link="Sign up" onPress={() => navigation.navigate('Signup')} />
      </Enter>
    </AuthShell>
  );
}
