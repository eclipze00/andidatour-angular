import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { Airport, Airline } from '../../models';

@Component({
  selector: 'app-nova-cotacao',
  standalone: true,
  imports: [FormsModule, CommonModule, TopbarComponent],
  template: `
    <app-topbar title="Nova cotação" subtitle="Configure os detalhes para encontrar as melhores opções." />
    <main class="flex-1 p-4 md:p-8">
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">

        <!-- Formulário principal -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-soft space-y-7" style="background:var(--card); border-color:var(--border)">

          <!-- Tipo de viagem -->
          <div>
            <label class="text-sm font-semibold mb-3 block">Tipo de viagem</label>
            <div class="flex gap-3">
              <label *ngFor="let opt of tripTypes" class="flex items-center gap-2 rounded-xl border px-4 py-2.5 cursor-pointer transition"
                [style.border-color]="tripType === opt.value ? 'var(--brand)' : 'var(--border)'"
                [style.background]="tripType === opt.value ? 'var(--accent)' : 'transparent'">
                <input type="radio" [(ngModel)]="tripType" [value]="opt.value" class="hidden" />
                <span class="text-sm font-medium">{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <!-- Origem / Destino / Datas -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Origem</label>
              <select [(ngModel)]="from" class="input-field">
                <option *ngFor="let a of airports" [value]="a.code">{{ a.city }} ({{ a.code }}) — {{ a.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Destino</label>
              <select [(ngModel)]="to" class="input-field">
                <option *ngFor="let a of airports" [value]="a.code">{{ a.city }} ({{ a.code }}) — {{ a.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Data de ida</label>
              <input type="date" [(ngModel)]="dateFrom" class="input-field" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Data de volta</label>
              <input type="date" [(ngModel)]="dateTo" class="input-field" [disabled]="tripType === 'ida'" />
            </div>
          </div>

          <!-- Passageiros -->
          <div>
            <label class="text-sm font-semibold mb-3 block">Passageiros</label>
            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1.5"><label class="text-xs" style="color:var(--muted-foreground)">Adultos</label><input type="number" [(ngModel)]="adults" min="1" class="input-field" /></div>
              <div class="space-y-1.5"><label class="text-xs" style="color:var(--muted-foreground)">Crianças</label><input type="number" [(ngModel)]="children" min="0" class="input-field" /></div>
              <div class="space-y-1.5"><label class="text-xs" style="color:var(--muted-foreground)">Bebês</label><input type="number" [(ngModel)]="infants" min="0" class="input-field" /></div>
            </div>
          </div>

          <!-- Classe / Preferências -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Classe da cabine</label>
              <select [(ngModel)]="cabin" class="input-field">
                <option value="economica">Econômica</option>
                <option value="executiva">Executiva</option>
                <option value="primeira">Primeira classe</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Companhia preferida</label>
              <select class="input-field">
                <option value="">Qualquer</option>
                <option *ngFor="let a of airlines" [value]="a.code">{{ a.name }}</option>
              </select>
            </div>
            <div class="space-y-3 pt-1">
              <label class="flex items-center justify-between rounded-xl border px-4 py-2.5" style="border-color:var(--border)">
                <span class="text-sm">Apenas voo direto</span>
                <input type="checkbox" [(ngModel)]="onlyDirect" class="h-4 w-4" />
              </label>
              <label class="flex items-center justify-between rounded-xl border px-4 py-2.5" style="border-color:var(--border)">
                <span class="text-sm">Bagagem despachada incluída</span>
                <input type="checkbox" [(ngModel)]="includeBaggage" [checked]="true" class="h-4 w-4" />
              </label>
            </div>
          </div>
        </div>

        <!-- Card lateral de confirmação -->
        <div class="rounded-2xl border p-6 shadow-soft space-y-5 h-fit lg:sticky lg:top-20" style="background:var(--card); border-color:var(--border)">
          <div class="rounded-xl bg-brand-gradient text-white p-5">
            <div class="text-xs uppercase tracking-wider text-white/80">Rota</div>
            <div class="mt-2 flex items-center gap-3 font-display text-xl">
              <span>{{ from }}</span>
              <div class="flex-1 border-t border-dashed border-white/40"></div>
              <span class="rotate-[-45deg] inline-block">✈</span>
              <div class="flex-1 border-t border-dashed border-white/40"></div>
              <span>{{ to }}</span>
            </div>
            <div class="mt-2 text-xs text-white/80 capitalize">{{ cabin }} · {{ tripType === 'ida' ? 'Somente ida' : 'Ida e volta' }}</div>
          </div>
          <p class="text-sm" style="color:var(--muted-foreground)">
            A AndidaTour consultará as APIs conectadas e retornará as melhores opções em poucos segundos.
          </p>
          <button (click)="onSearch()" class="w-full h-11 rounded-lg font-medium text-white" style="background:var(--primary)">
            Buscar melhores opções →
          </button>
        </div>
      </div>
    </main>
  `,
  styles: [`.input-field { width:100%; border-radius:var(--radius); border:1px solid var(--border); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; background:white; }`]
})
export class NovaCotacaoComponent implements OnInit {
  tripType = 'ida-volta';
  from = 'GRU'; to = 'LIS'; cabin = 'economica';
  dateFrom = '2026-06-12'; dateTo = '2026-06-22';
  adults = 1; children = 0; infants = 0;
  onlyDirect = false; includeBaggage = true;
  airports: Airport[] = []; airlines: Airline[] = [];

  tripTypes = [{ value: 'ida-volta', label: 'Ida e volta' }, { value: 'ida', label: 'Somente ida' }];

  constructor(private flightService: FlightService, private router: Router) {}

  ngOnInit() {
    this.flightService.getAirports().subscribe(d => this.airports = d);
    this.flightService.getAirlines().subscribe(d => this.airlines = d);
  }

  onSearch() {
    this.router.navigate(['/app/resultados'], { queryParams: { from: this.from, to: this.to, cabin: this.cabin } });
  }
}