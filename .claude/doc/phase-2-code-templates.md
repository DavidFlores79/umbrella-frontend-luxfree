# Phase 2 Complete Code Templates

## Form Components Code Templates

### 1. form-textarea.ts (Complete)

```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-textarea',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-textarea.html',
  styleUrl: './form-textarea.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormTextarea),
      multi: true
    }
  ]
})
export class FormTextarea implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() maxLength?: number;
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() disabled = false;

  value = '';
  touched = false;
  uniqueId = `form-textarea-${Math.random().toString(36).substring(2, 9)}`;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get showError(): boolean {
    return this.touched && !!this.errorMessage;
  }

  get remainingChars(): number | null {
    return this.maxLength ? this.maxLength - this.value.length : null;
  }
}
```

### 1. form-textarea.html (Complete)

```html
<div class="w-full">
  @if (label) {
    <label
      [for]="uniqueId"
      class="block text-sm font-medium text-text dark:text-text-dark-DEFAULT mb-1.5"
    >
      {{ label }}
      @if (required) {
        <span class="text-accent-red ml-0.5">*</span>
      }
    </label>
  }

  <div class="relative">
    <textarea
      [id]="uniqueId"
      [placeholder]="placeholder"
      [required]="required"
      [disabled]="disabled"
      [attr.maxlength]="maxLength"
      [value]="value"
      [attr.rows]="rows"
      (input)="onInput($event)"
      (blur)="onBlur()"
      [attr.aria-required]="required"
      [attr.aria-invalid]="showError"
      [attr.aria-describedby]="showError ? uniqueId + '-error' : null"
      class="w-full px-4 py-2.5 text-sm border rounded-lg transition-all duration-200
             bg-white dark:bg-background-dark-tertiary
             text-text dark:text-text-dark-DEFAULT
             border-gray-300 dark:border-gray-600
             placeholder-text-lighter dark:placeholder-text-dark-lighter
             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
             disabled:bg-gray-100 dark:disabled:bg-background-dark-DEFAULT disabled:cursor-not-allowed disabled:opacity-60
             resize-none"
      [class.border-accent-red]="showError"
      [class.focus:ring-accent-red]="showError"
    ></textarea>

    @if (maxLength && value.length > 0) {
      <div class="absolute right-3 bottom-2 text-xs text-text-lighter dark:text-text-dark-lighter">
        {{ remainingChars }} / {{ maxLength }}
      </div>
    }
  </div>

  @if (showError) {
    <p
      [id]="uniqueId + '-error'"
      class="mt-1.5 text-sm text-accent-red"
      role="alert"
      aria-live="polite"
    >
      {{ errorMessage }}
    </p>
  }
</div>
```

### 2. form-checkbox.ts (Complete)

```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-checkbox',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-checkbox.html',
  styleUrl: './form-checkbox.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormCheckbox),
      multi: true
    }
  ]
})
export class FormCheckbox implements ControlValueAccessor {
  @Input() label = '';
  @Input() checked = false;
  @Input() disabled = false;

  uniqueId = `form-checkbox-${Math.random().toString(36).substring(2, 9)}`;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
```

### 2. form-checkbox.html (Complete)

```html
<div class="flex items-center gap-2">
  <button
    type="button"
    role="checkbox"
    [id]="uniqueId"
    [attr.aria-checked]="checked"
    [attr.aria-labelledby]="label ? uniqueId + '-label' : null"
    [disabled]="disabled"
    (click)="toggle()"
    (keydown)="onKeyDown($event)"
    class="h-5 w-5 rounded-md border-2 border-gray-300 dark:border-gray-600 transition-all duration-200 flex items-center justify-center
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-background-dark-DEFAULT
           disabled:cursor-not-allowed disabled:opacity-50"
    [class.bg-primary-500]="checked"
    [class.border-primary-500]="checked"
    [class.dark:bg-primary-500]="checked"
    [class.dark:border-primary-500]="checked"
  >
    @if (checked) {
      <svg
        class="w-3 h-3 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    }
  </button>

  @if (label) {
    <label
      [id]="uniqueId + '-label'"
      [for]="uniqueId"
      class="text-sm font-medium text-text dark:text-text-dark-DEFAULT cursor-pointer select-none"
      [class.opacity-50]="disabled"
      (click)="toggle()"
    >
      {{ label }}
    </label>
  }
</div>
```

---

## Layout Components Code Templates

### 3. main-layout.ts (Complete)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule, Header, Sidebar, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {}
```

### 3. main-layout.html (Complete)

```html
<div class="min-h-screen flex flex-col dark:bg-background-dark-DEFAULT">
  <!-- Fixed header spanning full width -->
  <header class="fixed top-0 left-0 right-0 z-50">
    <app-header></app-header>
  </header>

  <!-- Main content container with sidebar and content -->
  <div class="flex flex-1 pt-16">
    <!-- Fixed sidebar (hidden on mobile with lg breakpoint) -->
    <aside class="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:z-40 dark:bg-background-dark-secondary">
      <app-sidebar></app-sidebar>
    </aside>

    <!-- Main content area with responsive left margin -->
    <main class="flex-1 lg:ml-64">
      <div class="p-6 lg:p-8">
        <router-outlet></router-outlet>
      </div>
    </main>
  </div>

  <!-- Fixed footer -->
  <footer class="mt-auto border-t border-gray-200 dark:border-gray-700">
    <app-footer></app-footer>
  </footer>
