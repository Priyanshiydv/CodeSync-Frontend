import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
    expect(component.data.username).toBe('');
    expect(component.data.fullName).toBe('');
    expect(component.error).toBe('');
    expect(component.loading).toBeFalse();
  });

  // Test 3 — Password mismatch shows error
  it('should show error when passwords do not match', () => {
    component.data.password = 'password123';
    component.data.confirm = 'different123';
    component.data.username = 'testuser';
    component.onRegister();
    expect(component.error).toBe('Passwords do not match!');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  // Test 4 — Short username shows error
  it('should show error when username is less than 3 chars', () => {
    component.data.password = 'password123';
    component.data.confirm = 'password123';
    component.data.username = 'ab';
    component.onRegister();
    expect(component.error)
      .toBe('Username must be at least 3 characters!');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  // Test 5 — Successful registration shows success message
  it('should show success message on successful register', () => {
    authServiceSpy.register.and.returnValue(of({}));
    component.data = {
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      confirm: 'password123'
    };
    component.onRegister();
    expect(component.success)
      .toBe('Account created! Redirecting to login...');
    expect(component.loading).toBeFalse();
  });

  // Test 6 — Failed registration shows error
  it('should show error on failed registration', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({
        error: { message: 'Email already exists!' }
      }))
    );
    component.data = {
      fullName: 'Test User',
      username: 'testuser',
      email: 'existing@test.com',
      password: 'password123',
      confirm: 'password123'
    };
    component.onRegister();
    expect(component.error).toBe('Email already exists!');
    expect(component.loading).toBeFalse();
  });

  // Test 7 — Register called with correct role
  it('should register with Developer role', () => {
    authServiceSpy.register.and.returnValue(of({}));
    component.data = {
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      confirm: 'password123'
    };
    component.onRegister();
    expect(authServiceSpy.register).toHaveBeenCalledWith(
      jasmine.objectContaining({ role: 'Developer' })
    );
  });

  // Test 8 — Default error when no message in response
  it('should show default error when no message in response', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({ error: {} }))
    );
    component.data = {
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      confirm: 'password123'
    };
    component.onRegister();
    expect(component.error).toBe('Registration failed!');
  });
});