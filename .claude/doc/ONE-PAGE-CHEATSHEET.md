# Design System - One Page Cheatsheet

## HubSpot Colors

```
Primary:     coral-500  (#FF7A59)
Secondary:   blue-500   (#0B8DEF)
Text:        text       (#2D3E50)
Background:  bg-light   (#FFF1EE)
Success:     success    (#27AE60)
Warning:     warning    (#F39C12)
Error:       error      (#E74C3C)

Dark Mode: Add "dark:" prefix to all Tailwind classes
```

## Tailwind Setup (5 minutes)

```bash
npm install -D tailwindcss postcss autoprefixer chart.js ng2-charts
npx tailwindcss init -p
```

Then copy `/tailwind.config.js` from `.claude/doc/tailwind-config-reference.js`

## Components Overview

| Component | File | Usage |
|-----------|------|-------|
| **FormInput** | form-input.component.ts | Text fields with validation |
| **FormSelect** | form-select.component.ts | Dropdown selects |
| **FormCheckbox** | form-checkbox.component.ts | Checkboxes |
| **FormToggle** | form-toggle.component.ts | Toggle switches |
| **Card** | card.component.ts | Content containers |
| **Badge** | badge.component.ts | Status labels |
| **Alert** | alert.component.ts | Messages/notifications |
| **DataTable** | data-table.component.ts | Sortable, filterable tables |
| **StatCard** | stat-card.component.ts | Metrics display |
| **Skeleton** | skeleton.component.ts | Loading placeholders |
| **Header** | header.component.ts | Top navigation |
| **Sidebar** | sidebar.component.ts | Left navigation |
| **MainLayout** | main-layout.component.ts | App shell |

## Quick Component Usage

```typescript
// Form with submit-only validation
<form [formGroup]="form" (ngSubmit)="onSubmit()" appSubmitValidation #f="appSubmitValidation">
  <app-form-input
    [control]="form.get('email')!"
    label="Email"
    [showError]="f.shouldShowError('email')">
  </app-form-input>
  <button type="submit" class="btn-primary">Submit</button>
</form>

// Data table with all features
<app-data-table
  [data]="users$ | async"
  [columns]="columns"
  [config]="{ pageSize: 10, showSearch: true, showSelection: true }">
</app-data-table>

// Chart card
<app-chart-card
  title="Revenue"
  [chartConfig]="chartConfig">
</app-chart-card>

// Loading state
<ng-container *ngIf="loading$ | async; else loaded">
  <app-skeleton type="table-row" [count]="5"></app-skeleton>
</ng-container>
<ng-template #loaded>
  <!-- content -->
</ng-template>

// Stats display
<app-stat-card label="Revenue" [value]="45000" [trend]="12.5" icon="💰"></app-stat-card>

// Alerts
<app-alert type="success" [dismissible]="true">
  Operation completed successfully
</app-alert>
```

## Dark Mode Toggle

```typescript
// In HeaderComponent
constructor(private themeService: ThemeService) {}

toggleDarkMode(): void {
  this.themeService.toggle();
}
```

## Responsive Classes

```
Mobile (default):     w-full p-2
Tablet (md:):        md:w-1/2 md:p-4
Desktop (lg:):       lg:w-1/3 lg:p-6
Wide (xl:):          xl:w-1/4 xl:p-8

Grid responsive:     grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Flexbox responsive:  flex flex-col md:flex-row gap-4
Hide on mobile:      hidden md:block
Show only mobile:    block md:hidden
```

## Form Validation Pattern

```typescript
// Component
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  name: ['', Validators.required]
});

onSubmit(): void {
  if (this.form.valid) {
    // Submit logic
  }
}

// Template
<form [formGroup]="form" (ngSubmit)="onSubmit()" appSubmitValidation #f="appSubmitValidation">
  <app-form-input
    [control]="form.get('email')!"
    [showError]="f.shouldShowError('email')"
    label="Email">
  </app-form-input>
</form>
```

## Chart.js Integration

```typescript
chartConfig: ChartConfiguration = {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Revenue',
      data: [65, 59, 80],
      borderColor: '#FF7A59',
      backgroundColor: 'rgba(255, 122, 89, 0.1)'
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: true } }
  }
};
```

## Tailwind Button Classes

```
btn-primary    - Coral, white text, hover effect
btn-secondary  - Gray, text color
btn-ghost      - Transparent, coral text
btn-danger     - Red background, white text
btn-sm         - Smaller button (px-3 py-1)
btn-lg         - Larger button (px-6 py-3)
btn:disabled    - Grayed out, cursor-not-allowed
```

## Tailwind Card Classes

```
card           - Default card with border and shadow
card-elevated  - Higher shadow, more prominent
card-outlined  - Outlined only, no fill
```

## Common Tailwind Utilities

