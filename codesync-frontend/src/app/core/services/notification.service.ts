import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = `${environment.notificationApi}/api/notifications`;
  private hubConnection: signalR.HubConnection | null = null;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Connect to SignalR hub for real-time notifications
  startSignalRConnection(token: string): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.notificationApi}/hubs/notifications`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Listen for real-time unread count updates
    this.hubConnection.on('UnreadCountUpdated', (count: number) => {
      this.unreadCountSubject.next(count);
    });

    this.hubConnection
      .start()
      .then(() => {
        const userId = this.getUserId();
        this.hubConnection!.invoke('JoinNotificationGroup', userId.toString());
        console.log('Notification SignalR connected');
      })
      .catch(err => console.error('Notification SignalR error:', err));
  }

  stopSignalRConnection(): void {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }

  getMyNotifications(): Observable<any[]> {
    const userId = this.getUserId();
    return this.http.get<any[]>(`${this.baseUrl}/recipient/${userId}`);
  }

  getUnreadCount(): Observable<any> {
    const userId = this.getUserId();
    return this.http.get<any>(`${this.baseUrl}/unread/${userId}`)
      .pipe(tap(res => this.unreadCountSubject.next(res.unreadCount || 0)));
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    const userId = this.getUserId();
    return this.http.put(`${this.baseUrl}/read-all/${userId}`, {})
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${notificationId}`);
  }

  clearRead(): Observable<any> {
    const userId = this.getUserId();
    return this.http.delete(`${this.baseUrl}/read/${userId}`);
  }

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