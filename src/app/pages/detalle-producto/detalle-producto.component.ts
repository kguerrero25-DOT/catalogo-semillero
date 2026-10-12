import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto';
@Component({ selector: 'app-detalle-producto', standalone: true, imports: [AsyncPipe, CurrencyPipe, RouterLink], template: `
<a routerLink="/productos">Volver al catálogo</a>
@if (estado$ | async; as estado) {
  @if (estado.producto; as producto) {
    <h1>{{ producto.title }}</h1><img [src]="producto.images[0]" [alt]="producto.title" style="max-width:280px;width:100%">
    <p>{{ producto.description }}</p><p>{{ producto.price | currency:'COP' }}</p>
    <button (click)="carrito.agregar(producto)">Agregar al carrito</button>
    <h2>Productos relacionados</h2>
    @for (relacionado of estado.relacionados; track relacionado.id) { <p><a [routerLink]="['/productos', relacionado.id]">{{ relacionado.title }}</a></p> }
  } @else { <p role="alert">No se encontró el producto solicitado.</p> }
} @else { <p>Cargando producto...</p> }` })
export class DetalleProductoComponent {
  private route = inject(ActivatedRoute); private productos = inject(ProductoService); readonly carrito = inject(CarritoService);
  readonly estado$ = this.route.paramMap.pipe(
    map(params => Number(params.get('id'))),
    switchMap(id => Number.isInteger(id) && id > 0 ? this.productos.obtenerPorId(id).pipe(
      switchMap(producto => this.productos.obtenerPorCategoria(producto.category.id).pipe(
        map(lista => ({ producto, relacionados: lista.filter(p => p.id !== producto.id).slice(0, 5) })),
        catchError(() => of({ producto, relacionados: [] as Producto[] }))
      )),
      catchError(() => of({ producto: null as Producto | null, relacionados: [] as Producto[] }))
    ) : of({ producto: null as Producto | null, relacionados: [] as Producto[] }))
  );
}
