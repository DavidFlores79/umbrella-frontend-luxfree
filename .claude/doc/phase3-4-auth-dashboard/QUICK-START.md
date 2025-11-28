# Phase 3 & 4: Quick Start Guide

**Last Updated:** November 27, 2025

---

## TL;DR

Build authentication (login/register) and dashboard features for Umbrella Frontend using Angular 20 standalone components, RxJS state management, and HubSpot-inspired design.

---

## Prerequisites

✅ Phase 1 complete (core services)
✅ Phase 2 complete (shared components)
✅ Angular 20.3 installed
✅ Tailwind CSS configured

---

## Installation

```bash
# Install Chart.js dependencies for dashboard
npm install ng2-charts chart.js
```

---

## File Creation Order

### Step 1: Authentication Feature

```bash
# Create directories
mkdir -p src/app/features/auth/login
mkdir -p src/app/features/auth/register

# Create files (copy from implementation plan)
# 1. src/app/features/auth/login/login.component.ts
# 2. src/app/features/auth/login/login.component.html
# 3. src/app/features/auth/register/register.component.ts
# 4. src/app/features/auth/register/register.component.html
# 5. src/app/features/auth/auth.routes.ts
```

### Step 2: Dashboard Feature

```bash
# Create directories
mkdir -p src/app/features/dashboard/services

# Create files (copy from implementation plan)
# 1. src/app/features/dashboard/services/dashboard.store.ts
# 2. src/app/features/dashboard/dashboard.component.ts
# 3. src/app/features/dashboard/dashboard.component.html
# 4. src/app/features/dashboard/dashboard.routes.ts
```

### Step 3: Update App Config

```typescript
// src/app/app.config.ts
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    provideCharts(withDefaultRegisterables())
  ]
};
```

### Step 4: Update Main Routes

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
  { path: '**', redirectTo: '/auth/login' }
];
```

---

## Test Credentials

```
Email: admin@techsolutions.com
Password: password123
```

---

## Component Checklist

### LoginComponent
- [ ] Reactive form with email and password
- [ ] Submit-only validation
- [ ] Loading state from AuthService
- [ ] Error display with Alert component
- [ ] Link to register page
- [ ] Redirect to /dashboard on success

### RegisterComponent
- [ ] Multi-section form (user + company)
- [ ] Password matching validation
- [ ] All required fields validated
- [ ] Loading state during registration
- [ ] Link to login page
- [ ] Creates admin user for new company

### DashboardStore
- [ ] Extends StoreBase<DashboardState>
- [ ] loadDashboardData() method
- [ ] Uses forkJoin for parallel loading
- [ ] Calculates metrics from sales/purchases
- [ ] Generates chart data
- [ ] Filters by company context

### DashboardComponent
- [ ] 4 StatCard components (metrics)
- [ ] Line chart (revenue trends)
- [ ] Bar chart (expense breakdown)
- [ ] Recent transactions table
- [ ] Low stock alerts section
- [ ] Loading skeletons
- [ ] Error handling

---

## Key Patterns to Follow

### 1. Component Structure

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, /* shared components */],
  templateUrl: './feature.component.html'
})
export class FeatureComponent implements OnInit, OnDestroy {
  private readonly service = inject(ServiceName);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Load data
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. Reactive Forms

```typescript
loginForm: FormGroup;

constructor() {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
}

onSubmit(): void {
  this.submitted = true;
  if (this.loginForm.invalid) return;

  const { email, password } = this.loginForm.value;
  // Call service...
}
```

### 3. Store Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureStore extends StoreBase<FeatureState> {
  private readonly api = inject(MockApiService);

  readonly data$ = this.select(state => state.data);
  readonly loading$ = this.select(state => state.loading);

  constructor() {
    super({ data: [], loading: false, error: null });
  }

  loadData(): void {
    this.patchState({ loading: true });
    this.api.getData().pipe(
      tap(data => this.patchState({ data, loading: false })),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }
}
```

### 4. Template with Async Pipe

```html
<div *ngIf="viewModel$ | async as vm">
  <app-skeleton-loader *ngIf="vm.loading"></app-skeleton-loader>
  <app-alert *ngIf="vm.error" type="error" [title]="vm.error"></app-alert>

  <div *ngIf="!vm.loading && !vm.error">
    <!-- Content here -->
  </div>
</div>
```

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Use Angular Signals for state management
- Use constructor injection (use `inject()` instead)
- Show validation errors on keystroke
- Forget to unsubscribe from Observables
- Use `any` type

