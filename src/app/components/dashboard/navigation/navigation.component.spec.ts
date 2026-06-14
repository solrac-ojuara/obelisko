import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationComponent } from './navigation.component';
import { AuthService } from '../../../services/auth.service';
import { SupabaseService } from '../../../services/supabase-service';
import { of } from 'rxjs';

class MockSupabaseService {
  getClient() { return {} as any; }
}

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent, RouterTestingModule],
      providers: [
        AuthService,
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set user from user$ on init', () => {
    const mockUser = { id: '1', email: 'test@example.com', nome: 'Test User', role: 'admin' };
    authService.user$ = of(mockUser);

    fixture.detectChanges();

    expect(component.user).toEqual(mockUser);
  });

  it('should call logout on logout click', () => {
    spyOn(authService, 'logout').and.returnValue(Promise.resolve());
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });
});
