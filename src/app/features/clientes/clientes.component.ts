import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ClientService } from '../../core/services/client.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { Client } from '../../models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar title="Clientes" subtitle="Gerencie sua carteira de clientes." />
    <main class="flex-1 p-4 md:p-8 space-y-6">
      <!-- Barra superior -->
      <div class="rounded-2xl border p-6 shadow-soft flex items-center justify-between gap-3" style="background:var(--card); border-color:var(--border)">
        <input placeholder="Buscar cliente…" class="input-field max-w-sm" />
        <button (click)="showModal = true" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style="background:var(--primary)">
          + Novo cliente
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div *ngFor="let i of [0,1,2]" class="rounded-2xl border p-6 h-48 animate-pulse" style="background:var(--card)"></div>
      </div>

      <!-- Vazio -->
      <div *ngIf="!loading && clients.length === 0"
           class="rounded-2xl border p-10 text-center shadow-soft"
           style="background:var(--card)">
        <div class="text-4xl mb-3">👥</div>
        <div class="font-medium">Nenhum cliente cadastrado</div>
        <div class="text-sm mt-1" style="color:var(--muted-foreground)">Clique em "+ Novo cliente" para começar.</div>
      </div>

      <!-- Grid de clientes -->
      <div *ngIf="!loading && clients.length > 0" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div *ngFor="let c of clients" class="rounded-2xl border p-6 shadow-soft hover:shadow-card transition" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-semibold">
                {{ getInitials(c.name) }}
              </div>
              <div>
                <div class="font-medium">{{ c.name }}</div>
                <div class="text-xs" style="color:var(--muted-foreground)">{{ c.email }}</div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 rounded-full" style="background:var(--accent)">{{ c.quotes }} cotações</span>
          </div>
          <div class="mt-4 space-y-1.5 text-sm">
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Telefone</span>
              <span>{{ c.phone }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:var(--muted-foreground)">Documento</span>
              <span>{{ c.document }}</span>
            </div>
            <div *ngIf="c.preferences" class="pt-2 mt-2 border-t" style="border-color:var(--border)">
              <div class="text-xs" style="color:var(--muted-foreground)">Preferências</div>
              <div class="text-sm">{{ c.preferences }}</div>
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="flex-1 py-2 rounded-lg text-sm border hover:bg-accent transition" style="border-color:var(--border)">Ver perfil</button>
            <button class="flex-1 py-2 rounded-lg text-sm font-medium text-white" style="background:var(--primary)">Nova cotação</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal novo cliente -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="rounded-2xl p-6 w-full max-w-md shadow-card space-y-4" style="background:var(--card)">
        <h3 class="font-display text-lg font-semibold">Novo cliente</h3>
        <div class="space-y-3">
          <div><label class="text-sm font-medium">Nome</label><input [(ngModel)]="newClient.name" class="input-field" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium">E-mail</label><input [(ngModel)]="newClient.email" type="email" class="input-field" /></div>
            <div><label class="text-sm font-medium">Telefone</label><input [(ngModel)]="newClient.phone" class="input-field" /></div>
          </div>
          <div><label class="text-sm font-medium">Documento</label><input [(ngModel)]="newClient.document" class="input-field" /></div>
          <div><label class="text-sm font-medium">Preferências</label><input [(ngModel)]="newClient.preferences" class="input-field" /></div>
        </div>
        <div class="flex gap-2 pt-2">
          <button (click)="showModal = false" class="flex-1 py-2 rounded-lg text-sm border" style="border-color:var(--border)">Cancelar</button>
          <button (click)="saveClient()" [disabled]="saving" class="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60" style="background:var(--primary)">
            {{ saving ? 'Salvando…' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`.input-field { width:100%; border-radius:var(--radius); border:1px solid var(--border); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; margin-top:0.25rem; }`]
})
export class ClientesComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  showModal = false;
  newClient: Partial<Client> = {};
  loading = false;
  saving = false;
  private sub!: Subscription;

  constructor(
    private clientService: ClientService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadClients();
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.loadClients());
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  // No loadClients(), adicione o cdr.detectChanges():
  loadClients() {
    this.loading = true;
    this.clientService.getAll().subscribe({
      next: d => {
        this.clients = d;
        this.loading = false;
        this.cdr.detectChanges();  // ← força o Angular a re-renderizar
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erro ao carregar clientes.');  // ← adicionado
        this.cdr.detectChanges();
      }
    });
  }

  getInitials(name: string) { return name.split(' ').map(n => n[0]).slice(0, 2).join(''); }

  saveClient() {
    this.saving = true;
    this.clientService.create(this.newClient).subscribe({
      next: c => {
        this.clients.push(c);
        this.showModal = false;
        this.newClient = {};
        this.saving = false;
        this.cdr.detectChanges();
        this.toast.success('Cliente cadastrado com sucesso!');
      },
      error: () => {
        this.saving = false;
        this.toast.error('Erro ao cadastrar cliente. Tente novamente.');
        this.cdr.detectChanges();
      }
    });
  }
}