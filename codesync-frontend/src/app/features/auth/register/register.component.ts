import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  data = {
    fullName: '',
    email: '',
    password: '',
    confirm: ''
  };
  error = '';
  success = '';
  loading = false;
  showPass = false;

  constructor(
    private auth: AuthService,
    private router: Router) { }

  onRegister() {
    if (this.data.password !== this.data.confirm) {
        this.error = 'Passwords do not match!';
        return;
    }
    this.loading = true;
    this.error = '';

    // Generate username from email automatically
    const username = this.data.email.split('@')[0];

    this.auth.register({
        fullName: this.data.fullName,
        username: username,
        email: this.data.email,
        password: this.data.password,
        role: 'Developer'   // ← capital D, lowercase rest
    }).subscribe({
        next: () => {
        this.loading = false;
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
        },
        error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed!';
        }
    });
    }
}