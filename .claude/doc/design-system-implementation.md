# HubSpot Design System & Shared Components Implementation Plan

## Overview

Implementation plan for establishing a complete design system for Umbrella Frontend with HubSpot brand colors, Tailwind CSS, responsive design, dark mode support, and a comprehensive shared component library.

**Status**: Implementation Ready
**Priority**: Critical - Required for all feature development
**Scope**: Tailwind config, 15 shared components, Chart.js integration, data tables, forms, loading states

---

## 1. TAILWIND CSS CONFIGURATION

### Files to Create/Modify

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/tailwind.config.js` (NEW)
**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/postcss.config.js` (NEW)
**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/styles.css` (MODIFY)

### Dependencies to Add

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16",
    "tailwindcss-dark-mode": "^1.1.7"
  }
}
```

### Tailwind Config Details

**Key Features**:
- HubSpot brand colors (Primary #FF7A59, Text #2D3E50, Background #FFF1EE)
- Dark mode support using `class` strategy
- Extended color palette for semantic usage
- Custom spacing, shadows, and animations
- Google Fonts integration (Inter, Outfit)
- Responsive breakpoints (mobile-first)
- CSS Grid and Flexbox utilities

**Color Palette Structure**:
```
Light Mode:
- Primary: #FF7A59 (coral/orange for CTAs)
- Secondary: #0B8DEF (blue for secondary actions)
- Tertiary: #A1A099 (gray for tertiary)
- Text: #2D3E50 (dark blue-gray for body text)
- Text Light: #56616C (lighter gray for secondary text)
- Background: #FFF1EE (light peach)
- Surface: #FFFFFF (white)
- Border: #DDD5D0 (light brown-gray)
- Success: #27AE60 (green)
- Warning: #F39C12 (amber)
- Error: #E74C3C (red)

Dark Mode:
- Primary: #FF8A6B (lighter coral for contrast)
- Text: #E8EEF5 (light gray)
- Text Light: #A8B2BD (muted gray)
- Background: #0F1419 (near black)
- Surface: #1A1F27 (dark gray)
- Border: #2D3540 (darker border)
```

**Configuration Approach**:
- JIT mode enabled (default in v3)
- Content paths configured for Angular standalone components
- Dark mode class strategy: `<html class="dark">`
- CSS variables for semantic colors
- Custom utilities for common patterns (badge, button variants, card shadows)

---

## 2. SHARED COMPONENTS LIBRARY

### Components to Create

All components located in: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/`

#### **2.1 Layout Components** (`/shared/components/layout/`)

| Component | File | Purpose | Key Props | Notes |
|-----------|------|---------|-----------|-------|
| **MainLayout** | `main-layout.component.ts` | App shell with header, sidebar, main content | `@Input() user$: Observable<User>` | Standalone, two-column responsive layout |
| **Header** | `header.component.ts` | Top navigation with logo, user menu, dark mode toggle | `@Input() title: string` | HubSpot branding, sticky positioning |
| **Sidebar** | `sidebar.component.ts` | Navigation menu with role-based visibility | `@Input() isCollapsed: boolean` | Collapsible on mobile, active route highlight |
| **Footer** | `footer.component.ts` | Copyright, links, version info | Static | Semantic layout structure |

#### **2.2 Card Components** (`/shared/components/ui/`)

| Component | File | Purpose | Key Props | Notes |
|-----------|------|---------|-----------|-------|
| **Card** | `card.component.ts` | Generic container with shadow, padding, border | `@Input() variant: 'default' \| 'elevated' \| 'outlined'` | Supports all variants, dark mode |
| **ChartCard** | `chart-card.component.ts` | Card wrapper for Chart.js charts | `@Input() title: string; @Input() chart: ChartConfiguration` | Loading skeleton support |
| **StatCard** | `stat-card.component.ts` | Display metric with icon, value, trend | `@Input() label: string; @Input() value: number; @Input() trend?: number` | Responsive grid layout |
| **EmptyState** | `empty-state.component.ts` | Empty state UI with icon and CTA | `@Input() icon: string; @Input() title: string; @Output() action` | Accessibility ready |

#### **2.3 Form Components** (`/shared/components/forms/`)

| Component | File | Purpose | Key Props | Notes |
|-----------|------|---------|-----------|-------|
| **FormInput** | `form-input.component.ts` | Text input with label, error, hint | `@Input() control: FormControl; @Input() label: string` | Reactive Forms integration |
| **FormSelect** | `form-select.component.ts` | Dropdown select with options | `@Input() options: Option[]; @Input() control: FormControl` | Supports search, async loading |
| **FormDatepicker** | `form-datepicker.component.ts` | Date input with calendar picker | `@Input() control: FormControl; @Input() range: boolean` | Native HTML5 date input |
| **FormCheckbox** | `form-checkbox.component.ts` | Checkbox with label | `@Input() control: FormControl; @Input() label: string` | Toggle support |
| **FormToggle** | `form-toggle.component.ts` | Toggle switch component | `@Input() control: FormControl; @Input() label: string` | Smooth animation, accessible |

#### **2.4 Data Display Components** (`/shared/components/data/`)

| Component | File | Purpose | Key Props | Notes |
|-----------|------|---------|-----------|-------|
| **DataTable** | `data-table.component.ts` | Responsive table with sorting, pagination | `@Input() data: any[]; @Input() columns: ColumnDef[]; @Input() pageSize: number` | See table pattern below |
| **Pagination** | `pagination.component.ts` | Page navigation controls | `@Input() total: number; @Input() pageSize: number; @Output() pageChange` | Aria labels included |
| **Badge** | `badge.component.ts` | Small label/tag component | `@Input() variant: 'primary' \| 'success' \| 'warning' \| 'error'` | Role indicators |
| **Chip** | `chip.component.ts` | Removable tag/filter chip | `@Input() label: string; @Output() remove` | Used in filter bars |

#### **2.5 Feedback Components** (`/shared/components/feedback/`)

| Component | File | Purpose | Key Props | Notes |
|-----------|------|---------|-----------|-------|
| **Alert** | `alert.component.ts` | Alert message with icon and close | `@Input() type: 'success' \| 'error' \| 'warning' \| 'info'` | Auto-dismiss support |
| **Skeleton** | `skeleton.component.ts` | Loading placeholder | `@Input() type: 'card' \| 'table' \| 'text' \| 'avatar'` | See loading pattern below |
| **Toast** | `toast.component.ts` | Toast notification service | Methods: `success()`, `error()`, `info()` | Service-based, dismissible |

---

## 3. CHART.JS INTEGRATION

### Best Library Choice for Angular 20

**Selected**: `ng2-charts` (community maintained, actively updated)
- Works perfectly with Angular 20 standalone components
- Type-safe Chart.js wrapper
- Reactive updates with `@Input()` binding
- No additional wrapper needed for our ChartCard component

### Installation & Setup

**Package**: `npm install chart.js ng2-charts`

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/chart-card.component.ts`

**Key Features**:
- Support for all Chart.js types (Line, Bar, Pie, Doughnut, Radar, etc.)
- Reactive data updates via Observable
- Responsive canvas sizing
- HubSpot color scheme integration
- Dark mode color adaptation

**Usage Pattern**:
```typescript
// Feature component
chartData$ = this.store.chartData$.pipe(
  map(data => ({
    labels: data.labels,
    datasets: [{
      label: 'Revenue',
      data: data.values,
      backgroundColor: '#FF7A59'
    }]
  }))
);

// Template
<app-chart-card
  [chartType]="'line'"
  [data]="chartData$ | async"
  [options]="chartOptions">
</app-chart-card>
```

---

## 4. DATA TABLE COMPONENT PATTERN

### Architecture Decision: Custom vs Library

**Choice**: Custom Angular-based data table with library-inspired API
- **Why**: Maintain full control, smaller bundle, Tailwind integration, standalone compatibility
- **Alternative considered**: ng-dynamic-component, but overkill for requirements

### DataTable Implementation Strategy

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/data/data-table.component.ts`

**Core Features**:
1. **Column Definition** - Type-safe column configuration
2. **Sorting** - Click headers to sort, direction indicator
3. **Filtering** - Client-side global search + per-column filters
4. **Pagination** - Configurable page size, navigation
5. **Selection** - Checkbox column for bulk operations (optional)
6. **Row Actions** - Inline actions menu (edit, delete)
7. **Responsive** - Horizontal scroll on mobile, card layout option
8. **Loading State** - Skeleton rows during data fetch
9. **Empty State** - Custom empty state UI
10. **Accessibility** - ARIA labels, keyboard navigation

**Column Definition Interface**:
```typescript
interface ColumnDef<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  template?: TemplateRef<any>;
  formatFn?: (value: any) => string;
}

