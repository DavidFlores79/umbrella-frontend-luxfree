import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkeletonLoader } from '../../ui/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../ui/empty-state/empty-state';
import { Pagination } from '../pagination/pagination';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string; // e.g., '100px', '20%'
  align?: 'left' | 'center' | 'right';
  cellTemplate?: (row: T) => string; // For custom rendering
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortEvent {
  column: string;
  direction: SortDirection;
}

export interface PageChangeEvent {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-data-table',
  imports: [CommonModule, FormsModule, SkeletonLoader, EmptyState, Pagination],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable<T = any> implements OnInit, OnChanges {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() emptyStateTitle = 'No data available';
  @Input() emptyStateDescription = '';
  @Input() emptyStateIcon = '';

  // Pagination
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() showPagination = true;

  // Events
  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() pageChange = new EventEmitter<PageChangeEvent>();
  @Output() rowClick = new EventEmitter<T>();

  // Internal state
  selectedRows = new Set<T>();
  sortColumn: string | null = null;
  sortDirection: SortDirection = null;
  allSelected = false;

  ngOnInit(): void {
    this.updateAllSelectedState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateAllSelectedState();
    }
  }

  // Sorting
  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      // Toggle direction: asc -> desc -> null
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = null;
        this.sortColumn = null;
      }
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({
      column: this.sortColumn || '',
      direction: this.sortDirection
    });
  }

  getSortIcon(column: TableColumn): string | null {
    if (!column.sortable || this.sortColumn !== column.key) return null;

    if (this.sortDirection === 'asc') {
      return 'M5 15l7-7 7 7'; // Up arrow
    } else if (this.sortDirection === 'desc') {
      return 'M19 9l-7 7-7-7'; // Down arrow
    }
    return null;
  }

  // Selection
  onSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.data.forEach(row => this.selectedRows.add(row));
    } else {
      this.selectedRows.clear();
    }

    this.updateAllSelectedState();
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  onSelectRow(row: T, event: Event): void {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedRows.add(row);
    } else {
      this.selectedRows.delete(row);
    }

    this.updateAllSelectedState();
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  isRowSelected(row: T): boolean {
    return this.selectedRows.has(row);
  }

  private updateAllSelectedState(): void {
    this.allSelected = this.data.length > 0 &&
                       this.data.every(row => this.selectedRows.has(row));
  }

  // Pagination
  onPageChange(event: PageChangeEvent): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.pageChange.emit(event);
  }

  // Row interaction
  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  // Cell value extraction
  getCellValue(row: T, column: TableColumn<T>): any {
    return (row as any)[column.key];
  }

  // Alignment class
  getAlignClass(column: TableColumn): string {
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    return alignments[column.align || 'left'];
  }

  // TrackBy function for performance
  trackByFn(index: number, item: T): any {
    return (item as any)['id'] || index;
  }

  get isEmpty(): boolean {
    return !this.loading && this.data.length === 0;
  }
}
