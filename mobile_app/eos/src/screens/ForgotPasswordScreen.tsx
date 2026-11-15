import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/dark';
import {
  AuthShell, AuthHeader, Field, ErrorBanner, PrimaryButton, CodeInput, linkStyle,
} from '../components/AuthUI';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

// ⚠️ UI only: connect these two to your real reset endpoints.
// Until then they throw, so the screen shows an error instead of pretending it worked.
const sendCode = async (email: string) => {
  // await api.post('/auth/forgot-password', { email });
  throw new Error('Connect your reset API in sendCode()');
};
const verifyCode = async (email: string, code: string) => {
  // await api.post('/auth/verify-code', { email, code });
  // then navigate to your reset-password screen
  throw new Error('Connect your reset API in verifyCode()');
};

const errMsg = (e: any) => e?.response?.data?.error || e?.message || 'Something went wrong';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setLoading(true);
    try { await fn(); } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  };

  const send = () => email && run(async () => {
    await sendCode(email);
    setCode('');
    setLeft(30);
    setStep('code');
  });
  const verify = () => code.length === 4 && run(() => verifyCode(email, code));
  const resend = () => left === 0 && run(async () => { await sendCode(email); setLeft(30); });

  const onBack = () => (step === 'code' ? (setError(''), setStep('email')) : navigation.goBack());

  return (
    <AuthShell onBack={onBack}>
      {step === 'email' ? (
        <Animated.View key="email" entering={FadeInRight.duration(350)} exiting={FadeOutLeft.duration(200)} style={{ gap: 22 }}>
          <AuthHeader
            icon="lock"
            title="Forgot Password?"
            sub="Don't worry! Enter the address associated with your account and we'll send you reset instructions."
          />
          {!!error && <ErrorBanner text={error} />}
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <PrimaryButton label="Send" onPress={send} loading={loading} />
        </Animated.View>
      ) : (
        <Animated.View key="code" entering={FadeInRight.duration(350)} exiting={FadeOutLeft.duration(200)} style={{ gap: 22 }}>
          <AuthHeader
            icon="mail"
            tone="green"
            title="Check your email"
            sub={<>We sent a 4 digit code to{'\n'}<Text style={{ fontWeight: '700', color: colors.white }}>{email}</Text></>}
          />
          {!!error && <ErrorBanner text={error} />}
          <CodeInput value={code} onChange={setCode} />
          <PrimaryButton label="Verify" onPress={verify} loading={loading} />
          <Text style={{ textAlign: 'center', color: colors.gray, fontSize: 13.5 }}>
            Didn't receive the email?{' '}
            <Text style={[linkStyle, left > 0 && { color: colors.grayDim }]} onPress={resend}>
              {left > 0 ? `Resend (${left})` : 'Resend'}
            </Text>
          </Text>
        </Animated.View>
      )}
    </AuthShell>
  );
}
