import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const clientGuard: CanActivateFn = () => {
  const auth     = inject(AuthService);
  const router   = inject(Router);
  const platform = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platform)) return true;
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (!auth.isClient)     { router.navigate(['/app/dashboard']); return false; }
  return true;
};