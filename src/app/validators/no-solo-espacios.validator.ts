
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noSoloEspacios: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const valor = control.value;

  if (typeof valor !== 'string') {
    return null;
  }

  return valor.trim().length === 0 && valor.length > 0
    ? { soloEspacios: true }
    : null;
};
