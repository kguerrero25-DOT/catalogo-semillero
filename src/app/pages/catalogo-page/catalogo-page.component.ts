
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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

import { ProductoListado } from '../../models/producto';
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

  cargando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  private categoriaSeleccionada = signal<string | null>(null);
  readonly categoriaActual = signal('Todas');

  private recargar$ = new Subject<void>();
  private eliminar$ = new Subject<ProductoListado>();

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const categoria = params.get('categoria');

      this.categoriaActual.set(categoria ?? 'Todas');

      this.categoriaSeleccionada.set(
        categoria && categoria !== 'Todas' ? categoria : null
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
            `Producto "${producto.titulo}" eliminado correctamente.`
          );

          this.snackBar.open(
            'Producto eliminado correctamente',
            'Cerrar',
            { duration: 3000 }
          );
        }),
        catchError((error: unknown) => {
          const mensaje = error instanceof HttpErrorResponse && error.status === 403
            ? 'No tienes permiso para borrar este producto.'
            : error instanceof HttpErrorResponse && error.status === 404
              ? 'El producto ya no existe o fue eliminado.'
              : `No se pudo eliminar "${producto.titulo}".`;

          this.mensajeError.set(mensaje);

          this.snackBar.open(
            mensaje,
            'Cerrar',
            { duration: 4000 }
          );

          return of(undefined);
        })
      )
    )
  );

  productos$: Observable<ProductoListado[]> = merge(
    this.recargar$,
    this.acciones$
  ).pipe(
    startWith(undefined),
    switchMap(() => this.cargarProductos())
  );

  private cargarProductos(): Observable<ProductoListado[]> {
    this.cargando.set(true);

    const categoria = this.categoriaSeleccionada();

    const peticion = categoria === null
      ? this.productoService.obtenerTodos()
      : this.productoService.obtenerPorCategoria(categoria);

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
        categoria: valor === 'Todas' ? null : valor
      },
      queryParamsHandling: 'merge'
    });
  }

  agregarAlCarrito(producto: ProductoListado): void {
    this.carritoService.agregar(producto);

    this.snackBar.open(
      'Producto agregado al carrito',
      'Cerrar',
      { duration: 2500 }
    );
  }

  editarProducto(producto: ProductoListado): void {
    this.router.navigate([
      '/admin/productos',
      producto.id,
      'editar'
    ]);
  }

  eliminarProducto(producto: ProductoListado): void {
    const referencia = this.dialog.open(
      ConfirmarEliminarDialogComponent,
      {
        width: '400px',
        maxWidth: '95vw',
        data: { nombre: producto.titulo }
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

  trackById(index: number, producto: ProductoListado): number {
    return producto.id;
  }
}
