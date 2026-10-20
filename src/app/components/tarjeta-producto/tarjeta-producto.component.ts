
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Producto } from '../../models/producto';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tarjeta-producto',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './tarjeta-producto.component.html',
  styleUrl: './tarjeta-producto.component.css'
})
export class TarjetaProductoComponent {
  @Input({ required: true }) producto!: Producto;

  @Output() agregarAlCarrito = new EventEmitter<Producto>();
}
