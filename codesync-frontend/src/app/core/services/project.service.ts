import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  private baseUrl = `${environment.projectApi}/api/projects`;

  constructor(private http: HttpClient) {}

  // GET all public projects
  getPublicProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/public`);
  }

  // GET projects by owner
  getProjectsByOwner(ownerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/owner/${ownerId}`);
  }

  // GET projects where user is member
  getMyProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/member`);
  }

  // GET project by id
  getProjectById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // GET search projects
  searchProjects(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search?query=${query}`);
  }

  // GET by language
  getByLanguage(language: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/language/${language}`);
  }

  // POST create project
  createProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  // POST fork project
  forkProject(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/fork`, {});
  }

  // PUT update project
  updateProject(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  // PUT archive project
  archiveProject(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/archive`, {});
  }

  // PUT star project
  starProject(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/star`, {});
  }

  // DELETE project
  deleteProject(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  // GET members
  getMembers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/members`);
  }

  // POST add member
  addMember(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/members`, data);
  }

  // DELETE remove member
  removeMember(projectId: number, userId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.baseUrl}/${projectId}/members/${userId}`);
  }
}