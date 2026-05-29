import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, CommonModule, TopbarComponent],
  template: `
    <div style="min-height:100vh; background:var(--background);">
      <app-topbar
        variant="client"
        title="AndidaTour"
        subtitle="Área do cliente"
        [userName]="auth.userName()"
        [showWelcome]="isHome"
        [welcomeText]="welcomeText"
        (logoutClick)="logout()"
      ></app-topbar>

      <router-outlet />
    </div>

    <app-toast />
  `
})
export class ClientLayoutComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  get isHome() {
    return this.router.url.includes('/cliente/home');
  }

  get welcomeText() {
    return 'Acompanhe suas solicitações de cotação e envie novas viagens para o agente.';
  }

  logout() {
    this.auth.logout();
  }
}