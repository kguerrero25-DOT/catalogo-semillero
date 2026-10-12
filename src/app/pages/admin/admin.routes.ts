import { Routes } from '@angular/router';
import { pendienteGuard } from '../../guards/pendiente.guard';
export const ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./admin-page.component').then(m => m.AdminPageComponent), canDeactivate: [pendienteGuard], title: 'Administración' }
];
