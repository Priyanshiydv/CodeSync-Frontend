import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DEVELOPER'
  };

  roles: any[] = [];
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.authService.getRoles().subscribe({
      next: (res) => this.roles = res,
      error: () => {
        this.roles = [
          { role: 'DEVELOPER', description: 'Registered developer' },
          { role: 'ADMIN', description: 'Platform administrator' }
        ];
      }
    });
  }

  onRegister() {
    if (this.registerData.password
      !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      fullName: this.registerData.fullName,
      email: this.registerData.email,
      password: this.registerData.password,
      role: this.registerData.role
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Registration successful!';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed!';
      }
    });
  }
}