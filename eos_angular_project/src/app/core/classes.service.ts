import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClassesService {
  constructor(private http: HttpClient) {}

  listClasses(from: Date, to: Date): Promise<any[]> {
    const q = `?from=${from.toISOString()}&to=${to.toISOString()}`;
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/classes${q}`));
  }

  myBookings(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/classes/bookings`));
  }

  book(classId: number): Promise<any> {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/classes/${classId}/book`, {}));
  }

  cancelBooking(classId: number): Promise<any> {
    return firstValueFrom(this.http.delete(`${environment.apiUrl}/classes/${classId}/book`));
  }

  getDashboardHome(): Promise<any> {
    return firstValueFrom(this.http.get(`${environment.apiUrl}/dashboard/home`));
  }

  listPosters(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/content/posters`));
  }

  listTrainers(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/trainers`));
  }

  myNotifications(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/content/my-notifications`));
  }

  markNotificationsRead(): Promise<any> {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/content/my-notifications/read`, {}));
  }

  listNotifications(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${environment.apiUrl}/content/notifications`));
  }
}