interface TableConfig {
  pageSize: number;
  pageSizeOptions: number[];
  showSearch: boolean;
  showSelection: boolean;
  striped: boolean; // alternating row colors
  hover: boolean; // row hover effect
}
```

**Usage Example**:
```typescript
// In feature component
columns: ColumnDef<User>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'role', label: 'Role', filterable: true, template: roleTemplate },
];

data$ = this.store.users$;
config: TableConfig = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  showSearch: true,
  showSelection: true,
  striped: true,
  hover: true
};

// Template
<app-data-table
  [data]="data$ | async"
  [columns]="columns"
  [config]="config"
  [loading]="loading$ | async"
  (rowClick)="onRowClick($event)">
</app-data-table>
```

---

## 5. FORM VALIDATION PATTERN

### Strategy: Submit-Only Validation

**Approach**: Validate only on form submission, not on keystroke (reduces noise)

**Implementation**:
1. **FormGroup setup** - No validators on initial control creation
2. **Custom validator directive** - Apply validators on first submit
3. **Error display** - Show only after submit or control touched
4. **Form state tracking** - `isSubmitted` flag in component

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/directives/submit-validation.directive.ts`

**Pattern Code**:
```typescript
// Directive usage in form component
<form [formGroup]="form" (ngSubmit)="onSubmit()"
      appSubmitValidation #submitForm="appSubmitValidation">
  <app-form-input
    [control]="form.get('email')"
    [showError]="submitForm.shouldShowError('email')"
    label="Email">
  </app-form-input>
</form>

// Component logic
onSubmit(): void {
  if (this.form.valid) {
    // Submit logic
  } else {
    // Mark all as submitted to show errors
    this.submitForm.markAllAsTouched();
  }
}
```

