
import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1>Iniciar sesión</h1>

    <form [formGroup]="formulario" (ngSubmit)="entrar()">

      <p>
        <label for="usuario">Usuario</label>
        <input
          id="usuario"
          type="text"
          formControlName="usuario"
          autocomplete="username">
      </p>

      @if (formulario.controls.usuario.touched) {
        @if (formulario.controls.usuario.hasError('required')) {
          <small>El usuario es obligatorio.</small>
        }
      }

      <p>
        <label for="contrasena">Contraseña</label>
        <input
          id="contrasena"
          type="password"
          formControlName="contrasena"
          autocomplete="current-password">
      </p>

      @if (formulario.controls.contrasena.touched &&
           formulario.controls.contrasena.hasError('required')) {
        <small>La contraseña es obligatoria.</small>
      }

      @if (error()) {
        <p role="alert" style="color: #b91c1c">
          {{ error() }}
        </p>
      }

      <p>
        <button type="submit" [disabled]="enviando()">
          {{ enviando() ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </p>

    </form>
  `
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  enviando = signal(false);
  error = signal('');

  formulario = this.fb.nonNullable.group({
    usuario: ['', [
      Validators.required
    ]],
    contrasena: ['', [
      Validators.required
    ]]
  });

  entrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.error.set('');

    const datos = this.formulario.getRawValue();

    this.auth.iniciarSesion(
      datos.usuario.trim(),
      datos.contrasena
    ).subscribe({
      next: () => {
        this.enviando.set(false);

        const destino =
          this.route.snapshot.queryParamMap.get('volverA') ||
          '/productos';

        const rutaSegura =
          destino.startsWith('/') && !destino.startsWith('//')
            ? destino
            : '/productos';

        this.router.navigateByUrl(rutaSegura);
      },
      error: () => {
        this.enviando.set(false);
        this.error.set('Usuario o contraseña incorrectos.');
      }
    });
  }
}
