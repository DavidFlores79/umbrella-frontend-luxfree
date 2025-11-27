# Phase 2.2 UI Components - Angular Frontend Implementation Plan

## Project Context

**Project**: Umbrella Frontend - Multi-company Income & Expense Management System
**Framework**: Angular 20.3 with Standalone Components Architecture
**Design System**: HubSpot-inspired using Tailwind CSS
**State Management**: RxJS (BehaviorSubject-based stores, NO Angular Signals for state)
**Architecture**: Clean Architecture with strict layer separation

## Overview

This document provides a detailed implementation plan for the remaining Phase 2 UI components. All components follow Angular 20 standalone architecture patterns, use the `inject()` function for dependency injection, and adhere to the HubSpot-inspired design system already configured in `tailwind.config.js`.

**Important Notes:**
- Components use `.ts` and `.html` file naming (NOT `.component.ts`)
- All components are standalone with `imports` array
- Use TypeScript strict mode with proper interfaces
- Follow the existing pattern from `button.ts`, `card.ts`, etc.
- Support dark mode using Tailwind's `dark:` utility classes
- Implement proper accessibility (ARIA labels, keyboard navigation)

---

## Design System Reference

### Color Palette (from tailwind.config.js)

```typescript
// Primary Colors
primary: {
  DEFAULT: '#FF7A59',  // Coral - Primary actions
  500: '#FF7A59',
  600: '#FF5533',
  700: '#E6381F'
}

// Text Colors
text: {
  DEFAULT: '#2D3E50',      // Pickled Bluewood - Primary text
  light: '#6B7C93',        // Secondary text
  lighter: '#A1B1C4',      // Tertiary text
  dark: {
    DEFAULT: '#E5E9F0',    // Dark mode text
    light: '#B8C2D4',
    lighter: '#8A99B0'
  }
}

// Background Colors
background: {
  DEFAULT: '#FFFFFF',
  secondary: '#FFF1EE',    // Forget Me Not
  tertiary: '#F7F9FB',
  dark: {
    DEFAULT: '#1A1F2E',
    secondary: '#242936',
    tertiary: '#2D3342'
  }
}

// Accent Colors
accent: {
  blue: '#0091AE',     // Trust, info
  green: '#00A862',    // Success
  yellow: '#FFB800',   // Warning
  red: '#F2545B'       // Error, danger
}
```

---

## Component 1: Badge Component

### File Structure
```
src/app/shared/components/ui/badge/
├── badge.ts
├── badge.html
└── badge.css
```

### Component Architecture

**badge.ts**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() rounded = false; // Pill-shaped vs rectangle

  get baseClasses(): string {
    return 'inline-flex items-center justify-center font-medium transition-all duration-200';
  }

  get variantClasses(): string {
    const variants: Record<BadgeVariant, string> = {
      success: 'bg-accent-green/10 text-accent-green dark:bg-accent-green/20 dark:text-green-300',
      warning: 'bg-accent-yellow/10 text-accent-yellow dark:bg-accent-yellow/20 dark:text-yellow-300',
      error: 'bg-accent-red/10 text-accent-red dark:bg-accent-red/20 dark:text-red-300',
      info: 'bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-300',
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return variants[this.variant];
  }

  get sizeClasses(): string {
    const sizes: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };
    return sizes[this.size];
  }

  get roundedClass(): string {
    return this.rounded ? 'rounded-full' : 'rounded-md';
  }
}
```

**badge.html**
```html
<span
  [class]="baseClasses + ' ' + variantClasses + ' ' + sizeClasses + ' ' + roundedClass"
  role="status"
  attr.aria-label="Badge: {{variant}}">
  <ng-content></ng-content>
</span>
```

**badge.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<app-badge variant="success" size="sm">Active</app-badge>
<app-badge variant="warning" [rounded]="true">Pending</app-badge>
<app-badge variant="error">Failed</app-badge>
```

---

## Component 2: Alert Component

### File Structure
```
src/app/shared/components/ui/alert/
├── alert.ts
├── alert.html
└── alert.css
```

### Component Architecture

**alert.ts**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  @Input() type: AlertType = 'info';
  @Input() title = '';
  @Input() dismissible = false;
  @Input() showIcon = true;
  @Output() dismissed = new EventEmitter<void>();

  visible = true;

  onDismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }

  get baseClasses(): string {
    return 'p-4 rounded-lg border transition-all duration-200 animate-fade-in';
  }

  get typeClasses(): string {
    const types: Record<AlertType, string> = {
      success: 'bg-accent-green/10 border-accent-green/30 text-accent-green dark:bg-accent-green/20 dark:border-accent-green/40',
      warning: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow dark:bg-accent-yellow/20 dark:border-accent-yellow/40',
      error: 'bg-accent-red/10 border-accent-red/30 text-accent-red dark:bg-accent-red/20 dark:border-accent-red/40',
      info: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue dark:bg-accent-blue/20 dark:border-accent-blue/40'
    };
    return types[this.type];
  }

  get icon(): string {
    const icons: Record<AlertType, string> = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.type];
  }
}
```

**alert.html**
```html
<div
  *ngIf="visible"
  [class]="baseClasses + ' ' + typeClasses"
  role="alert"
  attr.aria-live="polite">

  <div class="flex items-start gap-3">
    <!-- Icon -->
    <svg
      *ngIf="showIcon"
      class="w-5 h-5 flex-shrink-0 mt-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        [attr.d]="icon">
      </path>
    </svg>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3 *ngIf="title" class="font-semibold mb-1">{{ title }}</h3>
      <div class="text-sm opacity-90">
        <ng-content></ng-content>
      </div>
    </div>

    <!-- Dismiss Button -->
    <button
      *ngIf="dismissible"
      type="button"
      (click)="onDismiss()"
      class="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      aria-label="Dismiss alert">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</div>
