import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../models';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly apiUrl = 'http://localhost:5075/api/clients';
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Client[]>(this.apiUrl); }
  create(client: Partial<Client>) { return this.http.post<Client>(this.apiUrl, client); }
}