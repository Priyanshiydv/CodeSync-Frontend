import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationComponent } from '../notification/notification.component';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser = {
    userId: 1,
    username: 'testuser',
    email: 'test@test.com',
    role: 'Developer'
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser', 'isLoggedIn', 'getRole'
    ], {
      currentUser$: of(mockUser)
    });
    spy.getCurrentUser.and.returnValue(mockUser);
    spy.isLoggedIn.and.returnValue(true);
    spy.getRole.and.returnValue('Developer');

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as
      jasmine.SpyObj<AuthService>;
  });

  // Test 1 — Component creates successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 2 — Initial state
  it('should have correct initial state', () => {
    expect(component.myProjects).toEqual([]);
    expect(component.publicProjects).toEqual([]);
    expect(component.showCreateModal).toBeFalse();
    expect(component.activeTab).toBe('my');
  });

  // Test 3 — New project has correct defaults
  it('should have correct default new project values', () => {
    expect(component.newProject.language).toBe('Python');
    expect(component.newProject.visibility).toBe('PUBLIC');
    expect(component.newProject.name).toBe('');
  });

  // Test 4 — Languages list is correct
  it('should have correct languages list', () => {
    expect(component.languages).toContain('Python');
    expect(component.languages).toContain('Java');
    expect(component.languages).toContain('CSharp');
    expect(component.languages).toContain('C');
    expect(component.languages).toContain('C++');
  });

  // Test 5 — showCreateModal toggles correctly
  it('should toggle create modal', () => {
    expect(component.showCreateModal).toBeFalse();
    component.showCreateModal = true;
    expect(component.showCreateModal).toBeTrue();
    component.showCreateModal = false;
    expect(component.showCreateModal).toBeFalse();
  });

  // Test 6 — Active tab switches correctly
  it('should switch active tab', () => {
    expect(component.activeTab).toBe('my');
    component.activeTab = 'public';
    expect(component.activeTab).toBe('public');
  });

  // Test 7 — Error message starts empty
  it('should have empty error message initially', () => {
    expect(component.errorMessage).toBe('');
  });

  // Test 8 — Loading starts true
  it('should start with loading true', () => {
    expect(component.loading).toBeTrue();
  });
});