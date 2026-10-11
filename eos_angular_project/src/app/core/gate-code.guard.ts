import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from './admin.service';

// Guards /admin/:code (the gate form itself): the code must still be valid.
export const gateCodeGuard: CanActivateFn = async (route) => {
  const admin = inject(AdminService);
  const router = inject(Router);
  const code = route.paramMap.get('code');

  if (!code) { router.navigate(['/']); return false; }

  try {
    const res = await admin.checkGateCode(code);
    if (res.ok) return true;
  } catch {
    // falls through to redirect
  }
  router.navigate(['/']);
  return false;
};

// Guards /access-admin: must have completed the gate form in this session.
// Real enforcement happens server-side (requireGateSession on every /api/admin/* call);
// this just avoids showing an empty dashboard if someone lands here directly.
export const adminSessionGuard: CanActivateFn = () => {
  const admin = inject(AdminService);
  const router = inject(Router);
  if (admin.hasAdminToken()) return true;
  router.navigate(['/']);
  return false;
};
