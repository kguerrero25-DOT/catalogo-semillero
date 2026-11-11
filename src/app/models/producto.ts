

export interface ProductoListado {
  id: number;
  titulo: string;
  precio: number;
}

export interface ProductoDetalle {
  id: number;
  titulo: string;
  precio: number;
  existencias: number;
  categoria: string;
}

export interface ProductoEscritura {
  titulo: string;
  precio: number;
  existencias: number;
  categoriaId: number;
}

export interface ProductoCarrito {
  id: number;
  titulo: string;
  precio: number;
}
