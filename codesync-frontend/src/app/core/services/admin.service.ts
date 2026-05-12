import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  
  // Different base URLs for different services
  private authBaseUrl      = `${environment.authApi}/api/admin`;
  private projectBaseUrl   = `${environment.projectApi}/api/admin`;
  private executionBaseUrl = `${environment.executionApi}/api/admin`;
  private collabBaseUrl    = `${environment.collabApi}/api/admin`;

  constructor(private http: HttpClient) {}

  // ========== USERS (AuthService: 5157) ==========
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.authBaseUrl}/users`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.authBaseUrl}/users/${id}`);
  }

  suspendUser(id: number): Observable<any> {
    return this.http.put(`${this.authBaseUrl}/users/${id}/suspend`, {});
  }

  reactivateUser(id: number): Observable<any> {
    return this.http.put(`${this.authBaseUrl}/users/${id}/reactivate`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.authBaseUrl}/users/${id}`);
  }

  changeUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`${this.authBaseUrl}/users/${id}/role`, { role });
  }

  // ========== PROJECTS (ProjectService: 5257) ==========
  getAllProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.projectBaseUrl}/projects`);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.projectBaseUrl}/projects/${id}`);
  }

  archiveProject(id: number): Observable<any> {
    return this.http.put(`${this.projectBaseUrl}/projects/${id}/archive`, {});
  }

  getPlatformStats(): Observable<any> {
    return this.http.get<any>(`${this.projectBaseUrl}/analytics`);
  }

  getExecutionsByLanguage(): Observable<any> {
    return this.http.get<any>(`${this.projectBaseUrl}/analytics/languages`);
  }

  // ========== EXECUTIONS (ExecutionService: 5657) ==========
  getAllExecutions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.executionBaseUrl}/executions`);
  }

  cancelExecution(jobId: string): Observable<any> {
    return this.http.post(`${this.executionBaseUrl}/executions/${jobId}/cancel`, {});
  }

  // ========== LANGUAGES (ExecutionService: 5657) ==========
  getSupportedLanguages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.executionBaseUrl}/languages`);
  }

  addLanguage(data: any): Observable<any> {
    return this.http.post(`${this.executionBaseUrl}/languages`, data);
  }

  updateLanguage(id: number, data: any): Observable<any> {
    return this.http.put(`${this.executionBaseUrl}/languages/${id}`, data);
  }

  deleteLanguage(id: number): Observable<any> {
    return this.http.delete(`${this.executionBaseUrl}/languages/${id}`);
  }

  // ========== SESSIONS (CollabService: 5957) ==========
  getActiveSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.collabBaseUrl}/sessions/active`);
  }

  endSession(sessionId: string): Observable<any> {
    return this.http.post(`${this.collabBaseUrl}/sessions/${sessionId}/end`, {});
  }

  // ========== NOTIFICATIONS (NotificationService: 5857) ==========
    sendBroadcast(data: any): Observable<any> {
        // Use the existing 'bulk' endpoint
        return this.http.post(`${environment.notificationApi}/api/notifications/bulk`, {
            recipientIds: [], // Empty = all users
            title: data.title,
            message: data.message,
            type: 'BROADCAST',
            targetRole: data.targetRole
        });
    }   
    // ADD — Audit Log endpoints
    // Case study §2.4 — admin views audit logs

    getAuditLogs(page: number = 1, pageSize: number = 50): Observable<any[]> {
        // FIX: Remove extra '/admin' from URL
        return this.http.get<any[]>(
            `${environment.authApi}/api/admin/audit-logs?page=${page}&pageSize=${pageSize}`
        );
    }

    getAuditLogsByActor(actorId: number): Observable<any[]> {
        return this.http.get<any[]>(
            `${environment.authApi}/api/admin/audit-logs/actor/${actorId}`
        );
    }

    getAuditLogsByEntity(entityType: string, entityId: string): Observable<any[]> {
        return this.http.get<any[]>(
            `${environment.authApi}/api/admin/audit-logs/entity/${entityType}/${entityId}`
        );
    }
}