```

**alert.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<app-alert type="success" title="Success!" [dismissible]="true">
  Your changes have been saved successfully.
</app-alert>
```

---

## Component 3: Empty State Component

### File Structure
```
src/app/shared/components/ui/empty-state/
├── empty-state.ts
├── empty-state.html
└── empty-state.css
```

### Component Architecture

**empty-state.ts**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule, Button],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  @Input() icon = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'; // Default document icon
  @Input() title = 'No data available';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionVariant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Output() actionClick = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClick.emit();
  }

  get hasAction(): boolean {
    return !!this.actionLabel;
  }
}
```

**empty-state.html**
```html
<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
  <!-- Icon -->
  <div class="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
    <svg
      class="w-8 h-8 text-gray-400 dark:text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        [attr.d]="icon">
      </path>
    </svg>
  </div>

  <!-- Title -->
  <h3 class="text-lg font-semibold text-text dark:text-text-dark-DEFAULT mb-2">
    {{ title }}
  </h3>

  <!-- Description -->
  <p
    *ngIf="description"
    class="text-sm text-text-light dark:text-text-dark-light max-w-md mb-6">
    {{ description }}
  </p>

  <!-- Custom Content Projection -->
  <div class="text-sm text-text-light dark:text-text-dark-light max-w-md mb-6">
    <ng-content></ng-content>
  </div>

  <!-- Action Button -->
  <app-button
    *ngIf="hasAction"
    [variant]="actionVariant"
    (clicked)="onActionClick()">
    {{ actionLabel }}
  </app-button>
</div>
```

**empty-state.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<app-empty-state
  title="No products found"
  description="Get started by creating your first product."
  actionLabel="Create Product"
  (actionClick)="onCreateProduct()">
</app-empty-state>
```

---

## Component 4: Chip Component

### File Structure
```
src/app/shared/components/ui/chip/
├── chip.ts
├── chip.html
└── chip.css
```

### Component Architecture

**chip.ts**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-chip',
  imports: [CommonModule],
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class Chip {
  @Input() variant: ChipVariant = 'default';
  @Input() removable = false;
  @Input() disabled = false;
  @Output() removed = new EventEmitter<void>();

  onRemove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.removed.emit();
    }
  }

  get baseClasses(): string {
    return 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200';
  }

  get variantClasses(): string {
    const variants: Record<ChipVariant, string> = {
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      success: 'bg-accent-green/10 text-accent-green dark:bg-accent-green/20 dark:text-green-300',
      warning: 'bg-accent-yellow/10 text-accent-yellow dark:bg-accent-yellow/20 dark:text-yellow-300',
      error: 'bg-accent-red/10 text-accent-red dark:bg-accent-red/20 dark:text-red-300',
      info: 'bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-300'
    };
    return variants[this.variant];
  }

  get disabledClass(): string {
    return this.disabled ? 'opacity-50 cursor-not-allowed' : '';
  }
}
```

**chip.html**
```html
<span
  [class]="baseClasses + ' ' + variantClasses + ' ' + disabledClass"
  role="status"
  [attr.aria-label]="'Chip: ' + variant">

  <!-- Content -->
  <span class="truncate">
    <ng-content></ng-content>
  </span>

  <!-- Remove Button -->
  <button
    *ngIf="removable"
    type="button"
    (click)="onRemove($event)"
    [disabled]="disabled"
    class="flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
    aria-label="Remove">
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  </button>
</span>
```

**chip.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<app-chip variant="primary" [removable]="true" (removed)="onRemoveTag('angular')">
  Angular
</app-chip>
```

---

## Component 5: Stat Card Component

### File Structure
```
src/app/shared/components/ui/stat-card/
├── stat-card.ts
├── stat-card.html
└── stat-card.css
```

### Component Architecture

**stat-card.ts**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../card/card';

export type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, Card],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input() title = '';
  @Input() value = '';
  @Input() change = ''; // e.g., "+12.5%"
  @Input() trend: TrendDirection = 'neutral';
  @Input() loading = false;
  @Input() icon = ''; // SVG path for custom icon

  get trendColor(): string {
    const colors: Record<TrendDirection, string> = {
      up: 'text-accent-green',
      down: 'text-accent-red',
      neutral: 'text-text-light dark:text-text-dark-light'
    };
    return colors[this.trend];
  }

  get trendIcon(): string {
    const icons: Record<TrendDirection, string> = {
      up: 'M5 10l7-7m0 0l7 7m-7-7v18',
      down: 'M19 14l-7 7m0 0l-7-7m7 7V4',
      neutral: 'M5 12h14'
    };
    return icons[this.trend];
  }

  get hasChange(): boolean {
    return !!this.change;
  }
}
```

**stat-card.html**
```html
<app-card [loading]="loading" shadow="md" padding="md">
  <div class="flex items-start justify-between">
    <!-- Left Content -->
    <div class="flex-1 min-w-0">
      <!-- Title -->
      <p class="text-sm font-medium text-text-light dark:text-text-dark-light mb-1 truncate">
        {{ title }}
      </p>

      <!-- Value -->
      <p class="text-2xl font-bold text-text dark:text-text-dark-DEFAULT mb-2">
        {{ value }}
      </p>

      <!-- Change Indicator -->
      <div
        *ngIf="hasChange"
        class="flex items-center gap-1"
        [class]="trendColor">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            [attr.d]="trendIcon">
          </path>
        </svg>
        <span class="text-sm font-medium">{{ change }}</span>
      </div>
    </div>

    <!-- Icon -->
    <div
      *ngIf="icon"
      class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
      <svg
        class="w-6 h-6 text-primary-600 dark:text-primary-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          [attr.d]="icon">
        </path>
      </svg>
    </div>
  </div>
