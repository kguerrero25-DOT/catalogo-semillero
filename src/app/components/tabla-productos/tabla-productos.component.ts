import { Component, Input, Output, EventEmitter } from '@angular/core';
import {CommonModule} from "@angular/common";
import {Producto} from "../../models/producto";

@Component({
  selector: 'app-tabla-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-productos.component.html',
  styleUrl: './tabla-productos.component.css'
})
export class TablaProductosComponent {
  @Input ({ required: true }) productos!: Producto[];
  @Output() editar =new EventEmitter<Producto>();
  @Output() eliminar =new EventEmitter<Producto>();

  trackById(index: number, producto: Producto): number {
    return producto.id;
  }
}

