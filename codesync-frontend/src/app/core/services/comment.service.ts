import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommentService {

  private baseUrl = 'http://localhost:5757/api/comments';

  constructor(private http: HttpClient) {}

  addComment(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, data);
  }

  getByFile(fileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/file/${fileId}`);
  }

  getByLine(fileId: number, line: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/file/${fileId}/line/${line}`);
  }

  getReplies(commentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${commentId}/replies`);
  }

  resolveComment(commentId: number): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/${commentId}/resolve`, {});
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${commentId}`);
  }
}