**Form Error Display**:
- Show error message only when: `(control.invalid && (control.dirty || control.touched || submitted))`
- Use inline error text below field in red (#E74C3C)
- Show success icon when field valid after being invalid
- Disable submit button if form invalid

**Validation Rules**:
- Use Reactive Forms built-in validators: `Validators.required`, `Validators.email`, etc.
- Create custom validators for business logic (e.g., uniqueness checks via async validators)
- Show field-level errors, not form-level
- Prevent submission until all errors resolved

---

## 6. SKELETON LOADER PATTERN

### Skeleton Component Strategy

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/feedback/skeleton.component.ts`

**Approach**: Reusable skeleton with multiple variants for different content types

**Skeleton Types**:
1. **Card Skeleton** - Full card placeholder (image, title, text)
2. **Table Row Skeleton** - Multiple cells with pulsing animation
3. **Text Skeleton** - 1, 2, or 3 lines of text
4. **Avatar Skeleton** - Circular placeholder for profile images
5. **Chart Skeleton** - Bar chart placeholder

**Implementation Pattern**:
```typescript
// Skeleton component (reusable)
@Component({
  selector: 'app-skeleton',
  template: `
    <div [ngSwitch]="type" class="animate-pulse">
      <!-- Card variant -->
      <div *ngSwitchCase="'card'" class="space-y-4">
        <div class="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>

      <!-- Table row variant -->
      <div *ngSwitchCase="'table-row'" class="flex gap-2">
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  `,
  standalone: true
})
export class SkeletonComponent {
  @Input() type: 'card' | 'table-row' | 'text' | 'avatar' | 'chart' = 'card';
  @Input() count: number = 1;
}

// Usage in data table
<div *ngIf="loading$ | async; else tableContent" class="space-y-2">
  <app-skeleton type="table-row" [count]="pageSize"></app-skeleton>
</div>
<ng-template #tableContent>
  <!-- actual table -->
</ng-template>
```

**Animation**: CSS `animate-pulse` (built into Tailwind) for smooth fade effect

**Dark Mode**: Darker gray shades in dark mode (`dark:bg-gray-700` vs `bg-gray-200`)

---

## 7. RESPONSIVE DESIGN STRATEGY

### Mobile-First Breakpoints

```
Mobile: 0px (default)
Tablet: 768px (md:)
Desktop: 1024px (lg:)
Wide: 1280px (xl:)
```

### Layout Patterns

**Two-Column (MainLayout)**:
- Mobile: Single column (sidebar hidden/collapsed)
- Tablet+: Sidebar left, content right
- Toggle button to collapse sidebar on tablet

**Data Tables**:
- Mobile: Stacked card layout or horizontal scroll
- Tablet: Condensed table
- Desktop: Full table with all columns

**Forms**:
- Mobile: Single column, full-width inputs
- Tablet: 2-column grid where appropriate
- Desktop: Mixed layouts (left label, right input)

### Responsive Utilities in Tailwind Config

```css
/* Custom responsive utilities for common patterns */
.responsive-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.sidebar-layout {
  @apply grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4;
}
```

---

## 8. DARK MODE IMPLEMENTATION

### Strategy: Tailwind Dark Mode

**Approach**: Use Tailwind's built-in dark mode with `class` strategy

**Setup**:
1. Root HTML element gets `class="dark"` when dark mode enabled
2. All dark mode colors prefixed with `dark:` in Tailwind classes
3. Persistent preference using localStorage
4. Service to manage dark mode state

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/core/services/theme.service.ts`

**Implementation**:
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode$ = new BehaviorSubject<boolean>(
    localStorage.getItem('theme') === 'dark'
  );

  readonly isDarkMode$ = this.darkMode$.asObservable();

  toggle(): void {
    const newValue = !this.darkMode$.value;
    this.darkMode$.next(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');

    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  init(): void {
    // Initialize on app startup
    if (this.darkMode$.value) {
      document.documentElement.classList.add('dark');
    }
  }
}
```

**Color Mapping for Dark Mode**:
- Light backgrounds → Dark (#0F1419, #1A1F27)
- Dark text → Light (#E8EEF5, #A8B2BD)
- Borders → Darker (#2D3540)
- Coral accent → Slightly lighter (#FF8A6B)

---

## 9. COMPONENT DOCUMENTATION TEMPLATE

### Every component must include:

```typescript
/**
 * [Component Description]
 *
 * Handles [specific responsibility]
 *
 * @example
 * <app-component-name
 *   [property]="value"
 *   (eventName)="handler($event)">
 * </app-component-name>
 *
 * @accessibility
 * - ARIA labels on interactive elements
 * - Keyboard navigation support
 * - Color not sole indicator (use icons)
 *
 * @responsive
 * - Mobile: [behavior]
 * - Tablet: [behavior]
 * - Desktop: [behavior]
 */
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.css'
})
export class ComponentNameComponent {
  // ...
}
```

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [x] Create Tailwind config with HubSpot colors
- [x] Setup PostCSS and Tailwind in build pipeline
- [x] Update main styles.css with Tailwind directives
- [x] Create theme service for dark mode
- [x] Update angular.json build styles configuration

### Phase 2: Layout Components (Week 1-2)
- [ ] Create MainLayout (header, sidebar, footer structure)
- [ ] Create Header component with dark mode toggle
- [ ] Create Sidebar with navigation
- [ ] Create Footer component
- [ ] Test responsive behavior

### Phase 3: Core Shared Components (Week 2-3)
- [ ] Create Card, ChartCard, StatCard, EmptyState components
- [ ] Create FormInput, FormSelect, FormCheckbox, FormToggle components
- [ ] Create Badge, Chip, Alert components
- [ ] Create Skeleton loader with variants
- [ ] Create Toast notification service

### Phase 4: Data Components (Week 3-4)
- [ ] Create DataTable component with all features
- [ ] Create Pagination component
- [ ] Integrate Chart.js with ChartCard
- [ ] Create filter directive for tables
- [ ] Add sorting and searching

### Phase 5: Integration & Polish (Week 4)
- [ ] Apply components to existing features
- [ ] Dark mode testing across all components
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Accessibility review (WCAG 2.1 AA)
- [ ] Performance optimization

---

## 11. FILE STRUCTURE SUMMARY

```
src/app/shared/
├── components/
│   ├── layout/
│   │   ├── main-layout/
│   │   │   ├── main-layout.component.ts
│   │   │   └── main-layout.component.html
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   └── header.component.html
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   └── sidebar.component.html
│   │   └── footer/
│   │       ├── footer.component.ts
│   │       └── footer.component.html
│   ├── ui/
│   │   ├── card/
│   │   │   ├── card.component.ts
│   │   │   └── card.component.html
│   │   ├── chart-card/
│   │   │   ├── chart-card.component.ts
│   │   │   └── chart-card.component.html
│   │   ├── stat-card/
│   │   │   ├── stat-card.component.ts
│   │   │   └── stat-card.component.html
│   │   ├── empty-state/
│   │   │   ├── empty-state.component.ts
│   │   │   └── empty-state.component.html
│   │   ├── badge/
│   │   │   ├── badge.component.ts
│   │   │   └── badge.component.html
│   │   └── chip/
│   │       ├── chip.component.ts
│   │       └── chip.component.html
│   ├── forms/
│   │   ├── form-input/
│   │   │   ├── form-input.component.ts
│   │   │   └── form-input.component.html
│   │   ├── form-select/
│   │   │   ├── form-select.component.ts
│   │   │   └── form-select.component.html
│   │   ├── form-datepicker/
│   │   │   ├── form-datepicker.component.ts
│   │   │   └── form-datepicker.component.html
│   │   ├── form-checkbox/
│   │   │   ├── form-checkbox.component.ts
│   │   │   └── form-checkbox.component.html
│   │   └── form-toggle/
│   │       ├── form-toggle.component.ts
│   │       └── form-toggle.component.html
│   ├── data/
│   │   ├── data-table/
│   │   │   ├── data-table.component.ts
│   │   │   └── data-table.component.html
│   │   └── pagination/
│   │       ├── pagination.component.ts
│   │       └── pagination.component.html
│   └── feedback/
│       ├── alert/
│       │   ├── alert.component.ts
│       │   └── alert.component.html
│       ├── skeleton/
│       │   ├── skeleton.component.ts
│       │   └── skeleton.component.html
│       └── toast/
│           ├── toast.service.ts
│           ├── toast.component.ts
│           └── toast.component.html
├── directives/
│   ├── submit-validation.directive.ts
│   └── sortable.directive.ts
└── models/
    └── [existing models]
