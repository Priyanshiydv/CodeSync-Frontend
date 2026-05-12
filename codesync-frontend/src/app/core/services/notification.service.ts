import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = `${environment.notificationApi}/api/notifications`;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get notifications for current user
  getMyNotifications(): Observable<any[]> {
    const userId = this.getUserId();
    return this.http.get<any[]>(`${this.baseUrl}/recipient/${userId}`);
  }

  // Get unread count
  getUnreadCount(): Observable<any> {
    const userId = this.getUserId();
    return this.http.get<any>(`${this.baseUrl}/unread/${userId}`)
      .pipe(tap(res => this.unreadCountSubject.next(res.unreadCount || 0)));
  }

  // Mark single as read
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${notificationId}/read`, {});
  }

  // Mark all as read
  markAllAsRead(): Observable<any> {
    const userId = this.getUserId();
    return this.http.put(`${this.baseUrl}/read-all/${userId}`, {})
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${notificationId}`);
  }

  // Clear all read notifications
  clearRead(): Observable<any> {
    const userId = this.getUserId();
    return this.http.delete(`${this.baseUrl}/read/${userId}`);
  }

  // Refresh unread count
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  private getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) || 0;
    } catch { return 0; }
  }
}