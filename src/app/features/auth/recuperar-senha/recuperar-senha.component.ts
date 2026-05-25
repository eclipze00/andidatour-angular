import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6"
         style="background:var(--background)">

      <div class="w-full max-w-md space-y-6 rounded-2xl p-8 shadow-card border"
           style="background:var(--card); border-color:var(--border)">

        <!-- Ícone + cabeçalho -->
        <div class="flex flex-col items-center text-center gap-3">
          <div class="h-14 w-14 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-soft">
            <span class="text-white text-2xl">✉️</span>
          </div>
          <div>
            <h1 class="font-display text-2xl font-semibold">Recuperar senha</h1>
            <p class="mt-1 text-sm" style="color:var(--muted-foreground)">
              Enviaremos um link de redefinição para o seu e-mail cadastrado.
            </p>
          </div>
        </div>

        <!-- Formulário -->
        <div class="space-y-4" *ngIf="!sent">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">E-mail</label>
            <input
              [(ngModel)]="email"
              type="email"
              placeholder="seu@email.com"
              class="input-field"
            />
          </div>

          <button
            (click)="onSubmit()"
            [disabled]="loading || !email"
            class="w-full h-11 rounded-lg font-medium text-white transition disabled:opacity-60"
            style="background:var(--primary)"
          >
            {{ loading ? 'Enviando…' : 'Enviar instruções' }}
          </button>
        </div>

        <!-- Estado de sucesso -->
        <div *ngIf="sent"
             class="rounded-xl p-5 text-center space-y-2"
             style="background:oklch(0.5 0.16 155 / 0.08); border:1px solid oklch(0.5 0.16 155 / 0.25)">
          <div class="text-3xl">📬</div>
          <div class="font-medium" style="color:var(--success)">Instruções enviadas!</div>
          <div class="text-sm" style="color:var(--muted-foreground)">
            Se o endereço <strong>{{ email }}</strong> existir na nossa base,
            você receberá o link em instantes.
          </div>
        </div>

        <p class="text-center text-sm" style="color:var(--muted-foreground)">
          <a routerLink="/login"
             class="font-medium hover:underline"
             style="color:var(--brand)">
            ← Voltar ao login
          </a>
        </p>
      </div>
    </div>
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
export class RecuperarSenhaComponent {
  email = '';
  loading = false;
  sent = false;

  onSubmit() {
    if (!this.email) return;
    this.loading = true;
    // Simula chamada à API
    setTimeout(() => {
      this.loading = false;
      this.sent = true;
    }, 900);
  }
}