import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Allow /reset-password only when opened from an emailed link (?token=<64 hex chars>)
export const resetGuard: CanActivateFn = (route) => {
  const token = route.queryParamMap.get('token') || '';
  if (/^[a-f0-9]{64}$/i.test(token)) return true;
  return inject(Router).createUrlTree(['/forgot-password']);
};
