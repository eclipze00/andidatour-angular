import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FlightOption, Airport, Airline } from '../../models';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly apiUrl = 'http://localhost:5075/api/flights';

  constructor(private http: HttpClient) {}

  search(from: string, to: string, cabin: string) {
    return this.http.get<FlightOption[]>(`${this.apiUrl}/search`, {
      params: { from, to, cabin }
    });
  }

  getAirports() { return this.http.get<Airport[]>(`${this.apiUrl}/airports`); }
  getAirlines() { return this.http.get<Airline[]>(`${this.apiUrl}/airlines`); }
}