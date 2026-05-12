import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  projects: any[] = [];
  filtered: any[] = [];
  search = '';
  lang = '';
  loading = true;
  isLoggedIn = false;

  languages = [
    'Python','Java','CSharp',
    'C','C++',
  ];

  featureList = [
    { icon:'⚙️', title:'Monaco Editor',
      desc:'VS Code engine with syntax highlighting and auto-complete' },
    { icon:'👥', title:'Live Collaboration',
      desc:'Real-time co-editing with cursor presence via SignalR' },
    { icon:'▶️', title:'Code Execution',
      desc:'Run code in isolated Docker sandboxes — 14 languages' },
    { icon:'📄', title:'Version Control',
      desc:'Git-inspired snapshots with SHA-256 integrity and diff' },
    { icon:'💬', title:'Code Review',
      desc:'Inline comments with threading and @mentions' },
    { icon:'🔔', title:'Notifications',
      desc:'Real-time alerts for sessions and snapshots via SignalR' },
  ];

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private route: ActivatedRoute ) { }

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadProjects();

    // ADD — handle scroll on fragment
      this.route.fragment.subscribe(fragment => {
        if (fragment) {
          setTimeout(() => {
            const el = document.getElementById(fragment);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      });
    }

    // ADD — scroll to projects section
    scrollToProjects(): void {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

  loadProjects() {
    this.projectService.getPublicProjects().subscribe({
      next: (res) => {
        this.projects = res;
        this.filtered = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.projects = this.demos();
        this.filtered = this.projects;
      }
    });
  }

  filter() {
    this.filtered = this.projects.filter(p =>
      p.name.toLowerCase()
        .includes(this.search.toLowerCase()) &&
      (this.lang === '' || p.language === this.lang));
  }

  clear() {
    this.search = '';
    this.lang = '';
    this.filtered = this.projects;
  }

  goToDashboard() { this.auth.redirectByRole(); }

  logout() { this.auth.logout(); }

  starProject(id: number) {
    this.projectService.starProject(id).subscribe({
      next: () => this.loadProjects()
    });
  }

  forkProject(id: number) {
    this.projectService.forkProject(id).subscribe({
      next: () => alert('Project forked to your dashboard!')
    });
  }

  demos() {
    return [
      { projectId:1, name:'Snake Game',
        language:'Python',
        description:'Classic snake game in Python',
        starCount:24, forkCount:5 },
      { projectId:2, name:'Todo App',
        language:'JavaScript',
        description:'Simple task management app',
        starCount:18, forkCount:3 },
      { projectId:3, name:'REST API',
        language:'CSharp',
        description:'ASP.NET Core REST API',
        starCount:31, forkCount:8 },
      { projectId:4, name:'Weather App',
        language:'TypeScript',
        description:'Real-time weather application',
        starCount:15, forkCount:4 },
      { projectId:5, name:'Chat App',
        language:'Go',
        description:'Real-time chat with WebSockets',
        starCount:42, forkCount:11 },
      { projectId:6, name:'Calculator',
        language:'Java',
        description:'Basic calculator app',
        starCount:9, forkCount:2 },
    ];
  }
}