import client from './client';

export const classesApi = {
  list: (from?: string, to?: string) => client.get('/classes', { params: { from, to } }),
  book: (id: number | string) => client.post(`/classes/${id}/book`),
  cancelBooking: (id: number | string) => client.delete(`/classes/${id}/book`),
  myBookings: () => client.get('/classes/bookings'),
};
