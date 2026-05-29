import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlightService } from '../../core/services/flight.service';
import { ClientService } from '../../core/services/client.service';
import { QuoteService } from '../../core/services/quote.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { FlightOption, Client } from '../../models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-voo-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TopbarComponent],
  template: `
    <app-topbar
      [title]="'Detalhes do voo'"
      [subtitle]="flight ? flight.from.city + ' → ' + flight.to.city : 'Carregando...'"
    />

    <main class="flex-1 p-4 md:p-8" *ngIf="flight">
      <div class="grid gap-6 lg:grid-cols-[1fr_360px]">

        <!-- Coluna esquerda -->
        <div class="space-y-6">

          <!-- Resumo do voo -->
          <div class="rounded-2xl border p-6 shadow-soft"
               style="background:var(--card); border-color:var(--border)">
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 rounded-xl flex items-center justify-center
                          text-white font-display text-lg font-semibold shadow-soft"
                   [style.background]="flight.airline.color">
                {{ flight.airline.initials }}
              </div>
              <div class="flex-1">
                <div class="font-display text-lg font-semibold">{{ flight.airline.name }}</div>
                <div class="text-sm capitalize" style="color:var(--muted-foreground)">
                  {{ flight.cabin }} · {{ flight.segments[0]?.flightNumber }}
                </div>
              </div>
              <span class="text-xs px-3 py-1 rounded-full border font-medium"
                    [class]="flight.stops === 0
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'">
                {{ flight.stops === 0 ? 'Voo direto'
                   : flight.stops + (flight.stops === 1 ? ' conexão' : ' conexões') }}
              </span>
            </div>

            <div class="my-6 border-t" style="border-color:var(--border)"></div>

            <div class="grid grid-cols-3 gap-6 items-center">
              <div>
                <div class="font-display text-3xl font-semibold">{{ flight.departure }}</div>
                <div class="text-sm font-medium">{{ flight.from.code }}</div>
                <div class="text-xs" style="color:var(--muted-foreground)">{{ flight.from.city }}</div>
              </div>
              <div class="flex flex-col items-center gap-1">
                <div class="text-xs" style="color:var(--muted-foreground)">⏱ {{ flight.duration }}</div>
                <div class="w-full flex items-center gap-2">
                  <div class="flex-1 h-px" style="background:var(--border)"></div>
                  <span class="rotate-[-45deg] inline-block" style="color:var(--brand)">✈</span>
                  <div class="flex-1 h-px" style="background:var(--border)"></div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-display text-3xl font-semibold">{{ flight.arrival }}</div>
                <div class="text-sm font-medium">{{ flight.to.code }}</div>
                <div class="text-xs" style="color:var(--muted-foreground)">{{ flight.to.city }}</div>
              </div>
            </div>
          </div>

          <!-- Regras tarifárias -->
          <div class="rounded-2xl border p-6 shadow-soft"
               style="background:var(--card); border-color:var(--border)">
            <h3 class="font-display text-lg font-semibold mb-5">Regras tarifárias</h3>
            <div class="grid sm:grid-cols-2 gap-4">
              <div *ngFor="let r of rules" class="flex gap-3">
                <div class="h-9 w-9 rounded-lg flex items-center justify-center text-base shrink-0"
                     style="background:var(--accent)">{{ r.icon }}</div>
                <div>
                  <div class="text-sm font-medium">{{ r.title }}</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">{{ r.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna direita — preço + salvar -->
        <div class="space-y-4 lg:sticky lg:top-20 h-fit">
          <div class="rounded-2xl border p-6 shadow-card space-y-5"
               style="background:var(--card); border-color:var(--teal)">

            <div>
              <div class="text-xs uppercase tracking-wider" style="color:var(--muted-foreground)">
                Pagamento em dinheiro
              </div>
              <div class="font-display text-3xl font-semibold mt-1">
                {{ flight.price | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
              </div>
              <div class="text-xs" style="color:var(--muted-foreground)">
                + {{ flight.taxes | currency:'BRL':'symbol':'1.0-0':'pt-BR' }} taxas
              </div>
            </div>

            <div *ngIf="flight.miles" class="rounded-xl p-4" style="background:var(--accent)">
              <div class="text-xs uppercase tracking-wider" style="color:var(--muted-foreground)">
                Em milhas
              </div>
              <div class="font-display text-2xl font-semibold mt-1">
                {{ flight.miles | number:'1.0-0':'pt-BR' }} mi
              </div>
              <div class="text-xs" style="color:var(--muted-foreground)">{{ flight.milesProgram }}</div>
            </div>

            <!-- Seletor de cliente -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Cliente para esta cotação</label>
              <select
                [(ngModel)]="selectedClientId"
                class="input-field"
                [disabled]="loadingClients"
              >
                <option [ngValue]="0">
                  {{ loadingClients ? 'Carregando clientes...' : 'Selecione um cliente…' }}
                </option>

                <option *ngFor="let c of clients" [ngValue]="c.id">
                  {{ c.name }}
                </option>
              </select>
              <a routerLink="/app/clientes"
                 class="text-xs hover:underline" style="color:var(--brand)">
                + Cadastrar novo cliente
              </a>
            </div>

            <!-- Data da viagem -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Data da viagem</label>
              <input type="date" [(ngModel)]="travelDate" class="input-field" />
            </div>

            <!-- Feedback de sucesso -->
            <div *ngIf="savedSuccess"
                 class="rounded-lg px-4 py-3 text-sm font-medium text-white text-center"
                 style="background:var(--success)">
              ✅ Cotação salva no histórico!
            </div>

            <div class="space-y-2 pt-1">
              <button (click)="gerarProposta()"
                      [disabled]="!selectedClientId || saving"
                      class="w-full h-11 rounded-lg font-medium text-white flex items-center
                             justify-center gap-2 disabled:opacity-60"
                      style="background:var(--primary)">
                📄 Gerar proposta
              </button>
              <button (click)="salvarCotacao()"
                      [disabled]="!selectedClientId || saving"
                      class="w-full h-11 rounded-lg font-medium border flex items-center
                             justify-center gap-2 hover:bg-accent transition disabled:opacity-60"
                      style="border-color:var(--border)">
                {{ saving ? 'Salvando…' : '🔖 Salvar cotação' }}
              </button>
              <a [routerLink]="['/app/resultados']"
                 [queryParams]="{ from: flight.from.code, to: flight.to.code, cabin: flight.cabin }"
                 class="block w-full h-11 rounded-lg font-medium flex items-center
                        justify-center gap-2 hover:bg-accent transition text-sm"
                 style="color:var(--muted-foreground)">
                ← Voltar aos resultados
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Skeleton -->
    <main class="flex-1 p-4 md:p-8" *ngIf="!flight">
      <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <div *ngFor="let i of [0,1]"
               class="rounded-2xl border p-6 h-40 animate-pulse"
               style="background:var(--card)"></div>
        </div>
        <div class="rounded-2xl border p-6 h-72 animate-pulse"
             style="background:var(--card)"></div>
      </div>
    </main>
  `,
  styles: [`
    .input-field {
      width: 100%;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      outline: none;
      background: white;
    }
  `]
})
export class VooDetalheComponent implements OnInit {
  flight: FlightOption | undefined;
  clients: Client[] = [];
  loadingClients = false;
  selectedClientId = 0;
  travelDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]; // 30 dias a partir de hoje
  saving = false;
  savedSuccess = false;
  savedQuoteId: number | null = null;

  rules = [
    { icon: '🧳', title: 'Bagagem', desc: '' },
    { icon: '🛡️', title: 'Cancelamento', desc: 'Reembolso com taxa de 30% até 24h antes.' },
    { icon: '📝', title: 'Alteração', desc: 'Permitida com cobrança de diferença tarifária.' },
    { icon: '💰', title: 'Taxas', desc: 'Já consideradas no total exibido.' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private clientService: ClientService,
    private quoteService: QuoteService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadClients();

    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const cabin = this.route.snapshot.queryParamMap.get('cabin') ?? 'economica';

    const stateFlight = history.state?.flight as FlightOption | undefined;

    if (stateFlight && stateFlight.id === id) {
      this.flight = stateFlight;
      this.rules[0].desc = stateFlight.baggage;
      this.cdr.detectChanges();
      return;
    }

    const parts = id.split('-');
    const from = parts[2] ?? 'GRU';
    const to = parts[3] ?? 'LIS';

    this.flightService.search(from, to, cabin).subscribe({
      next: flights => {
        this.flight = flights.find(f => f.id === id) ?? flights[0];

        if (this.flight) {
          this.rules[0].desc = this.flight.baggage;
        }

        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Erro ao buscar voo:', err);
        this.toast.error('Erro ao carregar detalhes do voo.');
        this.cdr.detectChanges();
      }
    });
  }

  loadClients() {
    this.loadingClients = true;

    this.clientService.getAll().subscribe({
      next: clients => {
        this.clients = clients;
        this.loadingClients = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingClients = false;
        this.toast.error('Erro ao carregar clientes.');
        this.cdr.detectChanges();
      }
    });
  }

  salvarCotacao() {
    if (!this.flight || !this.selectedClientId) return;
    this.saving = true;
    this.quoteService.create({
      fromCode:       this.flight.from.code,
      toCode:         this.flight.to.code,
      travelDate:     this.travelDate,
      bestPrice:      this.flight.price,
      clientId:       this.selectedClientId,
      flightDataJson: this.quoteService.serializeFlight(this.flight),
    }).subscribe({
      next: (quote) => {
        this.saving = false;
        this.savedQuoteId = quote.id;
        this.toast.success('Cotação salva no histórico!');
        this.cdr.detectChanges();  // ← adicionado
        setTimeout(() => this.router.navigate(['/app/historico']), 1500);
      },
      error: () => {
        this.saving = false;
        this.toast.error('Erro ao salvar cotação. Tente novamente.');
        this.cdr.detectChanges();
      }
    });
  }

  gerarProposta() {
    if (!this.flight || !this.selectedClientId) return;
    if (this.savedQuoteId) {
      this.router.navigate(['/app/proposta', this.savedQuoteId]);
      return;
    }
    this.saving = true;
    this.quoteService.create({
      fromCode:       this.flight.from.code,
      toCode:         this.flight.to.code,
      travelDate:     this.travelDate,
      bestPrice:      this.flight.price,
      clientId:       this.selectedClientId,
      flightDataJson: this.quoteService.serializeFlight(this.flight),
    }).subscribe({
      next: (quote) => {
        this.saving = false;
        this.router.navigate(['/app/proposta', quote.id]);
      },
      error: () => {
        this.saving = false;
        this.toast.error('Erro ao gerar proposta. Tente novamente.');  // ← adicionado
        this.cdr.detectChanges();
      }
    });
  }
}