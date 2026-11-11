
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type RolUsuario = 'ADMIN' | 'EDITOR' | 'USER';

export interface UsuarioSesion {
  id: number;
  usuario: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
}

interface RespuestaLogin {
  token: string;
  tipo: string;
  usuario: string;
  rol: RolUsuario;
}

interface PerfilUsuario {
  id: number;
  usuario: string;
  correo: string;
  rol: RolUsuario;
  activo: boolean;
}

interface DatosToken {
  exp?: number;
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

      if (
        datos &&
        typeof datos.exp === 'number' &&
        datos.exp * 1000 <= Date.now()
      ) {
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
        !('id' in datos) ||
        !('usuario' in datos) ||
        !('correo' in datos) ||
        !('rol' in datos) ||
        !('activo' in datos) ||
        typeof datos.id !== 'number' ||
        typeof datos.usuario !== 'string' ||
        typeof datos.correo !== 'string' ||
        (datos.rol !== 'ADMIN' &&
          datos.rol !== 'EDITOR' &&
          datos.rol !== 'USER') ||
        typeof datos.activo !== 'boolean'
      ) {
        return null;
      }

      return {
        id: datos.id,
        usuario: datos.usuario,
        correo: datos.correo,
        rol: datos.rol,
        activo: datos.activo
      };
    } catch {
      return null;
    }
  }

  iniciarSesion(usuario: string, contrasena: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(
      `${environment.apiUrl}/auth/login`,
      {
        usuario,
        contrasena
      }
    ).pipe(
      tap(respuesta => {
        try {
          localStorage.setItem(
            this.claveToken,
            respuesta.token
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
          `${environment.apiUrl}/auth/yo`
        ).pipe(
          map(perfil => {
            const usuario: UsuarioSesion = {
              id: perfil.id,
              usuario: perfil.usuario,
              correo: perfil.correo,
              rol: perfil.rol,
              activo: perfil.activo
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

  registrar(
    usuario: string,
    contrasena: string,
    correo: string
  ): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(
      `${environment.apiUrl}/auth/registro`,
      {
        usuario,
        contrasena,
        correo
      }
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

  tieneRol(rol: RolUsuario): boolean {
    return this.estaAutenticado() &&
      this.usuario()?.rol === rol;
  }
}
