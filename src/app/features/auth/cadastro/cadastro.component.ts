import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
 
@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, ToastComponent],
  template: `
    <div class="min-h-screen grid md:grid-cols-2">
 
      <!-- Painel esquerdo -->
      <div class="hidden md:flex flex-col justify-between p-12 bg-brand-gradient text-white relative overflow-hidden">
        <div class="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5"></div>
        <div class="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5"></div>
        <div class="flex items-center gap-2.5 relative">
          <div class="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <span class="rotate-[-45deg] inline-block text-lg">✈</span>
          </div>
          <span class="font-display text-lg font-semibold">AndidaTour</span>
        </div>
        <div class="relative space-y-4">
          <h2 class="font-display text-4xl font-semibold leading-tight max-w-md">
            Tudo que você precisa para encantar seus clientes com passagens.
          </h2>
          <p class="text-white/80 max-w-md">
            Crie sua conta em segundos e comece a usar todas as ferramentas de cotação profissional.
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div *ngFor="let b of benefits" class="rounded-xl bg-white/10 backdrop-blur p-3.5 space-y-1">
              <div class="text-xl">{{ b.icon }}</div>
              <div class="text-sm font-medium">{{ b.title }}</div>
              <div class="text-xs text-white/70">{{ b.desc }}</div>
            </div>
          </div>
        </div>
      </div>
 
      <!-- Painel direito — formulário -->
      <div class="flex items-center justify-center p-6 md:p-10" style="background:var(--background)">
        <div class="w-full max-w-sm space-y-6">
 
          <!-- Logo mobile -->
          <div class="flex items-center gap-2 md:hidden">
            <div class="h-8 w-8 rounded-xl bg-brand-gradient flex items-center justify-center">
              <span class="text-white rotate-[-45deg] inline-block text-sm">✈</span>
            </div>
            <span class="font-display font-semibold">AndidaTour</span>
          </div>
 
          <div>
            <h1 class="font-display text-2xl font-semibold">Criar sua conta</h1>
            <p class="mt-1 text-sm" style="color:var(--muted-foreground)">Comece gratuitamente. Sem cartão de crédito.</p>
          </div>
 
          <div class="space-y-4">
 
            <!-- Nome e Sobrenome -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Nome</label>
                <input [(ngModel)]="firstName" class="input-field" placeholder="Ana" />
                <span *ngIf="submitted && !firstName" class="text-xs" style="color:var(--destructive)">Obrigatório</span>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Sobrenome</label>
                <input [(ngModel)]="lastName" class="input-field" placeholder="Costa" />
                <span *ngIf="submitted && !lastName" class="text-xs" style="color:var(--destructive)">Obrigatório</span>
              </div>
            </div>
 
            <!-- E-mail -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">E-mail</label>
              <input [(ngModel)]="email" type="email" class="input-field" placeholder="ana@agencia.com" />
              <span *ngIf="submitted && !email" class="text-xs" style="color:var(--destructive)">Obrigatório</span>
            </div>
 
            <!-- Senha -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Senha</label>
              <div class="relative">
                <input [(ngModel)]="password"
                       [type]="showPass ? 'text' : 'password'"
                       class="input-field pr-10"
                       placeholder="Mínimo 8 caracteres" />
                <button type="button" (click)="showPass = !showPass"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                        style="color:var(--muted-foreground)">
                  {{ showPass ? '🙈' : '👁' }}
                </button>
              </div>
              <!-- Força da senha -->
              <div class="flex gap-1 mt-1.5" *ngIf="password">
                <div *ngFor="let s of [0,1,2,3]"
                     class="h-1 flex-1 rounded-full transition-colors"
                     [style.background]="s < passwordStrength ? strengthColor : 'var(--border)'"></div>
              </div>
              <div class="text-xs" *ngIf="password" [style.color]="strengthColor">{{ strengthLabel }}</div>
              <span *ngIf="submitted && password.length < 8" class="text-xs" style="color:var(--destructive)">Mínimo 8 caracteres</span>
            </div>
 
            <!-- Confirmar senha -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Confirmar senha</label>
              <input [(ngModel)]="confirmPassword" type="password" class="input-field" placeholder="Repita a senha" />
              <span *ngIf="submitted && confirmPassword && password !== confirmPassword"
                    class="text-xs" style="color:var(--destructive)">As senhas não coincidem</span>
            </div>
 
            <!-- Tipo de conta -->
            <div>
              <label class="text-sm font-medium block mb-2">Tipo de conta</label>
              <div class="flex gap-2">
                <label *ngFor="let opt of roleOptions"
                       class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border cursor-pointer text-sm transition"
                       [style.border-color]="selectedRole === opt.value ? 'var(--brand)' : 'var(--border)'"
                       [style.background]="selectedRole === opt.value ? 'var(--brand-subtle)' : 'white'"
                       [style.color]="selectedRole === opt.value ? 'var(--brand)' : 'var(--foreground)'">
                  <input type="radio" [(ngModel)]="selectedRole" [value]="opt.value" class="hidden" />
                  {{ opt.label }}
                </label>
              </div>
            </div>
 
            <!-- Termos -->
            <label class="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" [(ngModel)]="acceptTerms" class="mt-0.5 h-4 w-4 rounded" />
              <span class="text-xs" style="color:var(--muted-foreground)">
                Concordo com os
                <a href="#" class="hover:underline font-medium" style="color:var(--brand)">Termos de uso</a>
                e a
                <a href="#" class="hover:underline font-medium" style="color:var(--brand)">Política de privacidade</a>
              </span>
            </label>
            <span *ngIf="submitted && !acceptTerms" class="text-xs block -mt-2" style="color:var(--destructive)">
              Você precisa aceitar os termos
            </span>
          </div>
 
          <!-- Botão -->
          <button (click)="onSubmit()" [disabled]="loading"
                  class="w-full h-11 rounded-lg font-medium text-white transition disabled:opacity-60"
                  style="background:var(--primary)">
            {{ loading ? 'Criando conta…' : 'Criar conta' }}
          </button>
 
          <p class="text-center text-sm" style="color:var(--muted-foreground)">
            Já tem conta?
            <a routerLink="/login" class="font-medium hover:underline" style="color:var(--brand)">Entrar</a>
          </p>
        </div>
      </div>
    </div>
    <app-toast />
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
      transition: border-color 0.15s;
    }
    .input-field:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 2px oklch(0.48 0.15 255 / 0.15);
    }
  `]
})
export class CadastroComponent {
  selectedRole = 'client';
  firstName = ''; lastName = ''; email = ''; password = '';
  confirmPassword = ''; acceptTerms = false; showPass = false;
  loading = false; submitted = false;
 
