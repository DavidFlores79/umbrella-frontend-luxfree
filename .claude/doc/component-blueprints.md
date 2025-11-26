# Component Blueprints - Ready to Copy-Paste

## Overview

Complete, ready-to-use component implementations for the design system. Each component includes:
- Full TypeScript class with proper types
- HTML template with Tailwind styling
- Standalone configuration
- Input/Output documentation
- Accessibility support

---

## 1. FORM INPUT COMPONENT

**File:** `/src/app/shared/components/forms/form-input/form-input.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Text input form field with label, error message, and hint
 *
 * @example
 * <app-form-input
 *   [control]="form.get('email')!"
 *   label="Email Address"
 *   hint="We'll never share your email"
 *   [showError]="submitted || form.get('email')?.invalid">
 * </app-form-input>
 */
@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-2">
      <label
        [for]="inputId"
        *ngIf="label"
        class="form-label">
        {{ label }}
        <span *ngIf="required" class="text-error-500">*</span>
      </label>

      <input
        [id]="inputId"
        [type]="type"
        [formControl]="control"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [attr.aria-label]="label"
        [attr.aria-invalid]="showError"
        [attr.aria-describedby]="showError ? errorId : hintId"
        class="input-base"
        [class.input-error]="showError"
        [class.input-success]="!showError && control.valid && control.touched">

      <!-- Hint text -->
      <p *ngIf="hint && !showError"
         [id]="hintId"
         class="form-hint">
        {{ hint }}
      </p>

      <!-- Error message -->
      <p *ngIf="showError"
         [id]="errorId"
         class="form-error">
        {{ getErrorMessage() }}
      </p>
    </div>
  `
})
export class FormInputComponent {
  @Input() control!: FormControl;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() required = false;
  @Input() disabled = false;
  @Input() showError = false;

  readonly inputId = this.generateId('input');
  readonly errorId = this.generateId('error');
  readonly hintId = this.generateId('hint');

  getErrorMessage(): string {
    const { errors, value } = this.control;

    if (!errors) return '';
    if (errors['required']) return `${this.label || 'Field'} is required`;
    if (errors['email']) return 'Invalid email format';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['min']) return `Minimum value: ${errors['min'].min}`;
    if (errors['max']) return `Maximum value: ${errors['max'].max}`;

    return 'Invalid input';
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 2. FORM SELECT COMPONENT

**File:** `/src/app/shared/components/forms/form-select/form-select.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/**
 * Dropdown select component with label, options, and error handling
 *
 * @example
 * <app-form-select
 *   [control]="form.get('role')!"
 *   [options]="roleOptions"
 *   label="Select Role"
 *   [showError]="submitted">
 * </app-form-select>
 */
@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-2">
      <label
        [for]="selectId"
        *ngIf="label"
        class="form-label">
        {{ label }}
        <span *ngIf="required" class="text-error-500">*</span>
      </label>

      <select
        [id]="selectId"
        [formControl]="control"
        [disabled]="disabled"
        [attr.aria-label]="label"
        [attr.aria-invalid]="showError"
        [attr.aria-describedby]="showError ? errorId : undefined"
        class="input-base"
        [class.input-error]="showError"
        [class.input-success]="!showError && control.valid && control.touched">

        <option [value]="null" disabled *ngIf="placeholder">
          {{ placeholder }}
        </option>

        <option
          *ngFor="let option of options"
          [value]="option.value"
          [disabled]="option.disabled">
          {{ option.label }}
        </option>
      </select>

      <!-- Error message -->
      <p *ngIf="showError"
         [id]="errorId"
         class="form-error">
        {{ getErrorMessage() }}
      </p>
    </div>
  `
})
export class FormSelectComponent {
  @Input() control!: FormControl;
  @Input() label = '';
  @Input() placeholder = 'Select an option';
  @Input() options: SelectOption[] = [];
  @Input() required = false;
  @Input() disabled = false;
  @Input() showError = false;

  readonly selectId = this.generateId('select');
  readonly errorId = this.generateId('error');

