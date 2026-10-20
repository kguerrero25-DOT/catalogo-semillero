
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioSesion {
  nombre: string;
  rol: 'admin' | 'usuario';
}

interface RespuestaLogin {
  access_token: string;
  refresh_token: string;
}

interface PerfilUsuario {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface DatosToken {
  exp?: number;
  role?: string;
  email?: string;
  sub?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly claveToken = 'wposs_token';
  private readonly claveUsuario = 'wposs_usuario';

  readonly usuario = signal<UsuarioSesion | null>(
    this.obtenerUsuarioGuardado()
  );

  private decodificarToken(token: string): DatosToken | null {
    try {
      const partes = token.split('.');
      if (partes.length !== 3) return null;

      const base64 = partes[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const datos: unknown = JSON.parse(atob(base64));

      if (typeof datos !== 'object' || datos === null) {
        return null;
      }

      return datos as DatosToken;
    } catch {
      return null;
    }
  }

  obtenerToken(): string | null {
    try {
      const token = localStorage.getItem(this.claveToken);
      if (!token) return null;

      const datos = this.decodificarToken(token);

      if (!datos || typeof datos.exp !== 'number') {
        this.cerrarSesion();
        return null;
      }

      if (datos.exp * 1000 <= Date.now()) {
        this.cerrarSesion();
        return null;
      }

      return token;
    } catch {
      return null;
    }
  }

  private obtenerUsuarioGuardado(): UsuarioSesion | null {
    try {
      const token = this.obtenerToken();
      if (!token) return null;

      const guardado = localStorage.getItem(this.claveUsuario);
      if (!guardado) return null;

      const datos: unknown = JSON.parse(guardado);

      if (
        typeof datos !== 'object' ||
        datos === null ||
        !('nombre' in datos) ||
        !('rol' in datos) ||
        typeof datos.nombre !== 'string' ||
        (datos.rol !== 'admin' && datos.rol !== 'usuario')
      ) {
        return null;
      }

      return {
        nombre: datos.nombre,
        rol: datos.rol
      };
    } catch {
      return null;
    }
  }

  iniciarSesion(correo: string, clave: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(
      `${environment.apiUrl}/auth/login`,
      {
        email: correo,
        password: clave
      }
    ).pipe(
      tap(respuesta => {
        try {
          localStorage.setItem(
            this.claveToken,
            respuesta.access_token
          );
          localStorage.removeItem(this.claveUsuario);
          this.usuario.set(null);
        } catch {
          this.cerrarSesion();
          throw new Error('No se pudo guardar la sesión.');
        }
      }),
      switchMap(respuesta =>
        this.http.get<PerfilUsuario>(
          `${environment.apiUrl}/auth/profile`
        ).pipe(
          map(perfil => {
            const usuario: UsuarioSesion = {
              nombre: perfil.name || perfil.email,
              rol: perfil.role === 'admin' ? 'admin' : 'usuario'
            };

            try {
              localStorage.setItem(
                this.claveUsuario,
                JSON.stringify(usuario)
              );
            } catch {
              this.cerrarSesion();
              throw new Error('No se pudo guardar el perfil.');
            }

            this.usuario.set(usuario);
            return respuesta;
          })
        )
      ),
      catchError(error => {
        this.cerrarSesion();
        return throwError(() => error);
      })
    );
  }

  cerrarSesion(): void {
    try {
      localStorage.removeItem(this.claveToken);
      localStorage.removeItem(this.claveUsuario);
    } catch {
      // Si el almacenamiento falla, limpiamos igualmente el estado.
    }

    this.usuario.set(null);
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  tieneRol(rol: 'admin' | 'usuario'): boolean {
    return this.estaAutenticado() &&
      this.usuario()?.rol === rol;
  }
}
