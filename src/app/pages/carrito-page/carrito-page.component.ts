
import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="contenedor">
      <h1>Carrito de compras</h1>

      <p>Productos en el carrito: {{ carrito.cantidad() }}</p>

      @if (!carrito.cantidad()) {
        <mat-card>
          <mat-card-content>
            <p>Tu carrito está vacío.</p>
            <a mat-flat-button color="primary" routerLink="/productos">
              Ver productos
            </a>
          </mat-card-content>
        </mat-card>
      }

      @for (producto of carrito.productos(); track $index) {
        <mat-card class="producto">
          <mat-card-content class="contenido-producto">
            <div>
              <a [routerLink]="['/productos', producto.id]">
                {{ producto.title }}
              </a>

              <p class="precio">
                {{ producto.price | currency:'COP' }}
              </p>
            </div>

            <button
              mat-stroked-button
              type="button"
              (click)="carrito.quitar(producto.id)">
              <mat-icon>delete</mat-icon>
              Quitar
            </button>
          </mat-card-content>
        </mat-card>
      }

      @if (carrito.cantidad()) {
        <mat-card class="resumen">
          <mat-card-content>
            <h2>Total: {{ carrito.total() | currency:'COP' }}</h2>

            <button
              mat-flat-button
              color="warn"
              type="button"
              (click)="carrito.vaciar()">
              <mat-icon>delete_sweep</mat-icon>
              Vaciar carrito
            </button>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .contenedor {
      max-width: 850px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    h1 {
      margin-bottom: 20px;
    }

    .producto {
      margin-bottom: 12px;
    }

    .contenido-producto {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .contenido-producto a {
      font-size: 17px;
      font-weight: 500;
    }

    .precio {
      margin: 8px 0 0;
    }

    .resumen {
      margin-top: 24px;
    }

    .resumen h2 {
      margin-bottom: 16px;
    }

    @media (max-width: 375px) {
      .contenido-producto {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class CarritoPageComponent {
  readonly carrito = inject(CarritoService);
}
