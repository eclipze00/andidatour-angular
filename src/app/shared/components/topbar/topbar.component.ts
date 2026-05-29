import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Header padrão antigo, para outras telas -->
    <header *ngIf="variant === 'default'" class="topbar-default">
      <h1>
        {{ title }}
      </h1>

      <span *ngIf="subtitle">
        {{ subtitle }}
      </span>
    </header>

    <!-- Header bonito do cliente -->
    <header *ngIf="variant === 'client'" class="client-header">
      <div class="client-header-bg"></div>

      <div class="client-header-inner">
        <!-- Marca -->
        <a routerLink="/cliente/home" class="client-brand">
          <div class="client-brand-icon">
            ✈
          </div>

          <div>
            <div class="client-brand-name">
              {{ title || 'AndidaTour' }}
            </div>

            <div class="client-brand-subtitle">
              {{ subtitle || 'Área do cliente' }}
            </div>
          </div>
        </a>

        <!-- Navegação -->
        <nav class="client-nav">
          <a
            routerLink="/cliente/home"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="client-nav-link"
          >
            Minhas solicitações
          </a>

          <a
            routerLink="/cliente/nova-solicitacao"
            routerLinkActive="active"
            class="client-nav-link"
          >
            Nova solicitação
          </a>
        </nav>

        <!-- Usuário -->
        <div class="client-user-area">
          <div class="client-user-card">
            <div class="client-avatar">
              {{ userInitial }}
            </div>

            <div class="client-user-info">
              <div class="client-user-label">
                Cliente
              </div>

              <div class="client-user-name">
                {{ userName || 'Cliente' }}
              </div>
            </div>
          </div>

          <button
            type="button"
            class="client-logout"
            (click)="logoutClick.emit()"
          >
            Sair
          </button>
        </div>
      </div>

      <div class="client-header-welcome" *ngIf="showWelcome">
        <div>
          <span class="client-eyebrow">
            ✨ Bem-vindo de volta
          </span>

          <h1>
            Olá, {{ userName || 'Cliente' }}
          </h1>

          <p>
            {{ welcomeText || 'Acompanhe suas solicitações de cotação e envie novas viagens para o agente.' }}
          </p>
        </div>

        <a routerLink="/cliente/nova-solicitacao" class="client-header-action">
          + Nova solicitação
        </a>
      </div>
    </header>
  `,
  styles: [`
    .topbar-default {
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--border);
      background: var(--card);
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }

    .topbar-default h1 {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--foreground);
      letter-spacing: -0.02em;
      margin: 0;
    }

    .topbar-default span {
      font-size: 0.8125rem;
      color: var(--muted-foreground);
    }

    .client-header {
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid var(--border);
      background:
        radial-gradient(circle at top left, oklch(0.72 0.12 185 / 0.20), transparent 34rem),
        radial-gradient(circle at top right, oklch(0.48 0.15 255 / 0.18), transparent 30rem),
        var(--card);
    }

    .client-header-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(to right, oklch(0.48 0.15 255 / 0.06) 1px, transparent 1px),
        linear-gradient(to bottom, oklch(0.48 0.15 255 / 0.05) 1px, transparent 1px);
      background-size: 44px 44px;
      mask-image: linear-gradient(to bottom, black, transparent 82%);
      opacity: 0.7;
    }

    .client-header-inner {
      position: relative;
      z-index: 1;
      min-height: 76px;
      padding: 0 1.5rem;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 1.5rem;
    }

    .client-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--foreground);
    }

    .client-brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 1rem;
      display: grid;
      place-items: center;
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      box-shadow: 0 12px 28px oklch(0.48 0.15 255 / 0.28);
      transform: rotate(-6deg);
    }

    .client-brand-name {
      font-family: var(--font-display, inherit);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
    }

    .client-brand-subtitle {
      margin-top: 0.2rem;
      font-size: 0.72rem;
      color: var(--muted-foreground);
    }

    .client-nav {
      justify-self: center;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: color-mix(in oklch, var(--card) 78%, transparent);
      box-shadow: 0 10px 24px oklch(0 0 0 / 0.04);
      backdrop-filter: blur(12px);
    }

    .client-nav-link {
      height: 36px;
      padding: 0 1rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      font-size: 0.83rem;
      font-weight: 600;
      text-decoration: none;
      color: var(--muted-foreground);
      transition:
        background 0.18s ease,
        color 0.18s ease,
        transform 0.18s ease;
    }

    .client-nav-link:hover {
      color: var(--foreground);
      background: var(--accent);
      transform: translateY(-1px);
    }

    .client-nav-link.active {
      color: white;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      box-shadow: 0 8px 18px oklch(0.48 0.15 255 / 0.22);
    }

    .client-user-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .client-user-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.35rem 0.75rem 0.35rem 0.35rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: color-mix(in oklch, var(--card) 82%, transparent);
      backdrop-filter: blur(12px);
    }

    .client-avatar {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--brand-deep);
      background: var(--teal);
    }

    .client-user-label {
      font-size: 0.66rem;
      line-height: 1;
      color: var(--muted-foreground);
    }

    .client-user-name {
      margin-top: 0.12rem;
      font-size: 0.8rem;
      font-weight: 700;
      line-height: 1;
      color: var(--foreground);
    }

    .client-logout {
      height: 36px;
      padding: 0 0.9rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--card);
      color: var(--foreground);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition:
        transform 0.18s ease,
        background 0.18s ease,
        border-color 0.18s ease;
    }

    .client-logout:hover {
      transform: translateY(-1px);
      background: var(--accent);
      border-color: color-mix(in oklch, var(--brand) 35%, var(--border));
    }

    .client-header-welcome {
      position: relative;
      z-index: 1;
      padding: 1.25rem 1.5rem 1.6rem;
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 1.5rem;
    }

    .client-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-bottom: 0.55rem;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      background: var(--accent);
      color: var(--muted-foreground);
      font-size: 0.72rem;
      font-weight: 700;
    }

    .client-header-welcome h1 {
      margin: 0;
      font-family: var(--font-display, inherit);
      font-size: clamp(1.3rem, 2vw, 2rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--foreground);
    }

    .client-header-welcome p {
      margin: 0.35rem 0 0;
      font-size: 0.9rem;
      color: var(--muted-foreground);
    }

    .client-header-action {
      height: 42px;
      padding: 0 1rem;
      border-radius: 0.9rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      text-decoration: none;
      color: white;
      font-size: 0.86rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--brand), var(--brand-deep));
      box-shadow: 0 12px 26px oklch(0.48 0.15 255 / 0.25);
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        filter 0.18s ease;
    }

    .client-header-action:hover {
      transform: translateY(-2px);
      filter: brightness(1.04);
      box-shadow: 0 16px 34px oklch(0.48 0.15 255 / 0.33);
    }

    @media (max-width: 900px) {
      .client-header-inner {
        grid-template-columns: 1fr auto;
        height: auto;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }

      .client-nav {
        grid-column: 1 / -1;
        grid-row: 2;
        justify-self: stretch;
        overflow-x: auto;
      }

      .client-nav-link {
        flex: 1;
        justify-content: center;
        white-space: nowrap;
      }
    }

    @media (max-width: 640px) {
      .client-header-welcome {
        flex-direction: column;
        align-items: stretch;
      }

      .client-header-action {
        width: 100%;
      }

      .client-user-info,
      .client-logout {
        display: none;
      }
    }
  `]
})
export class TopbarComponent {
  @Input() title = '';
  @Input() subtitle = '';

  @Input() variant: 'default' | 'client' = 'default';

  @Input() userName = '';
  @Input() showWelcome = false;
  @Input() welcomeText = '';

  @Output() logoutClick = new EventEmitter<void>();

  get userInitial() {
    return this.userName?.trim()?.charAt(0)?.toUpperCase() || 'U';
  }
}