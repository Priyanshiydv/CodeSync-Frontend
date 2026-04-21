import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  data = { email: '', password: '' };
  error = '';
  loading = false;
  showPass = false;

  constructor(private auth: AuthService) { }

  onLogin() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.data).subscribe({
      next: () => {
        this.loading = false;
        this.auth.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed!';
      }
    });
  }
}