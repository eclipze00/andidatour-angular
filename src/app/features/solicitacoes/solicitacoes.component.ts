import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ToastService } from '../../core/services/toast.service';

interface QuoteRequest {
  id: number;
  fromCode: string;
  toCode: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  notes?: string;
  status: string;
  adminPrice?: number;
  adminNotes?: string;
  createdAt: string;
  clientName?: string;
  clientEmail?: string;
}

@Component({
  selector: 'app-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar
      title="Solicitações dos clientes"
      subtitle="Gerencie as cotações recebidas."
    />

    <main class="admin-page">

      <!-- Hero / Resumo -->
      <section class="admin-hero">
        <div>
          <span class="admin-eyebrow">
            📥 Central de solicitações
          </span>

          <h2>
            Cotações recebidas
          </h2>

          <p>
            Visualize os pedidos dos clientes, altere status e envie propostas de viagem.
          </p>
        </div>

        <div class="admin-hero-stats">
          <div class="admin-stat">
            <span>Total</span>
            <strong>{{ requests.length }}</strong>
          </div>

          <div class="admin-stat">
            <span>Aguardando</span>
            <strong>{{ countByStatus('pending') }}</strong>
          </div>

          <div class="admin-stat">
            <span>Concluídas</span>
            <strong>{{ countByStatus('completed') }}</strong>
          </div>
        </div>
      </section>

      <!-- Filtros -->
      <section class="admin-toolbar">
        <div>
          <h3>Fila de atendimento</h3>
          <p>Filtre as solicitações por status.</p>
        </div>

        <div class="filter-tabs">
          <button
            *ngFor="let f of filters"
            type="button"
            (click)="activeFilter = f.value; applyFilter()"
            class="filter-tab"
            [class.active]="activeFilter === f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </section>

      <!-- Skeletons -->
      <div *ngIf="loading" class="request-list">
        <div *ngFor="let i of [0,1,2]" class="request-skeleton"></div>
      </div>

      <!-- Vazio -->
      <div *ngIf="!loading && filtered.length === 0" class="empty-state">
        <div class="empty-icon">🛫</div>
        <h3>Nenhuma solicitação encontrada</h3>
        <p>
          {{ activeFilter !== 'all'
            ? 'Não existem solicitações com este status no momento.'
            : 'Ainda não há solicitações enviadas pelos clientes.'
          }}
        </p>
      </div>

      <!-- Lista -->
      <section *ngIf="!loading && filtered.length > 0" class="request-list">
        <article *ngFor="let r of filtered" class="request-card">
          <div class="request-main">

            <div class="request-route-block">
              <div class="route-icon">
                ✈
              </div>

              <div>
                <div class="request-title-row">
                  <h3>
                    {{ r.fromCode }} → {{ r.toCode }}
                  </h3>

                  <span class="status-pill" [class]="getStatusClass(r.status)">
                    {{ statusLabel[r.status] || r.status }}
                  </span>
                </div>

                <div class="request-meta">
                  <span>
                    📅 {{ r.departureDate | date:'dd/MM/yyyy' }}
                    <ng-container *ngIf="r.returnDate">
                      → {{ r.returnDate | date:'dd/MM/yyyy' }}
                    </ng-container>
                  </span>

                  <span>
                    👥 {{ r.passengers }} {{ r.passengers === 1 ? 'pax' : 'pax' }}
                  </span>

                  <span>
                    💺 {{ cabinLabel[r.cabinClass] || r.cabinClass }}
                  </span>

                  <span *ngIf="r.clientName">
                    👤 {{ r.clientName }}
                  </span>

                  <span>
                    🕒 {{ r.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>
              </div>
            </div>

            <div *ngIf="r.notes" class="client-note">
              <span>Observação do cliente</span>
              <p>“{{ r.notes }}”</p>
            </div>

            <div *ngIf="r.adminPrice || r.adminNotes" class="admin-answer-preview">
              <span>Resposta enviada</span>

              <strong *ngIf="r.adminPrice">
                {{ r.adminPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
              </strong>

              <p *ngIf="r.adminNotes">
                {{ r.adminNotes }}
              </p>
            </div>
          </div>

          <aside class="request-actions">
            <label>
              Status
            </label>

            <select
              [(ngModel)]="statusUpdates[r.id]"
              (change)="updateStatus(r)"
              class="admin-select"
            >
              <option value="">Alterar status</option>
              <option value="inprogress">Em andamento</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>

            <button
              type="button"
              (click)="openRespond(r)"
              class="respond-button"
            >
              <span>Responder</span>
              <span>→</span>
            </button>
          </aside>
        </article>
      </section>
    </main>

    <!-- Modal de resposta -->
    <div *ngIf="respondingTo" class="modal-backdrop">
      <div class="response-modal">
        <div class="modal-header">
          <div>
            <span class="admin-eyebrow">
              💬 Enviar proposta
            </span>

            <h3>
              {{ respondingTo.fromCode }} → {{ respondingTo.toCode }}
            </h3>

            <p>
              Informe o valor e uma mensagem para o cliente.
            </p>
          </div>

          <button
            type="button"
            class="modal-close"
            (click)="respondingTo = null"
          >
            ×
          </button>
        </div>

        <div class="modal-route-summary">
          <div>
            <span>Cliente</span>
            <strong>{{ respondingTo.clientName || 'Cliente' }}</strong>
          </div>

          <div>
            <span>Passageiros</span>
            <strong>{{ respondingTo.passengers }}</strong>
          </div>

          <div>
            <span>Classe</span>
            <strong>{{ cabinLabel[respondingTo.cabinClass] }}</strong>
          </div>
        </div>

        <div class="form-group">
          <label>Melhor valor (R$)</label>

          <input
            type="number"
            [(ngModel)]="respondForm.adminPrice"
            class="admin-input"
            placeholder="Ex: 3200"
          />
        </div>

        <div class="form-group">
          <label>Mensagem para o cliente</label>

          <textarea
            [(ngModel)]="respondForm.adminNotes"
            class="admin-input"
            rows="5"
            placeholder="Descreva as opções encontradas, companhias, horários, condições e observações importantes..."
          ></textarea>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            (click)="respondingTo = null"
            class="cancel-button"
          >
            Cancelar
          </button>

          <button
            type="button"
            (click)="submitRespond()"
            [disabled]="responding"
            class="send-response-button"
          >
            {{ responding ? 'Enviando…' : 'Enviar resposta' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      flex: 1;
      padding: 1.5rem 2rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .admin-hero {
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.5rem;
      background:
        radial-gradient(circle at top left, oklch(0.48 0.15 255 / 0.12), transparent 28rem),
        radial-gradient(circle at top right, oklch(0.72 0.12 185 / 0.14), transparent 24rem),
        var(--card);
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      align-items: center;
      box-shadow: 0 16px 36px oklch(0 0 0 / 0.05);
    }

    .admin-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      background: var(--accent);
      color: var(--muted-foreground);
      font-size: 0.72rem;
      font-weight: 700;
      margin-bottom: 0.6rem;
    }

    .admin-hero h2 {
      margin: 0;
      font-family: var(--font-display, inherit);
      font-size: clamp(1.35rem, 2vw, 2rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--foreground);
    }

    .admin-hero p {
      margin: 0.35rem 0 0;
      color: var(--muted-foreground);
      font-size: 0.9rem;
    }

    .admin-hero-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(90px, 1fr));
      gap: 0.75rem;
      min-width: 360px;
    }

    .admin-stat {
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 0.9rem;
      background: color-mix(in oklch, var(--card) 82%, transparent);
      backdrop-filter: blur(10px);
    }

    .admin-stat span {
      display: block;
      font-size: 0.72rem;
      color: var(--muted-foreground);
      margin-bottom: 0.35rem;
    }

    .admin-stat strong {
      font-family: var(--font-display, inherit);
      font-size: 1.55rem;
      line-height: 1;
      color: var(--foreground);
    }

    .admin-toolbar {
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      background: var(--card);
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 10px 24px oklch(0 0 0 / 0.035);
    }

    .admin-toolbar h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .admin-toolbar p {
      margin: 0.15rem 0 0;
      font-size: 0.8rem;
      color: var(--muted-foreground);
    }

    .filter-tabs {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .filter-tab {
      height: 36px;
      padding: 0 0.9rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--card);
      color: var(--muted-foreground);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition:
        background 0.18s ease,
        color 0.18s ease,
        transform 0.18s ease,
        box-shadow 0.18s ease;
    }

    .filter-tab:hover {
      transform: translateY(-1px);
      background: var(--accent);
      color: var(--foreground);
    }

    .filter-tab.active {
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      border-color: transparent;
      box-shadow: 0 10px 24px oklch(0.48 0.15 255 / 0.22);
    }

    .request-list {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .request-card {
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      background: var(--card);
      padding: 1.1rem;
      display: grid;
      grid-template-columns: 1fr 190px;
      gap: 1.25rem;
      box-shadow: 0 10px 24px oklch(0 0 0 / 0.035);
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        border-color 0.18s ease;
    }

    .request-card:hover {
      transform: translateY(-2px);
      border-color: color-mix(in oklch, var(--brand) 30%, var(--border));
      box-shadow: 0 18px 38px oklch(0 0 0 / 0.07);
    }

    .request-main {
      min-width: 0;
    }

    .request-route-block {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
    }

    .route-icon {
      width: 42px;
      height: 42px;
      border-radius: 1rem;
      display: grid;
      place-items: center;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      box-shadow: 0 10px 22px oklch(0.48 0.15 255 / 0.20);
      flex-shrink: 0;
    }

    .request-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .request-title-row h3 {
      margin: 0;
      font-family: 'DM Mono', monospace;
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--foreground);
    }

    .request-meta {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
      font-size: 0.78rem;
      color: var(--muted-foreground);
    }

    .request-meta span {
      padding: 0.25rem 0.55rem;
      border-radius: 999px;
      background: var(--accent);
    }

    .status-pill {
      height: 26px;
      padding: 0 0.65rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      font-size: 0.72rem;
      font-weight: 800;
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

    .status-cancelled {
      background: oklch(0.94 0.03 25);
      color: oklch(0.5 0.12 25);
      border-color: oklch(0.84 0.06 25);
    }

    .client-note,
    .admin-answer-preview {
      margin-top: 0.9rem;
      border-radius: 1rem;
      padding: 0.85rem;
      background: var(--accent);
    }

    .client-note span,
    .admin-answer-preview span {
      display: block;
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted-foreground);
      margin-bottom: 0.35rem;
    }

    .client-note p,
    .admin-answer-preview p {
      margin: 0;
      font-size: 0.84rem;
      color: var(--foreground-2);
    }

    .admin-answer-preview strong {
      display: block;
      margin-bottom: 0.25rem;
      font-family: var(--font-display, inherit);
      font-size: 1.25rem;
      color: var(--success);
    }

    .request-actions {
      border-left: 1px solid var(--border);
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.6rem;
    }

    .request-actions label {
      font-size: 0.72rem;
      color: var(--muted-foreground);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .admin-select,
    .admin-input {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--border);
      border-radius: 0.85rem;
      background: var(--background);
      color: var(--foreground);
      padding: 0.65rem 0.8rem;
      font-size: 0.85rem;
      outline: none;
      transition:
        border-color 0.18s ease,
        box-shadow 0.18s ease,
        background 0.18s ease;
    }

    .admin-select:focus,
    .admin-input:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 4px oklch(0.48 0.15 255 / 0.12);
      background: var(--card);
    }

    textarea.admin-input {
      resize: vertical;
      line-height: 1.5;
    }

    .respond-button,
    .send-response-button {
      position: relative;
      min-height: 42px;
      border: 0;
      border-radius: 0.85rem;
      padding: 0 1rem;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      box-shadow: 0 12px 24px oklch(0.48 0.15 255 / 0.22);
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        filter 0.18s ease;
    }

    .respond-button:hover,
    .send-response-button:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: brightness(1.04);
      box-shadow: 0 16px 34px oklch(0.48 0.15 255 / 0.32);
    }

    .send-response-button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      box-shadow: none;
    }

    .empty-state {
      border: 1px dashed var(--border);
      border-radius: 1.25rem;
      background: var(--card);
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--muted-foreground);
    }

    .empty-icon {
      font-size: 2.4rem;
      margin-bottom: 0.8rem;
    }

    .empty-state h3 {
      margin: 0;
      color: var(--foreground);
      font-size: 1rem;
      font-weight: 800;
    }

    .empty-state p {
      margin: 0.4rem auto 0;
      max-width: 420px;
      font-size: 0.88rem;
    }

    .request-skeleton {
      height: 130px;
      border-radius: 1.25rem;
      background: var(--card);
      border: 1px solid var(--border);
      animation: pulse 1.5s infinite;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 200;
      padding: 1rem;
      background: oklch(0 0 0 / 0.55);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .response-modal {
      width: 100%;
      max-width: 560px;
      border-radius: 1.4rem;
      border: 1px solid var(--border);
      background: var(--card);
      padding: 1.35rem;
      box-shadow: 0 28px 80px oklch(0 0 0 / 0.28);
      animation: modalIn 0.18s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .modal-header h3 {
      margin: 0;
      font-family: 'DM Mono', monospace;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--foreground);
    }

    .modal-header p {
      margin: 0.35rem 0 0;
      font-size: 0.85rem;
      color: var(--muted-foreground);
    }

    .modal-close {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--card);
      color: var(--foreground);
      font-size: 1.25rem;
      cursor: pointer;
      transition: background 0.18s ease, transform 0.18s ease;
    }

    .modal-close:hover {
      background: var(--accent);
      transform: rotate(8deg);
    }

    .modal-route-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .modal-route-summary div {
      border-radius: 1rem;
      padding: 0.75rem;
      background: var(--accent);
    }

    .modal-route-summary span {
      display: block;
      font-size: 0.7rem;
      color: var(--muted-foreground);
      margin-bottom: 0.25rem;
    }

    .modal-route-summary strong {
      font-size: 0.85rem;
      color: var(--foreground);
    }

    .form-group {
      margin-top: 0.9rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.4rem;
      font-size: 0.82rem;
      font-weight: 800;
      color: var(--foreground);
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.15rem;
    }

    .cancel-button {
      flex: 1;
      min-height: 42px;
      border-radius: 0.85rem;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--foreground);
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      transition: background 0.18s ease, transform 0.18s ease;
    }

    .cancel-button:hover {
      background: var(--accent);
      transform: translateY(-1px);
    }

    .send-response-button {
      flex: 1;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes modalIn {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 1024px) {
      .admin-hero {
        align-items: stretch;
        flex-direction: column;
      }

      .admin-hero-stats {
        min-width: 0;
      }

      .request-card {
        grid-template-columns: 1fr;
      }

      .request-actions {
        border-left: 0;
        border-top: 1px solid var(--border);
        padding-left: 0;
        padding-top: 1rem;
      }
    }

    @media (max-width: 720px) {
      .admin-page {
        padding: 1rem;
      }

      .admin-toolbar {
        align-items: stretch;
        flex-direction: column;
      }

      .filter-tabs {
        justify-content: flex-start;
      }

      .admin-hero-stats,
      .modal-route-summary {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SolicitacoesComponent implements OnInit {
  requests: QuoteRequest[] = [];
  filtered: QuoteRequest[] = [];
  loading = false;
  activeFilter = 'all';
  statusUpdates: Record<number, string> = {};
  respondingTo: QuoteRequest | null = null;
  respondForm = { adminPrice: null as number | null, adminNotes: '' };
  responding = false;

  filters = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Aguardando' },
    { value: 'inprogress', label: 'Em andamento' },
    { value: 'completed', label: 'Concluídas' },
  ];

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

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.http.get<QuoteRequest[]>('http://localhost:5075/api/quote-requests').subscribe({
      next: d => {
        this.requests = d;
        this.applyFilter();
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

  applyFilter() {
    this.filtered = this.activeFilter === 'all'
      ? this.requests
      : this.requests.filter(r => r.status === this.activeFilter);
  }

  updateStatus(r: QuoteRequest) {
    const status = this.statusUpdates[r.id];

    if (!status) return;

    this.http.patch(`http://localhost:5075/api/quote-requests/${r.id}`, { status }).subscribe({
      next: () => {
        r.status = status;
        this.statusUpdates[r.id] = '';
        this.applyFilter();
        this.toast.success('Status atualizado!');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Erro ao atualizar status.')
    });
  }

  openRespond(r: QuoteRequest) {
    this.respondingTo = r;
    this.respondForm = {
      adminPrice: r.adminPrice ?? null,
      adminNotes: r.adminNotes ?? ''
    };
  }

  submitRespond() {
    if (!this.respondingTo) return;

    this.responding = true;

    this.http.patch(`http://localhost:5075/api/quote-requests/${this.respondingTo.id}`, {
      status: 'completed',
      adminPrice: this.respondForm.adminPrice,
      adminNotes: this.respondForm.adminNotes,
    }).subscribe({
      next: (updated: any) => {
        const idx = this.requests.findIndex(r => r.id === this.respondingTo!.id);

        if (idx >= 0) {
          this.requests[idx] = { ...this.requests[idx], ...updated };
        }

        this.applyFilter();
        this.responding = false;
        this.respondingTo = null;
        this.toast.success('Resposta enviada ao cliente!');
        this.cdr.detectChanges();
      },
      error: () => {
        this.responding = false;
        this.toast.error('Erro ao enviar resposta.');
        this.cdr.detectChanges();
      }
    });
  }

  countByStatus(status: string) {
    return this.requests.filter(r => r.status === status).length;
  }

  getStatusClass(status: string) {
    const map: Record<string, string> = {
      pending: 'status-pending',
      inprogress: 'status-inprogress',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };

    return map[status] ?? 'status-cancelled';
  }
}