import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { SupabaseService } from './supabase-service';

class MockSupabaseService {
  getClient() { return {} as any; }
}

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    });
    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return products observable emitting an array', (done) => {
    service.getProducts().subscribe((products) => {
      expect(Array.isArray(products)).toBe(true);
      done();
    });
  });

  it('should return stats observable emitting an object with numeric fields', (done) => {
    service.getStats().subscribe((stats) => {
      expect(stats).toBeDefined();
      expect(typeof stats.totalProducts).toBe('number');
      expect(typeof stats.lowStockCount).toBe('number');
      expect(typeof stats.outOfStockCount).toBe('number');
      expect(typeof stats.totalValue).toBe('number');
      done();
    });
  });

  it('should expose loading$ observable', (done) => {
    service.loading$.subscribe((loading) => {
      expect(typeof loading).toBe('boolean');
      done();
    });
  });
});
