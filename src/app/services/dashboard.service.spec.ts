import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { mockProdutos, mockStats } from '../models/mock-data';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return products', (done) => {
    service.getProducts().subscribe((products) => {
      expect(products).toEqual(mockProdutos);
      done();
    });
  });

  it('should return stats', (done) => {
    service.getStats().subscribe((stats) => {
      expect(stats).toEqual(mockStats);
      done();
    });
  });

  it('should search products by term', (done) => {
    service.searchProducts('Notebook').subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].produto).toContain('Notebook');
      done();
    });
  });

  it('should sort products ascending', () => {
    const sorted = service.sortProducts(mockProdutos, 'produto', 'asc');
    expect(sorted[0].produto).toBe('Monitor LG 27"');
  });

  it('should sort products descending', () => {
    const sorted = service.sortProducts(mockProdutos, 'quantidade', 'desc');
    expect(sorted[0].quantidade).toBe(45);
  });
});