  roleOptions = [
    { value: 'client', label: '👤 Sou cliente' },
    { value: 'admin',  label: '⚙️ Sou agente'  },
  ];
 
  benefits = [
    { icon: '🔍', title: 'Busca inteligente', desc: 'Compare todas as companhias em segundos' },
    { icon: '📄', title: 'Propostas elegantes', desc: 'PDF e link personalizados' },
    { icon: '🔔', title: 'Alertas de preço', desc: 'Notificações via e-mail e WhatsApp' },
    { icon: '🔗', title: 'APIs reais', desc: 'LATAM, GOL, Azul, Amadeus e mais' },
  ];
 
  get passwordStrength(): number {
    const p = this.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }
 
  get strengthColor(): string {
    return ['', 'oklch(0.55 0.2 25)', 'oklch(0.75 0.14 80)', 'oklch(0.5 0.16 155)', 'oklch(0.5 0.16 155)'][this.passwordStrength] || 'var(--border)';
  }
 
  get strengthLabel(): string {
    return ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][this.passwordStrength] || '';
  }
 
  isValid(): boolean {
    return !!(
      this.firstName &&
      this.lastName &&
      this.email &&
      this.password.length >= 8 &&
      this.password === this.confirmPassword &&
      this.acceptTerms
    );
  }
 
  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}
 
  onSubmit() {
    this.submitted = true;
    if (!this.isValid()) return;
 
    this.loading = true;
    this.cdr.detectChanges();
 
    this.auth.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.selectedRole,
    }).subscribe({
      next: () => {
        // ← Redireciona baseado no role escolhido
        const dest = this.auth.isAdmin ? '/app/dashboard' : '/cliente/home';
        this.router.navigate([dest]);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Erro ao criar conta. Tente novamente.');
        this.cdr.detectChanges();
      }
    });
  }
}