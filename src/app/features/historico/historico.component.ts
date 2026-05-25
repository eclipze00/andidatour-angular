import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { QuoteService, QuoteResponse } from '../../core/services/quote.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, RouterLink, TopbarComponent],
  template: `
    <app-topbar title="Histórico de cotações" subtitle="Acompanhe todas as cotações realizadas." />
    <main class="flex-1 p-4 md:p-8">
      <div class="rounded-2xl border shadow-soft" style="background:var(--card); border-color:var(--border)">
        <div class="p-6 flex items-center justify-between gap-3 border-b" style="border-color:var(--border)">
          <input placeholder="Buscar por cliente, rota…" class="input-field max-w-sm" />
          <a routerLink="/app/nova-cotacao">
            <button class="px-4 py-2 rounded-lg text-sm font-medium text-white" style="background:var(--primary)">Nova cotação</button>
          </a>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="p-6 space-y-3">
          <div *ngFor="let i of [0,1,2,3]" class="h-12 rounded-xl animate-pulse" style="background:var(--accent)"></div>
        </div>

        <!-- Vazio -->
        <div *ngIf="!loading && quotes.length === 0" class="p-10 text-center">
          <div class="text-3xl mb-2">📋</div>
          <div class="text-sm" style="color:var(--muted-foreground)">Nenhuma cotação ainda.</div>
          <a routerLink="/app/nova-cotacao" class="mt-3 inline-block text-sm font-medium hover:underline" style="color:var(--brand)">Fazer primeira cotação →</a>
        </div>

        <div *ngIf="!loading" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="background:var(--accent)">
                <th class="text-left px-4 py-3 font-medium" style="color:var(--muted-foreground)">Cliente</th>
                <th class="text-left px-4 py-3 font-medium" style="color:var(--muted-foreground)">Rota</th>
                <th class="text-left px-4 py-3 font-medium" style="color:var(--muted-foreground)">Data da viagem</th>
                <th class="text-left px-4 py-3 font-medium" style="color:var(--muted-foreground)">Melhor valor</th>
                <th class="text-left px-4 py-3 font-medium" style="color:var(--muted-foreground)">Status</th>
                <th class="text-right px-4 py-3 font-medium" style="color:var(--muted-foreground)">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let q of quotes" class="border-t hover:bg-accent/30 transition" style="border-color:var(--border)">
                <td class="px-4 py-3 font-medium">{{ q.clientName }}</td>
                <td class="px-4 py-3" style="color:var(--muted-foreground)">{{ q.from }} → {{ q.to }}</td>
                <td class="px-4 py-3" style="color:var(--muted-foreground)">{{ q.travelDate | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3 font-semibold">{{ q.bestPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-1 rounded-full border capitalize" [class]="getStatusClass(q.status)">{{ q.status }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <a [routerLink]="['/app/proposta', q.id]">
                      <button class="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-sm">👁</button>
                    </a>
                    <button class="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-sm">📋</button>
                    <button (click)="deleteQuote(q.id)" class="h-8 w-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-sm text-red-500">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  `,
  styles: [`.input-field { border-radius:var(--radius); border:1px solid var(--border); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; background:var(--accent); width:100%; }`]
})
export class HistoricoComponent implements OnInit, OnDestroy {
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
        this.toast.error('Erro ao carregar cotações.'); 
        this.cdr.detectChanges();
      }
    });
  }

  deleteQuote(id: number) {
    this.quoteService.delete(id).subscribe(() => {
      this.quotes = this.quotes.filter(q => q.id !== id);
      this.toast.success('Cotação removida.');
      this.cdr.detectChanges();
    }, () => {
      this.toast.error('Erro ao remover cotação.');
      this.cdr.detectChanges();
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