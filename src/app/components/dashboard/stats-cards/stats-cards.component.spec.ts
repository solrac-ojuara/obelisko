import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsCardsComponent } from './stats-cards.component';
import { mockStats } from '../../../models/mock-data';

describe('StatsCardsComponent', () => {
  let component: StatsCardsComponent;
  let fixture: ComponentFixture<StatsCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardsComponent);
    component = fixture.componentInstance;
    component.data = mockStats;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 4 stat cards', () => {
    expect(component.cards.length).toBe(4);
  });

  it('should display correct total products', () => {
    const cards = component.cards;
    expect(cards[0].label).toBe('Total de Produtos');
    expect(cards[0].value).toBe(mockStats.totalProducts);
  });

  it('should format total value correctly', () => {
    const cards = component.cards;
    const expectedValue = `R$ ${(mockStats.totalValue / 1000).toFixed(1)}K`;
    expect(cards[3].value).toBe(expectedValue);
  });

  it('should show loading state when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const skeletons = compiled.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });
});