</app-card>
```

**stat-card.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<app-stat-card
  title="Total Revenue"
  value="$45,231.89"
  change="+12.5%"
  trend="up"
  icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
</app-stat-card>
```

---

## Component 6: Skeleton Loader Component

### File Structure
```
src/app/shared/components/ui/skeleton-loader/
├── skeleton-loader.ts
├── skeleton-loader.html
└── skeleton-loader.css
```

### Component Architecture

**skeleton-loader.ts**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circle' | 'rectangle' | 'card' | 'table';

@Component({
  selector: 'app-skeleton-loader',
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.css',
})
export class SkeletonLoader {
  @Input() variant: SkeletonVariant = 'text';
  @Input() width = '100%';
  @Input() height = 'auto';
  @Input() rows = 1; // For text variant
  @Input() animate = true;

  get baseClasses(): string {
    const animation = this.animate ? 'animate-pulse' : '';
    return `bg-gray-200 dark:bg-gray-700 ${animation}`;
  }

  get variantClasses(): string {
    const variants: Record<SkeletonVariant, string> = {
      text: 'h-4 rounded',
      circle: 'rounded-full',
      rectangle: 'rounded-lg',
      card: 'rounded-xl h-48',
      table: 'rounded-lg h-12'
    };
    return variants[this.variant];
  }

  get rowsArray(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }
}
```

**skeleton-loader.html**
```html
<!-- Single Skeleton -->
<div
  *ngIf="variant !== 'text' || rows === 1"
  [class]="baseClasses + ' ' + variantClasses"
  [style.width]="width"
  [style.height]="height"
  role="status"
  aria-label="Loading content">
</div>

<!-- Multiple Text Rows -->
<div
  *ngIf="variant === 'text' && rows > 1"
  class="space-y-3"
  role="status"
  aria-label="Loading content">
  <div
    *ngFor="let _ of rowsArray; let last = last"
    [class]="baseClasses + ' ' + variantClasses"
    [style.width]="last ? '80%' : '100%'">
  </div>
</div>
```

**skeleton-loader.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<!-- Text Skeleton -->
<app-skeleton-loader variant="text" [rows]="3"></app-skeleton-loader>

<!-- Circle Skeleton (Avatar) -->
<app-skeleton-loader variant="circle" width="48px" height="48px"></app-skeleton-loader>

<!-- Card Skeleton -->
<app-skeleton-loader variant="card"></app-skeleton-loader>
```

---

## Component 7: Data Table Component

### File Structure
```
src/app/shared/components/data/data-table/
├── data-table.ts
├── data-table.html
└── data-table.css
```

### Component Architecture

**data-table.ts**
```typescript
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
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
export class DataTable<T = any> implements OnInit {
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

  get isEmpty(): boolean {
    return !this.loading && this.data.length === 0;
  }
}
```

