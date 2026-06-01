import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { mockProdutos, mockStats } from '../../models/mock-data';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: DashboardService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [DashboardService, AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(true);
    spyOn(dashboardService, 'getProducts').and.returnValue(of(mockProdutos));
    spyOn(dashboardService, 'getStats').and.returnValue(of(mockStats));

    component.ngOnInit();

    expect(component.products).toEqual(mockProdutos);
    expect(component.stats).toEqual(mockStats);
  });

  it('should filter products on search', () => {
    component.products = mockProdutos;
    component.filteredProducts = mockProdutos;

    component.onSearchChange('Notebook');

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].produto).toContain('Notebook');
  });

  it('should clear filter on empty search', () => {
    component.products = mockProdutos;
    component.filteredProducts = [];

    component.onSearchChange('');

    expect(component.filteredProducts).toEqual(mockProdutos);
  });

  it('should sort products on sort event', () => {
    component.products = mockProdutos;
    component.filteredProducts = [...mockProdutos];

    component.onSort('produto');

    expect(component.sortBy).toBe('produto');
    expect(component.sortOrder).toBe('asc');
  });

  it('should toggle sort order on same column', () => {
    component.products = mockProdutos;
    component.filteredProducts = [...mockProdutos];
    component.sortBy = 'produto';
    component.sortOrder = 'asc';

    component.onSort('produto');

    expect(component.sortOrder).toBe('desc');
  });

  it('should redirect to login if not authenticated', () => {
    spyOn(authService, 'isAuthenticated').and.returnValue(false);
    spyOn(router, 'navigate');

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
