import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router) { }

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) return true;
    // Already logged in — redirect to correct page
    this.auth.redirectByRole();
    return false;
  }
}