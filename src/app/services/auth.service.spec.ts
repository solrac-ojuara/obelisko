import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user', (done) => {
    service.login('test@example.com', 'password').subscribe((user) => {
      expect(user.email).toBe('test@example.com');
      expect(service.isAuthenticated()).toBe(true);
      done();
    });
  });

  it('should logout user', () => {
    service.login('test@example.com', 'password').subscribe(() => {
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  it('should return current user', (done) => {
    service.login('test@example.com', 'password').subscribe(() => {
      const user = service.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
      done();
    });
  });
});
