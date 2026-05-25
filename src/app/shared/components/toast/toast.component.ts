import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2"
         style="max-width:380px; pointer-events:none">
      <div *ngFor="let t of toasts; trackBy: trackById"
           class="flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-card border text-sm font-medium"
           [class]="getClass(t.type)"
           style="pointer-events:auto; cursor:pointer; animation:slideIn 0.25s ease"
           (click)="toastService.remove(t.id)">
        <span class="text-base shrink-0 mt-0.5">{{ getIcon(t.type) }}</span>
        <span class="flex-1">{{ t.message }}</span>
        <button class="shrink-0 opacity-60 hover:opacity-100 text-lg leading-none ml-2"
                (click)="$event.stopPropagation(); toastService.remove(t.id)">×</button>
      </div>
    </div>
    <style>
      @keyframes slideIn {
        from { opacity:0; transform:translateX(20px); }
        to   { opacity:1; transform:translateX(0); }
      }
    </style>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(
    public toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sub = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
      this.cdr.detectChanges();  // ← força render mesmo no SSR
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  trackById(_: number, t: Toast) { return t.id; }

  getIcon(type: string) {
    return { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' }[type] ?? 'ℹ️';
  }

  getClass(type: string) {
    return {
      success: 'bg-white border-green-200 text-green-800',
      error:   'bg-white border-red-200 text-red-800',
      warning: 'bg-white border-yellow-200 text-yellow-800',
      info:    'bg-white border-blue-200 text-blue-800',
    }[type] ?? 'bg-white border-blue-200 text-blue-800';
  }
}