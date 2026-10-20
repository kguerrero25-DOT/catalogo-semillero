
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorAuthInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return siguiente(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.cerrarSesion();

        if (!router.url.startsWith('/login')) {
          router.navigate(['/login'], {
            queryParams: {
              volverA: router.url
            }
          });
        }
      }

      return throwError(() => error);
    })
  );
};
