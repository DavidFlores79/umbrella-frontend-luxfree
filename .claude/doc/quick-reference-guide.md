# Quick Reference: Design System & Components Implementation

## 1. TAILWIND CONFIG SETUP (5 minutes)

```bash
# Install dependencies
npm install -D tailwindcss postcss autoprefixer
npm install chart.js ng2-charts

# Generate base files
npx tailwindcss init -p
```

**Then copy contents from `.claude/doc/tailwind-config-reference.js` to `/tailwind.config.js`**

**Update `/src/styles.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom layer for project-specific utilities */
@layer components {
  .sidebar-layout {
    @apply grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4;
  }

  .form-grid {
    @apply grid grid-cols-1 md:grid-cols-2 gap-4;
  }
}
```

**Add to `app.config.ts`:**
```typescript
import { ThemeService } from './core/services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    ThemeService  // Add theme service for dark mode
  ]
};
```

---

## 2. THEME SERVICE (Dark Mode Toggle)

**File:** `/src/app/core/services/theme.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(
    this.getInitialTheme()
  );

  readonly isDarkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  toggle(): void {
    const newValue = !this.darkModeSubject.value;
    this.setTheme(newValue);
  }

  private setTheme(isDark: boolean): void {
    this.darkModeSubject.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private initializeTheme(): void {
    if (this.darkModeSubject.value) {
      document.documentElement.classList.add('dark');
    }
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';

    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
```

---

## 3. FORM VALIDATION PATTERN (Submit-Only)

**Directive:** `/src/app/shared/directives/submit-validation.directive.ts`

```typescript
import { Directive, HostListener } from '@angular/core';
import { NgForm, FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '[appSubmitValidation]',
  exportAs: 'appSubmitValidation',
  standalone: true
})
export class SubmitValidationDirective {
  private form: NgForm | FormGroupDirective | null = null;
  submitted = false;

  constructor(form: NgForm | FormGroupDirective) {
    this.form = form;
  }

  @HostListener('ngSubmit')
  onSubmit(): void {
    this.submitted = true;
  }

  shouldShowError(fieldName: string): boolean {
    if (!this.form) return false;

    const control = this.form.form?.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
  }

  markAllAsTouched(): void {
    if (this.form?.form) {
      Object.keys(this.form.form.controls).forEach(key => {
        this.form!.form?.get(key)?.markAsTouched();
      });
    }
  }
}

// Usage in component:
// <form [formGroup]="form" (ngSubmit)="onSubmit()" appSubmitValidation #submitForm="appSubmitValidation">
//   <app-form-input
//     [control]="form.get('email')!"
//     [showError]="submitForm.shouldShowError('email')"
//     label="Email">
//   </app-form-input>
// </form>
```

