import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({ selector: 'app-login-page', standalone: true, imports: [FormsModule], template: `
<h1>Iniciar sesión</h1><p>Esta es una autenticación de demostración.</p>
<form (ngSubmit)="entrar()"><p><label>Usuario <input name="usuario" [(ngModel)]="nombre" required></label></p>
<p><label>Clave <input name="clave" type="password" [(ngModel)]="clave" required></label></p>
<button type="submit">Ingresar</button></form>
@if (error()) { <p role="alert" style="color:#b91c1c">{{ error() }}</p> }
<p>Clave de prueba: <code>wposs123</code>. Usuario <code>admin</code> para administración.</p>` })
export class LoginPageComponent {
  private auth = inject(AuthService); private router = inject(Router); private route = inject(ActivatedRoute);
  nombre = ''; clave = ''; error = signal('');
  entrar(): void {
    if (!this.auth.iniciarSesion(this.nombre, this.clave)) { this.error.set('Usuario o clave inválidos.'); return; }
    const destino = this.route.snapshot.queryParamMap.get('volverA') || '/productos';
    this.router.navigateByUrl(destino.startsWith('/') && !destino.startsWith('//') ? destino : '/productos');
  }
}
