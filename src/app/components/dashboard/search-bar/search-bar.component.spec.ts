import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';
import { FormsModule } from '@angular/forms';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searchChange event on input after debounce', fakeAsync(() => {
    spyOn(component.searchChange, 'emit');
    component.onSearchChange('test');
    tick(400);
    expect(component.searchChange.emit).toHaveBeenCalledWith('test');
  }));

  it('should display search term', () => {
    component.searchTerm = 'notebook';
    fixture.detectChanges();
    expect(component.searchTerm).toBe('notebook');
  });
});
