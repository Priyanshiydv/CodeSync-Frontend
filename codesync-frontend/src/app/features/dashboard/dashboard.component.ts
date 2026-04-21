import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user: any = null;
  myProjects: any[] = [];
  publicProjects: any[] = [];
  loading = true;
  showCreateModal = false;
  activeTab = 'my';
  errorMessage = '';

  newProject = {
    name: '', description: '',
    language: 'Python', visibility: 'PUBLIC'
  };

  languages = ['Python','JavaScript','TypeScript','Java',
    'CSharp','C','C++','Go','Rust','PHP','Ruby'];

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router) { }

  ngOnInit() {
    // Load profile from API to get actual name
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.loadMyProjects();
        this.loadPublicProjects();
      },
      error: () => {
        // Fallback to stored user
        this.user = this.auth.getCurrentUser();
        this.loadMyProjects();
        this.loadPublicProjects();
      }
    });
  }

  loadMyProjects() {
    this.loading = true;
    this.http.get<any[]>(
      `http://localhost:5257/api/projects/member`)
      .subscribe({
        next: (res) => {
          this.myProjects = res;
          this.loading = false;
        },
        error: () => {
          this.myProjects = [];
          this.loading = false;
        }
      });
  }

  loadPublicProjects() {
    this.http.get<any[]>(
      'http://localhost:5257/api/projects/public')
      .subscribe({
        next: (res) => this.publicProjects = res,
        error: () => this.publicProjects = []
      });
  }

  get totalStars(): number {
    return this.myProjects.reduce(
      (acc, p) => acc + (p.starCount || 0), 0);
  }

  createProject() {
    if (!this.newProject.name.trim()) {
      this.errorMessage = 'Project name is required!';
      return;
    }
    this.errorMessage = '';
    this.http.post('http://localhost:5257/api/projects',
      this.newProject).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.newProject = { name:'', description:'',
          language:'Python', visibility:'PUBLIC' };
        this.loadMyProjects();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create project!';
      }
    });
  }

  starProject(id: number) {
    this.http.put(
      `http://localhost:5257/api/projects/${id}/star`, {})
      .subscribe({ next: () => this.loadPublicProjects() });
  }

  forkProject(id: number) {
    this.http.post(
      `http://localhost:5257/api/projects/${id}/fork`, {})
      .subscribe({
        next: () => {
          this.loadMyProjects();
          this.loadPublicProjects();
        }
      });
  }

  deleteProject(id: number) {
    if (!confirm('Delete this project?')) return;
    this.http.delete(
      `http://localhost:5257/api/projects/${id}`)
      .subscribe({ next: () => this.loadMyProjects() });
  }

  logout() { this.auth.logout(); }
}