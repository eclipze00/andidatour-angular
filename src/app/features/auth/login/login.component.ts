import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen grid md:grid-cols-2">
      <!-- Painel esquerdo -->
      <div class="hidden md:flex flex-col justify-between p-12 bg-brand-gradient text-white relative overflow-hidden">
        <div class="flex items-center gap-2.5">
          <div class="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <span class="rotate-[-45deg] inline-block">✈</span>
          </div>
          <span class="font-display text-lg font-semibold">AndidaTour</span>
        </div>

        <div>
          <h2 class="font-display text-4xl font-semibold leading-tight max-w-md">
            A nova forma de cotar passagens, com a calma de um aeroporto premium.
          </h2>

          <p class="mt-4 text-white/80 max-w-md">
            Compare em segundos. Decida com confiança. Encante seu cliente.
          </p>
        </div>
      </div>
 
      <!-- Formulário -->
      <div class="flex items-center justify-center p-6">
        <div class="w-full max-w-sm space-y-6">
          <div>
            <h1 class="font-display text-2xl font-semibold">
              Entrar na sua conta
            </h1>

            <p class="mt-1 text-sm" style="color:var(--muted-foreground)">
              Acesse a plataforma AndidaTour.
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">
                  E-mail
                </label>

                <input
                  name="email"
                  [(ngModel)]="email"
                  type="email"
                  class="input-field"
                  placeholder="seu@email.com"
                  autocomplete="email"
                />
              </div>

              <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium">
                    Senha
                  </label>

                  <a
                    routerLink="/recuperar-senha"
                    class="text-xs hover:underline"
                    style="color:var(--brand)"
                  >
                    Esqueci a senha
                  </a>
                </div>

                <input
                  name="password"
                  [(ngModel)]="password"
                  type="password"
                  class="input-field"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full h-11 rounded-lg font-medium text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              style="background:var(--primary)"
            >
              {{ loading ? 'Entrando…' : 'Entrar' }}
            </button>
          </form>

          <p class="text-center text-sm" style="color:var(--muted-foreground)">
            Novo por aqui?
            <a
              routerLink="/cadastro"
              class="font-medium hover:underline"
              style="color:var(--brand)"
            >
              Crie sua conta
            </a>
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
    }

    .input-field:focus {
      border-color: var(--brand);
      box-shadow: 0 0 0 2px oklch(0.48 0.15 255 / 0.2);
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
 
  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}
 
  onSubmit() {
    if (this.loading) return;

    this.loading = true;
    this.cdr.detectChanges();
 
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const dest = this.auth.isAdmin ? '/app/dashboard' : '/cliente/home';
        this.router.navigate([dest]);
      },
      error: () => {
        this.loading = false;
        this.toast.error('E-mail ou senha incorretos.');
        this.cdr.detectChanges();
      }
    });
  }
}