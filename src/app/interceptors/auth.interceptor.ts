
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const auth = inject(AuthService);
  const token = auth.obtenerToken();

  if (!token) {
    return siguiente(peticion);
  }

  const peticionAutenticada = peticion.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return siguiente(peticionAutenticada);
};
