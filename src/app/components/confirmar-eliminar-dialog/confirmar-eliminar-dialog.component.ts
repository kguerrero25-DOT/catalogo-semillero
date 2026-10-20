
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmar-eliminar-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Eliminar producto</h2>

    <mat-dialog-content>
      ¿Seguro que deseas eliminar "{{ data.nombre }}"?
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        Cancelar
      </button>

      <button
        mat-flat-button
        color="warn"
        [mat-dialog-close]="true">
        Eliminar
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmarEliminarDialogComponent {
  readonly data = inject<{ nombre: string }>(MAT_DIALOG_DATA);
}
