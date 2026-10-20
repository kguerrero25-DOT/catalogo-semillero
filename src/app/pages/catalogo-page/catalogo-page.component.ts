
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TarjetaProductoComponent } from '../../components/tarjeta-producto/tarjeta-producto.component';
import { TablaProductosComponent } from '../../components/tabla-productos/tabla-productos.component';

import { Producto } from '../../models/producto';
import { Categoria } from '../../models/categoria';

import { AuthService } from '../../services/auth.service';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { CarritoService } from '../../services/carrito.service';

import { ConfirmarEliminarDialogComponent } from '../../components/confirmar-eliminar-dialog/confirmar-eliminar-dialog.component';

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TarjetaProductoComponent,
    TablaProductosComponent,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './catalogo-page.component.html',
  styleUrl: './catalogo-page.component.css'
})
export class CatalogoPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  readonly auth = inject(AuthService);
  readonly carritoService = inject(CarritoService);

  readonly rol = () =>
    this.auth.tieneRol('admin') ? 'admin' : 'customer';

  cargando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  private categoriaSeleccionada = signal<number | null>(null);
  readonly categoriaActual = signal('Todas');
  readonly paginaActual = signal(1);

  private recargar$ = new Subject<void>();
  private eliminar$ = new Subject<Producto>();

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const categoria = params.get('categoria');

      this.categoriaActual.set(categoria ?? 'Todas');

      this.paginaActual.set(
        Math.max(1, Number(params.get('pagina')) || 1)
      );

      this.categoriaSeleccionada.set(
        categoria &&
        Number.isInteger(Number(categoria)) &&
        Number(categoria) > 0
          ? Number(categoria)
          : null
      );

      this.recargar$.next();
    });
  }

  categorias$: Observable<Categoria[]> =
    this.categoriaService.obtenerTodas().pipe(
      catchError(() => {
        this.mensajeError.set(
          'No se pudieron cargar las categorías.'
        );
        return of([]);
      })
    );

  private acciones$ = this.eliminar$.pipe(
    switchMap(producto =>
      this.productoService.eliminar(producto.id).pipe(
        map(() => {
          this.mensajeExito.set(
            `Producto "${producto.title}" eliminado correctamente.`
          );

          this.snackBar.open(
            'Producto eliminado correctamente',
            'Cerrar',
            { duration: 3000 }
          );
        }),
        catchError(() => {
          this.mensajeError.set(
            `No se pudo eliminar "${producto.title}".`
          );

          this.snackBar.open(
            'No se pudo eliminar el producto',
            'Cerrar',
            { duration: 4000 }
          );

          return of(undefined);
        })
      )
    )
  );

  productos$: Observable<Producto[]> = merge(
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
      catchError(() => {
        this.mensajeError.set(
          'No se pudieron cargar los productos.'
        );
        return of([]);
      }),
      finalize(() => this.cargando.set(false))
    );
  }

  cambiarCategoria(valor: string): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categoria: valor === 'Todas' ? null : valor,
        pagina: null
      },
      queryParamsHandling: 'merge'
    });
  }

  cambiarPagina(pagina: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        pagina: pagina <= 1 ? null : pagina
      },
      queryParamsHandling: 'merge'
    });
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregar(producto);

    this.snackBar.open(
      'Producto agregado al carrito',
      'Cerrar',
      { duration: 2500 }
    );
  }

  editarProducto(producto: Producto): void {
    this.router.navigate([
      '/admin/productos',
      producto.id,
      'editar'
    ]);
  }

  eliminarProducto(producto: Producto): void {
    const referencia = this.dialog.open(
      ConfirmarEliminarDialogComponent,
      {
        width: '400px',
        maxWidth: '95vw',
        data: { nombre: producto.title }
      }
    );

    referencia.afterClosed().subscribe(confirmado => {
      if (confirmado === true) {
        this.mensajeError.set('');
        this.mensajeExito.set('');
        this.eliminar$.next(producto);
      }
    });
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }
}
