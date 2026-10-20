
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanMatchFn = (_route, segments) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.tieneRol('admin')) {
    return true;
  }

  if (auth.estaAutenticado()) {
    return router.createUrlTree(['/productos']);
  }

  const destino = '/' + segments.map(segmento => segmento.path).join('/');

  return router.createUrlTree(['/login'], {
    queryParams: {
      volverA: destino
    }
  });
};
