import client from './client';

export const authApi = {
  register: (name: string, email: string, phone: string, password: string) =>
    client.post('/auth/register', { name, email, phone, password }).then((r) => r.data),

  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }).then((r) => r.data), // { accessToken, user }

  sendOtp: (phone?: string) =>
    client.post('/auth/send-otp', phone ? { phone } : {}).then((r) => r.data),

  verifyOtp: (code: string) =>
    client.post('/auth/verify-otp', { code }).then((r) => r.data),

  me: () => client.get('/auth/me').then((r) => r.data),

  getPlans: () => client.get('/auth/plans').then((r) => r.data),

  setSubscription: (category: string, planId: number) =>
    client.post('/auth/subscription', { category, planId }).then((r) => r.data),
};
