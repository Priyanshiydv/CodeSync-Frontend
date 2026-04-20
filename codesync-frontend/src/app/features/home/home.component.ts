import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  publicProjects: any[] = [];
  filteredProjects: any[] = [];
  searchQuery = '';
  selectedLanguage = '';
  isLoading = true;
  isLoggedIn = false;
  userRole = '';

  languages = ['Python', 'JavaScript', 'Java', 'CSharp',
    'C', 'C++', 'Go', 'Rust', 'TypeScript', 'PHP', 'Ruby'];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userRole = this.authService.getRole();
    this.loadPublicProjects();
  }

  loadPublicProjects() {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:5257/api/projects/public')
      .subscribe({
        next: (res) => {
          this.publicProjects = res;
          this.filteredProjects = res;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          // Show demo projects if backend not running
          this.publicProjects = this.getDemoProjects();
          this.filteredProjects = this.publicProjects;
        }
      });
  }

  searchProjects() {
    this.filteredProjects = this.publicProjects.filter(p =>
      p.name.toLowerCase()
        .includes(this.searchQuery.toLowerCase()) &&
      (this.selectedLanguage === '' ||
        p.language === this.selectedLanguage)
    );
  }

  filterByLanguage() {
    this.searchProjects();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedLanguage = '';
    this.filteredProjects = this.publicProjects;
  }

  goToDashboard() {
    this.authService.redirectByRole();
  }

  getDemoProjects() {
    return [
      { projectId: 1, name: 'Snake Game', language: 'Python',
        description: 'Classic snake game', starCount: 24, forkCount: 5 },
      { projectId: 2, name: 'Todo App', language: 'JavaScript',
        description: 'Simple todo application', starCount: 18, forkCount: 3 },
      { projectId: 3, name: 'Calculator', language: 'Java',
        description: 'Basic calculator app', starCount: 12, forkCount: 2 },
      { projectId: 4, name: 'Weather App', language: 'TypeScript',
        description: 'Real-time weather', starCount: 31, forkCount: 8 },
      { projectId: 5, name: 'Chat App', language: 'CSharp',
        description: 'Real-time chat', starCount: 45, forkCount: 12 },
      { projectId: 6, name: 'Blog Platform', language: 'Go',
        description: 'Simple blog system', starCount: 9, forkCount: 1 },
    ];
  }
}