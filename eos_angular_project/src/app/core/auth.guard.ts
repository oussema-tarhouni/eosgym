import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.accessToken) return true;

  const ok = await auth.refresh();
  if (ok) return true;

  router.navigate(['/login']);
  return false;
};
