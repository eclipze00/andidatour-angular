import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

interface QuoteRequest {
  id: number;
  fromCode: string;
  toCode: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: string;
  cabinClass: string;
  notes?: string;
  status: string;
  adminPrice?: number;
  adminNotes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="flex-1 p-4 md:p-8 space-y-8">

      <!-- Hero -->
      <div class="rounded-2xl overflow-hidden bg-brand-gradient text-white shadow-card p-6 md:p-8 grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            ✈️ Área do cliente
          </span>

          <h2 class="mt-3 font-display text-2xl md:text-3xl font-semibold leading-tight">
            Precisa de uma nova cotação?
          </h2>

          <p class="mt-1 text-sm text-white/80">
            Envie sua solicitação para o agente e acompanhe cada etapa por aqui.
          </p>

          <div class="mt-5 flex flex-col sm:flex-row gap-2">
            <a routerLink="/cliente/nova-solicitacao">
              <button
                class="h-11 px-5 rounded-lg font-semibold text-sm"
                style="background:var(--teal); color:var(--brand-deep)"
              >
                + Nova solicitação
              </button>
            </a>
          </div>
        </div>

        <div class="hidden md:flex justify-end">
          <div class="rounded-2xl bg-white/10 backdrop-blur p-5 w-full max-w-xs border border-white/15">
            <div class="text-sm text-white/75">Status geral</div>
            <div class="mt-2 font-display text-3xl font-semibold">
              {{ requests.length }}
            </div>
            <div class="text-sm text-white/75">
              {{ requests.length === 1 ? 'solicitação enviada' : 'solicitações enviadas' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Indicadores -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div
              class="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
              style="background:oklch(0.48 0.15 255 / 0.1); color:var(--brand)"
            >
              📋
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">
              total
            </span>
          </div>

          <div class="mt-4 font-display text-2xl font-semibold">
            {{ requests.length }}
          </div>

          <div class="text-sm" style="color:var(--muted-foreground)">
            Solicitações realizadas
          </div>
        </div>

        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div
              class="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
              style="background:oklch(0.75 0.14 80 / 0.15); color:var(--warning-foreground)"
            >
              ⏳
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">
              análise
            </span>
          </div>

          <div class="mt-4 font-display text-2xl font-semibold">
            {{ pendingCount }}
          </div>

          <div class="text-sm" style="color:var(--muted-foreground)">
            Aguardando agente
          </div>
        </div>

        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div
              class="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
              style="background:oklch(0.72 0.12 185 / 0.15); color:var(--teal)"
            >
              🛫
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">
              andamento
            </span>
          </div>

          <div class="mt-4 font-display text-2xl font-semibold">
            {{ inProgressCount }}
          </div>

          <div class="text-sm" style="color:var(--muted-foreground)">
            Sendo cotadas
          </div>
        </div>

        <div class="rounded-2xl border p-5 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div
              class="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
              style="background:oklch(0.5 0.16 155 / 0.15); color:var(--success)"
            >
              ✅
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--accent)">
              concluídas
            </span>
          </div>

          <div class="mt-4 font-display text-2xl font-semibold">
            {{ completedCount }}
          </div>

          <div class="text-sm" style="color:var(--muted-foreground)">
            Cotações respondidas
          </div>
        </div>
      </div>

      <!-- Lista -->
      <section class="client-requests-panel">
        <div class="client-panel-header">
          <div>
            <span class="client-panel-eyebrow">📌 Área de acompanhamento</span>

            <h3>
              Minhas solicitações
            </h3>

            <p>
              Acompanhe o status das suas cotações recentes.
            </p>
          </div>

          <a routerLink="/cliente/nova-solicitacao" class="client-new-link">
            + Nova
          </a>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="client-request-list">
          <div *ngFor="let i of [0,1,2]" class="client-request-skeleton"></div>
        </div>

        <!-- Vazio -->
        <div *ngIf="!loading && requests.length === 0" class="client-empty-state">
          <div class="client-empty-icon">✈️</div>

          <h4>Nenhuma solicitação ainda</h4>

          <p>
            Faça sua primeira solicitação de cotação e acompanhe tudo por aqui.
          </p>

          <a routerLink="/cliente/nova-solicitacao">
            <button class="client-empty-button">
              Solicitar cotação
            </button>
          </a>
        </div>

        <!-- Requests -->
        <div *ngIf="!loading && requests.length > 0" class="client-request-list">
          <article *ngFor="let r of requests" class="client-request-card">
            <div class="client-request-main">
              <div class="client-route-icon">
                ✈
              </div>

              <div class="client-request-content">
                <div class="client-request-title-row">
                  <h4>
                    {{ r.fromCode }} → {{ r.toCode }}
                  </h4>

                  <span class="client-status-pill" [class]="getStatusClass(r.status)">
                    {{ statusLabel[normalizeStatus(r.status)] || r.status }}
                  </span>
                </div>

                <div class="client-request-meta">
                  <span>
                    📅 {{ r.departureDate | date:'dd/MM/yyyy' }}
                    <ng-container *ngIf="r.returnDate">
                      → {{ r.returnDate | date:'dd/MM/yyyy' }}
                    </ng-container>
                  </span>

                  <span>
                    👥 {{ r.passengers }} {{ r.passengers === 1 ? 'passageiro' : 'passageiros' }}
                  </span>

                  <span>
                    💺 {{ cabinLabel[r.cabinClass] || r.cabinClass }}
                  </span>
                </div>

                <div *ngIf="r.notes" class="client-note-box">
                  <span>Observação enviada</span>
                  <p>{{ r.notes }}</p>
                </div>

                <div
                  *ngIf="normalizeStatus(r.status) === 'completed'"
                  class="client-admin-response"
                >
                  <div>
                    <span>Resposta do agente</span>

                    <strong *ngIf="r.adminPrice">
                      {{ r.adminPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                    </strong>

                    <p *ngIf="r.adminNotes; else semMensagem">
                      {{ r.adminNotes }}
                    </p>

                    <ng-template #semMensagem>
                      <p>O agente concluiu sua cotação.</p>
                    </ng-template>
                  </div>
                </div>

                <div
                  *ngIf="normalizeStatus(r.status) === 'pending' || normalizeStatus(r.status) === 'inprogress'"
                  class="client-progress-message"
                >
                  <span></span>

                  {{
                    normalizeStatus(r.status) === 'pending'
                      ? 'Aguardando análise do agente…'
                      : 'Agente trabalhando na sua cotação…'
                  }}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .client-requests-panel {
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      background:
        radial-gradient(circle at top left, oklch(0.48 0.15 255 / 0.06), transparent 28rem),
        var(--card);
      padding: 1.5rem;
      box-shadow: 0 16px 36px oklch(0 0 0 / 0.05);
    }

    .client-panel-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .client-panel-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      background: var(--accent);
      color: var(--muted-foreground);
      font-size: 0.7rem;
      font-weight: 800;
      margin-bottom: 0.6rem;
    }

    .client-panel-header h3 {
      margin: 0;
      font-family: var(--font-display, inherit);
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--foreground);
    }

    .client-panel-header p {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: var(--muted-foreground);
    }

    .client-new-link {
      min-height: 38px;
      padding: 0 0.95rem;
      border-radius: 0.9rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      font-size: 0.82rem;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 12px 26px oklch(0.48 0.15 255 / 0.22);
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        filter 0.18s ease;
    }

    .client-new-link:hover {
      transform: translateY(-2px);
      filter: brightness(1.04);
      box-shadow: 0 16px 34px oklch(0.48 0.15 255 / 0.32);
    }

    .client-request-list {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .client-request-card {
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      background: color-mix(in oklch, var(--card) 92%, var(--accent));
      padding: 1rem;
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        border-color 0.18s ease;
    }

    .client-request-card:hover {
      transform: translateY(-2px);
      border-color: color-mix(in oklch, var(--brand) 32%, var(--border));
      box-shadow: 0 14px 32px oklch(0 0 0 / 0.06);
    }

    .client-request-main {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
    }

    .client-route-icon {
      width: 42px;
      height: 42px;
      border-radius: 1rem;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      box-shadow: 0 10px 22px oklch(0.48 0.15 255 / 0.20);
    }

    .client-request-content {
      min-width: 0;
      flex: 1;
    }

    .client-request-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .client-request-title-row h4 {
      margin: 0;
      font-family: 'DM Mono', monospace;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: var(--foreground);
    }

    .client-request-meta {
      margin-top: 0.45rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      color: var(--muted-foreground);
      font-size: 0.78rem;
    }

    .client-request-meta span {
      padding: 0.24rem 0.55rem;
      border-radius: 999px;
      background: var(--accent);
    }

    .client-status-pill {
      min-height: 26px;
      padding: 0 0.65rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      font-size: 0.7rem;
      font-weight: 900;
      border: 1px solid transparent;
    }

    .status-pending {
      background: oklch(0.95 0.08 85);
      color: oklch(0.42 0.11 75);
      border-color: oklch(0.88 0.1 85);
    }

    .status-inprogress {
      background: oklch(0.94 0.05 250);
      color: oklch(0.45 0.15 255);
      border-color: oklch(0.84 0.08 250);
    }

    .status-completed {
      background: oklch(0.94 0.08 155);
      color: oklch(0.42 0.14 155);
      border-color: oklch(0.84 0.1 155);
    }

    .status-cancelled,
    .status-neutral {
      background: oklch(0.94 0.03 25);
      color: oklch(0.5 0.12 25);
      border-color: oklch(0.84 0.06 25);
    }

    .client-note-box,
    .client-admin-response {
      margin-top: 0.85rem;
      border-radius: 1rem;
      padding: 0.85rem;
      background: var(--accent);
    }

    .client-note-box span,
    .client-admin-response span {
      display: block;
      margin-bottom: 0.35rem;
      font-size: 0.68rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted-foreground);
    }

    .client-note-box p,
    .client-admin-response p {
      margin: 0;
      font-size: 0.84rem;
      color: var(--foreground-2);
    }

    .client-admin-response {
      background:
        radial-gradient(circle at top left, oklch(0.5 0.16 155 / 0.12), transparent 18rem),
        var(--accent);
      border: 1px solid color-mix(in oklch, var(--success) 25%, var(--border));
    }

    .client-admin-response strong {
      display: block;
      margin-bottom: 0.25rem;
      font-family: var(--font-display, inherit);
      font-size: 1.45rem;
      color: var(--success);
    }

    .client-progress-message {
      margin-top: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: var(--muted-foreground);
    }

    .client-progress-message span {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--warning);
      animation: pulse 1.5s infinite;
    }

