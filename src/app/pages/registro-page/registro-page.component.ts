
import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { noSoloEspacios } from '../../validators/no-solo-espacios.validator';
import { clavesIguales } from '../../validators/claves-iguales.validator';
import { correoDisponible } from '../../validators/correo-disponible.validator';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="contenedor">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Registro de usuario</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="registrar()">

            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre">

              @if (formulario.controls.nombre.hasError('required')) {
                <mat-error>El nombre es obligatorio.</mat-error>
              }
              @if (formulario.controls.nombre.hasError('minlength')) {
                <mat-error>El nombre debe tener mínimo 3 caracteres.</mat-error>
              }
              @if (formulario.controls.nombre.hasError('soloEspacios')) {
                <mat-error>El nombre no puede contener solo espacios.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input
                matInput
                type="email"
                formControlName="correo"
                autocomplete="email">

              @if (formulario.controls.correo.hasError('required')) {
                <mat-error>El correo es obligatorio.</mat-error>
              }
              @if (formulario.controls.correo.hasError('email')) {
                <mat-error>Ingresa un correo válido.</mat-error>
              }
              @if (formulario.controls.correo.hasError('correoOcupado')) {
                <mat-error>Este correo ya está registrado.</mat-error>
              }
              @if (formulario.controls.correo.hasError('errorServidor')) {
                <mat-error>No se pudo comprobar el correo.</mat-error>
              }

              @if (formulario.controls.correo.pending) {
                <mat-hint>Comprobando disponibilidad...</mat-hint>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                type="password"
                formControlName="clave"
                autocomplete="new-password">

              @if (formulario.controls.clave.hasError('required')) {
                <mat-error>La contraseña es obligatoria.</mat-error>
              }
              @if (formulario.controls.clave.hasError('minlength')) {
                <mat-error>Mínimo 8 caracteres.</mat-error>
              }
              @if (formulario.controls.clave.hasError('pattern')) {
                <mat-error>Debe contener una letra y un número.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirmar contraseña</mat-label>
              <input
                matInput
                type="password"
                formControlName="confirmacion"
                autocomplete="new-password">

              @if (formulario.controls.confirmacion.hasError('required')) {
                <mat-error>Debes confirmar la contraseña.</mat-error>
              }
              @if (formulario.controls.confirmacion.touched &&
                   formulario.hasError('clavesDistintas')) {
                <mat-hint class="error-confirmacion">
                  Las contraseñas no coinciden.
                </mat-hint>
              }
            </mat-form-field>

            @if (error()) {
              <p class="error" role="alert">{{ error() }}</p>
            }

            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="enviando() || formulario.pending">
              @if (enviando()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Registrarse
              }
            </button>

            <a mat-button routerLink="/login">
              Volver al inicio de sesión
            </a>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .contenedor {
      display: flex;
      justify-content: center;
      padding: 32px 16px;
    }

    mat-card {
      width: 100%;
      max-width: 460px;
      padding: 20px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 24px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    mat-form-field {
      width: 100%;
    }

    button {
      min-height: 44px;
    }

    .error,
    .error-confirmacion {
      color: #b91c1c;
    }

    mat-spinner {
      display: inline-block;
      margin: auto;
    }

    @media (max-width: 375px) {
      .contenedor {
        padding: 16px 8px;
      }

      mat-card {
        padding: 12px;
      }
    }
  `]
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
