import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Public — anyone can see
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },

  // Guest only — logged in users redirected away
  {
    path: 'auth/login',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },

  // Developer only
  {
    path: 'dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'DEVELOPER' },
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'projects',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'DEVELOPER' },
    loadComponent: () =>
      import('./features/projects/projects.component')
        .then(m => m.ProjectsComponent)
  },

  // Any logged in user
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/auth/profile/profile.component')
        .then(m => m.ProfileComponent)
  },

  // Admin only
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    loadComponent: () =>
      import('./features/admin/admin.component')
        .then(m => m.AdminComponent)
  },

  { path: '**', redirectTo: '/home' }
];