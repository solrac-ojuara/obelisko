import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationComponent } from './navigation.component';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent, RouterTestingModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      nome: 'Test User',
      role: 'admin',
    };
    spyOn(authService, 'user$', 'get').and.returnValue(of(mockUser));

    fixture.detectChanges();
    expect(component.user).toEqual(mockUser);
  });

  it('should call logout on logout click', () => {
    spyOn(authService, 'logout');
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });
});
