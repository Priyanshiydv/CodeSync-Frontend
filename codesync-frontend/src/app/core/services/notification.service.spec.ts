import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
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

  // Test 2 — unreadCount$ starts at 0
  it('should have initial unread count of 0', (done) => {
    service.unreadCount$.subscribe(count => {
      expect(count).toBe(0);
      done();
    });
  });

  // Test 3 — getMyNotifications makes GET request
  it('should make GET request to get notifications', () => {
    // Set a fake token with userId=1
   const claimKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
        const payload: any = {};
        payload[claimKey] = '1';
        const fakeToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify(payload)) + '.signature';
    localStorage.setItem('token', fakeToken);

    service.getMyNotifications().subscribe();

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/notifications/recipient/'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // Test 4 — markAsRead makes PUT request
  it('should make PUT request to mark notification as read', () => {
    service.markAsRead(1).subscribe();

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/notifications/1/read'));
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  // Test 5 — deleteNotification makes DELETE request
  it('should make DELETE request to delete notification', () => {
    service.deleteNotification(1).subscribe();

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/notifications/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  // Test 6 — markAllAsRead updates unread count to 0
  it('should update unread count to 0 after markAllAsRead', (done) => {
    const claimKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
    const payload: any = {};
    payload[claimKey] = '1';
    const fakeToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
         btoa(JSON.stringify(payload)) + '.signature';
    localStorage.setItem('token', fakeToken);

    service.markAllAsRead().subscribe(() => {
      service.unreadCount$.subscribe(count => {
        expect(count).toBe(0);
        done();
      });
    });

    const req = httpMock.expectOne(req =>
      req.url.includes('/api/notifications/read-all/'));
    req.flush({});
  });

  // Test 7 — stopSignalRConnection does not throw when not connected
  it('should not throw when stopping non-existent connection', () => {
    expect(() => service.stopSignalRConnection()).not.toThrow();
  });
});