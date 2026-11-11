
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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

import { AuthService } from '../../services/auth.service';
import { noSoloEspacios } from '../../validators/no-solo-espacios.validator';

interface ErroresRegistro {
  usuario?: string;
  contrasena?: string;
  correo?: string;
}

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
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="usuario" autocomplete="username">

              @if (formulario.controls.usuario.hasError('required')) {
                <mat-error>El usuario es obligatorio.</mat-error>
              }
              @if (formulario.controls.usuario.hasError('maxlength')) {
                <mat-error>El usuario no puede superar 80 caracteres.</mat-error>
              }
              @if (erroresCampos().usuario) {
                <mat-error>{{ erroresCampos().usuario }}</mat-error>
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
              @if (formulario.controls.correo.hasError('maxlength')) {
                <mat-error>El correo no puede superar 254 caracteres.</mat-error>
              }
              @if (erroresCampos().correo) {
                <mat-error>{{ erroresCampos().correo }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                type="password"
                formControlName="contrasena"
                autocomplete="new-password">

              @if (formulario.controls.contrasena.hasError('required')) {
                <mat-error>La contraseña es obligatoria.</mat-error>
              }
              @if (formulario.controls.contrasena.hasError('minlength')) {
                <mat-error>Mínimo 8 caracteres.</mat-error>
              }
              @if (erroresCampos().contrasena) {
                <mat-error>{{ erroresCampos().contrasena }}</mat-error>
              }
            </mat-form-field>

            @if (error()) {
              <p class="error" role="alert">{{ error() }}</p>
            }

            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="enviando()">
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

    .error {
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
  private auth = inject(AuthService);

  enviando = signal(false);
  error = signal('');
  erroresCampos = signal<ErroresRegistro>({});

  formulario = this.fb.nonNullable.group({
    usuario: ['', [
      Validators.required,
      Validators.maxLength(80),
      noSoloEspacios
    ]],
    contrasena: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    correo: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254)
    ]]
  });

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.erroresCampos.set({});

    const datos = this.formulario.getRawValue();
    this.auth.registrar(
      datos.usuario.trim(),
      datos.contrasena,
      datos.correo.trim().toLowerCase()
    ).subscribe({
      next: () => {
        this.formulario.reset();
        this.router.navigate(['/login']);
      },
      error: (error: unknown) => this.mostrarErrorRegistro(error),
      complete: () => this.enviando.set(false)
    });
  }

  private mostrarErrorRegistro(error: unknown): void {
    this.enviando.set(false);

    if (!(error instanceof HttpErrorResponse)) {
      this.error.set('No se pudo completar el registro. Inténtalo de nuevo.');
      return;
    }

    if (error.status === 409) {
      this.error.set('Ese nombre de usuario ya está registrado.');
      return;
    }

    if (error.status === 400) {
      const cuerpo: unknown = error.error;
      if (typeof cuerpo === 'object' && cuerpo !== null) {
        const respuesta = cuerpo as {
          mensaje?: unknown;
          campos?: unknown;
        };

        this.error.set(
          typeof respuesta.mensaje === 'string'
            ? respuesta.mensaje
            : 'Revisa los datos ingresados y corrige los errores indicados.'
        );

        if (
          typeof respuesta.campos === 'object' &&
          respuesta.campos !== null &&
          !Array.isArray(respuesta.campos)
        ) {
          const errores: ErroresRegistro = {};
          for (const campo of ['usuario', 'contrasena', 'correo'] as const) {
            const mensaje = (respuesta.campos as Record<string, unknown>)[campo];
            if (typeof mensaje === 'string') {
              errores[campo] = mensaje;
            }
          }
          this.erroresCampos.set(errores);
        }
      } else {
        this.error.set('Revisa los datos ingresados y corrige los errores indicados.');
      }
      return;
    }

    this.error.set('No se pudo completar el registro. Inténtalo de nuevo.');
  }
}
