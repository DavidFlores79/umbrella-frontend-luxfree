# Phase 2 Implementation Quick Reference

## File Locations (Copy-Paste Ready)

```
src/app/shared/components/ui/forms/form-textarea/form-textarea.ts
src/app/shared/components/ui/forms/form-textarea/form-textarea.html
src/app/shared/components/ui/forms/form-textarea/form-textarea.css

src/app/shared/components/ui/forms/form-checkbox/form-checkbox.ts
src/app/shared/components/ui/forms/form-checkbox/form-checkbox.html
src/app/shared/components/ui/forms/form-checkbox/form-checkbox.css

src/app/shared/components/layout/main-layout/main-layout.ts
src/app/shared/components/layout/main-layout/main-layout.html
src/app/shared/components/layout/main-layout/main-layout.css

src/app/shared/components/layout/header/header.ts
src/app/shared/components/layout/header/header.html
src/app/shared/components/layout/header/header.css

src/app/shared/components/layout/sidebar/sidebar.ts
src/app/shared/components/layout/sidebar/sidebar.html
src/app/shared/components/layout/sidebar/sidebar.css

src/app/shared/components/layout/footer/footer.ts
src/app/shared/components/layout/footer/footer.html
src/app/shared/components/layout/footer/footer.css
```

---

## Quick Pattern Reference

### ControlValueAccessor Pattern (form-textarea & form-checkbox)

```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-NAME',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-NAME.html',
  styleUrl: './form-NAME.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormNAME),
      multi: true
    }
  ]
})
export class FormNAME implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;

  value: string | boolean = '';
  touched = false;
  uniqueId = `form-NAME-${Math.random().toString(36).substring(2, 9)}`;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // Change handlers
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  // ControlValueAccessor interface
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: any) => void): void {
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
}
```

### Component with Service Injection Pattern (header, sidebar)

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-component-name',
  imports: [CommonModule, RouterModule],
  templateUrl: './component-name.html',
  styleUrl: './component-name.css'
})
export class ComponentName {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly currentUser$ = this.authService.user$;

  someMethod(): void {
    // Implementation
  }
}
```

### Simple Presentational Component Pattern (footer, main-layout)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-component-name',
  imports: [CommonModule],
  templateUrl: './component-name.html',
  styleUrl: './component-name.css'
})
export class ComponentName {
  currentYear = new Date().getFullYear();
}
```

---

## HTML Template Patterns

### Control Flow Syntax (Angular 20)

```html
<!-- If/Else -->
@if (condition) {
  <div>Content when true</div>
} @else {
  <div>Content when false</div>
}

<!-- For loop -->
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

<!-- Combining -->
@if (items.length > 0) {
  @for (item of items; track item.id) {
    <div>{{ item }}</div>
  }
} @else {
  <p>No items</p>
}
```

### Async Pipe Pattern

```html
<!-- Observable display -->
<p>{{ user$ | async | json }}</p>

<!-- With null coalescing -->
@if (user$ | async as user) {
  <h1>{{ user.firstName }} {{ user.lastName }}</h1>
  <p>{{ user.email }}</p>
}

<!-- In ngFor alternative -->
@for (item of items$ | async; track item.id) {
  <div>{{ item.name }}</div>
}
```

### Conditional Classes

```html
<!-- Single condition -->
<div [class.active]="isActive">Content</div>

<!-- Multiple conditions -->
<div [class.bg-primary-500]="isPrimary"
     [class.bg-gray-300]="!isPrimary"
     [class.dark:bg-primary-900]="isPrimary">
</div>

<!-- Dynamic class binding -->
<div [class]="baseClasses + ' ' + variantClasses"></div>

<!-- Using computed property -->
<div [class]="computedClasses">Content</div>
```

### Dark Mode Pattern

```html
<!-- Light/Dark variants -->
<div class="bg-white dark:bg-background-dark-secondary
            text-text dark:text-text-dark-DEFAULT
            border-gray-300 dark:border-gray-700">
</div>

<!-- Applied consistently across all components -->
<!-- bg-white = light mode white
     dark:bg-background-dark-secondary = dark mode secondary background
     Similar pattern for text colors and borders
-->
```

---

## Tailwind Classes Quick Reference

### Spacing (px = pixel / rem = 0.25rem)
- `px-4` = 1rem (16px) horizontal padding
- `py-2.5` = 0.625rem (10px) vertical padding
- `gap-3` = 0.75rem (12px) gap between flex items
- `mt-2` = 0.5rem margin top
- `ml-0.5` = 0.125rem margin left

### Border & Shadow
- `border rounded-lg` = 1px border with 0.75rem radius
- `shadow-sm`, `shadow-md`, `shadow-lg` = box shadows
- `border-gray-300 dark:border-gray-700` = light/dark borders

### Display & Layout
- `flex items-center justify-between` = flexbox horizontal layout
- `flex-col` = flex column layout
- `hidden sm:block` = hidden on mobile, visible on tablet+
- `lg:flex lg:flex-col` = flex on large screens
- `flex-1` = flex-grow to fill space
- `overflow-y-auto` = scrollable vertically

### Colors
- `bg-white dark:bg-background-dark-secondary` = background
- `text-text dark:text-text-dark-DEFAULT` = text color
- `text-primary-500` = primary coral color
- `text-accent-red` = error red color
- `border-gray-300 dark:border-gray-700` = borders

### States
- `hover:bg-gray-100` = on hover
- `focus:outline-none focus:ring-2 focus:ring-primary-500` = focus state
- `disabled:opacity-50 disabled:cursor-not-allowed` = disabled state
- `active` = active state (can be custom)

