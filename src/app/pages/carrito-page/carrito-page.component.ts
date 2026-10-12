import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-carrito-page', standalone: true, imports: [CurrencyPipe, RouterLink], template: `
<h1>Carrito</h1><p>Productos: {{ carrito.cantidad() }}</p>
@for (producto of carrito.productos(); track $index) { <div><a [routerLink]="['/productos', producto.id]">{{ producto.title }}</a> — {{ producto.price | currency:'COP' }} <button (click)="carrito.quitar(producto.id)">Quitar</button></div> }
@if (!carrito.cantidad()) { <p>Tu carrito está vacío.</p> }
<h3>Total: {{ carrito.total() | currency:'COP' }}</h3>
@if (carrito.cantidad()) { <button (click)="carrito.vaciar()">Vaciar carrito</button> }` })
export class CarritoPageComponent { readonly carrito = inject(CarritoService); }
