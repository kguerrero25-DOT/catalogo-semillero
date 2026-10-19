
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria';
import { noSoloEspacios } from '../../validators/no-solo-espacios.validator';

@Component({
  selector: 'app-producto-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>{{ editando() ? 'Editar producto' : 'Nuevo producto' }}</h1>

    <form [formGroup]="formulario" (ngSubmit)="guardar()">

      @if (editando()) {
        <p>
          <label for="codigo">Código del producto</label>
          <input id="codigo" type="number" formControlName="codigo">
        </p>
      }

      <p>
        <label for="titulo">Título</label>
        <input id="titulo" formControlName="titulo">
      </p>

      @if (formulario.controls.titulo.touched) {
        @if (formulario.controls.titulo.hasError('required')) {
          <small>El título es obligatorio.</small>
        }
        @if (formulario.controls.titulo.hasError('minlength')) {
          <small>El título debe tener mínimo 3 caracteres.</small>
        }
        @if (formulario.controls.titulo.hasError('maxlength')) {
          <small>El título no puede superar 100 caracteres.</small>
        }
        @if (formulario.controls.titulo.hasError('soloEspacios')) {
          <small>El título no puede contener solo espacios.</small>
        }
      }

      <p>
        <label for="precio">Precio</label>
        <input id="precio" type="number" formControlName="precio">
      </p>

      @if (formulario.controls.precio.touched) {
        @if (formulario.controls.precio.hasError('required')) {
          <small>El precio es obligatorio.</small>
        }
        @if (formulario.controls.precio.hasError('min')) {
          <small>El precio debe ser mayor que cero.</small>
        }
      }

      <p>
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" formControlName="descripcion"></textarea>
      </p>

      <p>Caracteres restantes: {{ caracteresRestantes() }}</p>

      @if (formulario.controls.descripcion.touched) {
        @if (formulario.controls.descripcion.hasError('required')) {
          <small>La descripción es obligatoria.</small>
        }
        @if (formulario.controls.descripcion.hasError('minlength')) {
          <small>La descripción debe tener mínimo 20 caracteres.</small>
        }
        @if (formulario.controls.descripcion.hasError('maxlength')) {
          <small>La descripción no puede superar 500 caracteres.</small>
        }
      }

      <p>
        <label for="categoria">Categoría</label>
        <select id="categoria" formControlName="categoriaId">
          <option [ngValue]="0">Selecciona una categoría</option>
          @for (categoria of categorias(); track categoria.id) {
            <option [ngValue]="categoria.id">{{ categoria.name }}</option>
          }
        </select>
      </p>

      @if (formulario.controls.categoriaId.touched &&
           formulario.controls.categoriaId.invalid) {
        <small>Selecciona una categoría.</small>
      }

      <h2>Imágenes</h2>

      <div formArrayName="imagenes">
        @for (control of imagenes.controls; track control; let i = $index) {
          <p>
            <input
              [formControlName]="i"
              placeholder="URL de imagen">

            <button
              type="button"
              (click)="quitarImagen(i)"
              [disabled]="imagenes.length === 1">
              Quitar
            </button>

            @if (control.touched && control.hasError('required')) {
              <small>La URL de la imagen es obligatoria.</small>
            }

            @if (control.touched && control.hasError('pattern')) {
              <small>Ingresa una URL válida que comience con http:// o https://.</small>
            }
          </p>
        }
      </div>

      <button type="button" (click)="agregarImagen()">
        Agregar imagen
      </button>

      @if (error()) {
        <p role="alert">{{ error() }}</p>
      }

      <p>
        <button type="submit" [disabled]="guardando()">
          {{ guardando() ? 'Guardando...' : 'Guardar' }}
        </button>
      </p>

      <a routerLink="/productos">Volver al catálogo</a>
    </form>
  `
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
          'input.ng-invalid, textarea.ng-invalid, select.ng-invalid'
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