**Component Example:**
```typescript
@Component({
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()"
          appSubmitValidation #submitForm="appSubmitValidation">

      <div class="form-grid">
        <!-- Text input -->
        <app-form-input
          [control]="form.get('firstName')!"
          label="First Name"
          [showError]="submitForm.shouldShowError('firstName')">
        </app-form-input>

        <!-- Select dropdown -->
        <app-form-select
          [control]="form.get('role')!"
          [options]="roleOptions"
          label="Role"
          [showError]="submitForm.shouldShowError('role')">
        </app-form-select>

        <!-- Checkbox -->
        <app-form-checkbox
          [control]="form.get('isActive')!"
          label="Active User"
          [showError]="submitForm.shouldShowError('isActive')">
        </app-form-checkbox>

        <!-- Toggle -->
        <app-form-toggle
          [control]="form.get('notifications')!"
          label="Enable Notifications"
          [showError]="submitForm.shouldShowError('notifications')">
        </app-form-toggle>

        <!-- Date picker -->
        <app-form-datepicker
          [control]="form.get('joinDate')!"
          label="Join Date"
          [showError]="submitForm.shouldShowError('joinDate')">
        </app-form-datepicker>
      </div>

      <div class="flex gap-3 mt-6">
        <button type="button" class="btn-secondary" (click)="onCancel()">
          Cancel
        </button>
        <button type="submit" class="btn-primary" [disabled]="form.invalid">
          Save
        </button>
      </div>
    </form>
  `
})
export class UserFormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      role: ['user', Validators.required],
      isActive: [true],
      notifications: [false],
      joinDate: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
      // Submit logic
    }
  }

  onCancel(): void {
    this.form.reset();
  }
}
```

---

## 4. DATA TABLE PATTERN (Custom Implementation)

**File:** `/src/app/shared/components/data/data-table.component.ts`

```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ColumnDef<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export interface TableConfig {
  pageSize: number;
  pageSizeOptions: number[];
  showSearch: boolean;
  showSelection: boolean;
  striped: boolean;
  hover: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Search and Controls -->
      <div *ngIf="config.showSearch" class="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearch($event)"
          class="input-base w-64">
      </div>

      <!-- Table -->
      <div class="overflow-x-auto card">
        <table class="w-full" role="table">
          <thead>
            <tr class="border-b border-border-light dark:border-border-dark">
              <!-- Selection Checkbox -->
              <th *ngIf="config.showSelection" class="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  [checked]="allSelected"
                  (change)="toggleSelectAll($event)">
              </th>

              <!-- Column Headers -->
              <th *ngFor="let col of columns"
                  [style.width]="col.width"
                  [class.cursor-pointer]="col.sortable"
                  (click)="col.sortable && onSort(col.key as string)"
                  class="px-4 py-3 text-left text-sm font-semibold text-text dark:text-text-inverse">
                {{ col.label }}
                <span *ngIf="col.sortable && sortBy === col.key" class="ml-2">
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- Data Rows -->
            <tr *ngFor="let row of paginatedData; let i = index"
                [class.bg-gray-50]="config.striped && i % 2 !== 0"
                [class.dark:bg-dark-bg-tertiary]="config.striped && i % 2 !== 0"
                [class.hover:bg-gray-100]="config.hover"
                [class.dark:hover:bg-gray-700]="config.hover"
                class="border-b border-border-light dark:border-border-dark transition-colors"
                (click)="onRowClick(row)">

              <!-- Selection Checkbox -->
              <td *ngIf="config.showSelection" class="px-4 py-3">
                <input
                  type="checkbox"
                  [checked]="isRowSelected(row)"
                  (click)="$event.stopPropagation()"
                  (change)="toggleRowSelection(row, $event)">
              </td>

              <!-- Data Cells -->
              <td *ngFor="let col of columns"
                  class="px-4 py-3 text-sm text-gray-700 dark:text-text-light">
                {{ getRowValue(row, col.key) }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr *ngIf="paginatedData.length === 0">
              <td [attr.colspan]="config.showSelection ? columns.length + 1 : columns.length"
                  class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center" *ngIf="totalPages > 1">
        <select [(ngModel)]="pageSize"
                (ngModelChange)="onPageSizeChange($event)"
                class="input-base w-32">
          <option *ngFor="let size of config.pageSizeOptions" [value]="size">
            {{ size }} per page
          </option>
        </select>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          Page {{ currentPage + 1 }} of {{ totalPages }}
        </div>

        <div class="flex gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage === 0"
            class="btn-secondary px-3 py-2 disabled:opacity-50">
            Previous
          </button>
          <button
            (click)="nextPage()"
            [disabled]="currentPage >= totalPages - 1"
            class="btn-secondary px-3 py-2 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  `
})
export class DataTableComponent<T> implements OnInit {
  @Input() data: T[] = [];
  @Input() columns: ColumnDef<T>[] = [];
  @Input() config: TableConfig = {
    pageSize: 10,
    pageSizeOptions: [5, 10, 20],
    showSearch: true,
    showSelection: false,
    striped: true,
    hover: true
  };

  @Output() rowClick = new EventEmitter<T>();

  searchTerm = '';
  sortBy: keyof T | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  currentPage = 0;
  pageSize = 10;
  selectedRows = new Set<T>();
  allSelected = false;

  filteredData: T[] = [];
  paginatedData: T[] = [];
  totalPages = 0;

  ngOnInit(): void {
    this.updateTable();
  }

  onSearch(term: string): void {
    this.currentPage = 0;
    this.updateTable();
  }

