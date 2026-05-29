import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { Airport, Airline } from '../../models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-nova-cotacao',
  standalone: true,
  imports: [FormsModule, CommonModule, TopbarComponent],
  template: `
    <app-topbar
      title="Nova cotação"
      subtitle="Configure os detalhes para encontrar as melhores opções."
    />

    <main class="flex-1 p-4 md:p-8">
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">

        <!-- Formulário principal -->
        <div
          class="rounded-2xl border p-6 md:p-8 shadow-soft space-y-7"
          style="background:var(--card); border-color:var(--border)"
        >

          <!-- Tipo de viagem -->
          <div>
            <label class="text-sm font-semibold mb-3 block">
              Tipo de viagem
            </label>

            <div class="flex gap-3 flex-wrap">
              <label
                *ngFor="let opt of tripTypes"
                class="flex items-center gap-2 rounded-xl border px-4 py-2.5 cursor-pointer transition"
                [style.border-color]="tripType === opt.value ? 'var(--brand)' : 'var(--border)'"
                [style.background]="tripType === opt.value ? 'var(--accent)' : 'transparent'"
              >
                <input
                  type="radio"
                  [(ngModel)]="tripType"
                  [value]="opt.value"
                  class="hidden"
                />

                <span class="text-sm font-medium">
                  {{ opt.label }}
                </span>
              </label>
            </div>
          </div>

          <!-- Origem / Destino / Datas -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">
                Origem
              </label>

              <input
                [(ngModel)]="searchForm.origem"
                (ngModelChange)="searchForm.origem = normalizeAirportInput($event)"
                class="input-field"
                placeholder="Ex: GRU"
                maxlength="3"
                autocomplete="off"
                [class.input-error]="submitted && !isAirportCodeValid(searchForm.origem)"
              />

              <span
                *ngIf="submitted && !isAirportCodeValid(searchForm.origem)"
                class="field-error"
              >
                Informe a origem com 3 letras. Ex: GRU.
              </span>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">
                Destino
              </label>

              <input
                [(ngModel)]="searchForm.destino"
                (ngModelChange)="searchForm.destino = normalizeAirportInput($event)"
                class="input-field"
                placeholder="Ex: LIS"
                maxlength="3"
                autocomplete="off"
                [class.input-error]="submitted && !isAirportCodeValid(searchForm.destino)"
              />

              <span
                *ngIf="submitted && !isAirportCodeValid(searchForm.destino)"
                class="field-error"
              >
                Informe o destino com 3 letras. Ex: LIS.
              </span>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">
                Data de ida
              </label>

              <input
                type="date"
                [(ngModel)]="searchForm.dataIda"
                class="input-field"
                [class.input-error]="submitted && !searchForm.dataIda"
              />

              <span
                *ngIf="submitted && !searchForm.dataIda"
                class="field-error"
              >
                Informe a data de ida.
              </span>
            </div>

            <div class="space-y-1.5">
              <label
                class="text-sm font-medium"
                [style.opacity]="tripType === 'ida' ? '0.45' : '1'"
              >
                Data de volta
              </label>

              <input
                type="date"
                [(ngModel)]="searchForm.dataVolta"
                class="input-field"
                [disabled]="tripType === 'ida'"
                [style.opacity]="tripType === 'ida' ? '0.45' : '1'"
                [class.input-error]="submitted && isReturnDateRequired() && !searchForm.dataVolta"
              />

              <span
                *ngIf="submitted && isReturnDateRequired() && !searchForm.dataVolta"
                class="field-error"
              >
                Informe a data de volta.
              </span>
            </div>
          </div>

          <!-- Passageiros -->
          <div>
            <label class="text-sm font-semibold mb-3 block">
              Passageiros
            </label>

            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs" style="color:var(--muted-foreground)">
                  Adultos
                </label>

                <input
                  type="number"
                  [(ngModel)]="adults"
                  min="1"
                  class="input-field"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs" style="color:var(--muted-foreground)">
                  Crianças
                </label>

                <input
                  type="number"
                  [(ngModel)]="children"
                  min="0"
                  class="input-field"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs" style="color:var(--muted-foreground)">
                  Bebês
                </label>

                <input
                  type="number"
                  [(ngModel)]="infants"
                  min="0"
                  class="input-field"
                />
              </div>
            </div>
          </div>

          <!-- Classe / Preferências -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">
                Classe da cabine
              </label>

              <select [(ngModel)]="cabin" class="input-field">
                <option value="economica">Econômica</option>
                <option value="executiva">Executiva</option>
                <option value="primeira">Primeira classe</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">
                Companhia preferida
              </label>

              <select [(ngModel)]="preferredAirline" class="input-field">
                <option value="">Qualquer</option>
                <option *ngFor="let a of airlines" [value]="a.code">
                  {{ a.name }}
                </option>
              </select>
            </div>

            <div class="space-y-3 pt-1 md:col-span-2">
              <label
                class="flex items-center justify-between rounded-xl border px-4 py-2.5"
                style="border-color:var(--border)"
              >
                <span class="text-sm">
                  Apenas voo direto
                </span>

                <input
                  type="checkbox"
                  [(ngModel)]="onlyDirect"
                  class="h-4 w-4"
                />
              </label>

              <label
                class="flex items-center justify-between rounded-xl border px-4 py-2.5"
                style="border-color:var(--border)"
              >
                <span class="text-sm">
                  Bagagem despachada incluída
                </span>

                <input
                  type="checkbox"
                  [(ngModel)]="includeBaggage"
                  class="h-4 w-4"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Card lateral de confirmação -->
        <div
          class="rounded-2xl border p-6 shadow-soft space-y-5 h-fit lg:sticky lg:top-20"
          style="background:var(--card); border-color:var(--border)"
        >
          <div class="rounded-xl bg-brand-gradient text-white p-5">
            <div class="text-xs uppercase tracking-wider text-white/80">
              Rota
            </div>

            <div class="mt-2 flex items-center gap-3 font-display text-xl">
              <span>{{ searchForm.origem || 'Origem' }}</span>

              <div class="flex-1 border-t border-dashed border-white/40"></div>

              <span class="rotate-[-45deg] inline-block">
                ✈
              </span>

              <div class="flex-1 border-t border-dashed border-white/40"></div>

              <span>{{ searchForm.destino || 'Destino' }}</span>
            </div>

            <div class="mt-2 text-xs text-white/80 capitalize">
              {{ cabinLabel[cabin] || cabin }}
              ·
              {{ tripType === 'ida' ? 'Somente ida' : 'Ida e volta' }}
            </div>
          </div>

          <div class="rounded-xl p-4 space-y-3" style="background:var(--accent)">
            <div class="flex justify-between gap-3 text-sm">
              <span style="color:var(--muted-foreground)">Ida</span>
              <strong>{{ searchForm.dataIda || 'Não definida' }}</strong>
            </div>

            <div class="flex justify-between gap-3 text-sm">
              <span style="color:var(--muted-foreground)">Volta</span>
              <strong>
                {{ tripType === 'ida' ? 'Somente ida' : (searchForm.dataVolta || 'Não definida') }}
              </strong>
            </div>

            <div class="flex justify-between gap-3 text-sm">
              <span style="color:var(--muted-foreground)">Passageiros</span>
              <strong>{{ totalPassengers }}</strong>
            </div>
          </div>

          <p class="text-sm" style="color:var(--muted-foreground)">
            A AndidaTour consultará as APIs conectadas e retornará as melhores opções em poucos segundos.
          </p>

          <button
            type="button"
            (click)="buscarMelhoresOpcoes()"
            class="search-button"
          >
            Buscar melhores opções →
          </button>
        </div>
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
      min-height: 42px;
      transition:
        border-color 0.18s ease,
        box-shadow 0.18s ease,
        background 0.18s ease;
    }

    .input-field:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px oklch(0.48 0.15 255 / 0.14);
    }

    .input-field:disabled {
      cursor: not-allowed;
      background: var(--accent);
    }

    .input-error {
      border-color: var(--destructive) !important;
      box-shadow: 0 0 0 3px oklch(0.58 0.2 25 / 0.14) !important;
    }

    .field-error {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.75rem;
      color: var(--destructive);
    }

    .search-button {
      width: 100%;
      min-height: 44px;
      border: 0;
      border-radius: 0.9rem;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      font-size: 0.9rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 12px 26px oklch(0.48 0.15 255 / 0.25);
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        filter 0.18s ease;
    }

    .search-button:hover {
      transform: translateY(-2px);
      filter: brightness(1.04);
      box-shadow: 0 16px 34px oklch(0.48 0.15 255 / 0.33);
    }

    .search-button:active {
      transform: translateY(0);
    }
  `]
})
export class NovaCotacaoComponent implements OnInit {
  tripType = 'ida-volta';
  cabin = 'economica';

