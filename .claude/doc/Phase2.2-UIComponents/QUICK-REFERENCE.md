# Phase 2.2 UI Components - Quick Reference Guide

## Component Imports Quick Reference

```typescript
// UI Components
import { Badge } from '@shared/components/ui/badge/badge';
import { Alert } from '@shared/components/ui/alert/alert';
import { EmptyState } from '@shared/components/ui/empty-state/empty-state';
import { Chip } from '@shared/components/ui/chip/chip';
import { StatCard } from '@shared/components/ui/stat-card/stat-card';
import { SkeletonLoader } from '@shared/components/ui/skeleton-loader/skeleton-loader';

// Data Components
import { DataTable } from '@shared/components/data/data-table/data-table';
import { Pagination } from '@shared/components/data/pagination/pagination';
import { SearchBar } from '@shared/components/data/search-bar/search-bar';

// Pipes
import { CurrencyPipe } from '@shared/pipes/currency.pipe';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
```

---

## Badge

**Purpose**: Display status indicators with color variants

**Inputs**:
- `variant`: 'success' | 'warning' | 'error' | 'info' | 'default'
- `size`: 'sm' | 'md' | 'lg'
- `rounded`: boolean (pill shape)

**Quick Example**:
```html
<app-badge variant="success">Active</app-badge>
<app-badge variant="warning" size="sm" [rounded]="true">Pending</app-badge>
```

**Use Cases**:
- User status (Active/Inactive)
- Payment status
- Order status
- Feature flags

---

## Alert

**Purpose**: Display notification messages with optional dismiss

**Inputs**:
- `type`: 'success' | 'warning' | 'error' | 'info'
- `title`: string
- `dismissible`: boolean
- `showIcon`: boolean

**Outputs**:
- `dismissed`: EventEmitter<void>

**Quick Example**:
```html
<app-alert type="success" title="Success!" [dismissible]="true" (dismissed)="onDismiss()">
  Your changes have been saved successfully.
</app-alert>
```

**Use Cases**:
- Form submission feedback
- Error messages
- System notifications
- Warnings

---

## Empty State

**Purpose**: Display when no data is available

**Inputs**:
- `icon`: string (SVG path)
- `title`: string
- `description`: string
- `actionLabel`: string
- `actionVariant`: 'primary' | 'secondary' | 'danger' | 'ghost'

**Outputs**:
- `actionClick`: EventEmitter<void>

**Quick Example**:
```html
<app-empty-state
  title="No products found"
  description="Get started by creating your first product."
  actionLabel="Create Product"
  (actionClick)="onCreate()">
</app-empty-state>
```

**Use Cases**:
- Empty lists/tables
- No search results
- First-time user experience
- Deleted items view

---

## Chip

**Purpose**: Display removable tags/labels

**Inputs**:
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
- `removable`: boolean
- `disabled`: boolean

**Outputs**:
- `removed`: EventEmitter<void>

**Quick Example**:
```html
<app-chip variant="primary" [removable]="true" (removed)="onRemove()">
  Angular
</app-chip>
```

**Use Cases**:
- Filter tags
- Selected items
- Categories
- Multi-select displays

---

## Stat Card

**Purpose**: Display dashboard metrics with trends

**Inputs**:
- `title`: string
- `value`: string
- `change`: string (e.g., "+12.5%")
- `trend`: 'up' | 'down' | 'neutral'
- `loading`: boolean
- `icon`: string (SVG path)

**Quick Example**:
```html
<app-stat-card
  title="Total Revenue"
  value="$45,231.89"
  change="+12.5%"
  trend="up"
  [icon]="dollarIcon">
</app-stat-card>
```

**Use Cases**:
- Dashboard KPIs
- Financial metrics
- Performance indicators
- Analytics summaries

---

## Skeleton Loader

**Purpose**: Display loading placeholders

**Inputs**:
- `variant`: 'text' | 'circle' | 'rectangle' | 'card' | 'table'
- `width`: string
- `height`: string
- `rows`: number (for text variant)
- `animate`: boolean

**Quick Example**:
```html
<!-- Text skeleton -->
<app-skeleton-loader variant="text" [rows]="3"></app-skeleton-loader>

<!-- Avatar skeleton -->
<app-skeleton-loader variant="circle" width="48px" height="48px"></app-skeleton-loader>

<!-- Card skeleton -->
<app-skeleton-loader variant="card"></app-skeleton-loader>
```

**Use Cases**:
- Page loading states
- List loading states
- Image placeholders
- Content streaming

---

## Data Table

**Purpose**: Display data in sortable, paginated table

**Inputs**:
- `columns`: TableColumn[]
- `data`: T[]
- `loading`: boolean
- `selectable`: boolean
- `emptyStateTitle`: string
- `emptyStateDescription`: string
- `totalItems`: number
- `pageSize`: number
- `currentPage`: number
- `showPagination`: boolean

