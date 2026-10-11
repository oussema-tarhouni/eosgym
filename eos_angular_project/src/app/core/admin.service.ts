import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

const base = () => `${environment.apiUrl}/admin`;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private adminToken: string | null = null;

  constructor(private http: HttpClient) {}

  setAdminToken(token: string) { this.adminToken = token; }
  hasAdminToken() { return !!this.adminToken; }

  private headers() {
    return new HttpHeaders(this.adminToken ? { 'X-Admin-Session': this.adminToken } : {});
  }

  checkGateCode(code: string) {
    return firstValueFrom(this.http.get<{ ok: boolean }>(`${environment.apiUrl}/admin-gate/check/${code}`));
  }

  async verifyGate(data: { code: string; username: string; dbUsername: string; dbPassword: string; password: string }) {
    const res = await firstValueFrom(
      this.http.post<{ ok: boolean; adminToken: string }>(`${environment.apiUrl}/admin-gate/verify`, data)
    );
    if (res.adminToken) this.setAdminToken(res.adminToken);
    return res;
  }

  stats() { return firstValueFrom(this.http.get<any>(`${base()}/stats`, { headers: this.headers() })); }
  list(resource: string) { return firstValueFrom(this.http.get<any[]>(`${base()}/${resource}`, { headers: this.headers() })); }
  create(resource: string, data: any) { return firstValueFrom(this.http.post<any>(`${base()}/${resource}`, this.toBody(data), { headers: this.headers() })); }
  update(resource: string, id: number, data: any) { return firstValueFrom(this.http.put<any>(`${base()}/${resource}/${id}`, this.toBody(data), { headers: this.headers() })); }
  remove(resource: string, id: number) { return firstValueFrom(this.http.delete<any>(`${base()}/${resource}/${id}`, { headers: this.headers() })); }

  // Switches to multipart/form-data automatically when a field holds a File (e.g. poster/notification images).
  // Angular sets the multipart boundary header itself, so leave headers() untouched.
  private toBody(data: any): any {
    const hasFile = Object.values(data || {}).some(v => v instanceof File);
    if (!hasFile) return data;
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v as any);
    });
    return fd;
  }

  pendingApprovals() { return firstValueFrom(this.http.get<any[]>(`${base()}/pending-approvals`, { headers: this.headers() })); }
  approveUser(id: number) { return firstValueFrom(this.http.post<any>(`${base()}/users/${id}/approve`, {}, { headers: this.headers() })); }
  rejectUser(id: number) { return firstValueFrom(this.http.post<any>(`${base()}/users/${id}/reject`, {}, { headers: this.headers() })); }
}