  adults = 1;
  children = 0;
  infants = 0;

  onlyDirect = false;
  includeBaggage = true;
  preferredAirline = '';

  airports: Airport[] = [];
  airlines: Airline[] = [];

  submitted = false;

  searchForm = {
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
  };

  tripTypes = [
    { value: 'ida-volta', label: 'Ida e volta' },
    { value: 'ida', label: 'Somente ida' }
  ];

  cabinLabel: Record<string, string> = {
    economica: 'Econômica',
    executiva: 'Executiva',
    primeira: 'Primeira classe'
  };

  constructor(
    private flightService: FlightService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.flightService.getAirports().subscribe(d => this.airports = d);
    this.flightService.getAirlines().subscribe(d => this.airlines = d);
  }

  get totalPassengers() {
    return Number(this.adults || 0) + Number(this.children || 0) + Number(this.infants || 0);
  }

  normalizeAirportInput(value: string) {
    return (value || '')
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase();
  }

  isAirportCodeValid(value: string) {
    return /^[A-Z]{3}$/.test((value || '').trim().toUpperCase());
  }

  isReturnDateRequired() {
    return this.tripType === 'ida-volta';
  }

  isSearchValid() {
    const hasValidRoute =
      this.isAirportCodeValid(this.searchForm.origem) &&
      this.isAirportCodeValid(this.searchForm.destino);

    const hasDepartureDate = !!this.searchForm.dataIda;

    const hasReturnDate =
      !this.isReturnDateRequired() ||
      !!this.searchForm.dataVolta;

    return hasValidRoute && hasDepartureDate && hasReturnDate;
  }

  buscarMelhoresOpcoes() {
    this.submitted = true;

    this.searchForm.origem = this.normalizeAirportInput(this.searchForm.origem);
    this.searchForm.destino = this.normalizeAirportInput(this.searchForm.destino);

    if (!this.isSearchValid()) {
      this.toast.error('Informe origem, destino e data da viagem para buscar as opções.');
      return;
    }

    if (this.searchForm.origem === this.searchForm.destino) {
      this.toast.error('Origem e destino não podem ser iguais.');
      return;
    }

    if (this.tripType === 'ida') {
      this.searchForm.dataVolta = '';
    }

    this.router.navigate(['/app/resultados'], {
      queryParams: {
        from: this.searchForm.origem,
        to: this.searchForm.destino,
        cabin: this.cabin,
        dateFrom: this.searchForm.dataIda,
        dateTo: this.tripType === 'ida' ? null : this.searchForm.dataVolta,
        adults: this.adults,
        children: this.children,
        infants: this.infants,
        onlyDirect: this.onlyDirect,
        includeBaggage: this.includeBaggage,
        airline: this.preferredAirline || null,
      }
    });
  }
}