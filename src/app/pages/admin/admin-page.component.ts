
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PuedeSalir } from '../../guards/pendiente.guard';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Administración</h1>

    <p>Selecciona un ID para abrir el formulario completo de edición.</p>

    <form [formGroup]="formulario">

      <p>
        <label for="id">ID del producto</label>
        <input id="id" type="number" formControlName="id">
      </p>

      @if (formulario.controls.id.touched &&
           formulario.controls.id.invalid) {
        <small>Ingresa un ID válido.</small>
      }

    </form>

    <h2>Gestión de productos</h2>

    <p>
      <a routerLink="/admin/productos/nuevo">
        Crear nuevo producto
      </a>
    </p>

    <p>
      <a [routerLink]="['/admin/productos', formulario.controls.id.value, 'editar']">
        Editar este producto con el formulario completo
      </a>
    </p>
  `
})
export class AdminPageComponent implements PuedeSalir {
  private fb = inject(FormBuilder);

  formulario = this.fb.nonNullable.group({
    id: [1, [
      Validators.required,
      Validators.min(1)
    ]]
  });

  puedeSalir(): boolean {
    return !this.formulario.dirty ||
      window.confirm('Tienes cambios sin guardar. ¿Deseas salir?');
  }
}
