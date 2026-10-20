
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
        <label for="correo">Correo electrónico</label>
        <input
          id="correo"
          type="email"
          formControlName="correo"
          autocomplete="email">
      </p>

      @if (formulario.controls.correo.touched) {
        @if (formulario.controls.correo.hasError('required')) {
          <small>El correo es obligatorio.</small>
        }
        @if (formulario.controls.correo.hasError('email')) {
          <small>Ingresa un correo válido.</small>
        }
      }

      <p>
        <label for="clave">Contraseña</label>
        <input
          id="clave"
          type="password"
          formControlName="clave"
          autocomplete="current-password">
      </p>

      @if (formulario.controls.clave.touched &&
           formulario.controls.clave.hasError('required')) {
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
    correo: ['', [
      Validators.required,
      Validators.email
    ]],
    clave: ['', [
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
      datos.correo.trim(),
      datos.clave
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
        this.error.set('Correo o contraseña incorrectos.');
      }
    });
  }
}
