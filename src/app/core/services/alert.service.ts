import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PriceAlert } from '../../models';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly apiUrl = 'http://localhost:5075/api/alerts';
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<PriceAlert[]>(this.apiUrl); }
  create(alert: Partial<PriceAlert>) { return this.http.post<PriceAlert>(this.apiUrl, alert); }
  toggle(id: string) { return this.http.patch(`${this.apiUrl}/${id}/toggle`, {}); }
}
