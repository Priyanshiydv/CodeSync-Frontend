import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Default → home page (guest can see)
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Public routes — no login needed
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component')
            .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component')
            .then(m => m.RegisterComponent)
      }
    ]
  },

  // Developer routes
  {
    path: 'dashboard',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'DEVELOPER' },
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    loadComponent: () =>
      import('./features/admin/admin.component')
        .then(m => m.AdminComponent)
  },

  // Profile — any logged in user
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/auth/profile/profile.component')
        .then(m => m.ProfileComponent)
  },

  { path: '**', redirectTo: '/home' }
];