**Outputs**:
- `sortChange`: EventEmitter<SortEvent>
- `selectionChange`: EventEmitter<T[]>
- `pageChange`: EventEmitter<PageChangeEvent>
- `rowClick`: EventEmitter<T>

**Quick Example**:
```typescript
// Component
columns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', align: 'center' }
];
```

```html
<!-- Template -->
<app-data-table
  [columns]="columns"
  [data]="users"
  [loading]="loading"
  [selectable]="true"
  [totalItems]="100"
  (sortChange)="onSort($event)"
  (pageChange)="onPageChange($event)">
</app-data-table>
```

**Use Cases**:
- Product lists
- User management
- Order history
- Inventory tracking

---

## Pagination

**Purpose**: Navigate through pages of data

**Inputs**:
- `totalItems`: number
- `pageSize`: number
- `currentPage`: number
- `pageSizeOptions`: number[]
- `showPageSizeSelector`: boolean
- `maxVisiblePages`: number

**Outputs**:
- `pageChange`: EventEmitter<PageChangeEvent>

**Quick Example**:
```html
<app-pagination
  [totalItems]="250"
  [pageSize]="25"
  [currentPage]="3"
  [pageSizeOptions]="[10, 25, 50, 100]"
  (pageChange)="onPageChange($event)">
</app-pagination>
```

**Use Cases**:
- Table pagination
- Search results
- Product catalogs
- Blog posts

---

## Search Bar

**Purpose**: Debounced search input

**Inputs**:
- `placeholder`: string
- `debounceTime`: number (default: 300ms)
- `loading`: boolean
- `size`: 'sm' | 'md' | 'lg'

**Outputs**:
- `searchChange`: EventEmitter<string>
- `clear`: EventEmitter<void>

**Quick Example**:
```html
<app-search-bar
  placeholder="Search products..."
  [loading]="isSearching"
  (searchChange)="onSearch($event)"
  (clear)="onClearSearch()">
</app-search-bar>
```

**Use Cases**:
- Product search
- User search
- Global search
- Filter search

---

## Currency Pipe

**Purpose**: Format currency values

**Signature**:
```typescript
transform(
  value: number | string | null | undefined,
  currencyCode?: Currency,
  symbolOnly?: boolean
): string
```

**Supported Currencies**:
- USD, EUR, GBP, MXN, CAD, AUD, JPY, CHF

**Quick Example**:
```html
<!-- Use company currency -->
<p>{{ totalAmount | appCurrency }}</p>

<!-- Explicit currency -->
<p>{{ price | appCurrency:'EUR' }}</p>

<!-- Symbol only -->
<span>{{ amount | appCurrency:'USD':true }}</span>
```

**Features**:
- Auto-detects company currency from CompanyContextService
- Uses Intl.NumberFormat for proper localization
- Handles null/undefined gracefully

---

## Date Format Pipe

**Purpose**: Format dates in multiple styles

**Signature**:
```typescript
transform(
  value: Date | string | number | null | undefined,
  format?: 'short' | 'medium' | 'long' | 'relative'
): string
```

**Quick Example**:
```html
<!-- Medium format (default): Jan 15, 2024 -->
<p>{{ createdAt | appDateFormat }}</p>

<!-- Short format: 01/15/2024 -->
<p>{{ date | appDateFormat:'short' }}</p>

<!-- Long format: January 15, 2024 -->
<p>{{ date | appDateFormat:'long' }}</p>

<!-- Relative: 2 hours ago -->
<p>Updated {{ updatedAt | appDateFormat:'relative' }}</p>
```

**Formats**:
- **short**: MM/DD/YYYY
- **medium**: Jan 15, 2024
- **long**: January 15, 2024
- **relative**: "2 hours ago", "3 days ago"

---

## TypeScript Interfaces

### TableColumn
```typescript
interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  cellTemplate?: (row: T) => string;
}
```

### SortEvent
```typescript
interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | null;
}
```

### PageChangeEvent
```typescript
interface PageChangeEvent {
  page: number;
  pageSize: number;
}
```

---

## Color Variants Mapping

