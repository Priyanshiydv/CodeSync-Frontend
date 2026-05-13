import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from './notification.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('NotificationService', [
      'startSignalRConnection',
      'stopSignalRConnection'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthService,
        { provide: NotificationService, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    notificationServiceSpy = TestBed.inject(NotificationService) as
      jasmine.SpyObj<NotificationService>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // Test 1 — Service creates successfully
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2 — isLoggedIn returns false when no token
  it('should return false when no token in localStorage', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  // Test 3 — isLoggedIn returns true when token exists
  it('should return true when token exists in localStorage', () => {
    localStorage.setItem('token', 'fake-token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  // Test 4 — getToken returns null when no token
  it('should return null when no token', () => {
    expect(service.getToken()).toBeNull();
  });

  // Test 5 — getToken returns token when set
  it('should return token when it exists', () => {
    localStorage.setItem('token', 'my-token');
    expect(service.getToken()).toBe('my-token');
  });

  // Test 6 — getRole returns empty string when no role
  it('should return empty string when no role set', () => {
    expect(service.getRole()).toBe('');
  });

  // Test 7 — getRole returns stored role
  it('should return stored role', () => {
    localStorage.setItem('role', 'Developer');
    expect(service.getRole()).toBe('Developer');
  });

  // Test 8 — getCurrentUser returns null when not logged in
  it('should return null when no user in localStorage', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  // Test 9 — register makes POST request
  it('should make POST request to register', () => {
    const mockData = {
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      role: 'Developer'
    };

    service.register(mockData).subscribe();

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/auth/register'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush({ message: 'Registered successfully' });
  });

  // Test 10 — logout clears localStorage
  it('should clear localStorage on logout', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', '{}');
    localStorage.setItem('role', 'Developer');

    service.logout();

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/auth/logout'));
    req.flush({});

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });

  // Test 11 — searchUsers makes GET request
  it('should make GET request to search users', () => {
    service.searchUsers('john').subscribe();

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/auth/search'));
    expect(req.request.method).toBe('GET');
    req.flush([{ userId: 1, username: 'john' }]);
  });

  // Test 12 — getProfile makes GET request
  it('should make GET request to get profile', () => {
    service.getProfile().subscribe();

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/auth/profile'));
    expect(req.request.method).toBe('GET');
    req.flush({ userId: 1, username: 'testuser' });
  });
});