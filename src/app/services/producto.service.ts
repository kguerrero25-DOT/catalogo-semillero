import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import {
  ProductoDetalle,
  ProductoListado,
  ProductoEscritura
} from '../models/producto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private http = inject(HttpClient);

  private apiUrl =
    `${environment.apiUrl}/productos`;

  obtenerTodos(): Observable<ProductoListado[]> {

    return this.http
      .get<ProductoListado[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error(
            'Error al cargar productos',
            error
          );

          return of([]);
        })
      );
  }

  obtenerPorId(id: number): Observable<ProductoDetalle> {

    return this.http.get<ProductoDetalle>(
      `${this.apiUrl}/${id}`
    );
  }

  obtenerPorCategoria(
    categoria: string
  ): Observable<ProductoListado[]> {

    return this.http.get<ProductoListado[]>(
      this.apiUrl,
      { params: { categoria } }
    );
  }

  crear(producto: ProductoEscritura): Observable<ProductoDetalle> {

    return this.http.post<ProductoDetalle>(
      this.apiUrl,
      producto
    );
  }

  actualizar(
    id: number,
    cambios: ProductoEscritura
  ): Observable<ProductoDetalle> {

    return this.http.put<ProductoDetalle>(
      `${this.apiUrl}/${id}`,
      cambios
    );
  }

  eliminar(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
