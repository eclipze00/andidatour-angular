import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/cadastro/cadastro.component').then(m => m.CadastroComponent)
  },
  {
    path: 'recuperar-senha',
    loadComponent: () => import('./features/auth/recuperar-senha/recuperar-senha.component').then(m => m.RecuperarSenhaComponent)
  },
  {
    path: 'app',
    loadComponent: () => import('./layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [     
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'voo/:id', loadComponent: () => import('./features/voo-detalhes/voo-detalhe.component').then(m => m.VooDetalheComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'nova-cotacao', loadComponent: () => import('./features/nova-cotacao/nova-cotacao.component').then(m => m.NovaCotacaoComponent) },
      { path: 'resultados', loadComponent: () => import('./features/resultados/resultados.component').then(m => m.ResultadosComponent) },
      { path: 'historico', loadComponent: () => import('./features/historico/historico.component').then(m => m.HistoricoComponent) },

      { path: 'propostas',     loadComponent: () => import('./features/propostas/propostas.component').then(m => m.PropostasComponent) },
      { path: 'proposta/:id',  loadComponent: () => import('./features/proposta/proposta.component').then(m => m.PropostaComponent) },

      { path: 'clientes', loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'alertas', loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertasComponent) },
      { path: 'configuracoes', loadComponent: () => import('./features/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];