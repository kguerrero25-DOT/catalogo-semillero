import { Injectable, signal } from '@angular/core';
export interface UsuarioSesion { nombre: string; rol: 'admin' | 'usuario'; }
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly clave = 'sesion_semillero';
  private leer(): UsuarioSesion | null {
    try {
      const valor = localStorage.getItem(this.clave);
      if (!valor) return null;
      const usuario: unknown = JSON.parse(valor);
      if (typeof usuario !== 'object' || usuario === null || !('nombre' in usuario) || !('rol' in usuario)) return null;
      const dato = usuario as UsuarioSesion;
      return typeof dato.nombre === 'string' && (dato.rol === 'admin' || dato.rol === 'usuario') ? dato : null;
    } catch { return null; }
  }
  readonly usuario = signal<UsuarioSesion | null>(this.leer());
  iniciarSesion(nombre: string, clave: string): boolean {
    if (!nombre.trim() || clave !== 'wposs123') return false;
    const usuario: UsuarioSesion = { nombre: nombre.trim(), rol: nombre.trim().toLowerCase() === 'admin' ? 'admin' : 'usuario' };
    localStorage.setItem(this.clave, JSON.stringify(usuario));
    this.usuario.set(usuario);
    return true;
  }
  cerrarSesion(): void { localStorage.removeItem(this.clave); this.usuario.set(null); }
  estaAutenticado(): boolean { return this.usuario() !== null; }
  tieneRol(rol: 'admin' | 'usuario'): boolean { return this.usuario()?.rol === rol; }
}