  onSort(key: string): void {
    if (this.sortBy === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = key as keyof T;
      this.sortOrder = 'asc';
    }
    this.updateTable();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.updateTable();
  }

  toggleRowSelection(row: T, event: Event): void {
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.updateSelectAllCheckbox();
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.filteredData.forEach(row => this.selectedRows.add(row));
    } else {
      this.selectedRows.clear();
    }
    this.updateSelectAllCheckbox();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updateTable();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateTable();
    }
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  isRowSelected(row: T): boolean {
    return this.selectedRows.has(row);
  }

  getRowValue(row: T, key: keyof T): any {
    return row[key];
  }

  private updateTable(): void {
    this.filteredData = this.filterData();
    this.filteredData = this.sortData(this.filteredData);
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.paginatedData = this.paginate(this.filteredData);
  }

  private filterData(): T[] {
    if (!this.searchTerm) return [...this.data];

    return this.data.filter(row =>
      this.columns.some(col =>
        String(row[col.key]).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  private sortData(data: T[]): T[] {
    if (!this.sortBy) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[this.sortBy as keyof T];
      const bVal = b[this.sortBy as keyof T];

      if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  private paginate(data: T[]): T[] {
    const start = this.currentPage * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  private updateSelectAllCheckbox(): void {
    this.allSelected = this.filteredData.length > 0 &&
      this.filteredData.every(row => this.selectedRows.has(row));
  }
}
```

**Usage in Feature:**
```typescript
@Component({
  template: `
    <app-data-table
      [data]="users$ | async"
      [columns]="columns"
      [config]="tableConfig"
      (rowClick)="onRowClick($event)">
    </app-data-table>
  `
})
export class UsersListComponent {
  columns: ColumnDef<User>[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'role', label: 'Role', sortable: true }
  ];

  tableConfig: TableConfig = {
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    showSearch: true,
    showSelection: true,
    striped: true,
    hover: true
  };

  users$ = this.store.users$;

  constructor(private store: UsersStore) {}

  onRowClick(user: User): void {
    // Handle row click
  }
}
```

---

## 5. SKELETON LOADER PATTERN

**File:** `/src/app/shared/components/feedback/skeleton.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse" [ngSwitch]="type">
      <!-- Card skeleton -->
      <div *ngSwitchCase="'card'" class="space-y-4">
        <div class="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Table row skeleton -->
      <div *ngSwitchCase="'table-row'" class="flex gap-2 mb-4">
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>

      <!-- Text skeleton -->
      <div *ngSwitchCase="'text'" class="space-y-2">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>

      <!-- Avatar skeleton -->
      <div *ngSwitchCase="'avatar'" class="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

      <!-- Chart skeleton -->
      <div *ngSwitchCase="'chart'" class="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  `
})
export class SkeletonComponent {
  @Input() type: 'card' | 'table-row' | 'text' | 'avatar' | 'chart' = 'card';
  @Input() count: number = 1;
}
```

**Usage in Template:**
```html
<!-- Loading state -->
<div *ngIf="loading$ | async; else loaded" class="space-y-4">
  <app-skeleton type="table-row" [count]="5"></app-skeleton>
</div>

<!-- Loaded state -->
<ng-template #loaded>
  <app-data-table [data]="data$ | async" [columns]="columns"></app-data-table>
</ng-template>
```

---

## 6. CHART.JS WITH NG2-CHARTS

**Installation:**
```bash
npm install chart.js ng2-charts
```

**File:** `/src/app/shared/components/ui/chart-card.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="card">
      <h3 class="text-lg font-semibold text-text dark:text-text-inverse mb-4">
        {{ title }}
      </h3>

      <canvas
        *ngIf="chartConfig; else loading"
        baseChart
        [type]="chartConfig.type"
        [data]="chartConfig.data"
        [options]="chartConfig.options">
      </canvas>

      <ng-template #loading>
        <app-skeleton type="chart"></app-skeleton>
      </ng-template>
    </div>
  `
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() chartConfig: ChartConfiguration | null = null;
}
```

**Usage in Feature:**
```typescript
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  template: `
    <app-chart-card
      title="Monthly Revenue"
      [chartConfig]="chartConfig">
    </app-chart-card>
  `
})
export class DashboardComponent implements OnInit {
  chartConfig: ChartConfiguration | null = null;

  ngOnInit(): void {
    this.chartConfig = {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [65, 59, 80, 81, 56, 55],
          borderColor: '#FF7A59',
          backgroundColor: 'rgba(255, 122, 89, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };
  }
}
```

---

## 7. RESPONSIVE TAILWIND CLASSES CHEAT SHEET

```html
<!-- Mobile-first responsive -->
<div class="w-full md:w-1/2 lg:w-1/3">
  Responsive width: 100% mobile, 50% tablet, 33% desktop
</div>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive grid
</div>

<!-- Flexbox responsive -->
<div class="flex flex-col md:flex-row gap-4">
  Stack on mobile, side-by-side on tablet+
</div>

<!-- Hide/show responsive -->
<div class="hidden md:block">
  Hidden on mobile, visible on tablet+
</div>

<!-- Spacing responsive -->
<div class="p-2 md:p-4 lg:p-6">
  Responsive padding
</div>

<!-- Text responsive -->
<h1 class="text-xl md:text-2xl lg:text-3xl">
  Responsive font size
</h1>
```

---

## 8. DARK MODE USAGE IN COMPONENTS

```html
<!-- Simple dark mode classes -->
<div class="bg-white dark:bg-dark-bg-secondary text-text dark:text-text-inverse">
  Content adapts to dark mode automatically
</div>

<!-- Color transitions -->
<button class="bg-coral dark:bg-coral-600 transition-colors duration-200">
  Dark mode with smooth transition
</button>

<!-- Conditional styling -->
<div class="border border-border-light dark:border-border-dark">
  Borders adapt to theme
</div>

<!-- Shadow adaptation -->
<div class="shadow-md dark:shadow-dark-md">
  Shadows are darker in dark mode
</div>
```

---

## 9. TESTING DARK MODE

```bash
# In browser DevTools, run:
document.documentElement.classList.add('dark');  # Enable dark mode
document.documentElement.classList.remove('dark'); # Disable dark mode

# Or use the theme toggle in header component
```

---

## 10. COMMON COMPONENT PATTERNS

### Alert Component
```html
<div class="alert-success">
  <span>✓</span>
  <span>Operation completed successfully</span>
</div>

<div class="alert-error">
  <span>✕</span>
  <span>An error occurred. Please try again.</span>
</div>
```

### Badge Component
```html
<span class="badge-primary">Premium</span>
<span class="badge-success">Active</span>
<span class="badge-warning">Pending</span>
<span class="badge-error">Inactive</span>
```

### Button Variants
```html
<button class="btn-primary">Primary Action</button>
<button class="btn-secondary">Secondary Action</button>
<button class="btn-ghost">Ghost Button</button>
<button class="btn-danger">Delete</button>
```

### Card Variants
```html
<div class="card">Default card</div>
<div class="card-elevated">Elevated card</div>
<div class="card-outlined">Outlined card</div>
```

---

## 11. COLOR REFERENCE FOR COPY-PASTE

HubSpot Colors in Tailwind classes:
- Primary: `bg-coral-500` / `text-coral` / `border-coral`
- Secondary: `bg-blue-500` / `text-blue`
- Success: `bg-success-500` / `text-success`
- Warning: `bg-warning-500` / `text-warning`
- Error: `bg-error-500` / `text-error`
- Text: `text-text` (dark mode: `dark:text-text-inverse`)
- Background: `bg-bg-light` (dark mode: `dark:bg-dark-bg-primary`)
- Border: `border-border-light` (dark mode: `dark:border-border-dark`)

---

## 12. IMPORTANT REMINDERS

✓ Always use `dark:` prefix for dark mode colors
✓ Always include `standalone: true` in components
✓ Always use responsive classes (mobile-first)
✓ Always add form validation hints for accessibility
✓ Always test on mobile, tablet, and desktop
✓ Always test in both light and dark modes
✓ Use `async` pipe to avoid manual subscriptions
✓ Never hardcode colors - use Tailwind classes

---

**Last Updated:** 2025-11-26
**Status:** Ready to implement
