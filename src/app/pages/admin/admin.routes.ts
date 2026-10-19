
import { Routes } from '@angular/router';
import { pendienteGuard } from '../../guards/pendiente.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-page.component')
        .then(m => m.AdminPageComponent),
    title: 'Administración'
  },
  {
    path: 'productos/nuevo',
    loadComponent: () =>
      import('../producto-form-page/producto-form-page.component')
        .then(m => m.ProductoFormPageComponent),
    canDeactivate: [pendienteGuard],
    title: 'Nuevo producto'
  },
  {
    path: 'productos/:id/editar',
    loadComponent: () =>
      import('../producto-form-page/producto-form-page.component')
        .then(m => m.ProductoFormPageComponent),
    canDeactivate: [pendienteGuard],
    title: 'Editar producto'
  }
];
