import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: any = null;
  editData = { fullName:'', username:'', avatarUrl:'', bio:'' };
  passData = { currentPassword:'', newPassword:'' };
  searchQuery = '';
  searchResults: any[] = [];
  isEditing = false;
  isChangingPass = false;
  loading = false;
  success = '';
  error = '';

  constructor(private auth: AuthService) { }

  ngOnInit() { this.loadProfile(); }

  loadProfile() {
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.editData = {
          fullName: res.fullName || '',
          username: res.username || '',
          avatarUrl: res.avatarUrl || '',
          bio: res.bio || ''
        };
      }
    });
  }

  saveProfile() {
    this.loading = true;
    this.auth.updateProfile(this.editData).subscribe({
      next: () => {
        this.loading = false;
        this.isEditing = false;
        this.success = 'Profile updated!';
        this.loadProfile();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Update failed!';
      }
    });
  }

  changePassword() {
    this.loading = true;
    this.auth.changePassword(this.passData).subscribe({
      next: () => {
        this.loading = false;
        this.isChangingPass = false;
        this.success = 'Password changed!';
        this.passData = { currentPassword:'', newPassword:'' };
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed!';
      }
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) return;
    this.auth.searchUsers(this.searchQuery).subscribe({
      next: (res) => this.searchResults = res,
      error: () => this.searchResults = []
    });
  }

  logout() { this.auth.logout(); }
}