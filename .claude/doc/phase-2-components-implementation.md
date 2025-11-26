# Phase 2/3 Transition: Component Implementation Plan

## Overview
Implementation of 6 remaining essential components for the Umbrella Frontend MVP. These components complete the form library and layout system needed for feature development.

**Status**: Scaffolds exist with empty implementations
**Technology**: Angular 20 Standalone Components, Tailwind CSS, RxJS
**Completed**: form-input, form-toggle, form-select, button, card
**To Implement**: form-textarea, form-checkbox, main-layout, header, sidebar, footer

---

## Part 1: Form Components (2 Components)

### 1. Form Textarea Component

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-textarea/form-textarea.ts`

**Purpose**: Reusable textarea input component with character counter and validation support

**Implementation Pattern**:
- Implements `ControlValueAccessor` (like form-input) for form integration
- Extends form-input pattern with textarea-specific features
- Supports multiline text input with configurable row count

**Required Imports**:
```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
```

**Class Properties**:
- `@Input() label: string` - Field label
- `@Input() placeholder: string` - Placeholder text
- `@Input() rows: number` - Number of rows (default: 4)
- `@Input() maxLength?: number` - Character limit
- `@Input() required: boolean` - Is field required
- `@Input() errorMessage: string` - Error to display
- `@Input() disabled: boolean` - Disable state
- `value: string` - Current textarea value
- `touched: boolean` - Track if field was interacted with
- `uniqueId: string` - Auto-generated unique ID
- Private `onChange` and `onTouched` callbacks

**Key Methods**:
```typescript
onInput(event: Event): void {
  const textarea = event.target as HTMLTextAreaElement;
  this.value = textarea.value;
  this.onChange(this.value);
}

onBlur(): void {
  this.touched = true;
  this.onTouched();
}

get showError(): boolean {
  return this.touched && !!this.errorMessage;
}

get remainingChars(): number | null {
  return this.maxLength ? this.maxLength - this.value.length : null;
}
```

**ControlValueAccessor Implementation**:
- `writeValue(value: string): void` - Set value from form
- `registerOnChange(fn)` - Register change callback
- `registerOnTouched(fn)` - Register touched callback
- `setDisabledState(isDisabled)` - Update disabled state

**Providers Array**:
Must include NG_VALUE_ACCESSOR provider with forwardRef to FormTextarea class

**Template Structure** (`form-textarea.html`):
```html
<div class="w-full">
  <!-- Label section with required indicator -->
  @if (label) {
    <label [for]="uniqueId" class="block text-sm font-medium text-text dark:text-text-dark-DEFAULT mb-1.5">
      {{ label }}
      @if (required) {
        <span class="text-accent-red ml-0.5">*</span>
      }
    </label>
  }

  <!-- Textarea wrapper with position relative for counter positioning -->
  <div class="relative">
    <!-- Textarea element with full styling -->
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

    <!-- Character counter positioned in bottom-right -->
    @if (maxLength && value.length > 0) {
      <div class="absolute right-3 bottom-2 text-xs text-text-lighter dark:text-text-dark-lighter">
        {{ remainingChars }} / {{ maxLength }}
      </div>
    }
  </div>

  <!-- Error message with accessibility -->
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

**Styling** (`form-textarea.css`):
- Empty or minimal CSS - rely on Tailwind utility classes
- No custom styles needed with current Tailwind config

**Key Differences from form-input**:
- Uses `<textarea>` instead of `<input>`
- Added `rows` input property
- Character counter shows "remaining / max" format
- `resize-none` class to prevent user resizing
- No character counter hidden/shown positioning (always bottom-right when present)

---

### 2. Form Checkbox Component

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-checkbox/form-checkbox.ts`

**Purpose**: Custom checkbox component with Tailwind styling, supporting boolean form control

**Implementation Pattern**:
- Implements `ControlValueAccessor` for boolean values
- Custom Tailwind-styled checkbox (not native HTML checkbox)
- Primary color (coral) when checked
- Gray when unchecked

**Required Imports**:
```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
```

**Class Properties**:
- `@Input() label: string` - Checkbox label
- `@Input() checked: boolean` - Current checked state
- `@Input() disabled: boolean` - Disable state
- `uniqueId: string` - Auto-generated unique ID
- Private `onChange` and `onTouched` callbacks

**Key Methods**:
```typescript
toggle(): void {
  if (this.disabled) return;
  this.checked = !this.checked;
  this.onChange(this.checked);
  this.onTouched();
}

