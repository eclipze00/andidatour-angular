import { Component, OnInit, signal, computed, Signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlightService } from '../../core/services/flight.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { FlightOption } from '../../models';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar
      [title]="from + ' → ' + to"
      [subtitle]="filtered().length + ' opções encontradas · ' + cabinLabel"
    />
    <main class="flex-1 p-4 md:p-8">
      <div class="grid gap-6 lg:grid-cols-[280px_1fr]">

        <!-- Filtros -->
        <aside>
          <div class="rounded-2xl border p-5 shadow-soft space-y-5"
               style="background:var(--card); border-color:var(--border)">
            <div class="flex items-center gap-2">
              <span>🔍</span>
              <h3 class="font-semibold">Filtros</h3>
            </div>
            <div class="space-y-2">
              <label class="text-xs" style="color:var(--muted-foreground)">Ordenar por</label>
              <div class="grid grid-cols-2 gap-2">
                <button (click)="sort.set('price')"
                        class="px-3 py-1.5 rounded-lg text-sm border transition"
                        [style.background]="sort() === 'price' ? 'var(--primary)' : 'transparent'"
                        [style.color]="sort() === 'price' ? 'white' : 'var(--foreground)'"
                        [style.border-color]="sort() === 'price' ? 'var(--primary)' : 'var(--border)'">
                  Menor preço
                </button>
                <button (click)="sort.set('duration')"
                        class="px-3 py-1.5 rounded-lg text-sm border transition"
                        [style.background]="sort() === 'duration' ? 'var(--primary)' : 'transparent'"
                        [style.color]="sort() === 'duration' ? 'white' : 'var(--foreground)'"
                        [style.border-color]="sort() === 'duration' ? 'var(--primary)' : 'var(--border)'">
                  Mais rápido
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <label class="text-xs" style="color:var(--muted-foreground)">Valor máximo</label>
                <span class="text-xs font-medium">
                  {{ maxPrice() | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                </span>
              </div>
              <input type="range" [value]="maxPrice()"
                     (input)="maxPrice.set(+$any($event.target).value)"
                     min="500" max="20000" step="100" class="w-full" />
            </div>
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm">Apenas voos diretos</span>
              <input type="checkbox" [checked]="onlyDirect()"
                     (change)="onlyDirect.set(!onlyDirect())" class="h-4 w-4" />
            </label>
          </div>
        </aside>

        <!-- Resultados -->
        <div class="space-y-3">
          <div *ngIf="loading" class="space-y-3">
            <div *ngFor="let i of [0,1,2,3]"
                 class="rounded-2xl border p-6 h-32 animate-pulse"
                 style="background:var(--card)"></div>
          </div>

          <div *ngIf="!loading && filtered().length === 0"
               class="rounded-2xl border p-10 text-center shadow-soft"
               style="background:var(--card)">
            <span style="color:var(--muted-foreground)">
              Nenhum voo encontrado para os filtros selecionados.
            </span>
          </div>

          <div *ngFor="let f of filtered()"
               class="rounded-2xl border p-5 md:p-6 shadow-soft hover:shadow-card transition"
               style="background:var(--card); border-color:var(--border)">
            <div class="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">

              <!-- Companhia -->
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-xl flex items-center justify-center
                            text-white font-display text-sm font-semibold shadow-soft"
                     [style.background]="f.airline.color">
                  {{ f.airline.initials }}
                </div>
                <div>
                  <div class="font-medium text-sm">{{ f.airline.name }}</div>
                  <div class="text-xs capitalize" style="color:var(--muted-foreground)">
                    {{ f.cabin }}
                  </div>
                </div>
              </div>

              <!-- Horários -->
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <div class="font-display text-xl font-semibold">{{ f.departure }}</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">{{ f.from.code }}</div>
                </div>
                <div class="flex-1 flex flex-col items-center">
                  <div class="text-[11px]" style="color:var(--muted-foreground)">
                    ⏱ {{ f.duration }}
                  </div>
                  <div class="w-full mt-1 flex items-center gap-2">
                    <div class="flex-1 h-px" style="background:var(--border)"></div>
                    <span class="text-xs" style="color:var(--brand)">✈</span>
                    <div class="flex-1 h-px" style="background:var(--border)"></div>
                  </div>
                  <div class="mt-1 text-[11px]">
                    <span *ngIf="f.stops === 0" style="color:var(--success)" class="font-medium">
                      Direto
                    </span>
                    <span *ngIf="f.stops > 0" style="color:var(--muted-foreground)">
                      {{ f.stops }} {{ f.stops === 1 ? 'conexão' : 'conexões' }}
                    </span>
                  </div>
                </div>
                <div class="text-center">
                  <div class="font-display text-xl font-semibold">{{ f.arrival }}</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">{{ f.to.code }}</div>
                </div>
              </div>

              <!-- Preço -->
              <div class="text-right md:min-w-[200px]">
                <div class="font-display text-2xl font-semibold">
                  {{ f.price | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                </div>
                <div class="text-[11px]" style="color:var(--muted-foreground)">
                  + {{ f.taxes | currency:'BRL':'symbol':'1.0-0':'pt-BR' }} taxas
                </div>
                <div *ngIf="f.miles" class="mt-1 text-xs">
                  <span style="color:var(--teal)" class="font-medium">
                    {{ f.miles | number:'1.0-0':'pt-BR' }} mi
                  </span>
                  <span style="color:var(--muted-foreground)"> · {{ f.milesProgram }}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-3"
                 style="border-color:var(--border)">
              <span class="text-xs px-2 py-1 rounded-full border"
                    style="background:var(--accent)">
                🧳 {{ f.baggage }}
              </span>
              <!-- ← BOTÃO ATUALIZADO: navega para detalhe do voo -->
              <button (click)="selectFlight(f)"
                      class="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
                      style="background:var(--primary)">
                Selecionar opção →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class ResultadosComponent implements OnInit {
  from = 'GRU'; to = 'LIS'; cabin = 'economica';
  loading = true;
  flights = signal<FlightOption[]>([]);

  sort = signal<'price' | 'duration'>('price');
  maxPrice = signal(20000);
  onlyDirect = signal(false);

  filtered = computed(() => {
    let f = this.flights().filter(x => x.price <= this.maxPrice()); // ← flights() com ()
    if (this.onlyDirect()) f = f.filter(x => x.stops === 0);
    return [...f].sort((a, b) =>
      this.sort() === 'price'
        ? a.price - b.price
        : a.duration.localeCompare(b.duration)
    );
  });

  get cabinLabel() {
    return this.cabin === 'economica' ? 'Econômica'
         : this.cabin === 'executiva' ? 'Executiva'
         : 'Primeira';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private cdr: ChangeDetectorRef  // ← adicionar isso
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.from  = params['from']  ?? 'GRU';
      this.to    = params['to']    ?? 'LIS';
      this.cabin = params['cabin'] ?? 'economica';
      this.loading = true;
      this.flightService.search(this.from, this.to, this.cabin).subscribe({
        next: data => {
          this.flights.set(data);  // ← .set() em vez de = 
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  // Navega para o detalhe do voo passando os dados via state (evita URL longa)
  selectFlight(f: FlightOption) {
    this.router.navigate(['/app/voo', f.id], {
      queryParams: { cabin: this.cabin },
      state: { flight: f }   // ← passa o objeto completo via navigation state
    });
  }
}