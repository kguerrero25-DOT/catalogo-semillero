
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
import { noSoloEspacios } from '../../validators/no-solo-espacios.validator';

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
              } @else if (formulario.controls.titulo.hasError('soloEspacios')) {
                <mat-error>El título no puede contener solo espacios.</mat-error>
              } @else if (formulario.controls.titulo.hasError('minlength')) {
                <mat-error>Mínimo 3 caracteres.</mat-error>
              } @else if (formulario.controls.titulo.hasError('maxlength')) {
                <mat-error>Máximo 100 caracteres.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Precio</mat-label>
              <input
                matInput
                type="number"
                formControlName="precio">

              @if (formulario.controls.precio.hasError('required')) {
                <mat-error>El precio es obligatorio.</mat-error>
              } @else if (formulario.controls.precio.hasError('min')) {
                <mat-error>El precio debe ser mayor que cero.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Descripción</mat-label>
              <textarea
                matInput
                rows="4"
                formControlName="descripcion">
              </textarea>

              <mat-hint align="end">
                {{ caracteresRestantes() }} caracteres restantes
              </mat-hint>

              @if (formulario.controls.descripcion.hasError('required')) {
                <mat-error>La descripción es obligatoria.</mat-error>
              } @else if (formulario.controls.descripcion.hasError('minlength')) {
                <mat-error>Mínimo 20 caracteres.</mat-error>
              } @else if (formulario.controls.descripcion.hasError('maxlength')) {
                <mat-error>Máximo 500 caracteres.</mat-error>
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
                    {{ categoria.name }}
                  </mat-option>
                }
              </mat-select>

              @if (formulario.controls.categoriaId.invalid) {
                <mat-error>Selecciona una categoría.</mat-error>
              }
            </mat-form-field>

            <h2>Imágenes</h2>

            <div formArrayName="imagenes">
              @for (control of imagenes.controls; track control; let i = $index) {
                <div class="fila-imagen">
                  <mat-form-field appearance="outline">
                    <mat-label>URL de imagen {{ i + 1 }}</mat-label>

                    <input
                      matInput
                      type="url"
                      [formControlName]="i">

                    @if (control.hasError('required')) {
                      <mat-error>La URL es obligatoria.</mat-error>
                    } @else if (control.hasError('pattern')) {
                      <mat-error>
                        Debe comenzar con http:// o https://.
                      </mat-error>
                    }
                  </mat-form-field>

                  <button
                    mat-icon-button
                    type="button"
                    aria-label="Quitar imagen"
                    (click)="quitarImagen(i)"
                    [disabled]="imagenes.length === 1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>

            <button
              mat-stroked-button
              type="button"
              (click)="agregarImagen()">
              <mat-icon>add</mat-icon>
              Agregar imagen
            </button>

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

    h2 {
      margin: 8px 0 0;
    }

    .fila-imagen {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fila-imagen mat-form-field {
      flex: 1;
      min-width: 0;
    }

    .fila-imagen button {
      flex-shrink: 0;
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
  caracteresRestantes = signal(500);

  private productoId: number | null = null;

  private validadoresImagen = [
    Validators.required,
    Validators.pattern(/^https?:\/\/\S+$/i)
  ];

  formulario = this.fb.nonNullable.group({
    codigo: this.fb.nonNullable.control({
      value: 0,
      disabled: true
    }),
    titulo: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      noSoloEspacios
    ]],
    precio: [0, [
      Validators.required,
      Validators.min(0.01)
    ]],
    descripcion: ['', [
      Validators.required,
      Validators.minLength(20),
      Validators.maxLength(500)
    ]],
    categoriaId: [0, [
      Validators.required,
      Validators.min(1)
    ]],
    imagenes: this.fb.array<FormControl<string>>([
      this.fb.nonNullable.control('', this.validadoresImagen)
    ])
  });

  get imagenes(): FormArray<FormControl<string>> {
    return this.formulario.controls.imagenes;
  }

  ngOnInit(): void {
    this.categoriaService.obtenerTodas().subscribe({
      next: categorias => this.categorias.set(categorias),
      error: () => this.error.set('No se pudieron cargar las categorías.')
    });

    this.formulario.controls.descripcion.valueChanges.subscribe(valor => {
      this.caracteresRestantes.set(500 - valor.length);
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      const idNumerico = Number(id);

      if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
        this.error.set('El ID del producto no es válido.');
        return;
      }

      this.editando.set(true);
      this.productoId = idNumerico;

      this.productoService.obtenerPorId(idNumerico).subscribe({
        next: producto => {
          this.formulario.patchValue({
            codigo: producto.id,
            titulo: producto.title,
            precio: producto.price,
            descripcion: producto.description,
            categoriaId: producto.category.id
          });

          this.imagenes.clear();

          producto.images.forEach(imagen => {
            this.imagenes.push(
              this.fb.nonNullable.control(
                imagen,
                this.validadoresImagen
              )
            );
          });

          if (this.imagenes.length === 0) {
            this.imagenes.push(
              this.fb.nonNullable.control(
                '',
                this.validadoresImagen
              )
            );
          }

          this.formulario.markAsPristine();
        },
        error: () => this.error.set('No se pudo cargar el producto.')
      });
    }
  }

  agregarImagen(): void {
    this.imagenes.push(
      this.fb.nonNullable.control('', this.validadoresImagen)
    );
    this.formulario.markAsDirty();
  }

  quitarImagen(indice: number): void {
    if (this.imagenes.length > 1) {
      this.imagenes.removeAt(indice);
      this.formulario.markAsDirty();
    }
  }

  guardar(): void {
    if (this.formulario.invalid || this.formulario.pending) {
      this.formulario.markAllAsTouched();

      setTimeout(() => {
        document.querySelector(
          'input.ng-invalid, textarea.ng-invalid, mat-select.ng-invalid'
        )?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 0);

      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const datos = this.formulario.getRawValue();

    const producto = {
      title: datos.titulo.trim(),
      price: datos.precio,
      description: datos.descripcion,
      categoryId: datos.categoriaId,
      images: datos.imagenes
    };

    const peticion = this.editando() && this.productoId !== null
      ? this.productoService.actualizar(this.productoId, {
        ...producto,
        id: datos.codigo
      })
      : this.productoService.crear(producto);

    peticion.subscribe({
      next: () => {
        this.formulario.markAsPristine();
        this.guardando.set(false);
        this.router.navigate(['/productos']);
      },
      error: () => {
        this.error.set('No se pudo guardar el producto.');
        this.guardando.set(false);
      }
    });
  }

  puedeSalir(): boolean {
    return !this.formulario.dirty ||
      window.confirm('Tienes cambios sin guardar. ¿Deseas salir?');
  }
}