```

---

## 12. CRITICAL CONFIGURATION FILES

### Tailwind Config (`tailwind.config.js`)

Key sections:
- `content` array pointing to `src/**/*.{html,ts}`
- `theme.colors` with HubSpot palette and semantic colors
- `theme.extend.animation` with `pulse` and custom animations
- `darkMode: 'class'` for class-based dark mode
- Custom font family (Inter for body, Outfit for headings)

### PostCSS Config (`postcss.config.js`)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Styles.css Entry Point

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 rounded-lg font-medium text-white bg-coral hover:bg-coral-600 transition-colors;
  }

  .card-shadow {
    @apply shadow-md dark:shadow-lg;
  }
}
```

---

## 13. KEY DECISIONS & RATIONALE

| Decision | Choice | Why |
|----------|--------|-----|
| CSS Framework | Tailwind CSS | Utility-first, small bundle, dark mode native, no style conflicts |
| Chart Library | ng2-charts | Best Angular 20 support, type-safe, maintained, small bundle |
| Table Approach | Custom Component | Full control, Tailwind integration, standalone compatible, simpler than libraries |
| Form Validation | Submit-only | Reduces noise, better UX, cleaner code than keystroke validation |
| Dark Mode | Tailwind Class | Native support, easy to toggle, persistent, no extra library |
| Theme Management | RxJS BehaviorSubject | Fits project architecture, reactive, no signals for state |
| State for theme | localStorage | Persists preference, fast init, no backend needed |

