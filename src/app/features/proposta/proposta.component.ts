import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuoteService, QuoteResponse } from '../../core/services/quote.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ToastService } from '../../core/services/toast.service';
import { FlightOption } from '../../models';

@Component({
  selector: 'app-proposta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TopbarComponent],
  template: `
    <app-topbar title="Proposta comercial" subtitle="Gere uma proposta elegante para o seu cliente." />

    <main class="flex-1 p-4 md:p-8" *ngIf="quote">
      <div class="grid gap-6 lg:grid-cols-[380px_1fr]">

        <!-- Formulário -->
        <div class="rounded-2xl border p-6 shadow-soft space-y-5 h-fit lg:sticky lg:top-20"
             style="background:var(--card); border-color:var(--border)">
          <h3 class="font-display text-lg font-semibold">Dados da proposta</h3>
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Nome do cliente</label>
              <input [(ngModel)]="clientName" class="input-field" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Validade da cotação</label>
              <input [(ngModel)]="validUntil" type="date" class="input-field" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Observações</label>
              <textarea [(ngModel)]="notes" rows="3" class="input-field resize-none"
                        placeholder="Tarifa sujeita à disponibilidade…"></textarea>
            </div>
          </div>

          <div class="border-t" style="border-color:var(--border)"></div>

          <div>
            <p class="text-xs font-medium mb-3" style="color:var(--muted-foreground)">Compartilhar proposta</p>
            <div class="grid grid-cols-2 gap-2">
              <button (click)="copyLink()"
                      class="flex items-center justify-center gap-2 h-10 rounded-lg border text-sm hover:bg-accent transition"
                      style="border-color:var(--border)">
                🔗 Copiar link
              </button>
              <button (click)="sendWhatsapp()"
                      class="flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium text-white"
                      style="background:oklch(0.5 0.16 155)">
                💬 WhatsApp
              </button>
            </div>
          </div>
        </div>

        <!-- Preview da proposta -->
        <div class="rounded-2xl border shadow-card overflow-hidden" style="border-color:var(--border)">
          <div class="bg-brand-gradient text-white p-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                  <span class="rotate-[-45deg] inline-block">✈</span>
                </div>
                <span class="font-display text-lg font-semibold">AndidaTour</span>
              </div>
              <span class="text-xs border border-white/30 rounded-full px-3 py-1 bg-white/10">
                Proposta #{{ quote.id }}
              </span>
            </div>
            <h2 class="mt-6 font-display text-3xl font-semibold">Sua viagem para {{ quote.to }}</h2>
            <p class="mt-1 text-white/80">Preparada com cuidado para {{ clientName }}.</p>
          </div>

          <div class="p-8 space-y-6" style="background:var(--card)">

            <!-- Voo -->
            <div class="rounded-2xl border p-5" style="border-color:var(--border)">
              <div *ngIf="flight" class="flex items-center gap-3 mb-4">
                <div class="h-11 w-11 rounded-xl flex items-center justify-center text-white font-display font-semibold"
                     [style.background]="flight.airline.color">
                  {{ flight.airline.initials }}
                </div>
                <div>
                  <div class="font-medium">{{ flight.airline.name }}</div>
                  <div class="text-xs capitalize" style="color:var(--muted-foreground)">{{ flight.cabin }}</div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4 items-center">
                <div>
                  <div class="font-display text-2xl font-semibold">{{ flight?.departure ?? '—' }}</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">{{ quote.from }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 border-t border-dashed" style="border-color:var(--border)"></div>
                  <span class="text-xs" style="color:var(--brand)">✈</span>
                  <div class="flex-1 border-t border-dashed" style="border-color:var(--border)"></div>
                </div>
                <div class="text-right">
                  <div class="font-display text-2xl font-semibold">{{ flight?.arrival ?? '—' }}</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">{{ quote.to }}</div>
                </div>
              </div>
            </div>

            <!-- Preço -->
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="rounded-2xl p-5" style="background:var(--accent)">
                <div class="text-xs uppercase tracking-wider" style="color:var(--muted-foreground)">Em dinheiro</div>
                <div class="font-display text-2xl font-semibold mt-1">
                  {{ quote.bestPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}
                </div>
              </div>
              <div *ngIf="flight?.miles" class="rounded-2xl p-5" style="background:oklch(0.72 0.12 185 / 0.12)">
                <div class="text-xs uppercase tracking-wider" style="color:var(--muted-foreground)">Em milhas</div>
                <div class="font-display text-2xl font-semibold mt-1" style="color:var(--teal)">
                  {{ flight!.miles | number:'1.0-0':'pt-BR' }} mi
                </div>
                <div class="text-xs" style="color:var(--muted-foreground)">{{ flight!.milesProgram }}</div>
              </div>
            </div>

            <div *ngIf="notes" class="rounded-xl p-4 text-sm" style="background:var(--accent)">
              <span class="font-medium">Obs.: </span>{{ notes }}
            </div>

            <div class="flex items-center justify-between text-xs pt-2 border-t"
                 style="color:var(--muted-foreground); border-color:var(--border)">
              <span>Status: <strong class="capitalize">{{ quote.status }}</strong></span>
              <span *ngIf="validUntil">Válida até {{ validUntil | date:'dd/MM/yyyy' }}</span>
            </div>

            <div class="flex gap-2 justify-end pt-2">
              <a routerLink="/app/propostas"
                 class="px-4 py-2 rounded-lg text-sm border hover:bg-accent transition"
                 style="border-color:var(--border)">
                ← Voltar
              </a>
              <button (click)="enviarProposta()" [disabled]="sending"
                      class="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                      style="background:var(--primary)">
                {{ sending ? 'Enviando…' : 'Marcar como enviada →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Skeleton -->
    <main class="flex-1 p-4 md:p-8" *ngIf="!quote">
      <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div class="rounded-2xl border p-6 h-96 animate-pulse" style="background:var(--card)"></div>
        <div class="rounded-2xl border h-[500px] animate-pulse" style="background:var(--card)"></div>
      </div>
    </main>
  `,
  styles: [`
    .input-field { width:100%; border-radius:var(--radius); border:1px solid var(--border); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; background:white; }
  `]
})
export class PropostaComponent implements OnInit {
  quote: QuoteResponse | undefined;
  flight: FlightOption | undefined;
  clientName = '';
  validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  notes = 'Tarifa sujeita à disponibilidade no momento da emissão.';
  sending = false;

