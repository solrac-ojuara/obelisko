import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase-service';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { mockProdutos, mockStats } from '../../models/mock-data';
import { AppUser } from '../../models/produto';

const mockUser: AppUser = { id: '1', email: 'test@example.com', role: 'admin' };

class MockSupabaseService {
  getClient() { return {} as any; }
}

class MockDashboardService {
  private userSubject = new BehaviorSubject(mockProdutos);
  loading$ = of(false);
  currentPage$ = of(1);
  totalPages$ = of(1);
  loadProducts: jasmine.Spy;
  addFromNfe: jasmine.Spy;
  updateProduct: jasmine.Spy;
  deleteProduct: jasmine.Spy;

  constructor() {
    this.loadProducts = jasmine.createSpy('loadProducts').and.returnValue(Promise.resolve());
    this.addFromNfe = jasmine.createSpy('addFromNfe').and.returnValue(Promise.resolve());
    this.updateProduct = jasmine.createSpy('updateProduct').and.returnValue(Promise.resolve());
    this.deleteProduct = jasmine.createSpy('deleteProduct').and.returnValue(Promise.resolve());
  }

  getProducts() { return of(mockProdutos); }
  getStats() { return of(mockStats); }
}

class MockAuthService {
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  user$ = this.userSubject.asObservable();

  isAuthenticated() { return this.userSubject.value !== null; }
  logout() { return Promise.resolve(); }
  emit(user: AppUser | null) { this.userSubject.next(user); }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: MockDashboardService;
  let authServiceMock: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useClass: MockDashboardService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as unknown as MockDashboardService;
    authServiceMock = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init when user is present', () => {
    authServiceMock.emit(mockUser);
    component.ngOnInit();

    expect(component.products).toEqual(mockProdutos);
    expect(component.stats).toEqual(mockStats);
  });

  it('should call loadProducts with search term on search change', () => {
    component.onSearchChange('Notebook');

    expect(dashboardService.loadProducts).toHaveBeenCalledWith(
      1, jasmine.any(String), jasmine.any(String), 'Notebook'
    );
    expect(component.searchTerm).toBe('Notebook');
  });

  it('should call loadProducts with empty term to clear filter', () => {
    component.onSearchChange('');

    expect(dashboardService.loadProducts).toHaveBeenCalledWith(
      1, jasmine.any(String), jasmine.any(String), ''
    );
  });

  it('should set sortBy and sortOrder on sort event', () => {
    component.onSort('produto');

    expect(component.sortBy).toBe('produto');
    expect(component.sortOrder).toBe('asc');
  });

  it('should toggle sort order on same column', () => {
    component.sortBy = 'produto';
    component.sortOrder = 'asc';

    component.onSort('produto');

    expect(component.sortOrder).toBe('desc');
  });

  it('should redirect to login when user logs out after being authenticated', () => {
    spyOn(router, 'navigate');
    authServiceMock.emit(mockUser);
    component.ngOnInit();
    authServiceMock.emit(null);

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