onKeyDown(event: KeyboardEvent): void {
  // Support Space and Enter keys
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    this.toggle();
  }
}

get checkedClasses(): string {
  // Returns classes when checked (primary-500 background)
}

get uncheckedClasses(): string {
  // Returns classes when unchecked (gray background)
}
```

**ControlValueAccessor Implementation**:
- `writeValue(value: boolean): void` - Set checked state from form
- `registerOnChange(fn)` - Register change callback
- `registerOnTouched(fn)` - Register touched callback
- `setDisabledState(isDisabled)` - Update disabled state

**Template Structure** (`form-checkbox.html`):
```html
<div class="flex items-center gap-2">
  <!-- Custom checkbox visual (NOT native checkbox) -->
  <!-- Uses button role with proper ARIA attributes -->
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
    <!-- Checkmark icon (SVG) visible only when checked -->
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

  <!-- Label positioned to the right of checkbox -->
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

**Styling Considerations**:
- Custom checkbox visual (button element styled as checkbox)
- Primary color (#FF7A59 coral) when checked
- Gray (gray-300/gray-600 dark) when unchecked
- Smooth transition between states
- Focus ring for keyboard accessibility
- No native HTML checkbox element

**Accessibility**:
- `role="checkbox"` on button element
- `aria-checked` reflects boolean state
- `aria-labelledby` links to label
- Keyboard support (Space/Enter to toggle)
- Disabled state with cursor-not-allowed

**Key Implementation Details**:
- Use `<button type="button">` with `role="checkbox"` instead of native `<input type="checkbox">`
- Inline SVG checkmark with `currentColor` to inherit text color
- Label click also toggles checkbox (not just button click)
- Proper focus ring positioning on dark mode

---

## Part 2: Layout Components (4 Components)

### 3. Main Layout Component

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/main-layout/main-layout.ts`

**Purpose**: Main layout wrapper that orchestrates header, sidebar, content area, and footer

**Implementation Pattern**:
- Smart layout component with fixed positioning
- Flexbox grid for responsive layout
- Uses router-outlet for dynamic page content
- Responsive: sidebar collapses on mobile

**Required Imports**:
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
```

**Component Metadata**:
- `selector`: 'app-main-layout'
- `standalone: true`
- `imports`: [CommonModule, RouterModule, Header, Sidebar, Footer]

**Class**:
- No class properties needed
- Simple presentational component

**Template Structure** (`main-layout.html`):
```html
<!-- Root container using CSS Grid -->
<div class="min-h-screen flex flex-col dark:bg-background-dark-DEFAULT">
  <!-- Fixed header spanning full width -->
  <header class="fixed top-0 left-0 right-0 z-50">
    <app-header></app-header>
  </header>

  <!-- Main content container with sidebar and content -->
  <div class="flex flex-1 pt-16"> <!-- pt-16 for header height (64px) -->

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

**Responsive Design**:
- Mobile: Sidebar hidden, full-width content
- Tablet (lg breakpoint): Sidebar visible and fixed on left
- All breakpoints: Header always visible and fixed at top
- Content area scrolls while header/footer stay fixed

**Key Layout Properties**:
- `min-h-screen`: Ensures layout takes at least full viewport height
- `flex flex-col`: Vertical flexbox for header/content/footer
- `fixed` positioning for header, sidebar
- `z-index` layering: header (50), sidebar (40)
- `pt-16`: Padding-top to account for fixed header (4rem = 64px)
- `lg:ml-64`: Left margin for sidebar on large screens (16rem = 256px)
- Dark mode aware background colors

---

### 4. Header Component

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/header/header.ts`

**Purpose**: Main application header with logo, dark mode toggle, and user menu

**Implementation Pattern**:
- Injects AuthService, ThemeService, Router
- Displays logo/app name on left
- Dark mode toggle in center
- User menu dropdown on right
- Uses form-toggle component for theme switching

**Required Imports**:
```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Router } from '@angular/router';
import { FormToggle } from '../../ui/forms/form-toggle/form-toggle';
```

**Class Implementation**:
```typescript
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

  // Observable from authService
  protected readonly currentUser$ = this.authService.user$;

  // Observable from themeService
  protected readonly theme$ = this.themeService.theme$;

  // Local state for dropdown visibility
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

**Template Structure** (`header.html`):
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

      <!-- Current user name -->
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

**Key Features**:
- Fixed positioning (handled by main-layout)
- Responsive: hides user name on mobile (sm:hidden)
- Dark mode toggle uses form-toggle component
- User avatar initials (first letter of first and last name)
- Dropdown menu for user actions
- Logout button in dropdown

**Styling Notes**:
- White background on light mode, dark secondary on dark mode
- Uses theme$ observable from ThemeService
- User menu dropdown with proper z-index
- Smooth color transitions on hover

---

### 5. Sidebar Component

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/sidebar/sidebar.ts`

**Purpose**: Main navigation sidebar with role-based menu items

**Implementation Pattern**:
- Injects Router, PermissionService for RBAC
- Shows navigation links based on user permissions
- Highlights active route with routerLinkActive
- Scrollable content area

**Required Imports**:
```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
```

**Class Implementation**:
```typescript
interface NavItem {
  label: string;
  route: string;
  icon: string; // icon name or emoji
  requiredPermission?: string; // optional permission check
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

  // Navigation items for the sidebar
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

  // Check if user has permission to view a nav item
  canViewNavItem(item: NavItem): boolean {
    if (!item.requiredPermission) {
      return true; // Public item
    }
    return this.permissionService.hasPermission(item.requiredPermission as any);
  }
}
```

**Template Structure** (`sidebar.html`):
```html
<nav class="h-full overflow-y-auto px-4 py-6 space-y-2 bg-white dark:bg-background-dark-secondary">
  <!-- Navigation items -->
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
        <!-- Icon -->
        <span class="text-lg flex-shrink-0">{{ item.icon }}</span>

        <!-- Label -->
        <span>{{ item.label }}</span>
      </a>
    }
  }
</nav>
```

**Key Features**:
- Role-based navigation with PermissionService
- Active route highlighting with routerLinkActive
- Emoji icons for visual navigation
- Smooth hover transitions
- Scrollable content (overflow-y-auto)
- Dark mode aware styling
- Responsive width handled by main-layout

**Styling Notes**:
- White background on light mode, dark secondary on dark mode
- Active state: light primary background with primary text
- Hover: light gray background
- Icons and labels with proper spacing
- Border radius on nav items for modern look

---

### 6. Footer Component

**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/footer/footer.ts`

**Purpose**: Simple application footer with copyright and version info

**Implementation Pattern**:
- Simple presentational component
- No dependencies required
- Static content with current year

**Required Imports**:
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
```

**Class Implementation**:
```typescript
@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
  appVersion = '1.0.0'; // Can read from package.json later
}
```

**Template Structure** (`footer.html`):
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

**Key Features**:
- Dynamic current year
- Version display (hardcoded for now)
- Links to policy pages (placeholders)
- Responsive layout (stacked on mobile, row on tablet+)
- Dark mode aware
- Light gray text with hover effect on links

**Styling Notes**:
- Minimal styling - mostly utility classes
- Small text (text-sm)
- Muted color (text-lighter)
- Links with hover effect
- Responsive flex layout

---

## Implementation Checklist

### Form Textarea
- [ ] Update form-textarea.ts with class implementation
- [ ] Create form-textarea.html template
- [ ] Create form-textarea.css (empty or minimal)
- [ ] Import CommonModule, FormsModule
- [ ] Implement ControlValueAccessor with NG_VALUE_ACCESSOR provider
- [ ] Add all @Input properties (label, placeholder, rows, maxLength, required, errorMessage, disabled)
- [ ] Implement onInput(), onBlur() methods
- [ ] Implement value accessor methods (writeValue, registerOnChange, registerOnTouched, setDisabledState)
- [ ] Add computed properties (showError, remainingChars)
- [ ] Use @if control flow for conditional rendering
- [ ] Add ARIA attributes for accessibility

### Form Checkbox
- [ ] Update form-checkbox.ts with class implementation
- [ ] Create form-checkbox.html template
- [ ] Create form-checkbox.css (empty)
- [ ] Import CommonModule, FormsModule
- [ ] Implement ControlValueAccessor with NG_VALUE_ACCESSOR provider
- [ ] Add all @Input properties (label, checked, disabled)
- [ ] Implement toggle() method with disabled check
- [ ] Implement onKeyDown() for Space/Enter support
- [ ] Implement value accessor methods
- [ ] Use custom button-styled checkbox (not native input)
- [ ] Add checkmark SVG for checked state
- [ ] Add proper ARIA attributes (role="checkbox", aria-checked)

### Main Layout
- [ ] Update main-layout.ts (minimal implementation)
- [ ] Create main-layout.html template
- [ ] Create main-layout.css (empty)
- [ ] Import Header, Sidebar, Footer components
- [ ] Import CommonModule, RouterModule
- [ ] Use fixed positioning for header (z-50)
- [ ] Use fixed positioning for sidebar with lg:flex (z-40)
- [ ] Use router-outlet for content area
- [ ] Set proper padding/margin for header (pt-16) and sidebar (lg:ml-64)
- [ ] Dark mode background color on root div

### Header
- [ ] Update header.ts with class implementation
- [ ] Create header.html template
- [ ] Create header.css (empty)
- [ ] Inject AuthService, ThemeService, Router
- [ ] Import FormToggle component
- [ ] Add currentUser$ and theme$ observables
- [ ] Implement toggleUserMenu(), closeUserMenu(), logout() methods
- [ ] Implement onThemeChange(isDark) method
- [ ] Create logo/app name display section
- [ ] Add dark mode toggle using form-toggle
- [ ] Add user menu with dropdown
- [ ] Show user name and role on tablet+ (hidden on mobile)
- [ ] Add user avatar with initials
- [ ] Add logout button in dropdown menu

### Sidebar
- [ ] Update sidebar.ts with class implementation
- [ ] Create sidebar.html template
- [ ] Create sidebar.css (empty)
- [ ] Inject PermissionService, Router
- [ ] Import RouterModule
- [ ] Define NavItem interface with label, route, icon, requiredPermission
- [ ] Create navItems array with all 7 menu items (Dashboard, Companies, Users, Products, Sales, Purchases, Inventory)
- [ ] Implement canViewNavItem() method for RBAC
- [ ] Use @for loop with @if conditional for permission checking
- [ ] Use routerLink with routerLinkActive for active highlighting
- [ ] Style active state with primary colors
- [ ] Add hover transitions

### Footer
- [ ] Update footer.ts with class implementation
- [ ] Create footer.html template
- [ ] Create footer.css (empty)
- [ ] Add currentYear property (new Date().getFullYear())
- [ ] Add appVersion property (hardcoded as '1.0.0')
- [ ] Display copyright with year
- [ ] Add version number
- [ ] Add placeholder links to Privacy Policy and Terms of Service
- [ ] Make layout responsive (flex-col on mobile, flex-row on tablet+)

---

## Styling Standards Applied

### Theme Colors Used
- **Primary**: `primary-500` (#FF7A59 - Coral) for main actions and active states
- **Text**: `text` / `text-dark-DEFAULT` for primary text
- **Text Light**: `text-lighter` / `text-dark-lighter` for secondary text
- **Background**: `bg-white` / `dark:bg-background-dark-secondary`
- **Accent**: `accent-red` (#F2545B) for errors and danger
- **Borders**: `border-gray-300` light / `dark:border-gray-700` dark

### Tailwind Utility Classes (No Custom CSS)
- Padding/Margin: `px-4 py-2.5` (spacing)
- Border Radius: `rounded-lg` (0.75rem)
- Transitions: `transition-all duration-200`
- Focus Ring: `focus:ring-2 focus:ring-primary-500`
- Dark Mode: `dark:` prefix for dark mode variants
- Responsive: `hidden sm:block` (mobile first)

### Accessibility Standards
- All form inputs: `aria-required`, `aria-invalid`, `aria-describedby`
- Checkboxes: `role="checkbox"`, `aria-checked`
- Toggles: `role="switch"`, `aria-checked`
- Error messages: `role="alert"`, `aria-live="polite"`
- Proper label associations with `for` and `id`
- Keyboard support (Space, Enter, Tab)

---

## Build and Test Notes

### After Implementation
1. Run `npm run build` or `yarn build` to compile
2. Check for TypeScript errors (strict mode)
3. Verify all imports are correct
4. Test dark mode toggle functionality
5. Test form components with reactive forms
6. Test sidebar navigation and active route highlighting
7. Test responsive layout on mobile/tablet/desktop

### HTML Syntax
- Use Angular's new control flow syntax:
  - `@if (condition) { content }`
  - `@for (item of items; track item.id) { content }`
  - `@else { fallback }`
- Use `async` pipe for observables: `{{ observable$ | async }}`
- Property binding: `[property]="value"`
- Event binding: `(event)="method()"`
- Attribute binding: `[attr.name]="value"`

### Dark Mode
- All components must support dark mode
- Use `dark:` Tailwind prefix for dark variants
- Example: `bg-white dark:bg-background-dark-secondary`
- Background colors automatically apply dark mode

---

## File Paths Summary

| Component | Type File | Template File | CSS File |
|-----------|-----------|---------------|----------|
| form-textarea | /Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-textarea/form-textarea.ts | form-textarea.html | form-textarea.css |
| form-checkbox | /Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-checkbox/form-checkbox.ts | form-checkbox.html | form-checkbox.css |
| main-layout | /Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/main-layout/main-layout.ts | main-layout.html | main-layout.css |
| header | /Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/header/header.ts | header.html | header.css |
| sidebar | /Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/sidebar/sidebar.ts | sidebar.html | sidebar.css |
| footer | /Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/footer/footer.ts | footer.html | footer.css |

---

## Dependencies Summary

### Shared Services Required
- `AuthService` - Authentication state and user data
- `ThemeService` - Dark mode toggle and theme state
- `PermissionService` - Role-based access control
- `Router` - Navigation and route tracking

### Shared Components Required
- `FormToggle` - Used in header for dark mode toggle
- `Header` - Used in main-layout
- `Sidebar` - Used in main-layout
- `Footer` - Used in main-layout

### Angular Imports
- `CommonModule` - for *ngIf, *ngFor, async pipe
- `FormsModule` - for form controls and ControlValueAccessor
- `RouterModule` - for routerLink, routerLinkActive, router-outlet

---

## Important Implementation Notes

1. **ControlValueAccessor Pattern**: Form components must implement this interface for reactive forms integration. Use `forwardRef` in provider to avoid circular dependency.

2. **Touch Tracking**: Track `touched` state separately - only show errors after field is touched.

3. **Unique IDs**: Generate unique IDs with random suffix to avoid collisions: `form-input-${Math.random().toString(36).substring(2, 9)}`

4. **Observables**: Use `| async` pipe in templates instead of manual subscriptions. This handles subscription cleanup automatically.

5. **Dark Mode**: All components already support dark mode through Tailwind's `dark:` prefix. No additional changes needed.

6. **Responsive**: Use Tailwind breakpoints (`sm:`, `lg:`, etc.) for responsive design. Mobile-first approach.

7. **Accessibility**: Every interactive element must have proper ARIA attributes and keyboard support.

8. **Standalone Components**: All components have `standalone: true` and explicitly import dependencies. No NgModules used.

9. **Dependency Injection**: Use `inject()` function for dependencies in component class bodies (Angular 20 best practice).

10. **Router Integration**: Sidebar uses actual route tracking to highlight active item. Use `router.url` for comparison.
