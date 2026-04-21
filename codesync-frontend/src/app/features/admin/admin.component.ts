import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  activeTab = 'users';
  user: any = null;
  users: any[] = [];
  projects: any[] = [];
  sessions: any[] = [];
  jobs: any[] = [];
  languages: any[] = [];
  notifications: any[] = [];
  loading = false;
  broadcastMsg = { title:'', message:'', actorId: 1,
    recipientIds:[], type:'COMMENT' };

  constructor(
    private http: HttpClient,
    private auth: AuthService) { }

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.http.get<any[]>(
      'http://localhost:5157/api/auth/search?query=')
      .subscribe({
        next: (res) => { this.users = res; this.loading = false; },
        error: () => { this.users = []; this.loading = false; }
      });
  }

  loadProjects() {
    this.http.get<any[]>(
      'http://localhost:5257/api/projects/public')
      .subscribe({
        next: (res) => this.projects = res,
        error: () => this.projects = []
      });
  }

  loadSessions() {
    this.http.get<any[]>(
      'http://localhost:5657/api/executions/stats')
      .subscribe({ error: () => {} });
  }

  loadJobs() {
    this.http.get<any[]>(
      'http://localhost:5657/api/executions/languages')
      .subscribe({
        next: (res) => this.languages = res,
        error: () => this.languages = []
      });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'users') this.loadUsers();
    if (tab === 'projects') this.loadProjects();
    if (tab === 'languages') this.loadJobs();
  }

  deactivateUser(userId: number) {
    if (!confirm('Deactivate this user?')) return;
    this.http.put(
      `http://localhost:5157/api/auth/deactivate?userId=${userId}`,{})
      .subscribe({ next: () => this.loadUsers() });
  }

  deleteProject(id: number) {
    if (!confirm('Delete this project?')) return;
    this.http.delete(
      `http://localhost:5257/api/projects/${id}`)
      .subscribe({ next: () => this.loadProjects() });
  }

  sendBroadcast() {
    this.http.post(
      'http://localhost:5857/api/notifications/bulk',
      this.broadcastMsg)
      .subscribe({
        next: () => {
          alert('Broadcast sent!');
          this.broadcastMsg = { title:'', message:'',
            actorId:1, recipientIds:[], type:'COMMENT' };
        }
      });
  }

  logout() { this.auth.logout(); }
}