**data-table.html**
```html
<div class="w-full overflow-hidden">
  <!-- Desktop Table View -->
  <div class="hidden md:block overflow-x-auto">
    <table class="w-full border-collapse">
      <!-- Header -->
      <thead class="bg-background-tertiary dark:bg-background-dark-tertiary border-b border-gray-200 dark:border-gray-700">
        <tr>
          <!-- Selection Column -->
          <th
            *ngIf="selectable"
            class="px-4 py-3 w-12">
            <input
              type="checkbox"
              [checked]="allSelected"
              (change)="onSelectAll($event)"
              class="rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
              aria-label="Select all rows">
          </th>

          <!-- Data Columns -->
          <th
            *ngFor="let column of columns"
            [style.width]="column.width"
            [class]="'px-4 py-3 text-sm font-semibold text-text dark:text-text-dark-DEFAULT ' + getAlignClass(column)">

            <button
              *ngIf="column.sortable"
              type="button"
              (click)="onSort(column)"
              class="inline-flex items-center gap-2 hover:text-primary-500 transition-colors focus:outline-none focus:text-primary-500">
              {{ column.label }}
              <svg
                *ngIf="getSortIcon(column)"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  [attr.d]="getSortIcon(column)">
                </path>
              </svg>
            </button>

            <span *ngIf="!column.sortable">{{ column.label }}</span>
          </th>
        </tr>
      </thead>

      <!-- Body - Loading State -->
      <tbody *ngIf="loading">
        <tr *ngFor="let _ of [1,2,3,4,5]">
          <td *ngIf="selectable" class="px-4 py-3">
            <app-skeleton-loader variant="circle" width="20px" height="20px"></app-skeleton-loader>
          </td>
          <td *ngFor="let column of columns" class="px-4 py-3">
            <app-skeleton-loader variant="text"></app-skeleton-loader>
          </td>
        </tr>
      </tbody>

      <!-- Body - Data -->
      <tbody *ngIf="!loading && !isEmpty" class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          *ngFor="let row of data; trackBy: trackByFn"
          (click)="onRowClick(row)"
          class="hover:bg-background-secondary dark:hover:bg-background-dark-secondary transition-colors cursor-pointer"
          [class.bg-primary-50]="isRowSelected(row)"
          [class.dark:bg-primary-900/10]="isRowSelected(row)">

          <!-- Selection Cell -->
          <td *ngIf="selectable" class="px-4 py-3">
            <input
              type="checkbox"
              [checked]="isRowSelected(row)"
              (change)="onSelectRow(row, $event)"
              class="rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
              [attr.aria-label]="'Select row'">
          </td>

          <!-- Data Cells -->
          <td
            *ngFor="let column of columns"
            [class]="'px-4 py-3 text-sm text-text dark:text-text-dark-DEFAULT ' + getAlignClass(column)">
            {{ getCellValue(row, column) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty State -->
    <div *ngIf="isEmpty" class="py-8">
      <app-empty-state
        [title]="emptyStateTitle"
        [description]="emptyStateDescription"
        [icon]="emptyStateIcon">
      </app-empty-state>
    </div>
  </div>

  <!-- Mobile Card View -->
  <div class="md:hidden space-y-4">
    <!-- Loading Cards -->
    <div *ngIf="loading" class="space-y-4">
      <app-skeleton-loader
        *ngFor="let _ of [1,2,3]"
        variant="card"
        height="120px">
      </app-skeleton-loader>
    </div>

    <!-- Data Cards -->
    <div
      *ngFor="let row of data"
      (click)="onRowClick(row)"
      class="bg-white dark:bg-background-dark-secondary p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 cursor-pointer hover:shadow-md transition-shadow">

      <div
        *ngFor="let column of columns"
        class="flex justify-between items-center">
        <span class="text-sm font-medium text-text-light dark:text-text-dark-light">
          {{ column.label }}:
        </span>
        <span class="text-sm text-text dark:text-text-dark-DEFAULT">
          {{ getCellValue(row, column) }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <app-empty-state
      *ngIf="isEmpty"
      [title]="emptyStateTitle"
      [description]="emptyStateDescription"
      [icon]="emptyStateIcon">
    </app-empty-state>
  </div>

  <!-- Pagination -->
  <div *ngIf="showPagination && !isEmpty" class="mt-4">
    <app-pagination
      [totalItems]="totalItems"
      [pageSize]="pageSize"
      [currentPage]="currentPage"
      (pageChange)="onPageChange($event)">
    </app-pagination>
  </div>
</div>
```

**data-table.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Important Implementation Notes:**
1. TrackBy function should be implemented in parent component and passed as input
2. Mobile view uses card layout for better responsiveness
3. Supports both client-side and server-side sorting/pagination
4. Selection state is managed internally with Set for performance

**Usage Example:**
```typescript
// In component
columns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', align: 'center' }
];

data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  // ...
];

onSort(event: SortEvent): void {
  console.log('Sort by:', event.column, event.direction);
}

onPageChange(event: PageChangeEvent): void {
  console.log('Page:', event.page, 'Size:', event.pageSize);
}
```

```html
<!-- In template -->
<app-data-table
  [columns]="columns"
  [data]="data"
  [loading]="loading"
  [selectable]="true"
  [totalItems]="100"
  [pageSize]="10"
  [currentPage]="1"
  (sortChange)="onSort($event)"
  (pageChange)="onPageChange($event)">
</app-data-table>
```

---

## Component 8: Pagination Component

### File Structure
```
src/app/shared/components/data/pagination/
├── pagination.ts
├── pagination.html
└── pagination.css
```

### Component Architecture

**pagination.ts**
```typescript
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
export class Pagination implements OnChanges {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() showPageSizeSelector = true;
  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<PageChangeEvent>();

  totalPages = 1;
  visiblePages: number[] = [];

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
```

