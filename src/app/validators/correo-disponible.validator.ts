
import { inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface DisponibilidadCorreo {
  isAvailable: boolean;
}

export function correoDisponible(): AsyncValidatorFn {
  const http = inject(HttpClient);

  return (
    control: AbstractControl
  ): Observable<ValidationErrors | null> => {
    const correo = String(control.value ?? '').trim().toLowerCase();

    if (!correo) {
      return of(null);
    }

    return http.post<DisponibilidadCorreo>(
      `${environment.apiUrl}/users/is-available`,
      { email: correo }
    ).pipe(
      map(respuesta =>
        respuesta.isAvailable ? null : { correoOcupado: true }
      ),
      catchError(() => of({ errorServidor: true }))
    );
  };
}
