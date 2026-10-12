import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
@Component({ selector: 'app-encabezado', standalone: true, imports: [RouterLink, RouterLinkActive], template: `
<header><strong>Tienda Semillero</strong><nav>
<a routerLink="/productos" routerLinkActive="activo">Productos</a>
<a routerLink="/carrito" routerLinkActive="activo">Carrito ({{ carrito.cantidad() }})</a>
@if (auth.tieneRol('admin')) { <a routerLink="/admin" routerLinkActive="activo">Administración</a> }
@if (auth.estaAutenticado()) { <span>{{ auth.usuario()?.nombre }}</span><button (click)="auth.cerrarSesion()">Cerrar sesión</button> }
@else { <a routerLink="/login" routerLinkActive="activo">Iniciar sesión</a> }
</nav></header>`, styles: [`header {display:flex;justify-content:space-between;gap:20px;align-items:center;padding:18px 24px;background:#f1f5f9;flex-wrap:wrap}nav{display:flex;align-items:center;gap:16px;flex-wrap:wrap}a{color:#1758a8;text-decoration:none}.activo{font-weight:bold;text-decoration:underline}button{cursor:pointer}`] })
export class EncabezadoComponent { readonly auth = inject(AuthService); readonly carrito = inject(CarritoService); }
