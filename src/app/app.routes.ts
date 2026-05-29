import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Rotas públicas
  { path: 'login',          loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'cadastro',       loadComponent: () => import('./features/auth/cadastro/cadastro.component').then(m => m.CadastroComponent) },
  { path: 'recuperar-senha',loadComponent: () => import('./features/auth/recuperar-senha/recuperar-senha.component').then(m => m.RecuperarSenhaComponent) },

  // ── Área Admin (existente) ─────────────────────────────────────
  {
    path: 'app',
    loadComponent: () => import('./layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [adminGuard],  // ← trocou authGuard por adminGuard
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',      loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'nova-cotacao',   loadComponent: () => import('./features/nova-cotacao/nova-cotacao.component').then(m => m.NovaCotacaoComponent) },
      { path: 'resultados',     loadComponent: () => import('./features/resultados/resultados.component').then(m => m.ResultadosComponent) },
      { path: 'voo/:id',        loadComponent: () => import('./features/voo-detalhes/voo-detalhe.component').then(m => m.VooDetalheComponent) },
      { path: 'historico',      loadComponent: () => import('./features/historico/historico.component').then(m => m.HistoricoComponent) },
      { path: 'propostas',      loadComponent: () => import('./features/propostas/propostas.component').then(m => m.PropostasComponent) },
      { path: 'proposta/:id',   loadComponent: () => import('./features/proposta/proposta.component').then(m => m.PropostaComponent) },
      { path: 'clientes',       loadComponent: () => import('./features/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'alertas',        loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertasComponent) },
      { path: 'configuracoes',  loadComponent: () => import('./features/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent) },
      // Nova rota admin — solicitações dos clientes
      { path: 'solicitacoes',   loadComponent: () => import('./features/solicitacoes/solicitacoes.component').then(m => m.SolicitacoesComponent) },
    ]
  },

  // ── Área Cliente (nova) ────────────────────────────────────────
  {
    path: 'cliente',
    loadComponent: () => import('./layouts/client-layout/client-layout.component').then(m => m.ClientLayoutComponent),
    canActivate: [clientGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',           loadComponent: () => import('./features/cliente/home/client-home.component').then(m => m.ClientHomeComponent) },
      { path: 'nova-solicitacao', loadComponent: () => import('./features/cliente/nova-solicitacao/nova-solicitacao.component').then(m => m.NovaSolicitacaoComponent) },
    ]
  },

  { path: '**', redirectTo: '/login' }
];