import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: any = null;
  isEditing = false;
  isChangingPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  profileData = {
    fullName: '',
    username: '',
    avatarUrl: '',
    bio: ''
  };

  passwordData = {
    currentPassword: '',
    newPassword: ''
  };

  searchQuery = '';
  searchResults: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.profileData = {
          fullName: res.fullName || '',
          username: res.username || '',
          avatarUrl: res.avatarUrl || '',
          bio: res.bio || ''
        };
      },
      error: () => this.router.navigate(['/auth/login'])
    });
  }

  updateProfile() {
    this.isLoading = true;
    this.authService.updateProfile(this.profileData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully!';
        this.loadProfile();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Update failed!';
      }
    });
  }

  changePassword() {
    this.isLoading = true;
    this.authService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isChangingPassword = false;
        this.successMessage = 'Password changed successfully!';
        this.passwordData = { currentPassword: '', newPassword: '' };
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Password change failed!';
      }
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) return;
    this.authService.searchUsers(this.searchQuery).subscribe({
      next: (res) => this.searchResults = res,
      error: () => this.searchResults = []
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        localStorage.clear();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}