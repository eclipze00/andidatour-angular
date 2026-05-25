import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem { title: string; url: string; icon: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="w-64 min-h-screen border-r flex flex-col py-5 px-3" style="background:var(--card); border-color:var(--border)">
      <!-- Logo -->
      <div class="flex items-center gap-2.5 px-3 mb-8">
        <div class="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-soft">
          <span class="text-white font-bold text-sm rotate-[-45deg]">✈</span>
        </div>
        <div>
          <div class="font-display text-lg font-semibold" style="color:var(--foreground)">AndidaTour</div>
          <div class="text-[11px] uppercase tracking-wider" style="color:var(--muted-foreground)">Travel Intelligence</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1">
        <a *ngFor="let item of navItems"
           [routerLink]="item.url"
           routerLinkActive="active-nav"
           [routerLinkActiveOptions]="{ exact: item.url === '/app/dashboard' }"
           class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-accent"
           style="color:var(--foreground)">
          <span class="text-base">{{ item.icon }}</span>
          {{ item.title }}
        </a>
      </nav>

      <!-- Footer -->
      <div class="mt-4 rounded-xl p-3" style="background:var(--accent)">
        <div class="text-xs font-medium" style="color:var(--brand)">Plano Premium</div>
        <div class="mt-1 text-[11px]" style="color:var(--muted-foreground)">Cotações ilimitadas e APIs reais conectadas.</div>
      </div>
    </aside>

    <style>
      .active-nav { background: var(--accent); color: var(--brand) !important; font-weight: 500; }
    </style>
  `
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { title: 'Dashboard', url: '/app/dashboard', icon: '⊞' },
    { title: 'Nova cotação', url: '/app/nova-cotacao', icon: '🔍' },
    { title: 'Histórico', url: '/app/historico', icon: '📋' },
    { title: 'Propostas', url: '/app/propostas', icon: '📄' },
    { title: 'Clientes', url: '/app/clientes', icon: '👥' },
    { title: 'Alertas de preço', url: '/app/alertas', icon: '🔔' },
    { title: 'Integrações', url: '/app/configuracoes', icon: '⚙️' },
  ];
}