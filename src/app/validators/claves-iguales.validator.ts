
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const clavesIguales: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const clave = control.get('clave')?.value;
  const confirmacion = control.get('confirmacion')?.value;

  if (!clave || !confirmacion) {
    return null;
  }

  return clave === confirmacion
    ? null
    : { clavesDistintas: true };
};
