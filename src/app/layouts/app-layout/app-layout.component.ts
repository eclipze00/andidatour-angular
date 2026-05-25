import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';  // ← importar

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastComponent],  // ← adicionar
  template: `
    <div class="min-h-screen flex w-full" style="background:var(--background)">
      <app-sidebar />
      <div class="flex-1 flex flex-col min-w-0">
        <router-outlet />
      </div>
    </div>
    <app-toast />  <!-- ← adicionar aqui, fora do flex -->
  `
})
export class AppLayoutComponent {}