  getErrorMessage(): string {
    const { errors } = this.control;

    if (!errors) return '';
    if (errors['required']) return `${this.label || 'Field'} is required`;

    return 'Invalid selection';
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 3. FORM CHECKBOX COMPONENT

**File:** `/src/app/shared/components/forms/form-checkbox/form-checkbox.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Checkbox component with label
 *
 * @example
 * <app-form-checkbox
 *   [control]="form.get('agree')!"
 *   label="I agree to the terms">
 * </app-form-checkbox>
 */
@Component({
  selector: 'app-form-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center gap-3">
      <input
        [id]="checkboxId"
        type="checkbox"
        [formControl]="control"
        [disabled]="disabled"
        [attr.aria-label]="label"
        class="w-4 h-4 text-coral border-border-light rounded cursor-pointer
                 focus:ring-2 focus:ring-coral-500
                 dark:border-border-dark dark:bg-dark-bg-secondary">

      <label
        [for]="checkboxId"
        class="text-sm text-text dark:text-text-inverse cursor-pointer hover:text-coral dark:hover:text-coral-400 transition-colors">
        {{ label }}
        <span *ngIf="required" class="text-error-500">*</span>
      </label>
    </div>

    <!-- Error message -->
    <p *ngIf="showError"
       [id]="errorId"
       class="form-error mt-2">
      {{ getErrorMessage() }}
    </p>
  `
})
export class FormCheckboxComponent {
  @Input() control!: FormControl;
  @Input() label = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() showError = false;

  readonly checkboxId = this.generateId('checkbox');
  readonly errorId = this.generateId('error');

  getErrorMessage(): string {
    const { errors } = this.control;

    if (!errors) return '';
    if (errors['required']) return `${this.label || 'Field'} must be checked`;

    return 'Invalid input';
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 4. FORM TOGGLE COMPONENT

**File:** `/src/app/shared/components/forms/form-toggle/form-toggle.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Toggle switch component (on/off)
 *
 * @example
 * <app-form-toggle
 *   [control]="form.get('notifications')!"
 *   label="Enable Notifications">
 * </app-form-toggle>
 */
@Component({
  selector: 'app-form-toggle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center justify-between gap-4">
      <label
        [for]="toggleId"
        class="text-sm font-medium text-text dark:text-text-inverse">
        {{ label }}
        <span *ngIf="required" class="text-error-500">*</span>
      </label>

      <button
        [id]="toggleId"
        type="button"
        role="switch"
        [attr.aria-checked]="control.value"
        [attr.aria-label]="label"
        [disabled]="disabled"
        (click)="toggle()"
        class="relative inline-flex w-14 h-7 items-center rounded-full
                 transition-colors duration-300 cursor-pointer
                 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2
                 dark:focus:ring-offset-dark-bg-primary"
        [class.bg-coral]="control.value"
        [class.bg-gray-300]="!control.value"
        [class.dark:bg-coral-600]="control.value"
        [class.dark:bg-gray-700]="!control.value"
        [class.opacity-50]="disabled">

        <!-- Toggle circle -->
        <span
          class="inline-block h-5 w-5 transform rounded-full bg-white
                   transition duration-300 dark:bg-gray-200"
          [class.translate-x-7]="control.value"
          [class.translate-x-1]="!control.value">
        </span>
      </button>
    </div>
  `
})
export class FormToggleComponent {
  @Input() control!: FormControl;
  @Input() label = '';
  @Input() required = false;
  @Input() disabled = false;

  readonly toggleId = this.generateId('toggle');

