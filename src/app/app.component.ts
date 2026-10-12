import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EncabezadoComponent } from './components/encabezado/encabezado.component';
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet, EncabezadoComponent], templateUrl: './app.component.html', styleUrl: './app.component.css' })
export class AppComponent {}
