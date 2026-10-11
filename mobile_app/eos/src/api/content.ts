import client from './client';

export const contentApi = {
  listPosters: () => client.get('/content/posters'),
  listNotifications: () => client.get('/content/notifications'),
};
