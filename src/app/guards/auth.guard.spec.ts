import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, AuthService],
    });
    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    expect(guard.canActivate({} as any, {} as any)).toBe(true);
  });

  it('should deny access if not authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(false);
    spyOn(router, 'navigate');
    expect(guard.canActivate({} as any, {} as any)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
