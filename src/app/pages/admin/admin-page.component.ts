
import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { PuedeSalir } from '../../guards/pendiente.guard';
import { noSoloEspacios } from '../../validators/no-solo-espacios.validator';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Administración</h1>

    <p>Formulario de edición de productos</p>

    <form [formGroup]="formulario" (ngSubmit)="guardar()">

      <p>
        <label for="id">ID del producto</label>
        <input id="id" type="number" formControlName="id">
      </p>

      @if (formulario.controls.id.touched &&
           formulario.controls.id.invalid) {
        <small>Ingresa un ID válido.</small>
      }

      <p>
        <label for="titulo">Título</label>
        <input id="titulo" type="text" formControlName="titulo">
      </p>

      @if (formulario.controls.titulo.touched) {
        @if (formulario.controls.titulo.hasError('required')) {
          <small>El título es obligatorio.</small>
        }
        @if (formulario.controls.titulo.hasError('minlength')) {
          <small>El título debe tener mínimo 3 caracteres.</small>
        }
        @if (formulario.controls.titulo.hasError('soloEspacios')) {
          <small>El título no puede contener solo espacios.</small>
        }
      }

      <p>
        <label for="precio">Precio</label>
        <input id="precio" type="number" formControlName="precio">
      </p>

      @if (formulario.controls.precio.touched &&
           formulario.controls.precio.invalid) {
        <small>El precio debe ser mayor que cero.</small>
      }

      <button type="submit" [disabled]="guardando()">
        {{ guardando() ? 'Guardando...' : 'Guardar cambios' }}
      </button>

    </form>

    @if (mensaje()) {
      <p role="status">{{ mensaje() }}</p>
    }

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
  private productos = inject(ProductoService);

  guardando = signal(false);
  mensaje = signal('');

  formulario = this.fb.nonNullable.group({
    id: [1, [
      Validators.required,
      Validators.min(1)
    ]],
    titulo: ['', [
      Validators.required,
      Validators.minLength(3),
      noSoloEspacios
    ]],
    precio: [1, [
      Validators.required,
      Validators.min(0.01)
    ]]
  });

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensaje.set('');

    const datos = this.formulario.getRawValue();

    this.productos.actualizar(datos.id, {
      title: datos.titulo.trim(),
      price: datos.precio
    }).subscribe({
      next: () => {
        this.formulario.markAsPristine();
        this.mensaje.set('Producto actualizado.');
        this.guardando.set(false);
      },
      error: () => {
        this.mensaje.set('No se pudieron guardar los cambios.');
        this.guardando.set(false);
      }
    });
  }

  puedeSalir(): boolean {
    return !this.formulario.dirty ||
      window.confirm('Tienes cambios sin guardar. ¿Deseas salir?');
  }
}
