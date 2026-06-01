import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductTableComponent } from './product-table.component';
import { mockProdutos } from '../../../models/mock-data';

describe('ProductTableComponent', () => {
  let component: ProductTableComponent;
  let fixture: ComponentFixture<ProductTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTableComponent);
    component = fixture.componentInstance;
    component.products = mockProdutos;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all products', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(mockProdutos.length);
  });

  it('should calculate total value correctly', () => {
    const total = component.getTotalValue();
    const expectedTotal = mockProdutos.reduce((sum, p) => sum + p.valor * p.quantidade, 0);
    expect(total).toBe(expectedTotal);
  });

  it('should get correct status color', () => {
    expect(component.getStatusColor('Em estoque')).toContain('bg-green-50');
    expect(component.getStatusColor('Baixo estoque')).toContain('bg-yellow-50');
    expect(component.getStatusColor('Fora de estoque')).toContain('bg-red-50');
  });

  it('should emit sort event when column header is clicked', () => {
    spyOn(component.sort, 'emit');
    component.onSort('produto');
    expect(component.sort.emit).toHaveBeenCalledWith('produto');
  });

  it('should show empty message when no products', () => {
    component.products = [];
    fixture.detectChanges();
    const message = fixture.nativeElement.textContent;
    expect(message).toContain('Nenhum produto encontrado');
  });

  it('should show loading state', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const message = fixture.nativeElement.textContent;
    expect(message).toContain('Carregando produtos...');
  });
});