  toggle(): void {
    if (!this.disabled) {
      this.control.setValue(!this.control.value);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## 5. CARD COMPONENT

**File:** `/src/app/shared/components/ui/card/card.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable card container with configurable variant
 *
 * @example
 * <app-card variant="elevated">
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() variant: 'default' | 'elevated' | 'outlined' = 'default';

  getCardClasses(): string {
    const baseClasses = 'rounded-xl p-6 transition-shadow duration-200';

    const variantClasses = {
      default: 'bg-white dark:bg-dark-bg-secondary border border-border-light dark:border-border-dark shadow-md dark:shadow-dark-md',
      elevated: 'bg-white dark:bg-dark-bg-secondary border border-border-light dark:border-border-dark shadow-lg dark:shadow-dark-lg',
      outlined: 'bg-transparent border-2 border-border-light dark:border-border-dark'
    };

    return `${baseClasses} ${variantClasses[this.variant]}`;
  }
}
```

---

## 6. BADGE COMPONENT

**File:** `/src/app/shared/components/ui/badge/badge.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Small label/tag component with color variants
 *
 * @example
 * <app-badge variant="primary">Premium</app-badge>
 * <app-badge variant="success">Active</app-badge>
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getBadgeClasses()">
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: 'primary' | 'success' | 'warning' | 'error' | 'info' = 'primary';

  getBadgeClasses(): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap';

    const variantClasses = {
      primary: 'badge-primary',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      info: 'bg-info-50 text-info-700 dark:bg-info-900 dark:text-info-300'
    };

    return `${baseClasses} ${variantClasses[this.variant]}`;
  }
}
```

---

## 7. ALERT COMPONENT

**File:** `/src/app/shared/components/feedback/alert/alert.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Alert/notification component with multiple types
 *
 * @example
 * <app-alert type="success" [dismissible]="true">
 *   Operation completed successfully
 * </app-alert>
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      role="alert"
      [class]="getAlertClasses()"
      [@fadeInOut]>

      <!-- Icon -->
      <span class="flex-shrink-0">
        <span [innerHTML]="getIcon()"></span>
      </span>

      <!-- Content -->
      <div class="flex-1">
        <ng-content></ng-content>
      </div>

      <!-- Close button -->
      <button
        *ngIf="dismissible"
        type="button"
        (click)="onClose()"
        class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close alert">
        ✕
      </button>
    </div>
  `
})
export class AlertComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() dismissible = true;
  @Output() closed = new EventEmitter<void>();

  getAlertClasses(): string {
    const baseClasses = 'alert';

    const typeClasses = {
      success: 'alert-success',
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info'
    };

    return `${baseClasses} ${typeClasses[this.type]}`;
  }

  getIcon(): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'ℹ'
    };

    return icons[this.type];
  }

  onClose(): void {
    this.closed.emit();
  }
}
```

---

## 8. STAT CARD COMPONENT

**File:** `/src/app/shared/components/ui/stat-card/stat-card.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';

/**
 * Metric display card with trend indicator
 *
 * @example
 * <app-stat-card
 *   label="Total Revenue"
 *   [value]="45000"
 *   [trend]="12.5"
 *   icon="💰">
 * </app-stat-card>
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card variant="elevated">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {{ label }}
          </p>

          <h3 class="text-2xl md:text-3xl font-bold text-text dark:text-text-inverse">
            {{ formatValue(value) }}
          </h3>

          <!-- Trend indicator -->
          <div *ngIf="trend !== null" class="mt-3 flex items-center gap-2">
            <span
              class="text-sm font-semibold"
              [class.text-success-600]="trend >= 0"
              [class.text-error-600]="trend < 0">
              {{ trend > 0 ? '+' : '' }}{{ trend }}%
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ trend > 0 ? '↑' : '↓' }} vs last month
            </span>
          </div>
        </div>

        <!-- Icon -->
        <span class="text-3xl">{{ icon }}</span>
      </div>
    </app-card>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number = 0;
  @Input() trend: number | null = null;
  @Input() icon = '📊';

  formatValue(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  }
}
```

---

## 9. EMPTY STATE COMPONENT

**File:** `/src/app/shared/components/ui/empty-state/empty-state.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';

/**
 * Empty state UI with icon and call-to-action
 *
 * @example
 * <app-empty-state
 *   icon="📭"
 *   title="No results found"
 *   description="Try adjusting your filters"
 *   actionText="Clear filters"
 *   (actionClick)="onClearFilters()">
 * </app-empty-state>
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card variant="outlined" class="block">
      <div class="text-center py-12 px-6">
        <span class="text-6xl mb-4 block">{{ icon }}</span>

        <h3 class="text-xl font-semibold text-text dark:text-text-inverse mb-2">
          {{ title }}
        </h3>

        <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {{ description }}
        </p>

        <button
          *ngIf="actionText"
          (click)="onAction()"
          class="btn-primary">
          {{ actionText }}
        </button>
      </div>
    </app-card>
  `
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'No data available';
  @Input() description = '';
  @Input() actionText = '';

  @Output() actionClick = new EventEmitter<void>();

  onAction(): void {
    this.actionClick.emit();
  }
}
```

---

## 10. CHIP COMPONENT (Filter/Tag)

**File:** `/src/app/shared/components/ui/chip/chip.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Removable tag/chip component
 *
 * @example
 * <app-chip label="Angular" (remove)="onRemove()"></app-chip>
 */
