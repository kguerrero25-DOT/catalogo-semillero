
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Producto } from '../../models/producto';

@Component({
  selector: 'app-tabla-productos',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './tabla-productos.component.html',
  styleUrl: './tabla-productos.component.css'
})
export class TablaProductosComponent implements AfterViewInit {

  columnas: string[] = [
    'id',
    'imagen',
    'titulo',
    'categoria',
    'precio',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Producto>([]);

  @Input({ required: true })
  set productos(valor: Producto[]) {
    this.dataSource.data = valor ?? [];
  }

  @Output() editar = new EventEmitter<Producto>();
  @Output() eliminar = new EventEmitter<Producto>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}
