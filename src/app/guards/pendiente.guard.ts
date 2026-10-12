import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
export interface PuedeSalir { puedeSalir(): boolean; }
export const pendienteGuard: CanDeactivateFn<PuedeSalir> = componente => componente.puedeSalir();
