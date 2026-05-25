import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlightOption } from '../../models';

export interface QuoteResponse {
  id: number;
  clientName: string;
  from: string;
  to: string;
  travelDate: string;
  bestPrice: number;
  status: string;
  createdAt: string;
  flightDataJson?: string;
}

export interface CreateQuotePayload {
  fromCode: string;
  toCode: string;
  travelDate: string;
  bestPrice: number;
  clientId: number;
  flightDataJson?: string;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly apiUrl = 'http://localhost:5075/api/quotes';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<QuoteResponse[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<QuoteResponse>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateQuotePayload) {
    return this.http.post<QuoteResponse>(this.apiUrl, payload);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Serializa o FlightOption para salvar no banco
  serializeFlight(flight: FlightOption): string {
    return JSON.stringify(flight);
  }

  // Deserializa de volta para FlightOption
  deserializeFlight(json: string): FlightOption {
    return JSON.parse(json);
  }
}