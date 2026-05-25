import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { QuoteService, QuoteResponse } from '../../core/services/quote.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-propostas',
  standalone: true,
  imports: [CommonModule, RouterLink, TopbarComponent],
  template: `
    <app-topbar title="Propostas" subtitle="Documentos comerciais enviados aos seus clientes." />
    <main class="flex-1 p-4 md:p-8 space-y-6">

      <div *ngIf="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div *ngFor="let i of [0,1,2]" class="rounded-2xl border h-56 animate-pulse" style="background:var(--card)"></div>
      </div>

      <div *ngIf="!loading && quotes.length === 0"
           class="rounded-2xl border p-10 text-center shadow-soft"
           style="background:var(--card)">
        <div class="text-4xl mb-3">📄</div>
        <div class="font-medium">Nenhuma proposta ainda</div>
        <div class="text-sm mt-1" style="color:var(--muted-foreground)">Faça uma cotação e gere sua primeira proposta.</div>
        <a routerLink="/app/nova-cotacao" class="mt-4 inline-block px-4 py-2 rounded-lg text-sm font-medium text-white" style="background:var(--primary)">
          Nova cotação
        </a>
      </div>

      <div *ngIf="!loading && quotes.length > 0" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div *ngFor="let q of quotes" class="rounded-2xl border overflow-hidden shadow-soft hover:shadow-card transition" style="border-color:var(--border)">
          <div class="bg-brand-gradient text-white p-5">
            <div class="flex items-center justify-between text-xs">
              <span class="opacity-80">Proposta #{{ q.id }}</span>
              <span>📄</span>
            </div>
            <div class="mt-3 flex items-center gap-2 font-display text-xl">
              {{ q.from }} <span class="rotate-[-45deg] inline-block text-sm">✈</span> {{ q.to }}
            </div>
            <div class="mt-1 text-xs text-white/70">{{ q.travelDate | date:'dd/MM/yyyy' }}</div>
          </div>
          <div class="p-5 space-y-3" style="background:var(--card)">
            <div>
              <div class="text-xs" style="color:var(--muted-foreground)">Cliente</div>
              <div class="font-medium">{{ q.clientName }}</div>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs" style="color:var(--muted-foreground)">Valor</div>
                <div class="font-display text-lg font-semibold">{{ q.bestPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</div>
              </div>
              <span class="text-xs px-2 py-1 rounded-full border capitalize" [class]="getStatusClass(q.status)">{{ q.status }}</span>
            </div>
            <a [routerLink]="['/app/proposta', q.id]">
              <button class="w-full py-2 rounded-lg text-sm font-medium text-white mt-1" style="background:var(--primary)">
                Abrir proposta
              </button>
            </a>
          </div>
        </div>
      </div>
    </main>
  `
})
export class PropostasComponent implements OnInit, OnDestroy {
  quotes: QuoteResponse[] = [];
  loading = false;
  private sub!: Subscription;

  constructor(
    private quoteService: QuoteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadQuotes();
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.loadQuotes());
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  loadQuotes() {
  this.loading = true;
  this.quoteService.getAll().subscribe({
    next: d => { this.quotes = d; this.loading = false; this.cdr.detectChanges(); },
    error: () => {
      this.loading = false;
      this.toast.error('Erro ao carregar propostas.');  // ← adicionado
      this.cdr.detectChanges();
    }
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
}