</div>
```

### 4. header.ts (Complete)

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Router } from '@angular/router';
import { FormToggle } from '../../ui/forms/form-toggle/form-toggle';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, FormToggle],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly router = inject(Router);

  protected readonly currentUser$ = this.authService.user$;
  protected readonly theme$ = this.themeService.theme$;

  showUserMenu = false;

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeUserMenu();
  }

  onThemeChange(isDark: boolean): void {
    this.themeService.setTheme(isDark ? 'dark' : 'light');
  }
}
```

### 4. header.html (Complete)

```html
<header class="bg-white dark:bg-background-dark-secondary border-b border-gray-200 dark:border-gray-700 shadow-sm">
  <div class="px-6 py-4 flex items-center justify-between max-w-screen-2xl mx-auto">

    <!-- Left: Logo and App Name -->
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold">
        U
      </div>
      <div>
        <h1 class="text-lg font-semibold text-text dark:text-text-dark-DEFAULT">
          Umbrella
        </h1>
        <p class="text-xs text-text-lighter dark:text-text-dark-lighter">
          Business Management
        </p>
      </div>
    </div>

    <!-- Center: Dark Mode Toggle -->
    <div class="flex items-center">
      <app-form-toggle
        label="Dark Mode"
        [checked]="(theme$ | async) === 'dark'"
        (toggleChange)="onThemeChange($event)"
      ></app-form-toggle>
    </div>

    <!-- Right: User Menu -->
    <div class="relative flex items-center gap-4">
      @if (currentUser$ | async as user) {
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-text dark:text-text-dark-DEFAULT">
            {{ user.firstName }} {{ user.lastName }}
          </p>
          <p class="text-xs text-text-lighter dark:text-text-dark-lighter">
            {{ user.role }}
          </p>
        </div>
      }

      <!-- User avatar / dropdown button -->
      <button
        (click)="toggleUserMenu()"
        class="relative w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold
               hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200
               focus:outline-none focus:ring-2 focus:ring-primary-500"
        [attr.aria-expanded]="showUserMenu"
      >
        @if (currentUser$ | async as user) {
          {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
        }
      </button>

      <!-- Dropdown menu -->
      @if (showUserMenu) {
        <div
          class="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white dark:bg-background-dark-tertiary shadow-lg z-10
                 border border-gray-200 dark:border-gray-700"
          (click)="closeUserMenu()"
        >
          <nav class="py-2">
            <a
              href="#"
              (click)="$event.preventDefault()"
              class="block px-4 py-2 text-sm text-text dark:text-text-dark-DEFAULT hover:bg-gray-100 dark:hover:bg-background-dark-DEFAULT"
            >
              Profile Settings
            </a>
            <a
              href="#"
              (click)="$event.preventDefault()"
              class="block px-4 py-2 text-sm text-text dark:text-text-dark-DEFAULT hover:bg-gray-100 dark:hover:bg-background-dark-DEFAULT"
            >
              Preferences
            </a>
            <div class="my-2 border-t border-gray-200 dark:border-gray-700"></div>
            <button
              (click)="logout()"
              type="button"
              class="w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-gray-100 dark:hover:bg-background-dark-DEFAULT"
            >
              Logout
            </button>
          </nav>
        </div>
      }
    </div>
  </div>
</header>
```

### 5. sidebar.ts (Complete)

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  requiredPermission?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  protected readonly permissionService = inject(PermissionService);
  protected readonly router = inject(Router);

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: '📊'
    },
    {
      label: 'Companies',
      route: '/companies',
      icon: '🏢',
      requiredPermission: 'companies:read'
    },
    {
      label: 'Users',
      route: '/users',
      icon: '👥',
      requiredPermission: 'users:read'
    },
    {
      label: 'Products',
      route: '/products',
      icon: '📦',
      requiredPermission: 'products:read'
    },
    {
      label: 'Sales',
      route: '/sales',
      icon: '💰',
      requiredPermission: 'sales:read'
    },
    {
      label: 'Purchases',
      route: '/purchases',
      icon: '📥',
      requiredPermission: 'purchases:read'
    },
    {
      label: 'Inventory',
      route: '/inventory',
      icon: '📋',
      requiredPermission: 'inventory:read'
    }
  ];

  canViewNavItem(item: NavItem): boolean {
    if (!item.requiredPermission) {
      return true;
    }
    return this.permissionService.hasPermission(item.requiredPermission as any);
  }
}
```

### 5. sidebar.html (Complete)

```html
<nav class="h-full overflow-y-auto px-4 py-6 space-y-2 bg-white dark:bg-background-dark-secondary">
  @for (item of navItems; track item.route) {
    @if (canViewNavItem(item)) {
      <a
        [routerLink]="item.route"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
               text-text dark:text-text-dark-DEFAULT
               hover:bg-gray-100 dark:hover:bg-background-dark-tertiary
               focus:outline-none focus:ring-2 focus:ring-primary-500"
        [class.bg-primary-100]="router.url === item.route"
        [class.dark:bg-primary-900]="router.url === item.route"
        [class.text-primary-600]="router.url === item.route"
        [class.dark:text-primary-400]="router.url === item.route"
      >
        <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </a>
    }
  }
