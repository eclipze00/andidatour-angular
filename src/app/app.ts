import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],   // ← obrigatório
  template: `<router-outlet />`  // ← só isso, sem nada mais
})
export class AppComponent {}