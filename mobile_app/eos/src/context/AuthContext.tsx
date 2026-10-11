import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';

type User = { id: string; name: string; email: string; phone?: string; level?: string; status?: string; phone_verified?: boolean } | null;

type AuthContextType = {
  user: User;
  accessToken: string | null;
  loading: boolean; // true while restoring session on app boot
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  me: () => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'user']);
    setAccessToken(null);
    setUser(null);
  };

  // Fetches the full profile (e.g. level, which login/register responses may omit or have stale)
  const refreshUser = async (): Promise<User> => {
    try {
      const res = await authApi.me();
      const body = res?.data ?? res;
      const fresh = body?.data ?? body;
      if (fresh) {
        await AsyncStorage.setItem('user', JSON.stringify(fresh));
        setUser(fresh);
      }
      return fresh ?? null;
    } catch (err: any) {
      console.log('REFRESH USER ERROR:', err);
      if (err?.response?.status === 401) await clearSession(); // invalid/expired token -> back to Login
      return null;
    }
  };

  // Alias used by screens that need the freshly-fetched user value directly
  // (e.g. polling for approval status), not just the side-effect of updating context state.
  const me = refreshUser;

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const [token, rawUser] = await Promise.all([
          AsyncStorage.getItem('accessToken'),
          AsyncStorage.getItem('user'),
        ]);
        if (token) setAccessToken(token);
        if (rawUser) setUser(JSON.parse(rawUser));
        if (token) await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (token: string, userData: User) => {
    await AsyncStorage.multiSet([
      ['accessToken', token],
      ['user', JSON.stringify(userData)],
    ]);
    setAccessToken(token); // AppNavigator watches this to switch to the Home stack
    setUser(userData);
  };

  // Pulls token/user out of whatever shape authApi returns (raw object, or
  // axios-style { data: {...} }, sometimes nested one level deeper as data.data).
  const unwrap = (res: any) => {
    const body = res?.data ?? res;
    const payload = body?.data ?? body;
    const token = payload?.accessToken || payload?.token || payload?.access_token;
    const userData = payload?.user || payload?.member || null;
    if (!token) console.log('AUTH RESPONSE (unexpected shape):', JSON.stringify(res));
    return { token, userData };
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token, userData } = unwrap(res);
    if (!token) throw new Error('No accessToken in login response — check console log above.');
    await persist(token, userData);
    await refreshUser();
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await authApi.register(name, email, phone, password);
    const { token, userData } = unwrap(res);
    if (!token) throw new Error('No accessToken in register response — check console log above.');
    await persist(token, userData);
    await refreshUser();
  };

  const logout = async () => {
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, refreshUser, me }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
