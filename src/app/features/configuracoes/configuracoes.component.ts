import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ApiIntegration } from '../../models';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarComponent],
  template: `
    <app-topbar title="Configurações & Integrações" subtitle="Conecte APIs externas para ativar buscas em tempo real." />
    <main class="flex-1 p-4 md:p-8 space-y-6">

      <!-- Banner de aviso -->
      <div class="rounded-2xl border p-5 flex items-start gap-3" style="background:oklch(0.75 0.14 80 / 0.08); border-color:oklch(0.75 0.14 80 / 0.3)">
        <span class="mt-0.5">⚠️</span>
        <div class="text-sm">
          <div class="font-medium">Modo simulação ativo</div>
          <div style="color:var(--muted-foreground)">Enquanto APIs reais não estiverem conectadas, a AndidaTour retorna resultados simulados realistas.</div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div *ngFor="let i of integrations" class="rounded-2xl border p-6 shadow-soft" style="background:var(--card); border-color:var(--border)">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 rounded-xl flex items-center justify-center text-xl" style="background:var(--accent)">{{ catIcon[i.category] }}</div>
              <div>
                <div class="font-display font-semibold">{{ i.name }}</div>
                <div class="text-xs" style="color:var(--muted-foreground)">{{ catLabel[i.category] }}</div>
              </div>
            </div>
            <span class="text-xs px-2 py-1 rounded-full border flex items-center gap-1" [class]="getStatusClass(i.status)">
              {{ statusIcon[i.status] }} {{ statusLabel[i.status] }}
            </span>
          </div>
          <div class="mt-4 space-y-2">
            <label class="text-xs font-medium">Chave de API</label>
            <input [value]="i.apiKeyMask ?? ''" type="password" placeholder="Cole sua chave aqui" class="input-field" />
          </div>
          <div class="mt-4 flex gap-2">
            <button class="flex-1 py-2 rounded-lg text-sm border hover:bg-accent transition" style="border-color:var(--border)">Testar conexão</button>
            <button class="flex-1 py-2 rounded-lg text-sm font-medium text-white" style="background:var(--primary)">Salvar</button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`.input-field { width:100%; border-radius:var(--radius); border:1px solid var(--border); padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; margin-top:0.25rem; }`]
})
export class ConfiguracoesComponent {
  catIcon: Record<string, string> = { airline: '✈️', search: '🔍', miles: '💰', payment: '💳', email: '📧', whatsapp: '💬' };
  catLabel: Record<string, string> = { airline: 'Companhia aérea', search: 'Provedor de busca', miles: 'Programa de milhas', payment: 'Gateway de pagamento', email: 'E-mail transacional', whatsapp: 'WhatsApp' };
  statusIcon: Record<string, string> = { connected: '📶', disconnected: '📵', error: '⚠️' };
  statusLabel: Record<string, string> = { connected: 'Conectado', disconnected: 'Desconectado', error: 'Erro' };

  getStatusClass(s: string) {
    if (s === 'connected') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'error') return 'bg-red-50 text-red-600 border-red-200';
    return 'text-gray-500 border-gray-200';
  }

  integrations: ApiIntegration[] = [
    { id:'i1', name:'LATAM API', category:'airline', status:'connected', apiKeyMask:'sk_la_****7821' },
    { id:'i2', name:'GOL API', category:'airline', status:'disconnected' },
    { id:'i3', name:'Amadeus', category:'search', status:'connected', apiKeyMask:'am_****1290' },
    { id:'i4', name:'Smiles', category:'miles', status:'error', apiKeyMask:'sm_****4421' },
    { id:'i5', name:'Stripe', category:'payment', status:'connected', apiKeyMask:'sk_live_****abcd' },
    { id:'i6', name:'Resend', category:'email', status:'connected', apiKeyMask:'re_****9912' },
    { id:'i7', name:'WhatsApp Cloud', category:'whatsapp', status:'disconnected' },
  ];
}