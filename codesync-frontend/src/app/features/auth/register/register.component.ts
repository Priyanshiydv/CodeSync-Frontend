import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

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
    username: '',
    email: '',
    password: '',
    confirm: ''
  };
  error = '';
  success = '';
  loading = false;
  showPass = false;

  authApi = environment.authApi;

  constructor(
    private auth: AuthService,
    private router: Router) { }

  onRegister() {
    if (this.data.password !== this.data.confirm) {
        this.error = 'Passwords do not match!';
        return;
    }
    if (this.data.username.trim().length < 3) {
      this.error = 'Username must be at least 3 characters!';
      return;
    }
    this.loading = true;
    this.error = '';

    this.auth.register({
        fullName: this.data.fullName,
        username: this.data.username.trim(),
        email: this.data.email,
        password: this.data.password,
        role: 'Developer'   
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