import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', [
      'login', 'redirectByRole'
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as
      jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  // Test 1 — Component creates successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 2 — Initial state is correct
  it('should have empty form fields initially', () => {
    expect(component.data.email).toBe('');
    expect(component.data.password).toBe('');
    expect(component.error).toBe('');
    expect(component.loading).toBeFalse();
  });

  // Test 3 — Successful login calls redirectByRole
  it('should redirect on successful login', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'fake-token' }));
    component.data = {
      email: 'test@test.com',
      password: 'password123'
    };
    component.onLogin();
    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
    expect(authServiceSpy.redirectByRole).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  // Test 4 — Failed login shows error message
  it('should show error on failed login', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({
        error: { message: 'Invalid credentials!' }
      }))
    );
    component.data = {
      email: 'wrong@test.com',
      password: 'wrongpass'
    };
    component.onLogin();
    expect(component.error).toBe('Invalid credentials!');
    expect(component.loading).toBeFalse();
  });

  // Test 5 — Loading is true during login
  it('should set loading to true when login starts', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'fake-token' }));
    component.onLogin();
    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  // Test 6 — Error clears on new login attempt
  it('should clear error on new login attempt', () => {
    component.error = 'Previous error';
    authServiceSpy.login.and.returnValue(of({ token: 'fake-token' }));
    component.onLogin();
    expect(component.error).toBe('');
  });

  // Test 7 — Toggle password visibility
  it('should toggle password visibility', () => {
    expect(component.showPass).toBeFalse();
    component.showPass = true;
    expect(component.showPass).toBeTrue();
  });

  // Test 8 — Default error message when no message in response
  it('should show default error when no message in response', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ error: {} }))
    );
    component.onLogin();
    expect(component.error).toBe('Login failed!');
  });
});