</nav>
```

### 6. footer.ts (Complete)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
  appVersion = '1.0.0';
}
```

### 6. footer.html (Complete)

```html
<footer class="bg-white dark:bg-background-dark-secondary border-t border-gray-200 dark:border-gray-700">
  <div class="px-6 py-4 max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
    <!-- Copyright and App Name -->
    <div class="text-sm text-text-lighter dark:text-text-dark-lighter">
      &copy; {{ currentYear }} Umbrella. All rights reserved.
    </div>

    <!-- Version and Links -->
    <div class="flex items-center gap-6 text-sm text-text-lighter dark:text-text-dark-lighter">
      <span>v{{ appVersion }}</span>

      <a
        href="#"
        class="hover:text-text dark:hover:text-text-dark-DEFAULT transition-colors duration-200"
      >
        Privacy Policy
      </a>

      <a
        href="#"
        class="hover:text-text dark:hover:text-text-dark-DEFAULT transition-colors duration-200"
      >
        Terms of Service
      </a>
    </div>
  </div>
</footer>
```

---

## CSS Files (All Empty)

All 6 CSS files should be **empty or contain minimal styling**:

```css
/* form-textarea.css - Empty */
/* form-checkbox.css - Empty */
/* main-layout.css - Empty */
/* header.css - Empty */
/* sidebar.css - Empty */
/* footer.css - Empty */
```

All styling is done with Tailwind CSS utility classes in the HTML templates.

---

## Component Summary Table

| Component | Type | Selector | Imports | Key Features |
|-----------|------|----------|---------|--------------|
| FormTextarea | Form | `app-form-textarea` | CommonModule, FormsModule | ControlValueAccessor, character counter, rows property |
| FormCheckbox | Form | `app-form-checkbox` | CommonModule, FormsModule | Custom styled checkbox, keyboard support, boolean CVA |
| MainLayout | Layout | `app-main-layout` | Header, Sidebar, Footer, RouterModule | Fixed header/footer, responsive sidebar, grid layout |
| Header | Layout | `app-header` | FormToggle, AuthService, ThemeService | User menu, dark mode toggle, logo, user info |
| Sidebar | Layout | `app-sidebar` | RouterModule, PermissionService | Navigation, RBAC, active route highlighting |
| Footer | Layout | `app-footer` | CommonModule | Copyright, version, links |

---

## Usage Examples

### Using Form Textarea in a Form

```typescript
// In a parent component using reactive forms
export class MyComponent {
  form = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]],
    notes: ['']
  });

  constructor(private fb: FormBuilder) {}
}
```

```html
<form [formGroup]="form">
  <app-form-textarea
    formControlName="description"
    label="Description"
    placeholder="Enter description"
    rows="6"
    maxLength="500"
    [required]="true"
    [errorMessage]="form.get('description')?.hasError('required') ? 'Description is required' : ''"
  ></app-form-textarea>

  <app-form-textarea
    formControlName="notes"
    label="Additional Notes"
    placeholder="Enter notes"
    rows="4"
    maxLength="1000"
  ></app-form-textarea>
</form>
```

### Using Form Checkbox in a Form

```typescript
export class PreferencesComponent {
  form = this.fb.group({
    emailNotifications: [true],
    darkMode: [false],
    agreeToTerms: [false, Validators.requiredTrue]
  });

  constructor(private fb: FormBuilder) {}
}
```

```html
<form [formGroup]="form">
  <app-form-checkbox
    formControlName="emailNotifications"
    label="Send me email notifications"
  ></app-form-checkbox>

  <app-form-checkbox
    formControlName="darkMode"
    label="Prefer dark mode"
  ></app-form-checkbox>

  <app-form-checkbox
    formControlName="agreeToTerms"
    label="I agree to the terms and conditions"
    [errorMessage]="form.get('agreeToTerms')?.hasError('required') ? 'You must agree to terms' : ''"
  ></app-form-checkbox>
</form>
```

### Using MainLayout as Root

```typescript
// In app.ts or main route
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'companies', component: CompaniesComponent },
      // ... other routes
    ]
  },
  { path: 'auth', component: AuthComponent },
  { path: '**', component: NotFoundComponent }
];
```

---

## Build and Deployment

After implementing all 6 components:

```bash
# Verify types
npx tsc --noEmit

# Build
ng build

# Test
ng test

# Serve locally
ng serve

# Production build
ng build --configuration production
```

Check bundle size:
```bash
ng build --stats-json
webpack-bundle-analyzer dist/umbrella-frontend/stats.json
```

All components are standalone and tree-shakeable, so only imported components are included in the build.