@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-coral-50 dark:bg-coral-900 text-coral dark:text-coral-300
                border border-coral-200 dark:border-coral-700">

      <span class="text-sm font-medium">{{ label }}</span>

      <button
        type="button"
        (click)="onRemove()"
        class="text-coral dark:text-coral-300 hover:text-coral-600 dark:hover:text-coral-400
               transition-colors focus:outline-none"
        [attr.aria-label]="'Remove ' + label">
        ✕
      </button>
    </div>
  `
})
export class ChipComponent {
  @Input() label = '';
  @Output() remove = new EventEmitter<void>();

  onRemove(): void {
    this.remove.emit();
  }
}
```

---

## 11. PAGINATION COMPONENT

**File:** `/src/app/shared/components/data/pagination/pagination.component.ts`

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Pagination control component
 *
 * @example
 * <app-pagination
 *   [currentPage]="currentPage"
 *   [totalPages]="totalPages"
 *   (pageChange)="onPageChange($event)">
 * </app-pagination>
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-between items-center gap-4">
      <!-- Page info -->
      <span class="text-sm text-gray-600 dark:text-gray-400">
        Page {{ currentPage + 1 }} of {{ totalPages }}
      </span>

      <!-- Navigation buttons -->
      <div class="flex gap-2">
        <button
          type="button"
          (click)="goToPrevious()"
          [disabled]="currentPage === 0"
          class="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page">
          ← Previous
        </button>

        <button
          type="button"
          (click)="goToNext()"
          [disabled]="currentPage >= totalPages - 1"
          class="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page">
          Next →
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  goToPrevious(): void {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}
```

---

## 12. HEADER COMPONENT (With Dark Mode Toggle)

**File:** `/src/app/shared/components/layout/header/header.component.ts`

```typescript
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Application header with navigation and dark mode toggle
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-40 bg-white dark:bg-dark-bg-secondary border-b border-border-light dark:border-border-dark shadow-sm dark:shadow-dark-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <div class="flex items-center gap-3">
            <span class="text-2xl">☂️</span>
            <h1 class="text-xl font-bold text-text dark:text-text-inverse">
              Umbrella
            </h1>
          </div>

          <!-- Navigation (if needed) -->
          <nav class="hidden md:flex gap-8">
            <a routerLink="/dashboard"
               routerLinkActive="text-coral"
               class="text-text dark:text-text-inverse hover:text-coral transition-colors">
              Dashboard
            </a>
            <a routerLink="/companies"
               routerLinkActive="text-coral"
               class="text-text dark:text-text-inverse hover:text-coral transition-colors">
              Companies
            </a>
          </nav>

          <!-- Right side actions -->
          <div class="flex items-center gap-4">

            <!-- Dark mode toggle -->
            <button
              type="button"
              (click)="toggleDarkMode()"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              [attr.aria-label]="(isDarkMode$ | async) ? 'Enable light mode' : 'Enable dark mode'">
              <span class="text-xl">
                {{ (isDarkMode$ | async) ? '☀️' : '🌙' }}
              </span>
            </button>

            <!-- User menu (placeholder) -->
            <button type="button" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="User menu">
              👤
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  @Input() title = 'Umbrella';

  private themeService = inject(ThemeService);
  isDarkMode$ = this.themeService.isDarkMode$;

  ngOnInit(): void {
    // Initialization if needed
  }

  toggleDarkMode(): void {
    this.themeService.toggle();
  }
}
```

---

## 13. SIDEBAR COMPONENT

**File:** `/src/app/shared/components/layout/sidebar/sidebar.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  disabled?: boolean;
}

