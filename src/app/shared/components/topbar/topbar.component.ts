import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header style="
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--border);
      background: var(--card);
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    ">
      <h1 style="font-size:1.0625rem; font-weight:600; color:var(--foreground); letter-spacing:-0.02em; margin:0">
        {{ title }}
      </h1>
      <span *ngIf="subtitle" style="font-size:0.8125rem; color:var(--muted-foreground)">
        {{ subtitle }}
      </span>
    </header>
  `,
  imports: [CommonModule]
})
export class TopbarComponent {
  @Input() title = '';
  @Input() subtitle = '';
}