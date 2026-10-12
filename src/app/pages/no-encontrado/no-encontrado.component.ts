import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-no-encontrado', standalone: true, imports: [RouterLink], template: '<h1>404 — Página no encontrada</h1><a routerLink="/productos">Volver al catálogo</a>' })
export class NoEncontradoComponent {}
