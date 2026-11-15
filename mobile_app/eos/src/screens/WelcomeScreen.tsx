import React from 'react';
import { Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { AuthShell, AuthHeader, PrimaryButton, Enter, ui } from '../components/AuthUI';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <AuthShell>
      <AuthHeader title="Welcome to EOS" sub="Book classes, track your progress and stay on top of your fitness." />
      <Enter i={1} style={{ gap: 12 }}>
        <PrimaryButton label="Create account" onPress={() => navigation.navigate('Signup')} />
        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={({ pressed }) => ({
            height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
            backgroundColor: ui.fill, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.charcoal, fontSize: 16, fontWeight: '700' }}>Log in</Text>
        </Pressable>
      </Enter>
    </AuthShell>
  );
}
