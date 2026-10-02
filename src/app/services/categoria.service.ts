import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Categoria } from '../models/categoria';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private http = inject(HttpClient);

  private apiUrl =
    `${environment.apiUrl}/categories`;

  obtenerTodas(): Observable<Categoria[]> {

    return this.http.get<Categoria[]>(
      this.apiUrl
    );
  }
}
