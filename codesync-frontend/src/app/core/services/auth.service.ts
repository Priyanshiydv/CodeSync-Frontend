import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:5157/api/auth';

  private currentUserSubject = new BehaviorSubject<any>(
    JSON.parse(localStorage.getItem('user') || 'null'));
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data)
      .pipe(tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        this.currentUserSubject.next(res);
      }));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {})
      .pipe(tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
      }));
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

  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles`);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /// Gets role from stored user
  getRole(): string {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.role || '';
  }

  /// Redirects user based on their role after login
  redirectByRole(): void {
    const role = this.getRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'DEVELOPER') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}