import {
  Injectable,
  signal,
  computed
} from '@angular/core';

import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private readonly CLAVE =
    'carrito_wposs';

  private items =
    signal<Producto[]>([]);

  readonly productos =
    this.items.asReadonly();

  readonly cantidad =
    computed(() => this.items().length);

  readonly total =
    computed(() =>
      this.items().reduce(
        (suma, producto) =>
          suma + producto.price,
        0
      )
    );

  constructor() {

    const guardado =
      localStorage.getItem(this.CLAVE);

    if (guardado) {

      try {

        const productos: Producto[] =
          JSON.parse(guardado);

        this.items.set(productos);

      } catch (error) {

        console.error(
          'No se pudo restaurar el carrito',
          error
        );

        this.items.set([]);
      }
    }
  }

  agregar(producto: Producto): void {

    this.items.update(lista => [
      ...lista,
      producto
    ]);

    this.persistir();
  }

  quitar(id: number): void {

    this.items.update(lista =>
      lista.filter(
        producto => producto.id !== id
      )
    );

    this.persistir();
  }

  vaciar(): void {

    this.items.set([]);

    this.persistir();
  }

  private persistir(): void {

    localStorage.setItem(
      this.CLAVE,
      JSON.stringify(this.items())
    );
  }
}