    .client-empty-state {
      padding: 3rem 1.5rem;
      border: 1px dashed var(--border);
      border-radius: 1.25rem;
      text-align: center;
      background: var(--card);
    }

    .client-empty-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .client-empty-state h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: var(--foreground);
    }

    .client-empty-state p {
      margin: 0.35rem auto 1.1rem;
      max-width: 420px;
      font-size: 0.85rem;
      color: var(--muted-foreground);
    }

    .client-empty-button {
      height: 42px;
      padding: 0 1rem;
      border: 0;
      border-radius: 0.9rem;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      color: white;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
    }

    .client-request-skeleton {
      height: 105px;
      border-radius: 1.25rem;
      background: var(--accent);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 640px) {
      .client-requests-panel {
        padding: 1rem;
      }

      .client-panel-header {
        flex-direction: column;
      }

      .client-new-link {
        width: 100%;
      }

      .client-request-main {
        flex-direction: column;
      }
    }
  `]
})
export class ClientHomeComponent implements OnInit {
  requests: QuoteRequest[] = [];
  loading = false;

  statusLabel: Record<string, string> = {
    pending: 'Aguardando',
    inprogress: 'Em andamento',
    completed: 'Concluída',
    cancelled: 'Cancelada'
  };

  cabinLabel: Record<string, string> = {
    economy: 'Econômica',
    business: 'Executiva',
    first: 'Primeira'
  };

  get totalCount() {
    return this.requests.length;
  }

  get pendingCount() {
    return this.requests.filter(r => {
      const status = this.normalizeStatus(r.status);
      return status === 'pending' && !this.hasAdminResponse(r);
    }).length;
  }

  get inProgressCount() {
    return this.requests.filter(r => {
      const status = this.normalizeStatus(r.status);
      return status === 'inprogress';
    }).length;
  }

  get completedCount() {
    return this.requests.filter(r => {
      const status = this.normalizeStatus(r.status);
      return status === 'completed' || this.hasAdminResponse(r);
    }).length;
  }

  hasAdminResponse(r: QuoteRequest) {
    return r.adminPrice != null || !!r.adminNotes?.trim();
  }

  normalizeStatus(status: string | null | undefined) {
    const value = (status || '')
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const map: Record<string, string> = {
      pending: 'pending',
      aguardando: 'pending',

      inprogress: 'inprogress',
      'in progress': 'inprogress',
      andamento: 'inprogress',
      'em andamento': 'inprogress',

      completed: 'completed',
      complete: 'completed',
      completa: 'completed',
      completo: 'completed',
      concluida: 'completed',
      concluido: 'completed',
      respondida: 'completed',
      respondido: 'completed',
      finalizada: 'completed',
      finalizado: 'completed',

      cancelled: 'cancelled',
      canceled: 'cancelled',
      cancelada: 'cancelled',
      cancelado: 'cancelled'
    };

    return map[value] ?? value;
  }

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.http.get<QuoteRequest[]>('http://localhost:5075/api/quote-requests/mine').subscribe({
      next: d => {
        this.requests = d;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erro ao carregar solicitações.');
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(status: string) {
    const normalized = this.normalizeStatus(status);

    const map: Record<string, string> = {
      pending: 'status-pending',
      inprogress: 'status-inprogress',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };

    return map[normalized] ?? 'status-neutral';
  }
}