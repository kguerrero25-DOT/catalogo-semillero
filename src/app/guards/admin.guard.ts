import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.tieneRol('admin') ? true : router.createUrlTree(['/login'], { queryParams: { volverA: '/admin' } });
};
