import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    const mockSupabaseClient = {
      auth: {
        signInWithPassword: jasmine.createSpy('signInWithPassword').and.returnValue(
          Promise.resolve({ data: { user: { id: '123', email: 'test@example.com' } }, error: null })
        ),
        signOut: jasmine.createSpy('signOut').and.returnValue(
          Promise.resolve({ error: null })
        ),
        getSession: jasmine.createSpy('getSession').and.returnValue(
          Promise.resolve({ data: { session: null } })
        ),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      }),
    };

    class MockSupabaseService {
      getClient() { return mockSupabaseClient as any; }
    }

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should be authenticated after login', async () => {
    await service.login('test@example.com', 'password');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should not be authenticated after logout', async () => {
    await service.login('test@example.com', 'password');
    await service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should emit user via user$ after login', async () => {
    await service.login('test@example.com', 'password');
    let emitted: any;
    service.user$.subscribe(u => (emitted = u));
    expect(emitted?.email).toBe('test@example.com');
  });
});
