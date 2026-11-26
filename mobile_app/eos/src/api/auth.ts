import client from './client';

export type RegisterData = {
  name: string; email: string; phone: string; password: string;
  // onboarding answers (all optional)
  gender?: string; age?: number; height_cm?: number; weight_kg?: number;
  goals?: string[]; experience?: string; days_per_week?: number;
};

export const authApi = {
  register: (data: RegisterData) =>
    client.post('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }).then((r) => r.data), // { accessToken, user }

  me: () => client.get('/auth/me').then((r) => r.data),

  getPlans: () => client.get('/auth/plans').then((r) => r.data),

  setSubscription: (category: string, planId: number) =>
    client.post('/auth/subscription', { category, planId }).then((r) => r.data),
};
