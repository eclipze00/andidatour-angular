import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nova-solicitacao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="flex-1 p-4 md:p-8 space-y-8">

      <!-- Hero -->
      <div class="rounded-2xl overflow-hidden bg-brand-gradient text-white shadow-card p-6 md:p-8 grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            ✈️ Solicitação de cotação
          </span>

          <h2 class="mt-3 font-display text-2xl md:text-3xl font-semibold leading-tight">
            Conte pra gente sua rota.
          </h2>

          <p class="mt-1 text-sm text-white/80">
            Preencha origem, destino, datas e preferências. O agente recebe tudo organizado para cotar as melhores opções.
          </p>

          <div class="mt-5 flex flex-col sm:flex-row gap-2">
            <a routerLink="/cliente/home">
              <button
                class="h-11 px-5 rounded-lg font-semibold text-sm bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
              >
                ← Voltar para solicitações
              </button>
            </a>
          </div>
        </div>

        <div class="hidden md:flex justify-end">
          <div class="rounded-2xl bg-white/10 backdrop-blur p-5 w-full max-w-xs border border-white/15">
            <div class="text-sm text-white/75">Resumo rápido</div>

            <div class="mt-3 font-display text-2xl font-semibold">
              {{ form.fromCode || 'Origem' }} → {{ form.toCode || 'Destino' }}
            </div>

            <div class="mt-2 text-sm text-white/75">
              {{ form.passengers }}
              {{ form.passengers === 1 ? 'passageiro' : 'passageiros' }}
              · {{ cabinLabel[form.cabinClass] }}
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-start">

        <!-- Formulário -->
      <div class="rounded-2xl border p-6 md:p-7 shadow-soft" style="background:var(--card); border-color:var(--border)">
        <div class="flex items-center justify-between gap-4 mb-7">
          <div>
            <h3 class="font-display text-xl font-semibold tracking-tight">
              Dados da viagem
            </h3>
            <p class="text-sm mt-1" style="color:var(--muted-foreground)">
              Preencha as informações principais para o agente montar sua cotação.
            </p>
          </div>

          <span
            class="hidden sm:inline-flex text-xs px-3 py-1 rounded-full font-medium"
            style="background:var(--accent); color:var(--muted-foreground)"
          >
            Etapa única
          </span>
        </div>

        <div class="space-y-6">

          <!-- Tipo de viagem -->
          <div>
            <label class="block text-sm font-semibold mb-3">
              Tipo de viagem
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                *ngFor="let opt of tripTypes"
                class="h-12 rounded-xl border flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold transition select-none"
                [style.border-color]="form.tripType === opt.value ? 'var(--brand)' : 'var(--border)'"
                [style.background]="form.tripType === opt.value ? 'var(--brand-subtle)' : 'var(--card)'"
                [style.color]="form.tripType === opt.value ? 'var(--brand)' : 'var(--foreground)'"
              >
                <input
                  type="radio"
                  [(ngModel)]="form.tripType"
                  [value]="opt.value"
                  class="hidden"
                />

                {{ opt.label }}
              </label>
            </div>
          </div>

          <!-- Origem / Destino -->
          <div class="grid gap-5 md:grid-cols-2">
            <div class="space-y-2">
              <label class="block text-sm font-semibold">
                Origem
              </label>

              <input
                [(ngModel)]="form.fromCode"
                class="travel-input"
                placeholder="Ex: GRU, SDU, BSB"
                maxlength="3"
                style="text-transform:uppercase;"
              />

              <span
                *ngIf="submitted && !form.fromCode"
                class="text-xs block"
                style="color:var(--destructive)"
              >
                Informe a origem.
              </span>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold">
                Destino
              </label>

              <input
                [(ngModel)]="form.toCode"
                class="travel-input"
                placeholder="Ex: LIS, MIA, CDG"
                maxlength="3"
                style="text-transform:uppercase;"
              />

              <span
                *ngIf="submitted && !form.toCode"
                class="text-xs block"
                style="color:var(--destructive)"
              >
                Informe o destino.
              </span>
            </div>
          </div>

          <!-- Datas -->
          <div class="grid gap-5 md:grid-cols-2">
            <div class="space-y-2">
              <label class="block text-sm font-semibold">
                Data de ida
              </label>

              <input
                type="date"
                [(ngModel)]="form.departureDate"
                class="travel-input"
              />

              <span
                *ngIf="submitted && !form.departureDate"
                class="text-xs block"
                style="color:var(--destructive)"
              >
                Informe a data de ida.
              </span>
            </div>

            <div class="space-y-2">
              <label
                class="block text-sm font-semibold"
                [style.opacity]="form.tripType === 'oneway' ? '0.45' : '1'"
              >
                Data de volta
              </label>

              <input
                type="date"
                [(ngModel)]="form.returnDate"
                class="travel-input"
                [disabled]="form.tripType === 'oneway'"
                [style.opacity]="form.tripType === 'oneway' ? '0.45' : '1'"
              />
            </div>
          </div>

          <!-- Passageiros / Classe -->
          <div class="grid gap-5 md:grid-cols-2">
            <div class="space-y-2">
              <label class="block text-sm font-semibold">
                Passageiros
              </label>

              <input
                type="number"
                [(ngModel)]="form.passengers"
                class="travel-input"
                min="1"
                max="20"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold">
                Classe
              </label>

              <select
                [(ngModel)]="form.cabinClass"
                class="travel-input"
              >
                <option value="economy">Econômica</option>
                <option value="business">Executiva</option>
                <option value="first">Primeira classe</option>
              </select>
            </div>
          </div>

          <!-- Observações -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold">
              Observações ou preferências
              <span class="font-normal" style="color:var(--muted-foreground)">
                (opcional)
              </span>
            </label>

            <textarea
              [(ngModel)]="form.notes"
              class="travel-input min-h-[130px]"
              rows="5"
              placeholder="Ex: prefiro voos diretos, tenho fidelidade com LATAM, datas flexíveis..."
            ></textarea>
          </div>

          <!-- Ações -->
          <div
            class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t"
            style="border-color:var(--border)"
          >
            <a routerLink="/cliente/home" class="w-full sm:w-auto">
              <button
                type="button"
                class="w-full sm:w-auto h-11 px-5 rounded-xl border text-sm font-semibold transition hover:opacity-80"
                style="border-color:var(--border); color:var(--foreground); background:var(--card)"
              >
                Cancelar
              </button>
            </a>

            <button
              type="button"
              (click)="onSubmit()"
              [disabled]="loading"
              class="send-button group"
            >
              <span class="send-button-shine"></span>

              <span class="relative z-10 flex items-center justify-center gap-2">
                <span>{{ loading ? 'Enviando…' : 'Enviar solicitação' }}</span>

                <span
                  *ngIf="!loading"
                  class="transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>

                <span
                  *ngIf="loading"
                  class="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                ></span>
              </span>
            </button>
          </div>
        </div>
      </div>

        <!-- Preview lateral -->
        <aside class="rounded-2xl border p-6 shadow-soft lg:sticky lg:top-6" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-center gap-3 mb-5">
            <div
              class="h-10 w-10 rounded-xl flex items-center justify-center"
              style="background:var(--accent)"
            >
              🧭
            </div>

            <div>
              <h3 class="font-display text-base font-semibold">
                Prévia da solicitação
              </h3>
              <p class="text-xs" style="color:var(--muted-foreground)">
                Um resumo antes do envio.
              </p>
            </div>
          </div>

          <div class="space-y-4 text-sm">
            <div class="rounded-xl p-4" style="background:var(--accent)">
              <div class="text-xs mb-1" style="color:var(--muted-foreground)">
                Rota
              </div>

              <div class="font-display text-xl font-semibold">
                {{ form.fromCode || '---' }} → {{ form.toCode || '---' }}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl p-3" style="background:var(--muted-bg)">
                <div class="text-xs mb-1" style="color:var(--muted-foreground)">
                  Ida
                </div>

                <div class="font-medium">
                  {{ form.departureDate || 'Não definida' }}
                </div>
              </div>

              <div class="rounded-xl p-3" style="background:var(--muted-bg)">
                <div class="text-xs mb-1" style="color:var(--muted-foreground)">
                  Volta
                </div>

                <div class="font-medium">
                  {{ form.tripType === 'oneway' ? 'Somente ida' : (form.returnDate || 'Não definida') }}
                </div>
              </div>
            </div>

            <div class="rounded-xl p-3 flex items-center justify-between" style="background:var(--muted-bg)">
              <span style="color:var(--muted-foreground)">Passageiros</span>
              <strong>{{ form.passengers }}</strong>
            </div>

            <div class="rounded-xl p-3 flex items-center justify-between" style="background:var(--muted-bg)">
              <span style="color:var(--muted-foreground)">Classe</span>
              <strong>{{ cabinLabel[form.cabinClass] }}</strong>
            </div>

            <div class="rounded-xl p-3" style="background:var(--muted-bg)">
              <div class="text-xs mb-1" style="color:var(--muted-foreground)">
                Observações
              </div>

              <div style="color:var(--foreground-2)">
                {{ form.notes || 'Nenhuma observação informada.' }}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  `,
  styles: [`
    .travel-input {
      width: 100%;
      min-height: 46px;
      border: 1px solid var(--border);
      border-radius: 0.875rem;
      background: var(--background);
      color: var(--foreground);
      padding: 0.75rem 0.95rem;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    }

    .travel-input::placeholder {
      color: var(--muted-foreground);
      opacity: 0.75;
    }

    .travel-input:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 4px oklch(0.48 0.15 255 / 0.12);
      background: var(--card);
    }

    .travel-input:disabled {
      cursor: not-allowed;
      background: var(--accent);
    }

    textarea.travel-input {
      resize: vertical;
      line-height: 1.5;
    }

    select.travel-input {
      cursor: pointer;
    }

    .send-button {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      width: 100%;
      min-height: 46px;
      padding: 0 1.5rem;
      border: 0;
      border-radius: 0.875rem;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      color: white;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 12px 28px oklch(0.48 0.15 255 / 0.25);
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        filter 0.18s ease;
    }

    @media (min-width: 640px) {
      .send-button {
        width: auto;
      }
    }

    .send-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 16px 34px oklch(0.48 0.15 255 / 0.34);
      filter: brightness(1.04);
    }

    .send-button:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 8px 18px oklch(0.48 0.15 255 / 0.22);
    }

    .send-button:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 4px oklch(0.48 0.15 255 / 0.18),
        0 16px 34px oklch(0.48 0.15 255 / 0.34);
    }

    .send-button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
      transform: none;
      box-shadow: none;
    }

    .send-button-shine {
      position: absolute;
      inset: 0;
      z-index: 0;
      background: linear-gradient(
        120deg,
        transparent 0%,
        transparent 35%,
        rgba(255, 255, 255, 0.35) 50%,
        transparent 65%,
        transparent 100%
      );
      transform: translateX(-120%);
      transition: transform 0.6s ease;
    }

    .send-button:hover:not(:disabled) .send-button-shine {
      transform: translateX(120%);
    }
  `]
})
export class NovaSolicitacaoComponent {
  submitted = false;
  loading = false;

  form = {
    tripType: 'roundtrip',
    fromCode: '',
    toCode: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    cabinClass: 'economy',
    notes: '',
  };

  tripTypes = [
    { value: 'roundtrip', label: '↔ Ida e volta' },
    { value: 'oneway', label: '→ Somente ida' },
  ];

  cabinLabel: Record<string, string> = {
    economy: 'Econômica',
    business: 'Executiva',
    first: 'Primeira'
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
  ) {}

  isValid() {
    return !!(this.form.fromCode && this.form.toCode && this.form.departureDate);
  }

  get userName() {
    return this.auth.userName();
  }

  onSubmit() {
    this.submitted = true;

    if (!this.isValid()) return;

    this.loading = true;

    this.http.post('http://localhost:5075/api/quote-requests', {
      fromCode: this.form.fromCode.toUpperCase(),
      toCode: this.form.toCode.toUpperCase(),
      departureDate: this.form.departureDate,
      returnDate: this.form.tripType === 'oneway' ? null : this.form.returnDate,
      passengers: this.form.passengers,
      tripType: this.form.tripType,
      cabinClass: this.form.cabinClass,
      notes: this.form.notes || null,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Solicitação enviada! Aguarde o retorno do agente.');
        this.cdr.detectChanges();

        setTimeout(() => this.router.navigate(['/cliente/home']), 1800);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erro ao enviar. Tente novamente.');
        this.cdr.detectChanges();
      }
    });
  }
}