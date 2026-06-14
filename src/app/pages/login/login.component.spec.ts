import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase-service';
import { Router } from '@angular/router';

class MockSupabaseService {
  getClient() { return {} as any; }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        AuthService,
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty email and password', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should show error when fields are empty', () => {
    component.onSubmit();
    expect(component.error).toBe('Por favor, preencha todos os campos.');
  });

  it('should call authService.login on valid submit', () => {
    component.email = 'test@example.com';
    component.password = 'password';
    spyOn(authService, 'login').and.returnValue(
      Promise.resolve({ id: '1', email: 'test@example.com', role: 'admin' })
    );
    spyOn(router, 'navigate');

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should set isLoading to true during submit', () => {
    component.email = 'test@example.com';
    component.password = 'password';
    spyOn(authService, 'login').and.returnValue(new Promise(() => {}));

    component.onSubmit();

    expect(component.isLoading).toBe(true);
  });
});
