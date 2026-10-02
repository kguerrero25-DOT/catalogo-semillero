import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { Producto } from '../models/producto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private http = inject(HttpClient);

  private apiUrl =
    `${environment.apiUrl}/products`;

  obtenerTodos(): Observable<Producto[]> {

    return this.http
      .get<Producto[]>(this.apiUrl)
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

  obtenerPorId(id: number): Observable<Producto> {

    return this.http.get<Producto>(
      `${this.apiUrl}/${id}`
    );
  }

  obtenerPorCategoria(
    categoryId: number
  ): Observable<Producto[]> {

    return this.http.get<Producto[]>(
      `${this.apiUrl}/?categoryId=${categoryId}`
    );
  }

  crear(
    producto: Partial<Producto>
  ): Observable<Producto> {

    return this.http.post<Producto>(
      this.apiUrl,
      producto
    );
  }

  actualizar(
    id: number,
    cambios: Partial<Producto>
  ): Observable<Producto> {

    return this.http.put<Producto>(
      `${this.apiUrl}/${id}`,
      cambios
    );
  }

  eliminar(id: number): Observable<boolean> {

    return this.http.delete<boolean>(
      `${this.apiUrl}/${id}`
    );
  }
}