---

## 14. ACCESSIBILITY REQUIREMENTS

All components must meet WCAG 2.1 Level AA:

1. **Color Contrast**: Text must have 4.5:1 contrast ratio
   - HubSpot coral (#FF7A59) requires dark text overlay (use transparent overlay if needed)
   - Light peach background (#FFF1EE) with dark text #2D3E50 = compliant

2. **Semantic HTML**: Use proper elements (button, label, input, not divs)

3. **ARIA Attributes**:
   - Form fields: `aria-label`, `aria-describedby`, `aria-invalid`
   - Data table: `role="table"`, `role="row"`, `role="cell"`
   - Toggle: `role="switch"`, `aria-checked`

4. **Keyboard Navigation**: All interactive elements accessible via Tab/Enter

5. **Focus Management**: Clear focus indicators, focus trapped in modals

6. **Responsive Text**: Scale from 12px mobile to 16px desktop (never smaller than 12px)

---

## 15. PERFORMANCE CONSIDERATIONS

1. **Bundle Size**:
   - Tailwind purges unused styles (JIT mode)
   - Chart.js lazy loaded with feature
   - Components lazy loaded via Angular routing

2. **Change Detection**:
   - Use `OnPush` strategy where possible
   - Observable pipes with `async` pipe (automatic unsubscribe)
   - Avoid frequent `@Input()` mutations

3. **CSS Delivery**:
   - Critical styles inline in index.html
   - Rest deferred with `defer` attribute
   - Dark mode CSS loaded conditionally

4. **Images**:
   - SVG for icons (no external requests)
   - Lazy load charts only when visible
   - Responsive images with `srcset`

---

## 16. TESTING STRATEGY

### Unit Tests
- Test component inputs/outputs
- Mock data stores
- Form validation logic
- Skeleton visibility states

### Integration Tests
- Dark mode toggle affects all components
- Data table filtering, sorting, pagination
- Form submission with validation

### E2E Tests (Cypress)
- Responsive layout on mobile/tablet/desktop
- Dark mode persistence across navigation
- Complete user flows (form fill → submit → success)

### Example Test
```typescript
describe('DarkModeToggle', () => {
  it('should toggle dark mode and persist preference', () => {
    cy.visit('/');
    cy.get('[data-cy="dark-mode-toggle"]').click();
    cy.get('html').should('have.class', 'dark');
    cy.reload();
    cy.get('html').should('have.class', 'dark');
  });
});
```

---

## 17. QUICK REFERENCE: COMPONENT USAGE

### Using Design System Components in Features

```typescript
// Feature component using shared components
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  CardComponent,
  FormInputComponent,
  DataTableComponent,
  SkeletonComponent,
  BadgeComponent
} from '@shared/components';

@Component({
  selector: 'app-users-feature',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    FormInputComponent,
    DataTableComponent,
    SkeletonComponent,
    BadgeComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Card container -->
      <app-card>
        <h2 class="text-2xl font-bold text-text dark:text-text-light mb-4">Users</h2>

        <!-- Loading state -->
        <ng-container *ngIf="loading$ | async; else loaded">
          <app-skeleton type="table-row" [count]="5"></app-skeleton>
        </ng-container>

        <!-- Loaded state -->
        <ng-template #loaded>
          <app-data-table
            [data]="users$ | async"
            [columns]="columns"
            [config]="tableConfig"
            (rowClick)="onRowClick($event)">
          </app-data-table>
        </ng-template>
      </app-card>

      <!-- Form in modal/sidebar -->
      <app-card variant="elevated" *ngIf="showForm">
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <app-form-input
            [control]="userForm.get('name')!"
            label="Full Name">
          </app-form-input>

          <app-form-select
            [control]="userForm.get('role')!"
            [options]="roleOptions"
            label="Role">
          </app-form-select>

          <button
            type="submit"
            class="btn-primary mt-6">
            Save User
          </button>
        </form>
      </app-card>
    </div>
  `
})
export class UsersFeaturesComponent implements OnInit {
  readonly columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'role', label: 'Role', template: badgeTemplate }
  ];

  readonly tableConfig = {
    pageSize: 10,
    showSearch: true,
    showSelection: true
  };

  users$ = this.store.users$;
  loading$ = this.store.loading$;
  userForm: FormGroup;

  constructor(
    private store: UsersStore,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user']
    });
  }

  ngOnInit(): void {
    this.store.loadUsers();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.store.createUser(this.userForm.value);
    }
  }

  onRowClick(row: User): void {
    // Handle row selection
  }
}
```

---

## 18. NEXT STEPS

1. **Approve this plan** with any modifications needed
2. **Set up Tailwind configuration** (package installation, config files)
3. **Create Layout components** (MainLayout, Header, Sidebar, Footer)
4. **Create Form components** library (Input, Select, etc.)
5. **Create Data table** with all features
6. **Integrate with features** as they're developed
7. **Test responsive and dark mode** across all browsers

---

## 19. DEPENDENCIES TO ADD

```bash
npm install chart.js ng2-charts tailwindcss postcss autoprefixer
npm install -D tailwindcss postcss autoprefixer
```

## 20. COMMANDS TO RUN

```bash
# Setup Tailwind
npx tailwindcss init -p

# Start dev server with Tailwind JIT
npm start

# Build with optimized CSS
npm run build

# Run tests
npm test
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Status**: Ready for Implementation
**Estimated Timeline**: 4 weeks for complete implementation
