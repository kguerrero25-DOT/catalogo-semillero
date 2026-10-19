
import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { noSoloEspacios } from '../../validators/no-solo-espacios.validator';
import { clavesIguales } from '../../validators/claves-iguales.validator';
import { correoDisponible } from '../../validators/correo-disponible.validator';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Registro de usuario</h1>

    <form [formGroup]="formulario" (ngSubmit)="registrar()">

      <p>
        <label for="nombre">Nombre</label>
        <input id="nombre" type="text" formControlName="nombre">
      </p>

      @if (formulario.controls.nombre.touched) {
        @if (formulario.controls.nombre.hasError('required')) {
          <small>El nombre es obligatorio.</small>
        }
        @if (formulario.controls.nombre.hasError('minlength')) {
          <small>El nombre debe tener mínimo 3 caracteres.</small>
        }
        @if (formulario.controls.nombre.hasError('soloEspacios')) {
          <small>El nombre no puede contener solo espacios.</small>
        }
      }

      <p>
        <label for="correo">Correo electrónico</label>
        <input id="correo" type="email" formControlName="correo">
      </p>

      @if (formulario.controls.correo.touched) {
        @if (formulario.controls.correo.hasError('required')) {
          <small>El correo es obligatorio.</small>
        }
        @if (formulario.controls.correo.hasError('email')) {
          <small>Ingresa un correo válido.</small>
        }
        @if (formulario.controls.correo.hasError('correoOcupado')) {
          <small>Este correo ya está registrado.</small>
        }
        @if (formulario.controls.correo.hasError('errorServidor')) {
          <small>No se pudo comprobar el correo. Inténtalo nuevamente.</small>
        }
      }

      @if (formulario.controls.correo.pending) {
        <small>Comprobando disponibilidad del correo...</small>
      }

      <p>
        <label for="clave">Contraseña</label>
        <input id="clave" type="password" formControlName="clave">
      </p>

      @if (formulario.controls.clave.touched) {
        @if (formulario.controls.clave.hasError('required')) {
          <small>La contraseña es obligatoria.</small>
        }
        @if (formulario.controls.clave.hasError('minlength')) {
          <small>La contraseña debe tener al menos 8 caracteres.</small>
        }
        @if (formulario.controls.clave.hasError('pattern')) {
          <small>La contraseña debe contener al menos una letra y un número.</small>
        }
      }

      <p>
        <label for="confirmacion">Confirmar contraseña</label>
        <input
          id="confirmacion"
          type="password"
          formControlName="confirmacion">
      </p>

      @if (formulario.controls.confirmacion.touched &&
           formulario.controls.confirmacion.hasError('required')) {
        <small>Debes confirmar la contraseña.</small>
      }

      @if (formulario.controls.confirmacion.touched &&
           formulario.hasError('clavesDistintas')) {
        <small>Las contraseñas no coinciden.</small>
      }

      @if (error()) {
        <p role="alert">{{ error() }}</p>
      }

      <p>
        <button
          type="submit"
          [disabled]="enviando() || formulario.pending">
          {{ enviando() ? 'Registrando...' : 'Registrarse' }}
        </button>
      </p>

    </form>

    <p>
      <a routerLink="/login">Volver al inicio de sesión</a>
    </p>
  `
})
export class RegistroPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  enviando = signal(false);
  error = signal('');

  formulario = this.fb.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3),
      noSoloEspacios
    ]],
    correo: this.fb.nonNullable.control('', {
      validators: [
        Validators.required,
        Validators.email
      ],
      asyncValidators: [correoDisponible()],
      updateOn: 'blur'
    }),
    clave: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    ]],
    confirmacion: ['', Validators.required]
  }, {
    validators: [clavesIguales]
  });

  registrar(): void {
    if (this.formulario.invalid || this.formulario.pending) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set('');

    try {
      const datos = this.formulario.getRawValue();

      const usuarios: { nombre: string; correo: string }[] =
        JSON.parse(
          localStorage.getItem('usuarios_registrados') || '[]'
        );

      usuarios.push({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim().toLowerCase()
      });

      localStorage.setItem(
        'usuarios_registrados',
        JSON.stringify(usuarios)
      );

      this.formulario.reset();
      this.router.navigate(['/login']);
    } catch {
      this.error.set('No se pudo completar el registro.');
    } finally {
      this.enviando.set(false);
    }
  }
}