✅ **DO:**
- Use RxJS BehaviorSubject and Observable
- Use `inject()` for dependency injection
- Show validation errors only after submit
- Use `takeUntil(destroy$)` or `async` pipe
- Define strict TypeScript interfaces

---

## Responsive Design Classes

```html
<!-- Stack on mobile, grid on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<!-- Full width on mobile, constrained on desktop -->
<div class="w-full max-w-md mx-auto">

<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">

<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">
```

---

## Color Usage

```html
<!-- Primary button (coral) -->
<app-button variant="primary">

<!-- Status badges -->
<app-badge variant="success" text="Paid">
<app-badge variant="warning" text="Pending">
<app-badge variant="danger" text="Cancelled">
<app-badge variant="info" text="Draft">

<!-- Chart colors -->
datasets: [{
  backgroundColor: '#FF7A59', // Primary coral
  borderColor: '#0091AE',     // Accent blue
  // ... other colors
}]
```

---

## Chart Configuration

```typescript
// Line Chart
revenueChartConfig: ChartConfiguration<'line'> = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }
};

// Bar Chart
expenseChartConfig: ChartConfiguration<'bar'> = {
  type: 'bar',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  }
};
```

---

## Running the App

```bash
# Development server
npm start
# or
ng serve

# Navigate to
http://localhost:4200

# Should redirect to /auth/login (unauthenticated)
```

---

## Testing Flow

1. **Start app** → redirects to `/auth/login`
2. **Click "Sign up"** → navigate to `/auth/register`
3. **Fill registration form** → create account
4. **Auto-login** → redirect to `/dashboard`
5. **View dashboard** → see metrics, charts, transactions
6. **Logout** (when implemented) → back to `/auth/login`

---

## Debug Checklist

### Login not working?
- [ ] Check console for errors
- [ ] Verify email format
- [ ] Use test credentials: `admin@techsolutions.com / password123`
- [ ] Check AuthService is loaded
- [ ] Verify MockApiService has seed data

### Dashboard not loading?
- [ ] Check if authenticated (token in localStorage)
- [ ] Verify company context is set
- [ ] Check browser console for API errors
- [ ] Ensure Chart.js is installed
- [ ] Verify app.config.ts has provideCharts

### Charts not rendering?
- [ ] Install: `npm install ng2-charts chart.js`
- [ ] Import BaseChartDirective in component
- [ ] Add provideCharts to app.config.ts
- [ ] Check chart data structure matches ChartData interface
- [ ] Verify canvas element exists in template

---

## File Sizes (Approximate)

- `login.component.ts`: ~150 lines
- `login.component.html`: ~80 lines
- `register.component.ts`: ~180 lines
- `register.component.html`: ~250 lines
- `dashboard.store.ts`: ~300 lines
- `dashboard.component.ts`: ~120 lines
- `dashboard.component.html`: ~200 lines

Total: ~1,280 lines of code

---

## Estimated Time

- **Phase 3 (Auth):** 3-4 hours
- **Phase 4 (Dashboard):** 5-6 hours
- **Testing:** 2-3 hours
- **Total:** 10-13 hours

---

## Resources

- **Full Implementation Plan:** `angular-frontend.md` (this folder)
- **Summary:** `IMPLEMENTATION-SUMMARY.md` (this folder)
- **Project Docs:** `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/.claude/doc/`
- **CLAUDE.md:** Main project guide

---

## Success Metrics

You're done when:
✅ Login works with test credentials
✅ Registration creates new user and company
✅ Dashboard displays all metrics
✅ Charts render with data
✅ Recent transactions table shows data
✅ Low stock alerts appear when applicable
✅ Responsive on mobile and desktop
✅ Loading states work correctly
✅ Error handling displays properly

---

**Ready to Start?**

1. Install dependencies: `npm install ng2-charts chart.js`
2. Create auth feature files
3. Create dashboard feature files
4. Update app.config.ts and app.routes.ts
5. Test in browser
6. Write tests

**Good luck!** 🚀
