import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CollabService {
  private baseUrl = 'http://localhost:5457/api/sessions';

  constructor(private http: HttpClient) {}

  createSession(data: { projectId: number; fileId: number; language: string; maxParticipants?: number; isPasswordProtected?: boolean; sessionPassword?: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  getSession(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${sessionId}`);
  }

  joinSession(sessionId: string, data: { userId: number; sessionPassword?: string | null }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/join`, data);
  }

  leaveSession(sessionId: string, userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/leave?userId=${userId}`, {});
  }

  endSession(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${sessionId}/end`, {});
  }

  getParticipants(sessionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${sessionId}/participants`);
  }

  updateCursor(sessionId: string, data: { userId: number; cursorLine: number; cursorCol: number }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${sessionId}/cursor`, data);
  }
}