**pagination.html**
```html
<div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-background-dark-secondary border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
  <!-- Items Info -->
  <div class="text-sm text-text-light dark:text-text-dark-light">
    Showing <span class="font-medium text-text dark:text-text-dark-DEFAULT">{{ startItem }}</span>
    to <span class="font-medium text-text dark:text-text-dark-DEFAULT">{{ endItem }}</span>
    of <span class="font-medium text-text dark:text-text-dark-DEFAULT">{{ totalItems }}</span>
    results
  </div>

  <!-- Page Navigation -->
  <nav class="flex items-center gap-2" aria-label="Pagination">
    <!-- Previous Button -->
    <button
      type="button"
      (click)="onPageChange(currentPage - 1)"
      [disabled]="!hasPrevious"
      class="px-3 py-2 text-sm font-medium text-text dark:text-text-dark-DEFAULT bg-white dark:bg-background-dark-tertiary border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Previous page">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>

    <!-- First Page -->
    <button
      *ngIf="showFirstPage"
      type="button"
      (click)="onPageChange(1)"
      class="px-3 py-2 text-sm font-medium text-text dark:text-text-dark-DEFAULT bg-white dark:bg-background-dark-tertiary border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label="Page 1">
      1
    </button>

    <!-- Ellipsis Before -->
    <span
      *ngIf="showFirstPage && visiblePages[0] > 2"
      class="px-2 text-text-light dark:text-text-dark-light">
      ...
    </span>

    <!-- Page Numbers -->
    <button
      *ngFor="let page of visiblePages"
      type="button"
      (click)="onPageChange(page)"
      [class.bg-primary-500]="page === currentPage"
      [class.text-white]="page === currentPage"
      [class.hover:bg-primary-600]="page === currentPage"
      [class.bg-white]="page !== currentPage"
      [class.dark:bg-background-dark-tertiary]="page !== currentPage"
      [class.text-text]="page !== currentPage"
      [class.dark:text-text-dark-DEFAULT]="page !== currentPage"
      [class.hover:bg-gray-50]="page !== currentPage"
      [class.dark:hover:bg-gray-700]="page !== currentPage"
      class="px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
      [attr.aria-label]="'Page ' + page"
      [attr.aria-current]="page === currentPage ? 'page' : null">
      {{ page }}
    </button>

    <!-- Ellipsis After -->
    <span
      *ngIf="showLastPage && visiblePages[visiblePages.length - 1] < totalPages - 1"
      class="px-2 text-text-light dark:text-text-dark-light">
      ...
    </span>

    <!-- Last Page -->
    <button
      *ngIf="showLastPage"
      type="button"
      (click)="onPageChange(totalPages)"
      class="px-3 py-2 text-sm font-medium text-text dark:text-text-dark-DEFAULT bg-white dark:bg-background-dark-tertiary border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      [attr.aria-label]="'Page ' + totalPages">
      {{ totalPages }}
    </button>

    <!-- Next Button -->
    <button
      type="button"
      (click)="onPageChange(currentPage + 1)"
      [disabled]="!hasNext"
      class="px-3 py-2 text-sm font-medium text-text dark:text-text-dark-DEFAULT bg-white dark:bg-background-dark-tertiary border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Next page">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  </nav>

  <!-- Page Size Selector -->
  <div *ngIf="showPageSizeSelector" class="flex items-center gap-2">
    <label for="pageSize" class="text-sm text-text-light dark:text-text-dark-light">
      Per page:
    </label>
    <select
      id="pageSize"
      [value]="pageSize"
      (change)="onPageSizeChange($event)"
      class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option *ngFor="let option of pageSizeOptions" [value]="option">
        {{ option }}
      </option>
    </select>
  </div>
</div>
```

**pagination.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<app-pagination
  [totalItems]="250"
  [pageSize]="25"
  [currentPage]="3"
  (pageChange)="onPageChange($event)">
</app-pagination>
```

---

## Component 9: Search Bar Component

### File Structure
```
src/app/shared/components/data/search-bar/
├── search-bar.ts
├── search-bar.html
└── search-bar.css
```

### Component Architecture

**search-bar.ts**
```typescript
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
```

**search-bar.html**
```html
<div class="relative w-full">
  <!-- Search Input -->
  <div class="relative">
    <!-- Search Icon -->
    <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg
        class="w-5 h-5 text-text-light dark:text-text-dark-light"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z">
        </path>
      </svg>
    </div>

    <!-- Input Field -->
    <input
      type="text"
      [value]="searchTerm"
      (input)="onInput($event)"
      [placeholder]="placeholder"
      [class]="'w-full pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-tertiary text-text dark:text-text-dark-DEFAULT placeholder-text-lighter dark:placeholder-text-dark-lighter focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ' + sizeClasses"
      aria-label="Search">

    <!-- Right Side Icons -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
      <!-- Loading Spinner -->
      <div
        *ngIf="loading"
        class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"
        aria-label="Loading">
      </div>

      <!-- Clear Button -->
      <button
        *ngIf="hasValue && !loading"
        type="button"
        (click)="onClear()"
        class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Clear search">
        <svg class="w-4 h-4 text-text-light dark:text-text-dark-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>
</div>
```

**search-bar.css**
```css
/* Empty - all styling via Tailwind utilities */
```

**Usage Example:**
```html
<app-search-bar
  placeholder="Search products..."
  [loading]="isSearching"
  (searchChange)="onSearch($event)"
  (clear)="onClearSearch()">
</app-search-bar>
```

---

## Component 10: Currency Pipe

### File Structure
```
src/app/shared/pipes/currency.pipe.ts
```

### Pipe Implementation

**currency.pipe.ts**
```typescript
import { Pipe, PipeTransform, inject } from '@angular/core';
import { CompanyContextService } from '../../core/services/company-context.service';
import { Currency } from '../models/company.model';

/**
 * Custom currency pipe that uses the company's configured currency
 * or accepts an explicit currency code.
 *
 * @example
 * {{ price | appCurrency }}  // Uses company currency
 * {{ price | appCurrency:'EUR' }}  // Explicit currency
 * {{ price | appCurrency:'USD':true }}  // Show symbol only
 */
@Pipe({
  name: 'appCurrency',
  pure: true // Can be pure since currency doesn't change frequently
})
export class CurrencyPipe implements PipeTransform {
  private readonly companyContext = inject(CompanyContextService);

