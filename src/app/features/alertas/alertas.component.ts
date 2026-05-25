import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AlertService } from '../../core/services/alert.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { PriceAlert } from '../../models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar title="Alertas de preço" subtitle="Seja notificado quando os preços baixarem." />
    <main class="flex-1 p-4 md:p-8 space-y-6">
      <div class="flex justify-end">
        <button (click)="showModal = true" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background:var(--primary)">
          + Novo alerta
        </button>
      </div>

      <div *ngIf="loading" class="grid gap-4 md:grid-cols-2">
        <div *ngFor="let i of [0,1]" class="rounded-2xl border p-6 h-48 animate-pulse" style="background:var(--card)"></div>
      </div>

      <div *ngIf="!loading && alerts.length === 0"
           class="rounded-2xl border p-10 text-center shadow-soft"
           style="background:var(--card)">
        <div class="text-4xl mb-3">🔔</div>
        <div class="font-medium">Nenhum alerta criado</div>
        <div class="text-sm mt-1" style="color:var(--muted-foreground)">Crie alertas para ser notificado quando os preços baixarem.</div>
      </div>

      <div *ngIf="!loading" class="grid gap-4 md:grid-cols-2">
        <div *ngFor="let a of alerts" class="rounded-2xl border p-6 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 rounded-xl flex items-center justify-center text-xl" style="background:var(--accent)">🔔</div>
              <div class="flex items-center gap-2 font-display text-lg font-semibold">
                {{ a.from }} <span class="text-sm rotate-[-45deg] inline-block" style="color:var(--brand)">✈</span> {{ a.to }}
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="a.active" (change)="toggleAlert(a.id)" class="sr-only peer" />
              <div class="w-11 h-6 rounded-full peer peer-checked:bg-blue-600 bg-gray-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-xs" style="color:var(--muted-foreground)">Período</div>
              <div>{{ a.periodStart | date:'dd/MM/yy' }} → {{ a.periodEnd | date:'dd/MM/yy' }}</div>
            </div>
            <div>
              <div class="text-xs" style="color:var(--muted-foreground)">Valor máximo</div>
              <div class="font-semibold">{{ a.maxPrice | currency:'BRL':'symbol':'1.0-0':'pt-BR' }}</div>
            </div>
          </div>
          <div *ngIf="a.milesProgram" class="mt-3">
            <span class="text-xs px-2 py-1 rounded-full" style="background:var(--accent)">{{ a.milesProgram }}</span>
          </div>
          <div class="mt-4 pt-4 border-t flex items-center gap-2" style="border-color:var(--border)">
            <span *ngFor="let c of a.channels" class="text-xs px-2 py-1 rounded-full border flex items-center gap-1" style="border-color:var(--border)">
              {{ channelIcon[c] }} {{ channelLabel[c] }}
            </span>
          </div>
        </div>
      </div>
    </main>

    <div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="rounded-2xl p-6 w-full max-w-md shadow-card space-y-4" style="background:var(--card)">
        <h3 class="font-display text-lg font-semibold">Criar alerta de preço</h3>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-sm font-medium">Origem</label><input [(ngModel)]="newAlert.from" class="input-field" placeholder="GRU" /></div>
          <div><label class="text-sm font-medium">Destino</label><input [(ngModel)]="newAlert.to" class="input-field" placeholder="LIS" /></div>
          <div><label class="text-sm font-medium">Período de</label><input type="date" [(ngModel)]="newAlert.periodStart" class="input-field" /></div>
          <div><label class="text-sm font-medium">Período até</label><input type="date" [(ngModel)]="newAlert.periodEnd" class="input-field" /></div>
        </div>
        <div><label class="text-sm font-medium">Valor máximo (R$)</label><input type="number" [(ngModel)]="newAlert.maxPrice" class="input-field" /></div>
        <div class="flex gap-2 pt-2">
          <button (click)="showModal = false" class="flex-1 py-2 rounded-lg text-sm border" style="border-color:var(--border)">Cancelar</button>
          <button (click)="saveAlert()" [disabled]="saving" class="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60" style="background:var(--primary)">
            {{ saving ? 'Salvando…' : 'Criar alerta' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`.input-field { width:100%; border-radius:var(--radius); border:1px solid var(--border); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; margin-top:0.25rem; }`]
})
export class AlertasComponent implements OnInit, OnDestroy {
  alerts: PriceAlert[] = [];
  showModal = false;
  newAlert: Partial<PriceAlert> = { channels: ['email'] };
  loading = false;
  saving = false;
  private sub!: Subscription;

  channelIcon: Record<string, string> = { email: '✉️', whatsapp: '💬', panel: '🖥️' };
  channelLabel: Record<string, string> = { email: 'E-mail', whatsapp: 'WhatsApp', panel: 'Painel' };

  constructor(
    private alertService: AlertService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadAlerts();
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.loadAlerts());
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  loadAlerts() {
    this.loading = true;
    this.alertService.getAll().subscribe({
      next: d => { this.alerts = d; this.loading = false; this.cdr.detectChanges(); },
      error: () => {
        this.loading = false;
        this.toast.error('Erro ao carregar alertas.');  // ← adicionado
        this.cdr.detectChanges();
      }
    });
  }

  toggleAlert(id: string) {
    this.alertService.toggle(id).subscribe({
      next: () => {
        const a = this.alerts.find(x => x.id === id);
        if (a) {
          a.active = !a.active;
          this.toast.info(a.active ? 'Alerta ativado.' : 'Alerta desativado.');  // ← adicionado
          this.cdr.detectChanges();
        }
      },
      error: () => this.toast.error('Erro ao atualizar alerta.')  // ← adicionado
    });
  }

  saveAlert() {
    this.saving = true;
    this.alertService.create(this.newAlert).subscribe({
      next: a => {
        this.alerts.push(a);
        this.showModal = false;
        this.newAlert = { channels: ['email'] };
        this.saving = false;
        this.cdr.detectChanges();
        this.toast.success('Alerta criado com sucesso!');
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
        this.toast.error('Erro ao criar alerta. Tente novamente.');
      }
    });
  }
}