### Badge/Chip/Alert Variants
- `success` → Green (#00A862)
- `warning` → Yellow (#FFB800)
- `error` → Red (#F2545B)
- `info` → Blue (#0091AE)
- `default` → Gray

### Stat Card Trends
- `up` → Green (positive)
- `down` → Red (negative)
- `neutral` → Gray (no change)

---

## Accessibility Quick Tips

### Keyboard Navigation
- All interactive elements support Tab/Enter/Space
- Focus indicators are visible
- Logical tab order

### ARIA Labels
```html
<!-- Badge -->
<app-badge aria-label="Status: Active" variant="success">Active</app-badge>

<!-- Alert -->
<app-alert role="alert" aria-live="polite">Message</app-alert>

<!-- Empty State -->
<app-empty-state aria-label="No data available"></app-empty-state>

<!-- Data Table -->
<app-data-table aria-label="Products table"></app-data-table>
```

### Screen Readers
- Icons have `aria-hidden="true"`
- Loading states announce "Loading"
- Dynamic content uses `aria-live`

---

## Dark Mode Classes

All components support dark mode using Tailwind's `dark:` prefix:

```html
<!-- Automatic dark mode support -->
<div class="bg-white dark:bg-background-dark-secondary
            text-text dark:text-text-dark-DEFAULT
            border-gray-200 dark:border-gray-700">
  Content
</div>
```

**Key Dark Mode Colors:**
- Background: `dark:bg-background-dark-DEFAULT` (#1A1F2E)
- Secondary: `dark:bg-background-dark-secondary` (#242936)
- Text: `dark:text-text-dark-DEFAULT` (#E5E9F0)
- Light text: `dark:text-text-dark-light` (#B8C2D4)
- Borders: `dark:border-gray-700`

---

## Common Patterns

### Loading State Pattern
```html
<app-skeleton-loader *ngIf="loading" variant="card"></app-skeleton-loader>

<div *ngIf="!loading">
  <!-- Content -->
</div>
```

### Empty State Pattern
```html
<app-data-table
  *ngIf="hasData"
  [columns]="columns"
  [data]="data">
</app-data-table>

<app-empty-state
  *ngIf="!hasData && !loading"
  title="No items found"
  actionLabel="Create Item"
  (actionClick)="onCreate()">
</app-empty-state>
```

### Alert Pattern
```typescript
// Component
showAlert = false;
alertType: AlertType = 'success';
alertMessage = '';

showSuccessAlert(message: string): void {
  this.alertType = 'success';
  this.alertMessage = message;
  this.showAlert = true;
}
```

```html
<!-- Template -->
<app-alert
  *ngIf="showAlert"
  [type]="alertType"
  [dismissible]="true"
  (dismissed)="showAlert = false">
  {{ alertMessage }}
</app-alert>
```

### Search with Table Pattern
```html
<div class="space-y-4">
  <app-search-bar
    [loading]="searching"
    (searchChange)="onSearch($event)">
  </app-search-bar>

  <app-data-table
    [columns]="columns"
    [data]="filteredData"
    [loading]="loading">
  </app-data-table>
</div>
```

---

## Performance Tips

1. **Use trackBy in tables**:
```typescript
trackByFn(index: number, item: any): any {
  return item.id; // Use unique identifier
}
```

2. **Debounce search** (built-in):
```html
<app-search-bar [debounceTime]="300"></app-search-bar>
```

3. **Lazy load data**:
```typescript
onPageChange(event: PageChangeEvent): void {
  this.loadData(event.page, event.pageSize);
}
```

4. **Virtual scrolling** (future):
Consider virtual scrolling for large datasets (500+ rows)

---

## Troubleshooting

### Component not rendering
- Ensure component is imported in component's `imports` array
- Check if `standalone: true` is set
- Verify Tailwind CSS is configured

### Styles not applying
- Run `npm run build` to rebuild Tailwind
- Check `tailwind.config.js` includes component paths
- Verify dark mode class is on root element

### Pipes not working
- Import pipe in component's `imports` array
- Check syntax: `{{ value | pipeName:arg1:arg2 }}`
- Verify pipe is registered as standalone

### Accessibility issues
- Check ARIA labels are present
- Test keyboard navigation
- Use Chrome DevTools Accessibility panel
- Run Lighthouse audit

---

## Testing Snippets

### Component Test
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
});
```

### Pipe Test
```typescript
import { TestBed } from '@angular/core/testing';
import { CurrencyPipe } from './currency.pipe';

describe('CurrencyPipe', () => {
  let pipe: CurrencyPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrencyPipe]
    });
    pipe = TestBed.inject(CurrencyPipe);
  });

  it('should format USD', () => {
    expect(pipe.transform(100, 'USD')).toContain('100');
  });
});
```

---

## File Locations Reference

```
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/

src/app/shared/
├── components/
│   ├── ui/
│   │   ├── badge/
│   │   ├── alert/
│   │   ├── empty-state/
│   │   ├── chip/
│   │   ├── stat-card/
│   │   └── skeleton-loader/
│   └── data/
│       ├── data-table/
│       ├── pagination/
│       └── search-bar/
└── pipes/
    ├── currency.pipe.ts
    └── date-format.pipe.ts
```

---

## Related Documentation

- **Full Implementation Plan**: `angular-frontend.md`
- **Implementation Summary**: `IMPLEMENTATION-SUMMARY.md`
- **Tailwind Config**: `/tailwind.config.js`
- **Project Instructions**: `/CLAUDE.md`
- **Angular 20 Guide**: `/.claude/doc/angular20_module_instructions.md`

---

**Last Updated**: November 27, 2025
**Version**: 1.0
**Status**: Ready for Implementation
