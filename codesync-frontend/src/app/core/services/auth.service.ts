import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = `${environment.authApi}/api/auth`;
  private userSubject = new BehaviorSubject<any>(
    JSON.parse(localStorage.getItem('user') || 'null'));
  currentUser$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService) {
       // Reconnect SignalR on page refresh if already logged in
    const token = localStorage.getItem('token');
      if (token) {
        this.notificationService.startSignalRConnection(token);
      }
    }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data)
      .pipe(tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));

        // Decode JWT token to extract role exactly as backend sends it
        try {
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          const role =
            payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
            payload['role'] ||
            payload['Role'] ||
            'Developer';

          // Store role exactly as received from backend
          localStorage.setItem('role', role);
          console.log('Role stored:', role);
        } catch (e) {
          localStorage.setItem('role', 'Developer');
        }

        this.userSubject.next(res);
        this.notificationService.startSignalRConnection(res.token);
      }));
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {})
      .subscribe({ error: () => { } });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    this.userSubject.next(null);
    this.notificationService.stopSignalRConnection();
    this.router.navigate(['/home']);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/password`, data);
  }

  searchUsers(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search?query=${query}`);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  redirectByRole(): void {
    const role = this.getRole();
    console.log('Redirecting with role:', role);

    // Handle all possible cases from backend
    if (role.toLowerCase() === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role.toLowerCase() === 'developer') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  // ADD — stores JWT token from OAuth2 callback
  storeToken(token: string): void {
    localStorage.setItem('token', token);
    this.notificationService.startSignalRConnection(token);
    // Decode role from token and store it
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ] ?? 'Developer';
      localStorage.setItem('role', role);
      console.log('Role stored:', role);
    } catch {
      localStorage.setItem('role', 'Developer');
    }
  }
}