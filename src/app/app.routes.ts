
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { pendienteGuard } from './guards/pendiente.guard';
import { NoEncontradoComponent } from './pages/no-encontrado/no-encontrado.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { CatalogoPageComponent } from './pages/catalogo-page/catalogo-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'productos'
  },
  {
    path: 'productos',
    component: CatalogoPageComponent,
    title: 'Catálogo'
  },
  {
    path: 'productos/:id',
    loadComponent: () =>
      import('./pages/detalle-producto/detalle-producto.component')
        .then(m => m.DetalleProductoComponent),
    title: 'Detalle del producto'
  },
  {
    path: 'carrito',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/carrito-page/carrito-page.component')
        .then(m => m.CarritoPageComponent),
    title: 'Carrito'
  },
  {
    path: 'login',
    component: LoginPageComponent,
    title: 'Iniciar sesión'
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro-page/registro-page.component')
        .then(m => m.RegistroPageComponent),
    title: 'Registro de usuario'
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadChildren: () =>
      import('./pages/admin/admin.routes')
        .then(m => m.ADMIN_ROUTES),
    title: 'Administración'
  },
  {
    path: '**',
    component: NoEncontradoComponent,
    title: 'Página no encontrada'
  }
];