```
Text:          text-sm, text-base, text-lg, text-xl
Spacing:       p-4, m-4, gap-4, space-y-4
Colors:        bg-coral, text-text, border-border-light
Dark mode:     dark:bg-dark-bg-primary, dark:text-text-inverse
Hover:         hover:bg-gray-100, hover:text-coral
Rounded:       rounded-lg, rounded-xl, rounded-full
Shadow:        shadow-md, shadow-lg, shadow-xl
Width:         w-full, w-1/2, w-1/3
Height:        h-10, h-12, h-16, h-full
Display:       flex, grid, block, hidden
```

## Dark Mode Syntax

```html
<!-- Light mode class (always applied) -->
<div class="bg-white text-text">

<!-- Dark mode class (only in dark: theme) -->
<div class="bg-white dark:bg-dark-bg-secondary
            text-text dark:text-text-inverse">

<!-- All colors should have dark: variant -->
border-border-light dark:border-border-dark
bg-coral dark:bg-coral-600
shadow-md dark:shadow-dark-md
```

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Tailwind not applying | Check `content` in tailwind.config.js includes `./src/**/*.{html,ts}` |
| Dark mode not toggling | Verify `ThemeService` is in `app.config.ts` providers |
| Component not found | Add `standalone: true` and verify import in @Component |
| Form errors appear early | Use submit-only validation directive, not keystroke |
| Colors don't match design | Check you're using `coral-500` not `coral`, use semantic colors |

## File Structure

```
.claude/doc/
├── design-system-implementation.md    (Complete guide)
├── tailwind-config-reference.js       (Tailwind config)
├── quick-reference-guide.md           (Implementation guide)
├── component-blueprints.md            (Copy-paste code)
├── IMPLEMENTATION-SUMMARY.md          (Executive summary)
└── ONE-PAGE-CHEATSHEET.md            (This file)
```

## Installation Steps (Copy-Paste)

```bash
# 1. Install dependencies
npm install -D tailwindcss postcss autoprefixer chart.js ng2-charts

# 2. Create tailwind config
npx tailwindcss init -p

# 3. Copy this to tailwind.config.js from reference file

# 4. Update src/styles.css with:
@tailwind base;
@tailwind components;
@tailwind utilities;

# 5. Start dev server
npm start

# 6. Copy components from component-blueprints.md into your src/app/shared/components/
```

## Color Palette (Quick Reference)

```
Coral (Primary):     50-950 shades of #FF7A59
Blue (Secondary):    50-950 shades of #0B8DEF
Gray (Neutral):      50-900 shades of #999999
Success:             #27AE60
Warning:             #F39C12
Error:               #E74C3C
Info:                #0B8DEF

Text Dark Mode:      #E8EEF5 (light gray)
Background Dark:     #0F1419 (near black)
Surface Dark:        #1A1F27 (dark gray)
```

## Responsive Breakpoints

```
xs   0px   (Mobile, default)
sm  640px  (Small mobile)
md  768px  (Tablet)
lg 1024px  (Desktop)
xl 1280px  (Large desktop)
2xl 1536px (Extra large)

Usage: text-sm md:text-base lg:text-lg
```

## Component Imports

```typescript
// All components are standalone, import directly:
import { CardComponent } from '@shared/components';
import { FormInputComponent } from '@shared/components';
import { DataTableComponent } from '@shared/components';

// Or use barrel export:
import { CardComponent, FormInputComponent } from '@shared/components';

// Add to imports array in @Component decorator
@Component({
  standalone: true,
  imports: [CardComponent, FormInputComponent, CommonModule]
})
```

## Theme Service Usage

```typescript
// Inject in any component
constructor(private themeService: ThemeService) {}

// Toggle dark mode
toggleDarkMode(): void {
  this.themeService.toggle();
}

// Get dark mode state
isDarkMode$ = this.themeService.isDarkMode$;

// In template
<button (click)="toggleDarkMode()">
  {{ (isDarkMode$ | async) ? '☀️' : '🌙' }}
</button>
```

## Testing Commands

```bash
# Start dev server
npm start

# Run unit tests
npm test

# Build for production
npm run build

# Run tests in watch mode
ng test --watch
```

## Key Files to Create/Modify

- `/tailwind.config.js` - Tailwind configuration
- `/postcss.config.js` - PostCSS configuration
- `/src/styles.css` - Add Tailwind directives
- `/src/app/core/services/theme.service.ts` - Dark mode service
- `/src/app/shared/components/` - All 15+ components

## Browser DevTools Tips

```javascript
// Test dark mode
document.documentElement.classList.add('dark');
document.documentElement.classList.remove('dark');

// Check localStorage
localStorage.getItem('theme');
localStorage.setItem('theme', 'dark');

// Check Tailwind is loaded
console.log(window.getComputedStyle(document.body).backgroundColor);
```

---

**Print this page for quick reference during implementation!**

All details available in accompanying documentation files.
Last Updated: 2025-11-26