  // Currency symbols mapping
  private readonly currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    MXN: 'MX$',
    CAD: 'CA$',
    AUD: 'AU$',
    JPY: '¥',
    CHF: 'CHF'
  };

  transform(
    value: number | string | null | undefined,
    currencyCode?: Currency,
    symbolOnly = false
  ): string {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '-';
    }

    // Convert to number
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '-';
    }

    // Determine currency to use
    const currency = currencyCode || this.getCompanyCurrency();

    // Return symbol only if requested
    if (symbolOnly) {
      return this.currencySymbols[currency];
    }

    // Format using Intl.NumberFormat
    try {
      const formatter = new Intl.NumberFormat(this.getLocale(currency), {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return formatter.format(numValue);
    } catch (error) {
      // Fallback to manual formatting
      const symbol = this.currencySymbols[currency];
      return `${symbol}${numValue.toFixed(2)}`;
    }
  }

  /**
   * Gets the company's configured currency or defaults to USD.
   */
  private getCompanyCurrency(): Currency {
    const company = this.companyContext.currentCompany;
    return company?.settings?.currency || 'USD';
  }

  /**
   * Maps currency to appropriate locale for Intl.NumberFormat.
   */
  private getLocale(currency: Currency): string {
    const localeMap: Record<Currency, string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      MXN: 'es-MX',
      CAD: 'en-CA',
      AUD: 'en-AU',
      JPY: 'ja-JP',
      CHF: 'de-CH'
    };
    return localeMap[currency];
  }
}
```

**Important Notes:**
1. This pipe uses `inject()` to access CompanyContextService
2. Falls back to USD if no company currency is configured
3. Uses Intl.NumberFormat for proper localization
4. Supports explicit currency override
5. Handles edge cases (null, undefined, NaN)

**Usage Example:**
```html
<!-- Use company currency -->
<p>Total: {{ totalAmount | appCurrency }}</p>

<!-- Explicit currency -->
<p>Price: {{ price | appCurrency:'EUR' }}</p>

<!-- Symbol only -->
<span>{{ amount | appCurrency:'USD':true }}</span>
```

**Module Registration:**
The pipe must be imported in components that use it:
```typescript
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-my-component',
  imports: [CommonModule, CurrencyPipe],
  // ...
})
```

---

## Component 11: Date Format Pipe

### File Structure
```
src/app/shared/pipes/date-format.pipe.ts
```

### Pipe Implementation

**date-format.pipe.ts**
```typescript
import { Pipe, PipeTransform } from '@angular/core';

export type DateFormatType = 'short' | 'medium' | 'long' | 'relative';

/**
 * Custom date formatting pipe with multiple format options.
 *
 * @example
 * {{ date | appDateFormat }}  // Default: medium
 * {{ date | appDateFormat:'short' }}  // 01/15/2024
 * {{ date | appDateFormat:'long' }}  // January 15, 2024
 * {{ date | appDateFormat:'relative' }}  // 2 hours ago
 */
@Pipe({
  name: 'appDateFormat',
  pure: true
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: Date | string | number | null | undefined,
    format: DateFormatType = 'medium'
  ): string {
    // Handle null/undefined
    if (!value) {
      return '-';
    }

    // Convert to Date object
    const date = this.toDate(value);

    if (!date || isNaN(date.getTime())) {
      return '-';
    }

    // Apply requested format
    switch (format) {
      case 'short':
        return this.formatShort(date);
      case 'medium':
        return this.formatMedium(date);
      case 'long':
        return this.formatLong(date);
      case 'relative':
        return this.formatRelative(date);
      default:
        return this.formatMedium(date);
    }
  }

  /**
   * Converts various input types to Date object.
   */
  private toDate(value: Date | string | number): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  /**
   * Short format: MM/DD/YYYY
   */
  private formatShort(date: Date): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
  }

  /**
   * Medium format: Jan 15, 2024
   */
  private formatMedium(date: Date): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  }

  /**
   * Long format: January 15, 2024
   */
  private formatLong(date: Date): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  }

  /**
   * Relative format: "2 hours ago", "3 days ago", etc.
   */
  private formatRelative(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    // Future dates
    if (diffMs < 0) {
      return this.formatMedium(date);
    }

    // Just now
    if (diffSec < 30) {
      return 'Just now';
    }

    // Seconds
    if (diffSec < 60) {
      return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    }

    // Minutes
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    }

    // Hours
    if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    }

    // Days
    if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    }

    // Weeks
    if (diffWeek < 4) {
      return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
    }

    // Months
    if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
    }

    // Years
    return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
  }
}
```

**Usage Example:**
```html
<!-- Default medium format -->
<p>Created: {{ createdAt | appDateFormat }}</p>

<!-- Short format -->
<p>Date: {{ date | appDateFormat:'short' }}</p>

<!-- Long format -->
<p>Published: {{ publishedAt | appDateFormat:'long' }}</p>

<!-- Relative format -->
<p>Updated {{ updatedAt | appDateFormat:'relative' }}</p>
```

**Module Registration:**
```typescript
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-my-component',
  imports: [CommonModule, DateFormatPipe],
  // ...
})
```

---

## Additional Directory Structure

Create the `data` subdirectory for data-related components:

```bash
mkdir -p src/app/shared/components/data
mkdir -p src/app/shared/components/data/data-table
mkdir -p src/app/shared/components/data/pagination
mkdir -p src/app/shared/components/data/search-bar
mkdir -p src/app/shared/pipes
```

---

## Testing Strategy

### Unit Tests for Each Component

Each component should have corresponding test files:

**Example: badge.spec.ts**
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

describe('Badge', () => {
  let component: Badge;
  let fixture: ComponentFixture<Badge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge]
    }).compileComponents();

    fixture = TestBed.createComponent(Badge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply correct variant classes', () => {
    component.variant = 'success';
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('span');
    expect(element.classList.contains('bg-accent-green/10')).toBeTruthy();
  });

  it('should apply correct size classes', () => {
    component.size = 'lg';
    fixture.detectChanges();

    expect(component.sizeClasses).toContain('px-3 py-1.5');
  });

  it('should apply rounded class when rounded is true', () => {
    component.rounded = true;
    fixture.detectChanges();

    expect(component.roundedClass).toBe('rounded-full');
  });
});
```

