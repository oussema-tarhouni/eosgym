import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;

  const cloned = req.clone({
    withCredentials: true, // sends the httpOnly refresh_token cookie
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(cloned);
};
