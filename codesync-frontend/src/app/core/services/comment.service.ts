import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {

  private baseUrl = `${environment.commentApi}/api/comments`;

  constructor(private http: HttpClient) {}

  addComment(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  getByFile(fileId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/file/${fileId}`);
  }

  getByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/project/${projectId}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getReplies(id: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${id}/replies`);
  }

  getByLine(fileId: number,
    line: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/file/${fileId}/line/${line}`);
  }

  getCount(fileId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/file/${fileId}/count`);
  }

  updateComment(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  resolveComment(id: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/${id}/resolve`, {});
  }

  unresolveComment(id: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/${id}/unresolve`, {});
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}