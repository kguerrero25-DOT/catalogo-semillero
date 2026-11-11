
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria';
import { ProductoEscritura } from '../../models/producto';

interface ErroresProducto {
  titulo?: string;
  precio?: string;
  existencias?: string;
  categoriaId?: string;
  [campo: string]: string | undefined;
}

@Component({
  selector: 'app-producto-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="contenedor">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ editando() ? 'Editar producto' : 'Nuevo producto' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()">

            @if (editando()) {
              <mat-form-field appearance="outline">
                <mat-label>Código del producto</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="codigo">
              </mat-form-field>
            }

            <mat-form-field appearance="outline">
              <mat-label>Título</mat-label>
              <input matInput formControlName="titulo">

              @if (formulario.controls.titulo.hasError('required')) {
                <mat-error>El título es obligatorio.</mat-error>
              } @else if (formulario.controls.titulo.hasError('maxlength')) {
                <mat-error>Máximo 120 caracteres.</mat-error>
              }
              @if (erroresCampos().titulo) {
                <mat-error>{{ erroresCampos().titulo }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Precio</mat-label>
              <input
                matInput
                type="number"
                step="0.01"
                formControlName="precio">

              @if (formulario.controls.precio.hasError('required')) {
                <mat-error>El precio es obligatorio.</mat-error>
              } @else if (formulario.controls.precio.hasError('min')) {
                <mat-error>El precio debe ser mayor que cero.</mat-error>
              } @else if (formulario.controls.precio.hasError('pattern')) {
                <mat-error>Usa como máximo dos decimales.</mat-error>
              }
              @if (erroresCampos().precio) {
                <mat-error>{{ erroresCampos().precio }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Existencias</mat-label>
              <input
                matInput
                type="number"
                step="1"
                formControlName="existencias">

              @if (formulario.controls.existencias.hasError('required')) {
                <mat-error>Las existencias son obligatorias.</mat-error>
              } @else if (formulario.controls.existencias.hasError('min')) {
                <mat-error>Las existencias no pueden ser negativas.</mat-error>
              } @else if (formulario.controls.existencias.hasError('pattern')) {
                <mat-error>Las existencias deben ser un número entero.</mat-error>
              }
              @if (erroresCampos().existencias) {
                <mat-error>{{ erroresCampos().existencias }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="categoriaId">
                <mat-option [value]="0">
                  Selecciona una categoría
                </mat-option>

                @for (categoria of categorias(); track categoria.id) {
                  <mat-option [value]="categoria.id">
                    {{ categoria.nombre }}
                  </mat-option>
                }
              </mat-select>

              @if (formulario.controls.categoriaId.invalid) {
                <mat-error>Selecciona una categoría.</mat-error>
              }
              @if (erroresCampos().categoriaId) {
                <mat-error>{{ erroresCampos().categoriaId }}</mat-error>
              }
            </mat-form-field>

            @if (error()) {
              <p class="error" role="alert">{{ error() }}</p>
            }

            <div class="acciones">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="guardando()">

                @if (guardando()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>save</mat-icon>
                  Guardar
                }
              </button>

              <a mat-button routerLink="/productos">
                Volver al catálogo
              </a>
            </div>

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
      max-width: 700px;
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
      gap: 18px;
    }

    mat-form-field {
      width: 100%;
    }

    .acciones {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 16px;
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
        padding: 12px 8px;
      }

      mat-card {
        padding: 12px;
      }
    }
  `]
})
export class ProductoFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categorias = signal<Categoria[]>([]);
  editando = signal(false);
  guardando = signal(false);
  error = signal('');
  erroresCampos = signal<ErroresProducto>({});

  private productoId: number | null = null;

  formulario = this.fb.nonNullable.group({
    codigo: this.fb.nonNullable.control({
      value: 0,
      disabled: true
    }),
    titulo: ['', [
      Validators.required,
      Validators.maxLength(120)
    ]],
    precio: [0, [
      Validators.required,
      Validators.min(0.01),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)
    ]],
    existencias: [0, [
      Validators.required,
      Validators.min(0),
      Validators.pattern(/^\d+$/)
    ]],
    categoriaId: [0, [
      Validators.required,
      Validators.min(1)
    ]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      const idNumerico = Number(id);

      if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
        this.error.set('El ID del producto no es válido.');
        return;
      }

      this.editando.set(true);
      this.productoId = idNumerico;

      forkJoin({
        producto: this.productoService.obtenerPorId(idNumerico),
        categorias: this.categoriaService.obtenerTodas()
      }).subscribe({
        next: ({ producto, categorias }) => {
          this.categorias.set(categorias);
          const categoria = categorias.find(
            elemento => elemento.nombre === producto.categoria
          );

          if (!categoria) {
            this.error.set(
              `No se encontró la categoría "${producto.categoria}" del producto.`
            );
            return;
          }

          this.formulario.patchValue({
            codigo: producto.id,
            titulo: producto.titulo,
            precio: producto.precio,
            existencias: producto.existencias,
            categoriaId: categoria.id
          });
          this.formulario.markAsPristine();
        },
        error: (error: unknown) => this.mostrarError(error, true)
      });
    } else {
      this.categoriaService.obtenerTodas().subscribe({
        next: categorias => this.categorias.set(categorias),
        error: (error: unknown) => this.mostrarError(error, false)
      });
    }
  }

  guardar(): void {
    if (this.formulario.invalid || this.formulario.pending) {
      this.formulario.markAllAsTouched();

      setTimeout(() => {
      document.querySelector(
          'input.ng-invalid, mat-select.ng-invalid'
        )?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 0);

      return;
    }

    this.guardando.set(true);
    this.error.set('');
    this.erroresCampos.set({});

    const datos = this.formulario.getRawValue();

    const producto: ProductoEscritura = {
      titulo: datos.titulo.trim(),
      precio: datos.precio,
      existencias: datos.existencias,
      categoriaId: datos.categoriaId
    };

    const peticion = this.editando() && this.productoId !== null
      ? this.productoService.actualizar(this.productoId, producto)
      : this.productoService.crear(producto);

    peticion.subscribe({
      next: () => {
        this.formulario.markAsPristine();
        this.guardando.set(false);
        this.router.navigate(['/productos']);
      },
      error: (error: unknown) => this.mostrarError(error, false)
    });
  }

  private mostrarError(error: unknown, cargando: boolean): void {
    this.guardando.set(false);

    if (!(error instanceof HttpErrorResponse)) {
      this.error.set(
        cargando
          ? 'No se pudo cargar el producto o las categorías.'
          : 'No se pudo guardar el producto.'
      );
      return;
    }

    if (error.status === 403) {
      this.error.set('No tienes permiso para realizar esta acción.');
      return;
    }

    if (error.status === 404) {
      this.error.set('El producto no existe o ya fue eliminado.');
      return;
    }

    if (error.status === 400) {
      const cuerpo: unknown = error.error;
      if (typeof cuerpo === 'object' && cuerpo !== null) {
        const respuesta = cuerpo as {
          mensaje?: unknown;
          campos?: unknown;
        };
        const erroresCampos: ErroresProducto = {};
        if (
          typeof respuesta.campos === 'object' &&
          respuesta.campos !== null &&
          !Array.isArray(respuesta.campos)
        ) {
          for (const [campo, mensaje] of Object.entries(
            respuesta.campos as Record<string, unknown>
          )) {
            if (typeof mensaje === 'string') {
              erroresCampos[campo] = mensaje;
            }
          }
        }
        this.erroresCampos.set(erroresCampos);

        this.error.set(
          typeof respuesta.mensaje === 'string'
            ? respuesta.mensaje
            : 'Revisa los datos ingresados y corrige los errores.'
        );
        return;
      }

      this.error.set('Revisa los datos ingresados y corrige los errores.');
      return;
    }

    this.error.set(
      cargando
        ? 'No se pudo cargar el producto o las categorías.'
        : 'No se pudo guardar el producto.'
    );
  }

  puedeSalir(): boolean {
    return !this.formulario.dirty ||
      window.confirm('Tienes cambios sin guardar. ¿Deseas salir?');
  }
}
