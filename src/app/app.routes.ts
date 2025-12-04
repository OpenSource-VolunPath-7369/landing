import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/presentation/components/login-page/login-page.component')
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/presentation/components/register-page/register-page.component')
  },
  {
    path: 'comunidad',
    loadComponent: () => import('./projects/presentation/components/comunidad-page/comunidad-page.component')
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./publications/presentation/components/dashboard-page/dashboard-page.component')
  },
  {
    path: 'mensajes',
    loadComponent: () => import('./communication/presentation/components/mensajes-page/mensajes-page.component')
  },
  {
    path: 'mensajes/formulario',
    loadComponent: () => import('./communication/presentation/components/mensajes-page/mensajes-page.component')
  },
  {
    path: 'mensajes/formulario-voluntarios',
    loadComponent: () => import('./communication/presentation/components/mensajes-page/mensajes-page.component')
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./communication/presentation/components/notificaciones-page/notificaciones-page.component')
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil-page/perfil-page.component')
  },
  {
    path: 'soporte',
    loadComponent: () => import('./pages/soporte-page/soporte-page.component')
  },
  {
    path: 'nueva-publicacion',
    loadComponent: () => import('./publications/presentation/components/nueva-publicacion-page/nueva-publicacion-page.component')
  },
  {
    path: 'nueva-publicacion/:id',
    loadComponent: () => import('./publications/presentation/components/nueva-publicacion-page/nueva-publicacion-page.component')
  },
  {
    path: 'organizacion/:id',
    loadComponent: () => import('./organizations/presentation/components/organization-profile-page/organization-profile-page.component')
  },
  {
    path: '**',
    redirectTo: 'comunidad'
  }
];
