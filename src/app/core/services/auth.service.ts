import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  name: string;
  userId: number;
  role: string;  
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:5075/api/auth';

  userName = signal<string>('');
  userId = signal<number>(0);
  role = signal<string>('');
  isLoggedIn = signal<boolean>(false);

  get isAdmin()  { return this.role() === 'admin'; }
  get isClient() { return this.role() === 'client'; }

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const name  = localStorage.getItem('userName');
      const uid   = localStorage.getItem('userId');
      const role  = localStorage.getItem('role');

      if (token && !this.isTokenExpired(token)) {
        this.isLoggedIn.set(true);
        this.userName.set(name ?? '');
        this.userId.set(Number(uid ?? 0));
        this.role.set(role ?? '');
      } else if (token) {
        // Token expirado — limpa tudo
        this.clearStorage();
      }
    }
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  register(data: { firstName: string; lastName: string; email: string; password: string; role?: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  logout() {
    this.clearStorage();
    this.isLoggedIn.set(false);
    this.userName.set('');
    this.userId.set(0);
    this.role.set('');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private handleAuthResponse(res: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('userName', res.name);
      localStorage.setItem('userId', res.userId.toString());
      localStorage.setItem('role', res.role);
      this.role.set(res.role);

      // Salva quando expira para verificar depois
      const expiresAt = Date.now() + res.expiresIn * 1000;
      localStorage.setItem('expiresAt', expiresAt.toString());
    }
    this.isLoggedIn.set(true);
    this.userName.set(res.name);
    this.userId.set(res.userId);
    this.role.set(res.role);
  }

  private isTokenExpired(token: string): boolean {
    try {
      // Decodifica o payload do JWT (parte do meio)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private clearStorage() {
    if (isPlatformBrowser(this.platformId)) {
      ['token', 'userName', 'userId', 'role', 'expiresAt'].forEach(k => localStorage.removeItem(k));
    }
  }
}