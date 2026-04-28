import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { IndianDatePipe } from '../../shared/pipes/date.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThemeToggleComponent, IndianDatePipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  admin: any = null;
  activeTab = 'dashboard';
  
  // Stats
  stats: any = {
    totalUsers: 0,
    totalProjects: 0,
    activeSessions: 0,
    executionsToday: 0
  };
  
  // Data
  users: any[] = [];
  projects: any[] = [];
  activeSessions: any[] = [];
  executions: any[] = [];
  languages: any[] = [];
  languageStats: any[] = [];
  
  // UI State
  loading = false;
  showAddLanguageModal = false;
  showBroadcastModal = false;
  searchTerm = '';
  
  // Forms
  newLanguage = { name: '', dockerImage: '', version: '', fileExtension: '' };
  broadcast = { title: '', message: '', targetRole: 'ALL' };

  // ADD — Audit logs
  auditLogs: any[] = [];
  auditLoading = false;
  auditPage = 1;

  constructor(
    private auth: AuthService,
    private adminService: AdminService,
    private router:Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (res: any) => {
        this.admin = res;
        if (res.role !== 'ADMIN') {
          // Use Angular Router instead of window.location
          this.router.navigate(['/dashboard']);
          return;
        }
        // Only load stats if admin
        this.loadStats();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
  loadStats() {
    // Get project stats from ProjectService
    this.adminService.getPlatformStats().subscribe({
      next: (projectStats: any) => {
        this.stats.totalProjects = projectStats.totalProjects || 0;
      }
    });

    // Get user stats from AuthService
    this.http.get<any>('http://localhost:5157/api/admin/stats').subscribe({
      next: (userStats: any) => {
        this.stats.totalUsers = userStats.totalUsers || 0;
      },
      error: () => this.stats.totalUsers = 0
    });

    // Get session stats from CollabService
    this.http.get<any[]>('http://localhost:5957/api/admin/sessions/active').subscribe({
      next: (sessions: any[]) => {
        this.stats.activeSessions = sessions.length || 0;
      },
      error: () => this.stats.activeSessions = 0
    });

    // Get today's executions from ExecutionService
    this.http.get<any[]>('http://localhost:5657/api/admin/executions').subscribe({
      next: (executions: any[]) => {
        const today = new Date().toDateString();
        this.stats.executionsToday = executions.filter((e: any) => 
          new Date(e.createdAt).toDateString() === today
        ).length;
      },
      error: () => this.stats.executionsToday = 0
    });
  }

 

  loadUsers() {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (res: any[]) => {
        this.users = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadProjects() {
    this.loading = true;
    this.adminService.getAllProjects().subscribe({
      next: (res: any[]) => {
        this.projects = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadActiveSessions() {
    this.adminService.getActiveSessions().subscribe({
      next: (res: any[]) => this.activeSessions = res,
      error: () => this.activeSessions = []
    });
  }

  loadExecutions() {
    this.adminService.getAllExecutions().subscribe({
      next: (res: any[]) => this.executions = res,
      error: () => this.executions = []
    });
  }

  loadLanguages() {
    this.adminService.getSupportedLanguages().subscribe({
      next: (res: any[]) => this.languages = res,
      error: () => this.languages = []
    });
  }


  loadLanguageStats() {
    this.adminService.getExecutionsByLanguage().subscribe({
      next: (res: any) => this.languageStats = res,
      error: () => this.languageStats = []
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'users') this.loadUsers();
    if (tab === 'projects') this.loadProjects();
    if (tab === 'sessions') this.loadActiveSessions();
    if (tab === 'executions') this.loadExecutions();
    if (tab === 'languages') this.loadLanguages();
    if (tab === 'analytics') this.loadLanguageStats();
    if (tab === 'dashboard') this.loadStats();
    if (tab === 'audit') this.loadAuditLogs();
  }

  suspendUser(id: number) {
    if (!confirm('Suspend this user?')) return;
    this.adminService.suspendUser(id).subscribe({
      next: () => this.loadUsers()
    });
  }

  reactivateUser(id: number) {
    this.adminService.reactivateUser(id).subscribe({
      next: () => this.loadUsers()
    });
  }

  deleteUser(id: number) {
    if (!confirm('PERMANENTLY delete this user?')) return;
    this.adminService.deleteUser(id).subscribe({
      next: () => this.loadUsers()
    });
  }

  changeRole(id: number, role: string) {
    this.adminService.changeUserRole(id, role).subscribe({
      next: () => this.loadUsers()
    });
  }

  deleteProject(id: number) {
    if (!confirm('Delete this project?')) return;
    this.adminService.deleteProject(id).subscribe({
      next: () => this.loadProjects()
    });
  }

  endSession(sessionId: string) {
    this.adminService.endSession(sessionId).subscribe({
      next: () => this.loadActiveSessions()
    });
  }

  cancelJob(jobId: string) {
    this.adminService.cancelExecution(jobId).subscribe({
      next: () => this.loadExecutions()
    });
  }

  addLanguage() {
    this.adminService.addLanguage(this.newLanguage).subscribe({
      next: () => {
        this.showAddLanguageModal = false;
        this.newLanguage = { name: '', dockerImage: '', version: '', fileExtension: '' };
        this.loadLanguages();
      }
    });
  }

  deleteLanguage(id: number) {
    if (!confirm('Remove this language?')) return;
    this.adminService.deleteLanguage(id).subscribe({
      next: () => this.loadLanguages()
    });
  }

  sendBroadcast() {
    if (!this.broadcast.title || !this.broadcast.message) {
      alert('Title and message are required!');
      return;
    }
    
    this.adminService.sendBroadcast({
      title: this.broadcast.title,
      message: this.broadcast.message,
      targetRole: this.broadcast.targetRole
    }).subscribe({
      next: () => {
        this.showBroadcastModal = false;
        this.broadcast = { title: '', message: '', targetRole: 'ALL' };
        alert('Broadcast sent successfully!');
      },
      error: (err) => {
        alert('Failed to send broadcast: ' + err.message);
      }
    });
  }
    
  get filteredUsers() {
    if (!this.searchTerm) return this.users;
    return this.users.filter(u => 
      u.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get filteredProjects() {
    if (!this.searchTerm) return this.projects;
    return this.projects.filter(p => 
      p.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  getMaxExecutions(): number {
    if (!this.languageStats || this.languageStats.length === 0) return 1;
    return Math.max(...this.languageStats.map(ls => ls.count || 0), 1);
  }

  goToDashboard() {
    this.activeTab = 'dashboard';
    this.loadStats();
  }

  // ADD — load audit logs
  loadAuditLogs(): void {
    this.auditLoading = true;
    this.adminService.getAuditLogs(this.auditPage).subscribe({
      next: (logs: any[]) => {
        this.auditLogs = logs;
        this.auditLoading = false;
      },
      error: () => this.auditLoading = false
    });
  }

  // ADD — format action badge color
  getActionColor(action: string): string {
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('SUSPEND')) return 'warning';
    if (action.includes('REACTIVATE')) return 'success';
    if (action.includes('ROLE')) return 'info';
    return 'default';
  }

  formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

  logout() { this.auth.logout(); }
}