/**
 * Navigation sidebar component
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="bg-white dark:bg-dark-bg-secondary border-r border-border-light dark:border-border-dark overflow-y-auto">
      <nav class="space-y-1 p-4">
        <a
          *ngFor="let item of menuItems"
          [routerLink]="item.route"
          routerLinkActive="bg-coral-50 dark:bg-coral-900 text-coral dark:text-coral-300 border-l-4 border-coral"
          [class.opacity-50]="item.disabled"
          [class.pointer-events-none]="item.disabled"
          class="flex items-center justify-between px-4 py-3 text-sm font-medium text-text dark:text-text-light hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">

          <div class="flex items-center gap-3">
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </div>

          <span *ngIf="item.badge" class="badge-primary text-xs">
            {{ item.badge }}
          </span>
        </a>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/dashboard' },
    { icon: '🏢', label: 'Companies', route: '/companies' },
    { icon: '👥', label: 'Users', route: '/users' },
    { icon: '📦', label: 'Products', route: '/products' },
    { icon: '💰', label: 'Sales', route: '/sales' },
    { icon: '📥', label: 'Purchases', route: '/purchases' },
    { icon: '📈', label: 'Inventory', route: '/inventory' }
  ];
}
```

---

## 14. MAIN LAYOUT COMPONENT

**File:** `/src/app/shared/components/layout/main-layout/main-layout.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

/**
 * Main application layout shell with header, sidebar, and footer
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <!-- Header -->
      <app-header [title]="title"></app-header>

      <!-- Main content area -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar (hidden on mobile) -->
        <div class="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <app-sidebar [menuItems]="menuItems"></app-sidebar>
        </div>

        <!-- Main content -->
        <main class="flex-1 overflow-y-auto bg-bg-light dark:bg-dark-bg-primary">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ng-content></ng-content>
          </div>
        </main>
      </div>

      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `
})
export class MainLayoutComponent {
  @Input() title = 'Umbrella';
  @Input() menuItems = [];
}
```

---

## 15. FOOTER COMPONENT

**File:** `/src/app/shared/components/layout/footer/footer.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Application footer component
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-white dark:bg-dark-bg-secondary border-t border-border-light dark:border-border-dark">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">☂️</span>
              <h3 class="text-lg font-bold text-text dark:text-text-inverse">Umbrella</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Multi-company income and expense management system
            </p>
          </div>

          <!-- Links -->
          <div>
            <h4 class="font-semibold text-text dark:text-text-inverse mb-4">Quick Links</h4>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" class="hover:text-coral transition-colors">Documentation</a></li>
              <li><a href="#" class="hover:text-coral transition-colors">Support</a></li>
              <li><a href="#" class="hover:text-coral transition-colors">Status</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h4 class="font-semibold text-text dark:text-text-inverse mb-4">Legal</h4>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" class="hover:text-coral transition-colors">Privacy</a></li>
              <li><a href="#" class="hover:text-coral transition-colors">Terms</a></li>
              <li><a href="#" class="hover:text-coral transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-border-light dark:border-border-dark pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Umbrella. All rights reserved. v{{ version }}</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  version = '1.0.0';
}
```

---

## Import All Components in App Config

**File:** `/src/app/shared/components/index.ts`

```typescript
// Layout Components
export * from './layout/main-layout/main-layout.component';
export * from './layout/header/header.component';
export * from './layout/sidebar/sidebar.component';
export * from './layout/footer/footer.component';

// Form Components
export * from './forms/form-input/form-input.component';
export * from './forms/form-select/form-select.component';
export * from './forms/form-checkbox/form-checkbox.component';
export * from './forms/form-toggle/form-toggle.component';

// UI Components
export * from './ui/card/card.component';
export * from './ui/badge/badge.component';
export * from './ui/chip/chip.component';
export * from './ui/stat-card/stat-card.component';
export * from './ui/empty-state/empty-state.component';
export * from './ui/chart-card/chart-card.component';

// Data Components
export * from './data/data-table/data-table.component';
export * from './data/pagination/pagination.component';

// Feedback Components
export * from './feedback/alert/alert.component';
export * from './feedback/skeleton/skeleton.component';
```

---

**Status:** All components ready to copy-paste
**Last Updated:** 2025-11-26
