import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  user: any = null;
  myProjects: any[] = [];
  members: any[] = [];
  selectedProject: any = null;
  loading = true;
  showCreateModal = false;
  showMembersModal = false;
  showEditModal = false;
  searchQuery = '';
  errorMessage = '';

  newProject = {
    name: '', description: '',
    language: 'Python', visibility: 'PUBLIC'
  };

  editData = {
    name: '', description: '',
    language: '', visibility: ''
  };

  newMember = { userId: null, role: 'VIEWER' };

  languages = ['Python','JavaScript','TypeScript','Java',
    'CSharp','C','C++','Go','Rust','PHP','Ruby'];

  totalStars = (acc: number, p: any) => acc + (p.starCount || 0);
  countPublic = (acc: number, p: any) =>
    acc + (p.visibility === 'PUBLIC' ? 1 : 0);
  countPrivate = (acc: number, p: any) =>
    acc + (p.visibility === 'PRIVATE' ? 1 : 0);

  constructor(
    private auth: AuthService,
    private projectService: ProjectService) { }

  ngOnInit() {
    // Load actual profile from API to get real name
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.loadProjects();
      },
      error: () => {
        this.user = this.auth.getCurrentUser();
        this.loadProjects();
      }
    });
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getMyProjects().subscribe({
      next: (res: any[]) => {
        this.myProjects = res;
        this.loading = false;
      },
      error: () => {
        this.myProjects = [];
        this.loading = false;
      }
    });
  }

  get filteredProjects() {
    return this.myProjects.filter(p =>
      p.name.toLowerCase()
        .includes(this.searchQuery.toLowerCase()));
  }

  createProject() {
    if (!this.newProject.name.trim()) {
      this.errorMessage = 'Project name is required!';
      return;
    }
    this.errorMessage = '';
    this.projectService.createProject(this.newProject)
      .subscribe({
        next: () => {
          this.showCreateModal = false;
          this.newProject = { name:'', description:'',
            language:'Python', visibility:'PUBLIC' };
          this.loadProjects();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed!';
        }
      });
  }

  openEdit(p: any) {
    this.selectedProject = p;
    this.editData = {
      name: p.name,
      description: p.description,
      language: p.language,
      visibility: p.visibility
    };
    this.showEditModal = true;
  }

  saveEdit() {
    this.projectService.updateProject(
      this.selectedProject.projectId, this.editData)
      .subscribe({
        next: () => {
          this.showEditModal = false;
          this.loadProjects();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Update failed!';
        }
      });
  }

  openMembers(p: any) {
    this.selectedProject = p;
    this.showMembersModal = true;
    this.loadMembers(p.projectId);
  }

  loadMembers(projectId: number) {
    this.projectService.getMembers(projectId).subscribe({
      next: (res) => this.members = res,
      error: () => this.members = []
    });
  }

  addMember() {
    if (!this.newMember.userId) return;
    this.projectService.addMember(
      this.selectedProject.projectId, this.newMember)
      .subscribe({
        next: () => {
          this.newMember = { userId: null, role: 'VIEWER' };
          this.loadMembers(this.selectedProject.projectId);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to add member!';
        }
      });
  }

  removeMember(userId: number) {
    if (!confirm('Remove this member?')) return;
    this.projectService.removeMember(
      this.selectedProject.projectId, userId)
      .subscribe({
        next: () =>
          this.loadMembers(this.selectedProject.projectId)
      });
  }

  starProject(id: number) {
    this.projectService.starProject(id).subscribe({
      next: () => this.loadProjects()
    });
  }

  archiveProject(id: number) {
    if (!confirm('Archive this project?')) return;
    this.projectService.archiveProject(id).subscribe({
      next: () => this.loadProjects()
    });
  }

  forkProject(id: number) {
    this.projectService.forkProject(id).subscribe({
      next: () => {
        alert('Project forked!');
        this.loadProjects();
      }
    });
  }

  deleteProject(id: number) {
    if (!confirm('Delete this project permanently?')) return;
    this.projectService.deleteProject(id).subscribe({
      next: () => this.loadProjects()
    });
  }

  logout() { this.auth.logout(); }
}