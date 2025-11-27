import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PageChangeEvent {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination implements OnInit, OnChanges {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() showPageSizeSelector = true;
  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  totalPages = 1;
  visiblePages: number[] = [];

  ngOnInit(): void {
    this.calculateTotalPages();
    this.calculateVisiblePages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems'] || changes['pageSize']) {
      this.calculateTotalPages();
      this.calculateVisiblePages();
    }
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  private calculateVisiblePages(): void {
    const pages: number[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    this.visiblePages = pages;
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.calculateVisiblePages();
    this.emitPageChange();
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = parseInt(select.value, 10);
    this.currentPage = 1; // Reset to first page
    this.calculateTotalPages();
    this.calculateVisiblePages();
    this.emitPageChange();
  }

  private emitPageChange(): void {
    this.pageChange.emit({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get hasPrevious(): boolean {
    return this.currentPage > 1;
  }

  get hasNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get showFirstPage(): boolean {
    return this.visiblePages.length > 0 && this.visiblePages[0] > 1;
  }

  get showLastPage(): boolean {
    return this.visiblePages.length > 0 &&
           this.visiblePages[this.visiblePages.length - 1] < this.totalPages;
  }
}