### Responsive
- `hidden` = hidden by default (mobile first)
- `sm:block` = visible from small (640px) and up
- `lg:flex` = flex from large (1024px) and up
- `hidden lg:flex lg:flex-col` = different layouts per breakpoint

---

## Key Implementation Steps

### 1. Form Textarea
1. Copy form-input.ts structure
2. Change `<input>` to `<textarea>`
3. Add `rows` property and attribute
4. Update character counter position (bottom-right)
5. Add `resize-none` class
6. Add `[attr.rows]="rows"` binding

### 2. Form Checkbox
1. Create button-styled checkbox (not native input)
2. Use `role="checkbox"` and `aria-checked`
3. Add custom SVG checkmark
4. Style with primary-500 when checked
5. Implement toggle() with disabled check
6. Support Space/Enter keyboard keys

### 3. Main Layout
1. Create grid/flex layout with header, sidebar, content, footer
2. Fixed header with z-50 (top-0, left-0, right-0)
3. Fixed sidebar with lg:flex (hidden on mobile)
4. Content area with pt-16 (header height) and lg:ml-64 (sidebar width)
5. Router outlet in content area
6. Footer at bottom with border-t

### 4. Header
1. Inject AuthService, ThemeService, Router
2. Display logo/app name on left
3. Dark mode toggle (form-toggle) in center
4. User menu (dropdown) on right
5. Show user name on tablet+ (sm:hidden)
6. Logout button in dropdown

### 5. Sidebar
1. Create NavItem interface
2. Define 7 nav items (Dashboard, Companies, Users, Products, Sales, Purchases, Inventory)
3. Use PermissionService.hasPermission() for RBAC
4. Use routerLink with routerLinkActive="active"
5. Highlight active route with primary colors
6. Add emoji icons

### 6. Footer
1. Display copyright with current year
2. Show version (hardcoded as 1.0.0)
3. Add placeholder links
4. Responsive layout (flex-col on mobile, flex-row on tablet+)
5. Minimal styling with light text color

---

## Testing the Components After Implementation

```bash
# Build the project
yarn build
# or
npm run build

# Run tests
yarn test
# or
npm test

# Start dev server
yarn dev
# or
npm start
```

### Manual Testing Checklist
- [ ] Form textarea: input text, character counter, validation error
- [ ] Form checkbox: click to toggle, keyboard Space/Enter, disabled state
- [ ] Header: dark mode toggle works, user menu opens/closes, logout button
- [ ] Sidebar: navigation links work, active route highlighted, permission filtering
- [ ] Footer: current year correct, version displays, links not broken
- [ ] Main Layout: responsive on mobile/tablet/desktop, scrolling works
- [ ] Dark mode: toggle affects all components
- [ ] ARIA attributes: accessibility checker passes

---

## Common Mistakes to Avoid

1. **Forgetting NG_VALUE_ACCESSOR Provider** - Form inputs won't work with reactive forms
2. **Not Using `async` Pipe** - Manual subscriptions cause memory leaks
3. **Missing `track` in @for** - Angular warns about performance
4. **Wrong Class Names** - Check tailwind.config.js for exact color names
5. **Missing Dark Mode Classes** - Always pair `dark:` variant
6. **Forgetting `standalone: true`** - Component won't work without it
7. **Using Constructor Instead of `inject()`** - Not idiomatic Angular 20
8. **Incorrect ARIA Attributes** - Breaks accessibility
9. **Not Testing Touch State** - Errors show immediately, should show on touch
10. **Hardcoded IDs** - Use generated unique IDs to avoid conflicts

---

## Useful References

### Theme Colors in Tailwind Config
```javascript
primary-500: '#FF7A59'           // Coral - main action color
accent-red: '#F2545B'            // Error/danger
accent-green: '#00A862'          // Success
accent-yellow: '#FFB800'         // Warning
accent-blue: '#0091AE'           // Info

text: '#2D3E50'                  // Primary text
text-lighter: '#A1B1C4'          // Tertiary text
text-dark-DEFAULT: '#E5E9F0'     // Dark mode text

background-DEFAULT: '#FFFFFF'    // Light background
background-secondary: '#FFF1EE'  // Light secondary
background-dark-secondary: '#242936'  // Dark secondary
```

### Service Inject Examples
```typescript
// In component class
private readonly authService = inject(AuthService);
private readonly themeService = inject(ThemeService);
private readonly permissionService = inject(PermissionService);
private readonly router = inject(Router);

// Access current values synchronously
const user = this.authService.currentUser;  // null or User
const isDark = this.themeService.isDarkMode;  // boolean
const isAdmin = this.permissionService.isAdmin();  // boolean

// Observable access (for templates with async pipe)
protected readonly currentUser$ = this.authService.user$;
protected readonly theme$ = this.themeService.theme$;
```

---

## Next Steps After Implementation

1. **Update app.routes.ts** - Add routes for features
2. **Update app.ts** - Use main-layout as root component or wrapper
3. **Create feature modules** - Use these components in feature pages
4. **Update app.config.ts** - Add any additional providers if needed
5. **Run full test suite** - Ensure all tests pass
6. **Build for production** - `ng build` and check bundle size

---

## Documentation Links

- Angular 20 Docs: https://angular.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Reactive Forms: https://angular.io/guide/reactive-forms
- Dark Mode: https://tailwindcss.com/docs/dark-mode
- Accessibility (ARIA): https://www.w3.org/WAI/ARIA/apg/

