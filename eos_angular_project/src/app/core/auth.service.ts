import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// TODO: point this at your real API base (e.g. environment.apiUrl) if you have
// an environments/ setup — I don't have that file so I couldn't confirm it.
const API_BASE = 'http://localhost:3000/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role?: string;
  status?: string;                 // 'pending_category' | 'pending_approval' | 'approved' | 'rejected'
  preferred_category?: string | null;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  accessToken: string | null = null;
  currentUser: AuthUser | null = null;

  constructor(private http: HttpClient) {}

  async register(name: string, email: string, phone: string, password: string): Promise<AuthResponse> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${API_BASE}/auth/register`, { name, email, phone, password }, { withCredentials: true })
    );
    this.accessToken = res.token;
    this.currentUser = res.user;
    return res;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${API_BASE}/auth/login`, { email, password }, { withCredentials: true })
    );
    this.accessToken = res.token;
    this.currentUser = res.user;
    return res;
  }

  async me(): Promise<AuthUser> {
    const res = await firstValueFrom(this.http.get<AuthUser>(`${API_BASE}/auth/me`));
    this.currentUser = res;
    return res;
  }

  async sendOtp(): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${API_BASE}/auth/send-otp`, {}));
  }

  async verifyOtp(code: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${API_BASE}/auth/verify-otp`, { code }));
  }

  // CHANGED — category/plan flow
  async getPlans(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${API_BASE}/auth/plans`));
  }

  async setSubscription(category: string, planId: number): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${API_BASE}/auth/subscription`, { category, planId }));
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${API_BASE}/auth/forgot-password`, { email }));
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${API_BASE}/auth/reset-password`, { token, password, newPassword: password }));
  }

  async refresh(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ token: string }>(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
      );
      this.accessToken = res.token;
      return true;
    } catch {
      this.accessToken = null;
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true }));
    } finally {
      this.accessToken = null;
      this.currentUser = null;
    }
  }
}