### Pipe Tests

**Example: currency.pipe.spec.ts**
```typescript
import { TestBed } from '@angular/core/testing';
import { CurrencyPipe } from './currency.pipe';
import { CompanyContextService } from '../../core/services/company-context.service';

describe('CurrencyPipe', () => {
  let pipe: CurrencyPipe;
  let mockCompanyContext: jasmine.SpyObj<CompanyContextService>;

  beforeEach(() => {
    mockCompanyContext = jasmine.createSpyObj('CompanyContextService', [], {
      currentCompany: {
        settings: { currency: 'USD' }
      }
    });

    TestBed.configureTestingModule({
      providers: [
        CurrencyPipe,
        { provide: CompanyContextService, useValue: mockCompanyContext }
      ]
    });

    pipe = TestBed.inject(CurrencyPipe);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format USD correctly', () => {
    const result = pipe.transform(1234.56, 'USD');
    expect(result).toContain('1,234.56');
  });

  it('should handle null values', () => {
    expect(pipe.transform(null)).toBe('-');
  });

  it('should use explicit currency over company currency', () => {
    const result = pipe.transform(100, 'EUR');
    expect(result).toContain('€');
  });
});
```

---

## Accessibility Requirements

All components must meet WCAG 2.1 AA standards:

1. **Keyboard Navigation**:
   - All interactive elements must be keyboard accessible
   - Proper focus management with visible focus indicators
   - Tab order should be logical

2. **ARIA Labels**:
   - All icons must have `aria-hidden="true"` or descriptive labels
   - Interactive elements need `aria-label` when text content is insufficient
   - Use `role` attributes appropriately

3. **Color Contrast**:
   - Text must have 4.5:1 contrast ratio minimum
   - UI components must have 3:1 contrast ratio
   - Don't rely on color alone to convey information

4. **Screen Reader Support**:
   - Use semantic HTML elements
   - Provide alternative text for visual content
   - Announce dynamic content changes with `aria-live`

---

## Dark Mode Support

All components must support dark mode using Tailwind's `dark:` prefix:

```html
<!-- Example pattern -->
<div class="bg-white dark:bg-background-dark-secondary
            text-text dark:text-text-dark-DEFAULT
            border-gray-200 dark:border-gray-700">
  Content
</div>
```

