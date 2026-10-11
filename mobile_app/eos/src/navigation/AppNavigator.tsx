import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import HomeScreen from '../screens/HomeScreen';
import SplashScreen from '../screens/SplashScreen';
import PlanScreen from '../screens/PlanScreen';
import PendingScreen from '../screens/PendingScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Terms: undefined;
  Privacy: undefined;
  SelectPlan: undefined;
  Pending: undefined;
  Dashboard: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}

// Authenticated but not yet through onboarding: phone not verified, no plan
// picked yet, or still waiting on admin approval. Which screen shows first
// depends on user.status (set by the backend at each step).
function OnboardingStack({ initialRouteName }: { initialRouteName: 'SelectPlan' | 'Pending' }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="SelectPlan" component={PlanScreen} />
      <Stack.Screen name="Pending" component={PendingScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function RootSwitch() {
  const { accessToken, user, loading } = useAuth();

  if (loading) return <SplashScreen />;
  if (!accessToken) return <AuthStack />;

  if (user?.status === 'pending_category') return <OnboardingStack initialRouteName="SelectPlan" />;
  if (user?.status === 'pending_approval') return <OnboardingStack initialRouteName="Pending" />;
  return <MainStack />;
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootSwitch />
      </NavigationContainer>
    </AuthProvider>
  );
}
