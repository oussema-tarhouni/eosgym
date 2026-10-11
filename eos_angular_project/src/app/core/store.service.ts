import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private base = `${environment.apiUrl}/store`;

  constructor(private http: HttpClient) {}

  listProducts(category?: string): Promise<any[]> {
    const url = category && category !== 'all' ? `${this.base}/products?category=${encodeURIComponent(category)}` : `${this.base}/products`;
    return firstValueFrom(this.http.get<any[]>(url));
  }

  checkout(items: { product_id: number; quantity: number }[]): Promise<any> {
    return firstValueFrom(this.http.post(`${this.base}/orders`, { items }));
  }

  myOrders(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.base}/orders/mine`));
  }
}
