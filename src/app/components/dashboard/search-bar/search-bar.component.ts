import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() searchTerm: string = '';
  @Output() searchChange = new EventEmitter<string>();

  private searchInput$ = new Subject<string>();
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => this.searchChange.emit(term));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearchChange(term: string): void {
    this.searchInput$.next(term);
  }
}
