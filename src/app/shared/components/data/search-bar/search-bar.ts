import { Component, Input, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar implements OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() debounceTime = 300; // milliseconds
  @Input() loading = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() searchChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  searchTerm = '';
  private searchSubject = new Subject<string>();
  private subscription;

  constructor() {
    // Set up debounced search
    this.subscription = this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchChange.emit(term);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.searchSubject.next(this.searchTerm);
  }

  onClear(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
    this.clear.emit();
  }

  get sizeClasses(): string {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base'
    };
    return sizes[this.size];
  }

  get hasValue(): boolean {
    return this.searchTerm.length > 0;
  }
}