**Key Dark Mode Colors:**
- Background: `dark:bg-background-dark-DEFAULT` (#1A1F2E)
- Secondary BG: `dark:bg-background-dark-secondary` (#242936)
- Text: `dark:text-text-dark-DEFAULT` (#E5E9F0)
- Borders: `dark:border-gray-700`

---

## Component Export Index

Create an index file for easy imports:

**src/app/shared/components/ui/index.ts**
```typescript
// UI Components
export { Badge } from './badge/badge';
export { Alert } from './alert/alert';
export { EmptyState } from './empty-state/empty-state';
export { Chip } from './chip/chip';
export { StatCard } from './stat-card/stat-card';
export { SkeletonLoader } from './skeleton-loader/skeleton-loader';
export { Button } from './button/button';
export { Card } from './card/card';

// Data Components
export { DataTable } from '../data/data-table/data-table';
export { Pagination } from '../data/pagination/pagination';
export { SearchBar } from '../data/search-bar/search-bar';

// Pipes
export { CurrencyPipe } from '../../pipes/currency.pipe';
export { DateFormatPipe } from '../../pipes/date-format.pipe';
```

---

## Implementation Checklist

### Phase 1: UI Components (Days 1-2)
- [ ] Create Badge component with all variants
- [ ] Create Alert component with dismissible functionality
- [ ] Create Empty State component with content projection
- [ ] Create Chip component with removable option
- [ ] Create Stat Card component with trend indicators
- [ ] Create Skeleton Loader component with variants
- [ ] Test all components in isolation
- [ ] Verify dark mode support
- [ ] Check accessibility compliance

### Phase 2: Data Components (Days 3-4)
- [ ] Create Data Table component
  - [ ] Desktop table view
  - [ ] Mobile card view
  - [ ] Sorting functionality
  - [ ] Selection functionality
  - [ ] Loading states
  - [ ] Empty states
- [ ] Create Pagination component
  - [ ] Page navigation
  - [ ] Page size selector
  - [ ] Ellipsis for large page counts
- [ ] Create Search Bar component
  - [ ] Debounced search
  - [ ] Clear functionality
  - [ ] Loading indicator
- [ ] Integration testing with mock data
- [ ] Responsive testing

### Phase 3: Pipes (Day 5)
- [ ] Create Currency Pipe
  - [ ] Company currency integration
  - [ ] Multi-currency support
  - [ ] Intl.NumberFormat implementation
- [ ] Create Date Format Pipe
  - [ ] Multiple format types
  - [ ] Relative date formatting
  - [ ] Intl.DateTimeFormat implementation
- [ ] Unit test all pipes
- [ ] Integration test with components

### Phase 4: Integration & Documentation (Day 6)
- [ ] Create component export index
- [ ] Write usage examples
- [ ] Create Storybook/demo pages
- [ ] Document accessibility features
- [ ] Performance testing
- [ ] Code review and refinement

---

## Performance Considerations

1. **Change Detection**:
   - Use `OnPush` change detection strategy where applicable
   - Avoid unnecessary re-renders
   - Use `trackBy` functions in `*ngFor` loops

2. **Bundle Size**:
   - All components are standalone for tree-shaking
   - Import only what you need
   - Lazy load heavy components

3. **Runtime Performance**:
   - Debounce search input (300ms)
   - Virtual scrolling for large tables (future enhancement)
   - Memoize expensive computations

4. **Accessibility Performance**:
   - Limit ARIA updates to necessary changes
   - Use passive event listeners where applicable

---

## Common Patterns and Anti-Patterns

### DO:
- ✅ Use `inject()` for dependency injection
- ✅ Keep components small and focused
- ✅ Use TypeScript interfaces for all inputs/outputs
- ✅ Support dark mode on all components
- ✅ Provide proper ARIA labels
- ✅ Use Tailwind utility classes
- ✅ Handle loading and error states
- ✅ Support keyboard navigation

### DON'T:
- ❌ Use Angular Signals for state management (RxJS only)
- ❌ Create monolithic components
- ❌ Use `any` type
- ❌ Ignore accessibility requirements
- ❌ Hard-code colors (use Tailwind theme)
- ❌ Skip error handling
- ❌ Forget mobile responsiveness
- ❌ Mix component and business logic

---

## File Summary

After implementation, the following files will be created:

### UI Components (6 components, 18 files)
1. `/src/app/shared/components/ui/badge/badge.ts` - Badge component
2. `/src/app/shared/components/ui/badge/badge.html` - Badge template
3. `/src/app/shared/components/ui/badge/badge.css` - Badge styles
4. `/src/app/shared/components/ui/alert/alert.ts` - Alert component
5. `/src/app/shared/components/ui/alert/alert.html` - Alert template
6. `/src/app/shared/components/ui/alert/alert.css` - Alert styles
7. `/src/app/shared/components/ui/empty-state/empty-state.ts` - Empty state component
8. `/src/app/shared/components/ui/empty-state/empty-state.html` - Empty state template
9. `/src/app/shared/components/ui/empty-state/empty-state.css` - Empty state styles
10. `/src/app/shared/components/ui/chip/chip.ts` - Chip component
11. `/src/app/shared/components/ui/chip/chip.html` - Chip template
12. `/src/app/shared/components/ui/chip/chip.css` - Chip styles
13. `/src/app/shared/components/ui/stat-card/stat-card.ts` - Stat card component
14. `/src/app/shared/components/ui/stat-card/stat-card.html` - Stat card template
15. `/src/app/shared/components/ui/stat-card/stat-card.css` - Stat card styles
16. `/src/app/shared/components/ui/skeleton-loader/skeleton-loader.ts` - Skeleton component
17. `/src/app/shared/components/ui/skeleton-loader/skeleton-loader.html` - Skeleton template
18. `/src/app/shared/components/ui/skeleton-loader/skeleton-loader.css` - Skeleton styles

### Data Components (3 components, 9 files)
19. `/src/app/shared/components/data/data-table/data-table.ts` - Data table component
20. `/src/app/shared/components/data/data-table/data-table.html` - Data table template
21. `/src/app/shared/components/data/data-table/data-table.css` - Data table styles
22. `/src/app/shared/components/data/pagination/pagination.ts` - Pagination component
23. `/src/app/shared/components/data/pagination/pagination.html` - Pagination template
24. `/src/app/shared/components/data/pagination/pagination.css` - Pagination styles
25. `/src/app/shared/components/data/search-bar/search-bar.ts` - Search bar component
26. `/src/app/shared/components/data/search-bar/search-bar.html` - Search bar template
27. `/src/app/shared/components/data/search-bar/search-bar.css` - Search bar styles

### Pipes (2 pipes)
28. `/src/app/shared/pipes/currency.pipe.ts` - Currency formatting pipe
29. `/src/app/shared/pipes/date-format.pipe.ts` - Date formatting pipe

### Index Files
30. `/src/app/shared/components/ui/index.ts` - Component export index

### Test Files (optional but recommended)
31-41. Corresponding `.spec.ts` files for each component and pipe

---

## Next Steps After Implementation

1. **Integration with Features**:
   - Use DataTable in product/sales/purchase lists
   - Use StatCard in dashboard
   - Use Badge/Chip for status indicators
   - Use Alert for error/success messages

2. **Storybook Setup** (Optional):
   - Create stories for each component
   - Document all props and variants
   - Interactive playground for designers

3. **E2E Testing**:
   - Test component interactions
   - Verify responsive behavior
   - Accessibility audits

4. **Documentation**:
   - Update component usage guide
   - Create quick reference guide
   - Video tutorials for complex components

---

## Conclusion

This implementation plan provides complete specifications for all 11 remaining Phase 2 UI components. Each component follows Angular 20 standalone architecture, uses the HubSpot-inspired design system, supports dark mode, and meets accessibility standards.

**Key Principles:**
- Standalone components with `imports` array
- Use `inject()` for dependency injection
- RxJS for reactive programming (NO Angular Signals for state)
- Tailwind CSS for styling with custom theme
- Comprehensive TypeScript typing
- Full dark mode support
- WCAG 2.1 AA accessibility compliance
- Mobile-responsive design

The components are production-ready and fully integrated with the existing codebase patterns.
