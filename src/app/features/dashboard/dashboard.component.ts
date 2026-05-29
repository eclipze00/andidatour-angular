import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { QuoteResponse, QuoteService } from '../../core/services/quote.service';
import { AlertService } from '../../core/services/alert.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TopbarComponent],
  template: `
    <div class="dashboard-topbar-wrapper">
      <app-topbar
        [title]="'Olá, ' + userName"
        subtitle="Aqui está o resumo das suas cotações hoje."
      />

      <button
        type="button"
        class="dashboard-logout-button"
        (click)="logout()"
      >
        <span class="dashboard-logout-avatar">
          {{ userInitial }}
        </span>

        <span class="dashboard-logout-text">
          Sair
        </span>
      </button>
    </div>
    <main class="flex-1 p-4 md:p-8 space-y-8">

      <div class="rounded-2xl overflow-hidden bg-brand-gradient text-white shadow-card p-6 md:p-8 grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">✨ Busca rápida</span>
          <h2 class="mt-3 font-display text-2xl md:text-3xl font-semibold leading-tight">Para onde seu cliente quer voar?</h2>
          <p class="mt-1 text-sm text-white/80">Cote em segundos e gere uma proposta elegante.</p>
          <div class="mt-5 flex flex-col sm:flex-row gap-2">
            <input placeholder="Origem (ex: GRU)" class="search-input" />
            <input placeholder="Destino (ex: LIS)" class="search-input" />
            <a routerLink="/app/nova-cotacao">
              <button class="h-11 px-5 rounded-lg font-semibold text-sm" style="background:var(--teal); color:var(--brand-deep)">Buscar →</button>
            </a>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style="background:oklch(0.48 0.15 255 / 0.1); color:var(--brand)">🔍</div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">total</span>
          </div>
          <div class="mt-4 font-display text-2xl font-semibold">{{ quotes.length }}</div>
          <div class="text-sm" style="color:var(--muted-foreground)">Cotações realizadas</div>
        </div>
        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style="background:oklch(0.5 0.16 155 / 0.15); color:var(--success)">✅</div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">aprovadas</span>
          </div>
          <div class="mt-4 font-display text-2xl font-semibold">{{ approvedCount }}</div>
          <div class="text-sm" style="color:var(--muted-foreground)">Propostas aprovadas</div>
        </div>
        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style="background:oklch(0.72 0.12 185 / 0.15); color:var(--teal)">💰</div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">melhor</span>
          </div>
          <div class="mt-4 font-display text-2xl font-semibold">{{ bestPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</div>
          <div class="text-sm" style="color:var(--muted-foreground)">Melhor cotação</div>
        </div>
        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div class="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style="background:oklch(0.75 0.14 80 / 0.15); color:var(--warning-foreground)">🔔</div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">ativos</span>
          </div>
          <div class="mt-4 font-display text-2xl font-semibold">{{ activeAlerts }}</div>
          <div class="text-sm" style="color:var(--muted-foreground)">Alertas de preço ativos</div>
        </div>
      </div>

      <div class="rounded-2xl border p-6 shadow-soft" style="background:var(--card); border-color:var(--border)">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-display text-lg font-semibold">Últimas cotações</h3>
            <p class="text-xs" style="color:var(--muted-foreground)">Acompanhe o status das suas propostas recentes.</p>
          </div>
          <a routerLink="/app/historico" class="text-sm font-medium hover:underline" style="color:var(--brand)">Ver tudo ↗</a>
        </div>

        <div *ngIf="loading" class="space-y-3">
          <div *ngFor="let i of [0,1,2]" class="h-14 rounded-xl animate-pulse" style="background:var(--accent)"></div>
        </div>

        <div *ngIf="!loading && quotes.length === 0" class="py-8 text-center">
          <div class="text-3xl mb-2">📋</div>
          <div class="text-sm" style="color:var(--muted-foreground)">Nenhuma cotação ainda.</div>
          <a routerLink="/app/nova-cotacao" class="mt-3 inline-block text-sm font-medium hover:underline" style="color:var(--brand)">Fazer primeira cotação →</a>
        </div>

        <div *ngIf="!loading" class="divide-y" style="border-color:var(--border)">
          <div *ngFor="let q of quotes.slice(0, 5)" class="flex items-center justify-between py-3.5">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl flex items-center justify-center" style="background:var(--accent)">✈</div>
              <div>
                <div class="font-medium">{{ q.clientName }}</div>
                <div class="text-xs" style="color:var(--muted-foreground)">{{ q.from }} → {{ q.to }} · {{ q.travelDate | date:'dd/MM/yyyy' }}</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <div class="font-semibold">{{ q.bestPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</div>
                <div class="text-[11px]" style="color:var(--muted-foreground)">melhor opção</div>
              </div>
              <span class="text-xs px-2 py-1 rounded-full border capitalize" [class]="getStatusClass(q.status)">{{ q.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .dashboard-topbar-wrapper {
      position: relative;
    }

    .dashboard-logout-button {
      position: absolute;
      top: 50%;
      right: 2rem;
      transform: translateY(-50%);
      height: 38px;
      padding: 0.25rem 0.85rem 0.25rem 0.35rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--card);
      color: var(--foreground);
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 20px oklch(0 0 0 / 0.04);
      transition:
        transform 0.18s ease,
        background 0.18s ease,
        border-color 0.18s ease,
        box-shadow 0.18s ease;
    }

    .dashboard-logout-button:hover {
      transform: translateY(calc(-50% - 1px));
      background: var(--accent);
      border-color: color-mix(in oklch, var(--brand) 35%, var(--border));
      box-shadow: 0 12px 26px oklch(0 0 0 / 0.08);
    }

    .dashboard-logout-button:active {
      transform: translateY(-50%);
    }

    .dashboard-logout-avatar {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      font-size: 0.75rem;
      font-weight: 800;
    }

    .dashboard-logout-text {
      line-height: 1;
    }

    .search-input {
      height: 2.75rem;
      border-radius: var(--radius);
      border: 0;
      padding: 0 0.75rem;
      font-size: 0.875rem;
      background: rgba(255,255,255,0.95);
      color: var(--foreground);
      outline: none;
    }

    @media (max-width: 640px) {
      .dashboard-logout-button {
        right: 1rem;
        padding-right: 0.35rem;
      }

      .dashboard-logout-text {
        display: none;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  quotes: QuoteResponse[] = [];
  loading = false;
  activeAlerts = 0;
  private sub!: Subscription;

  get userName() { return this.auth.userName(); }
  get approvedCount() { return this.quotes.filter(q => q.status === 'aprovada').length; }
  get bestPrice() {
    if (!this.quotes.length) return 0;
    return Math.min(...this.quotes.map(q => q.bestPrice));
  }

  get userInitial() {
    return this.userName?.trim()?.charAt(0)?.toUpperCase() || 'U';
  }

  constructor(
    private quoteService: QuoteService,
    private alertService: AlertService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadData();
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.loadData());
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  loadData() {
    this.loading = true;
    this.quoteService.getAll().subscribe({
      next: d => { 
        this.quotes = d; this.loading = false; this.cdr.detectChanges(); },
      error: () => { 
        this.loading = false; 
        this.cdr.detectChanges(); 
        this.toast.error('Erro ao carregar cotações.'); 
      }
    });
    this.alertService.getAll().subscribe({
      next: d => { this.activeAlerts = d.filter((a: any) => a.active).length; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      aprovada: 'bg-green-50 text-green-700 border-green-200',
      enviada: 'bg-blue-50 text-blue-700 border-blue-200',
      rascunho: 'bg-gray-50 text-gray-500 border-gray-200',
      expirada: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      cancelada: 'bg-red-50 text-red-600 border-red-200',
    };
    return map[status] ?? '';
  }

  logout() {
    this.auth.logout();
    this.toast.success('Sessão encerrada.');
    this.router.navigate(['/login']);
  }
}