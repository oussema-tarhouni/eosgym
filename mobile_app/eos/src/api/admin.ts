import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let adminToken: string | null = null;
AsyncStorage.getItem('adminToken').then((t) => {
  adminToken = t;
});

export function hasAdminToken() {
  return !!adminToken;
}

function adminHeaders() {
  return adminToken ? { 'X-Admin-Token': adminToken } : {};
}

interface GatePayload {
  code: string;
  username: string;
  dbUsername: string;
  dbPassword: string;
  password: string;
}

export const adminApi = {
  verifyGate: async (payload: GatePayload) => {
    const { data } = await client.post('/admin/gate', payload);
    adminToken = data.token;
    await AsyncStorage.setItem('adminToken', data.token);
    return data;
  },

  list: (resource: string) =>
    client.get(`/admin/${resource}`, { headers: adminHeaders() }).then((r) => r.data),

  create: (resource: string, body: any) =>
    client.post(`/admin/${resource}`, body, { headers: adminHeaders() }).then((r) => r.data),

  update: (resource: string, id: number, body: any) =>
    client.put(`/admin/${resource}/${id}`, body, { headers: adminHeaders() }).then((r) => r.data),

  remove: (resource: string, id: number) =>
    client.delete(`/admin/${resource}/${id}`, { headers: adminHeaders() }).then((r) => r.data),

  stats: () => client.get('/admin/stats', { headers: adminHeaders() }).then((r) => r.data),

  logout: async () => {
    adminToken = null;
    await AsyncStorage.removeItem('adminToken');
  },
};
