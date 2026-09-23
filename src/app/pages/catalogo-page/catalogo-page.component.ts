import {Component, computed, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TarjetaProductoComponent} from "../../components/tarjeta-producto/tarjeta-producto.component";
import {TablaProductosComponent} from "../../components/tabla-productos/tabla-productos.component";
import {Producto} from "../../models/producto";

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [ CommonModule, TarjetaProductoComponent, TablaProductosComponent],
  templateUrl: './catalogo-page.component.html',
  styleUrl: './catalogo-page.component.css'
})
export class CatalogoPageComponent {
  productos = signal<Producto[]>([
    {
      id: 1,
      title: 'Teclado mecánico',
      price: 180000,
      description: 'Teclado mecánico para computador',
      images: ['assets/productos/teclado.jpg'],
      stock: 10,
      category: { id: 1, name: 'Tecnología' }
    },
    {
      id: 2,
      title: 'Mouse inalámbrico',
      price: 85000,
      description: 'Mouse inalámbrico',
      images: ['assets/productos/mouse.jpg'],
      stock: 0,
      category: { id: 1, name: 'Tecnología' }
    },
    {
      id: 3,
      title: 'Monitor',
      price: 650000,
      description: 'Monitor para computador',
      images: ['assets/productos/monitor.jpg'],
      stock: 5,
      category: { id: 1, name: 'Tecnología' }
    },
    {
      id: 4,
      title: 'Silla',
      price: 320000,
      description: 'Silla para escritorio',
      images: ['assets/productos/silla.jpg'],
      stock: 4,
      category: { id: 2, name: 'Hogar' }
    },
    {
      id: 5,
      title: 'Escritorio',
      price: 420000,
      description: 'Escritorio sencillo',
      images: ['assets/productos/escritorio.jpg'],
      stock: 2,
      category: { id: 2, name: 'Hogar' }
    },
    {
      id: 6,
      title: 'Lámpara',
      price: 90000,
      description: 'Lámpara de escritorio',
      images: ['assets/productos/lampara.jpg'],
      stock: 8,
      category: { id: 2, name: 'Hogar' }
    }
  ]);

  rol = signal<'admin' | 'customer'>('customer');

  carrito = signal<Producto[]>([]);

  categoriaSeleccionada = signal<string>('Todas');

  productosFiltrados = computed(() => {
    const categoria = this.categoriaSeleccionada();

    if (categoria === 'Todas') {
      return this.productos();
    }

    return this.productos().filter(
      producto => producto.category.name === categoria
    );
  });

  cantidadItems = computed(() => {
    return this.carrito().length;
  });

  totalCarrito = computed(() => {
    return this.carrito().reduce(
      (total, producto) => total + producto.price,
      0
    );
  });

  alternarRol() {
    this.rol.update(rol =>
      rol === 'admin' ? 'customer' : 'admin'
    );
  }

  agregarAlCarrito(producto: Producto) {
    this.carrito.update(carrito => [
      ...carrito,
      producto
    ]);
  }

  cambiarCategoria(categoria: string) {
    this.categoriaSeleccionada.set(categoria);
  }

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }
}
