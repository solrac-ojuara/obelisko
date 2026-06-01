import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardHeaderComponent } from './dashboard-header.component';

describe('DashboardHeaderComponent', () => {
  let component: DashboardHeaderComponent;
  let fixture: ComponentFixture<DashboardHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit addPurchase event when button is clicked', () => {
    spyOn(component.addPurchase, 'emit');
    component.onAddPurchase();
    expect(component.addPurchase.emit).toHaveBeenCalled();
  });
});