  constructor(
    private route: ActivatedRoute,
    private quoteService: QuoteService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.quoteService.getById(id).subscribe({
      next: q => {
        this.quote = q;
        this.clientName = q.clientName;
        if (q.flightDataJson) {
          this.flight = this.quoteService.deserializeFlight(q.flightDataJson);
        }
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Erro ao carregar proposta.')
    });
  }

  copyLink() {
    navigator.clipboard.writeText(`https://andidatour.app/p/${this.quote?.id}`);
    this.toast.success('🔗 Link copiado para a área de transferência!');
  }

  sendWhatsapp() {
    if (!this.quote) return;
    const msg = encodeURIComponent(`Olá, ${this.clientName}! Sua proposta ${this.quote.from} → ${this.quote.to}: https://andidatour.app/p/${this.quote.id}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  enviarProposta() {
    if (!this.quote) return;
    this.sending = true;
    this.quoteService.updateStatus(this.quote.id, 'Enviada').subscribe({
      next: () => {
        this.sending = false;
        if (this.quote) this.quote.status = 'enviada';
        this.toast.success('🎉 Proposta marcada como enviada!');
        this.cdr.detectChanges();
      },
      error: () => {
        this.sending = false;
        this.toast.error('Erro ao atualizar status.');
        this.cdr.detectChanges();
      }
    });
  }
}