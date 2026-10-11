import client from './client';

export const dashboardApi = {
  getHome: () => client.get('/dashboard/home'),
  listClasses: (from?: string, to?: string) => client.get('/classes', { params: { from, to } }),
  bookClass: (id: string) => client.post(`/classes/${id}/book`),
  listTrainers: () => client.get('/trainers'),
  listAnnouncements: () => client.get('/announcements'),
  listNotifications: () => client.get('/notifications'),
  markAllRead: () => client.patch('/notifications/read-all'),
};
