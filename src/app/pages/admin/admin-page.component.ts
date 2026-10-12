import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { PuedeSalir } from '../../guards/pendiente.guard';
@Component({ selector: 'app-admin-page', standalone: true, imports: [FormsModule], template: `
<h1>Administración</h1><p>Formulario de edición de productos</p>
<form (ngSubmit)="guardar()"><p><label>ID del producto <input type="number" name="id" [(ngModel)]="id" required></label></p>
<p><label>Título <input name="titulo" [(ngModel)]="titulo" (ngModelChange)="cambios.set(true)" required></label></p>
<p><label>Precio <input name="precio" type="number" [(ngModel)]="precio" (ngModelChange)="cambios.set(true)" required></label></p>
<button type="submit">Guardar cambios</button></form>
@if (mensaje()) { <p role="status">{{ mensaje() }}</p> }` })
export class AdminPageComponent implements PuedeSalir {
  private productos = inject(ProductoService);
  id = 1; titulo = ''; precio = 1; readonly cambios = signal(false); readonly mensaje = signal('');
  guardar(): void {
    if (!this.id || !this.titulo.trim() || this.precio <= 0) { this.mensaje.set('Completa los campos correctamente.'); return; }
    this.productos.actualizar(this.id, { title: this.titulo.trim(), price: this.precio }).subscribe({
      next: () => { this.cambios.set(false); this.mensaje.set('Producto actualizado.'); },
      error: () => this.mensaje.set('No se pudieron guardar los cambios.')
    });
  }
  puedeSalir(): boolean { return !this.cambios() || window.confirm('Tienes cambios sin guardar. ¿Deseas salir?'); }
}
