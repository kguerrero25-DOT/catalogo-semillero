import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  Observable,
  Subject,
  catchError,
  finalize,
  map,
  merge,
  of,
  startWith,
  switchMap
} from 'rxjs';

import { TarjetaProductoComponent } from '../../components/tarjeta-producto/tarjeta-producto.component';
import { TablaProductosComponent } from '../../components/tabla-productos/tabla-productos.component';

import { Producto } from '../../models/producto';
import { Categoria } from '../../models/categoria';

import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [
    CommonModule,
    TarjetaProductoComponent,
    TablaProductosComponent,
    RouterLink
  ],
  templateUrl: './catalogo-page.component.html',
  styleUrl: './catalogo-page.component.css'
})
export class CatalogoPageComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly auth = inject(AuthService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);

  readonly carritoService = inject(CarritoService);

  readonly rol = () => this.auth.tieneRol('admin') ? 'admin' : 'customer';

  cargando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  private categoriaSeleccionada = signal<number | null>(null);
  readonly categoriaActual = signal('Todas');
  readonly paginaActual = signal(1);
  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const categoria = params.get('categoria');
      this.categoriaActual.set(categoria ?? 'Todas');
      this.paginaActual.set(Math.max(1, Number(params.get('pagina')) || 1));
      this.categoriaSeleccionada.set(categoria && Number.isInteger(Number(categoria)) && Number(categoria) > 0 ? Number(categoria) : null);
      this.recargar$.next();
    });
  }

  private recargar$ = new Subject<void>();

  private eliminar$ = new Subject<Producto>();

  private editar$ = new Subject<Producto>();

  categorias$: Observable<Categoria[]> =
    this.categoriaService.obtenerTodas().pipe(
      catchError(error => {
        console.error('Error al cargar categorías', error);
        this.mensajeError.set(
          'No se pudieron cargar las categorías.'
        );
        return of([]);
      })
    );

  private acciones$ = merge(

    this.eliminar$.pipe(
      switchMap(producto => {
        this.mensajeError.set('');
        this.mensajeExito.set('');

        return this.productoService.eliminar(producto.id).pipe(
          map(() => {
            this.mensajeExito.set(
              `Producto "${producto.title}" eliminado correctamente.`
            );
          }),
          catchError(error => {
            console.error('Error al eliminar producto', error);

            this.mensajeError.set(
              `No se pudo eliminar "${producto.title}".`
            );

            return of(undefined);
          })
        );
      })
    ),

    this.editar$.pipe(
      switchMap(producto => {

        const nuevoTitulo = window.prompt(
          'Nuevo título del producto:',
          producto.title
        );

        if (nuevoTitulo === null) {
          return of(undefined);
        }

        const precioTexto = window.prompt(
          'Nuevo precio:',
          producto.price.toString()
        );

        if (precioTexto === null) {
          return of(undefined);
        }

        const nuevoPrecio = Number(precioTexto);

        if (
          nuevoTitulo.trim() === '' ||
          Number.isNaN(nuevoPrecio) ||
          nuevoPrecio <= 0
        ) {
          this.mensajeError.set(
            'El título y el precio ingresados no son válidos.'
          );

          return of(undefined);
        }

        this.mensajeError.set('');
        this.mensajeExito.set('');

        return this.productoService.actualizar(
          producto.id,
          {
            title: nuevoTitulo.trim(),
            price: nuevoPrecio
          }
        ).pipe(
          map(() => {
            this.mensajeExito.set(
              `Producto "${nuevoTitulo.trim()}" actualizado correctamente.`
            );
          }),
          catchError(error => {
            console.error('Error al actualizar producto', error);

            this.mensajeError.set(
              `No se pudo actualizar "${producto.title}".`
            );

            return of(undefined);
          })
        );
      })
    )

  ).pipe(
    map(() => undefined)
  );

  productos$: Observable<Producto[]> =
    merge(
      this.recargar$,
      this.acciones$
    ).pipe(
      startWith(undefined),
      switchMap(() => this.cargarProductos())
    );

  private cargarProductos(): Observable<Producto[]> {

    this.cargando.set(true);

    const categoriaId = this.categoriaSeleccionada();

    const peticion = categoriaId === null
      ? this.productoService.obtenerTodos()
      : this.productoService.obtenerPorCategoria(categoriaId);

    return peticion.pipe(
      catchError(error => {
        console.error('Error al cargar catálogo', error);

        this.mensajeError.set(
          'No se pudieron cargar los productos.'
        );

        return of([]);
      }),

      finalize(() => {
        this.cargando.set(false);
      })
    );
  }

  cambiarCategoria(valor: string): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.router.navigate([], { relativeTo: this.route, queryParams: { categoria: valor === 'Todas' ? null : valor }, queryParamsHandling: 'merge' });
  }

  cambiarPagina(pagina: number): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { pagina: pagina <= 1 ? null : pagina }, queryParamsHandling: 'merge' });
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregar(producto);
  }

  editarProducto(producto: Producto): void {
    this.editar$.next(producto);
  }

  eliminarProducto(producto: Producto): void {

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${producto.title}"?`
    );

    if (confirmar) {
      this.eliminar$.next(producto);
    }
  }

  trackById(
    index: number,
    producto: Producto
  ): number {
    return producto.id;
  }
}
