import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

const base = () => `${environment.apiUrl}/admin`;
const KEY = 'eos_admin_session';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  // Token lives in sessionStorage so a page refresh doesn't kick you out of the dashboard.
  private get token(): string | null { try { return sessionStorage.getItem(KEY); } catch { return null; } }
  setAdminToken(t: string) { try { sessionStorage.setItem(KEY, t); } catch {} }
  hasAdminToken() { return !!this.token; }
  private h() { return new HttpHeaders(this.token ? { 'X-Admin-Session': this.token } : {}); }

  checkGateCode(code: string) {
    return firstValueFrom(this.http.get<{ ok: boolean }>(`${environment.apiUrl}/admin-gate/check/${code}`));
  }
  async verifyGate(data: { code: string; username: string; password: string }) {
    const res = await firstValueFrom(this.http.post<{ ok: boolean; adminToken: string }>(`${environment.apiUrl}/admin-gate/verify`, data));
    if (res.adminToken) this.setAdminToken(res.adminToken);
    return res;
  }
  async logout() {
    try { await firstValueFrom(this.http.post(`${environment.apiUrl}/admin-gate/logout`, {}, { headers: this.h() })); } catch {}
    try { sessionStorage.removeItem(KEY); } catch {}
  }

  stats() { return firstValueFrom(this.http.get<any>(`${base()}/stats`, { headers: this.h() })); }
  list(r: string) { return firstValueFrom(this.http.get<any[]>(`${base()}/${r}`, { headers: this.h() })); }
  create(r: string, d: any) { return firstValueFrom(this.http.post<any>(`${base()}/${r}`, this.body(d), { headers: this.h() })); }
  update(r: string, id: number, d: any) { return firstValueFrom(this.http.put<any>(`${base()}/${r}/${id}`, this.body(d), { headers: this.h() })); }
  remove(r: string, id: number) { return firstValueFrom(this.http.delete<any>(`${base()}/${r}/${id}`, { headers: this.h() })); }

  pendingApprovals() { return this.list('pending-approvals'); }
  approveUser(id: number) { return firstValueFrom(this.http.post<any>(`${base()}/users/${id}/approve`, {}, { headers: this.h() })); }
  rejectUser(id: number) { return firstValueFrom(this.http.post<any>(`${base()}/users/${id}/reject`, {}, { headers: this.h() })); }
  resetPassword(id: number, password: string) { return firstValueFrom(this.http.post<any>(`${base()}/users/${id}/reset-password`, { password }, { headers: this.h() })); }
  orderItems(id: number) { return this.list(`orders/${id}/items`); }
  send(data: any) { return firstValueFrom(this.http.post<{ sent: number; feed: boolean }>(`${base()}/notifications/send`, this.body(data), { headers: this.h() })); }

  // multipart automatically when a field holds a File
  private body(data: any): any {
    if (!Object.values(data || {}).some(v => v instanceof File)) return data;
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v as any); });
    return fd;
  }
}
