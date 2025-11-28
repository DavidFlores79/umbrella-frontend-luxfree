# Phase 3 & 4: Authentication and Dashboard - Implementation Plan

**Project:** Umbrella Frontend MVP
**Angular Version:** 20.3 (Standalone Components)
**Date:** November 27, 2025
**Status:** Implementation Ready

---

## Table of Contents
1. [Overview](#overview)
2. [Phase 3: Authentication Feature](#phase-3-authentication-feature)
3. [Phase 4: Dashboard Feature](#phase-4-dashboard-feature)
4. [Main Application Routing](#main-application-routing)
5. [Integration Points](#integration-points)
6. [Testing Strategy](#testing-strategy)
7. [Important Notes](#important-notes)

---

## Overview

This implementation plan covers the complete implementation of:
- **Phase 3:** Authentication feature with login and registration components
- **Phase 4:** Dashboard feature with metrics, charts, and data visualization

Both phases follow Angular 20 standalone architecture patterns with:
- RxJS-based state management (NO Angular Signals for state)
- `inject()` function for dependency injection
- Reactive forms with submit-only validation
- HubSpot-inspired design system using Tailwind CSS
- Integration with existing core services

### Key Principles
- **Single Responsibility:** Each component has one clear purpose
- **Type Safety:** Strict TypeScript with no `any` types
- **Reactive Patterns:** Use RxJS Observables with `async` pipe
- **Reusability:** Leverage existing shared components
- **Accessibility:** WCAG 2.1 AA compliant

---

## Phase 3: Authentication Feature

### Directory Structure

```
src/app/features/auth/
├── login/
│   ├── login.component.ts
│   └── login.component.html
├── register/
│   ├── register.component.ts
│   └── register.component.html
└── auth.routes.ts
```

---

### 3.1 Login Component

**File:** `src/app/features/auth/login/login.component.ts`

#### Purpose
Provides email/password authentication with form validation and error handling.

#### Component Architecture

**Dependencies:**
```typescript
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Core Services
import { AuthService } from '../../../core/services/auth.service';

// Shared Components
import { Card } from '../../../shared/components/ui/card/card';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { Button } from '../../../shared/components/ui/button/button';
import { Alert } from '../../../shared/components/ui/alert/alert';
```

**Component Metadata:**
```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    Card,
    FormInput,
    Button,
    Alert
  ],
  templateUrl: './login.component.html'
})
```

**Class Implementation:**
```typescript
export class LoginComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // Reactive form
  loginForm: FormGroup;

  // Component state
  submitted = false;
  errorMessage = '';

  // Observable subscriptions
  loading$ = this.authService.loading$;
  error$ = this.authService.error$;

  constructor() {
    this.loginForm = this.createForm();

    // Subscribe to auth errors
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.errorMessage = error;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.authService.clearError();

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Login failed. Please try again.';
        }
      });
  }

  getFieldError(fieldName: string): string {
    if (!this.submitted) return '';

    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${this.capitalize(fieldName)} is required`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.capitalize(fieldName)} must be at least ${minLength} characters`;
    }

    return '';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  dismissError(): void {
    this.errorMessage = '';
    this.authService.clearError();
  }
}
```

**Key Implementation Notes:**
1. **Submit-Only Validation:** Form errors only shown after submit attempt
2. **RxJS Cleanup:** Uses `takeUntil(destroy$)` pattern for subscription management
3. **Error Handling:** Displays both form validation and authentication errors
4. **Loading State:** Uses AuthService loading$ observable
5. **Navigation:** Redirects to /dashboard on success

---

**File:** `src/app/features/auth/login/login.component.html`

#### Template Structure

```html
<div class="min-h-screen bg-background flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <!-- Logo and Title -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-text mb-2">Umbrella</h1>
      <p class="text-text-light">Sign in to your account</p>
    </div>

    <!-- Login Card -->
    <app-card>
      <!-- Error Alert -->
      <div *ngIf="errorMessage" class="mb-6">
        <app-alert
          type="error"
          [title]="errorMessage"
          [dismissible]="true"
          (dismissed)="dismissError()">
        </app-alert>
      </div>

      <!-- Login Form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-text mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            [class.border-accent-red]="getFieldError('email')"
            placeholder="you@example.com"
          />
          <p *ngIf="getFieldError('email')" class="mt-1.5 text-sm text-accent-red">
            {{ getFieldError('email') }}
          </p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-text mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            [class.border-accent-red]="getFieldError('password')"
            placeholder="Enter your password"
          />
          <p *ngIf="getFieldError('password')" class="mt-1.5 text-sm text-accent-red">
            {{ getFieldError('password') }}
          </p>
        </div>

        <!-- Submit Button -->
        <app-button
          type="submit"
          variant="primary"
          size="md"
          [fullWidth]="true"
          [loading]="loading$ | async"
          [disabled]="(loading$ | async) || false">
          <span *ngIf="!(loading$ | async)">Sign In</span>
          <span *ngIf="loading$ | async">Signing In...</span>
        </app-button>
      </form>

      <!-- Register Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-text-light">
          Don't have an account?
          <a
            routerLink="/auth/register"
            class="text-primary-500 hover:text-primary-600 font-medium transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </app-card>

    <!-- Test Credentials Info -->
    <div class="mt-6 text-center">
      <p class="text-xs text-text-lighter">
        Test credentials: admin@techsolutions.com / password123
      </p>
    </div>
  </div>
</div>
```

**Template Design Notes:**
1. **Centered Layout:** Full-height viewport with centered card
2. **Responsive:** Mobile-first with max-width constraint
3. **Accessibility:** Proper label associations and ARIA attributes
4. **Dark Mode:** Uses Tailwind dark mode classes
5. **Error Display:** Inline field errors + dismissible alert for auth errors
6. **Loading State:** Button shows loading spinner and disabled state

---

### 3.2 Register Component

**File:** `src/app/features/auth/register/register.component.ts`

#### Purpose
Handles new user registration with company creation.

#### Component Architecture

**Dependencies:**
```typescript
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Core Services
import { AuthService } from '../../../core/services/auth.service';

// Shared Components
import { Card } from '../../../shared/components/ui/card/card';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { Button } from '../../../shared/components/ui/button/button';
import { Alert } from '../../../shared/components/ui/alert/alert';

// Models
import { RegisterDto } from '../../../shared/models/user.model';
```

**Component Metadata:**
```typescript
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    Card,
    FormInput,
    Button,
    Alert
  ],
  templateUrl: './register.component.html'
})
```

**Class Implementation:**
```typescript
export class RegisterComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // Reactive form
  registerForm: FormGroup;

  // Component state
  submitted = false;
  errorMessage = '';

  // Observable subscriptions
  loading$ = this.authService.loading$;
  error$ = this.authService.error$;

  constructor() {
    this.registerForm = this.createForm();

    // Subscribe to auth errors
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.errorMessage = error;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // User information
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],

      // Company information
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPhone: ['', [Validators.required]],
      companyAddress: ['', [Validators.required]],
      companyCity: ['', [Validators.required]],
      companyState: ['', [Validators.required]],
      companyCountry: ['', [Validators.required]],
      companyPostalCode: ['', [Validators.required]],
      companyTaxId: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.authService.clearError();

    if (this.registerForm.invalid) {
      return;
    }

    // Check password match
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const registerData: RegisterDto = this.registerForm.value;

    this.authService.register(registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
  }

  getFieldError(fieldName: string): string {
    if (!this.submitted) return '';

    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${this.formatFieldName(fieldName)} is required`;
    if (field.errors['email']) return 'Invalid email format';
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }

    return '';
  }

  private formatFieldName(fieldName: string): string {
    // Convert camelCase to Title Case with spaces
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  dismissError(): void {
    this.errorMessage = '';
    this.authService.clearError();
  }
}
```

**Key Implementation Notes:**
1. **Complex Form:** Handles both user and company data in single form
2. **Password Matching:** Custom validation for password confirmation
3. **Submit-Only Validation:** Errors shown only after submit attempt
4. **Auto Company Admin:** Registered user becomes admin of new company
5. **Error Handling:** Clear error messages for all validation failures

---

**File:** `src/app/features/auth/register/register.component.html`

#### Template Structure

```html
<div class="min-h-screen bg-background py-8 px-4">
  <div class="max-w-3xl mx-auto">
    <!-- Logo and Title -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-text mb-2">Create Your Account</h1>
      <p class="text-text-light">Get started with Umbrella</p>
    </div>

    <!-- Registration Card -->
    <app-card>
      <!-- Error Alert -->
      <div *ngIf="errorMessage" class="mb-6">
        <app-alert
          type="error"
          [title]="errorMessage"
          [dismissible]="true"
          (dismissed)="dismissError()">
        </app-alert>
      </div>

      <!-- Registration Form -->
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-8">

        <!-- User Information Section -->
        <div>
          <h2 class="text-lg font-semibold text-text mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            User Information
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- First Name -->
            <div>
              <label for="firstName" class="block text-sm font-medium text-text mb-2">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('firstName')"
                placeholder="John"
              />
              <p *ngIf="getFieldError('firstName')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('firstName') }}
              </p>
            </div>

            <!-- Last Name -->
            <div>
              <label for="lastName" class="block text-sm font-medium text-text mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('lastName')"
                placeholder="Doe"
              />
              <p *ngIf="getFieldError('lastName')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('lastName') }}
              </p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-text mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('email')"
                placeholder="john@company.com"
              />
              <p *ngIf="getFieldError('email')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('email') }}
              </p>
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-text mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('phone')"
                placeholder="+1 (555) 123-4567"
              />
              <p *ngIf="getFieldError('phone')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('phone') }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('password')"
                placeholder="Min. 6 characters"
              />
              <p *ngIf="getFieldError('password')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('password') }}
              </p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-text mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('confirmPassword')"
                placeholder="Re-enter password"
              />
              <p *ngIf="getFieldError('confirmPassword')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('confirmPassword') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Company Information Section -->
        <div>
          <h2 class="text-lg font-semibold text-text mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            Company Information
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Company Name -->
            <div class="md:col-span-2">
              <label for="companyName" class="block text-sm font-medium text-text mb-2">
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                formControlName="companyName"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyName')"
                placeholder="Your Company Inc."
              />
              <p *ngIf="getFieldError('companyName')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyName') }}
              </p>
            </div>

            <!-- Company Email -->
            <div>
              <label for="companyEmail" class="block text-sm font-medium text-text mb-2">
                Company Email
              </label>
              <input
                id="companyEmail"
                type="email"
                formControlName="companyEmail"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyEmail')"
                placeholder="info@company.com"
              />
              <p *ngIf="getFieldError('companyEmail')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyEmail') }}
              </p>
            </div>

            <!-- Company Phone -->
            <div>
              <label for="companyPhone" class="block text-sm font-medium text-text mb-2">
                Company Phone
              </label>
              <input
                id="companyPhone"
                type="tel"
                formControlName="companyPhone"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyPhone')"
                placeholder="+1 (555) 987-6543"
              />
              <p *ngIf="getFieldError('companyPhone')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyPhone') }}
              </p>
            </div>

            <!-- Address -->
            <div class="md:col-span-2">
              <label for="companyAddress" class="block text-sm font-medium text-text mb-2">
                Address
              </label>
              <input
                id="companyAddress"
                type="text"
                formControlName="companyAddress"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyAddress')"
                placeholder="123 Business Street"
              />
              <p *ngIf="getFieldError('companyAddress')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyAddress') }}
              </p>
            </div>

            <!-- City -->
            <div>
              <label for="companyCity" class="block text-sm font-medium text-text mb-2">
                City
              </label>
              <input
                id="companyCity"
                type="text"
                formControlName="companyCity"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyCity')"
                placeholder="San Francisco"
              />
              <p *ngIf="getFieldError('companyCity')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyCity') }}
              </p>
            </div>

            <!-- State -->
            <div>
              <label for="companyState" class="block text-sm font-medium text-text mb-2">
                State/Province
              </label>
              <input
                id="companyState"
                type="text"
                formControlName="companyState"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyState')"
                placeholder="CA"
              />
              <p *ngIf="getFieldError('companyState')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyState') }}
              </p>
            </div>

            <!-- Country -->
            <div>
              <label for="companyCountry" class="block text-sm font-medium text-text mb-2">
                Country
              </label>
              <input
                id="companyCountry"
                type="text"
                formControlName="companyCountry"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyCountry')"
                placeholder="USA"
              />
              <p *ngIf="getFieldError('companyCountry')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyCountry') }}
              </p>
            </div>

            <!-- Postal Code -->
            <div>
              <label for="companyPostalCode" class="block text-sm font-medium text-text mb-2">
                Postal Code
              </label>
              <input
                id="companyPostalCode"
                type="text"
                formControlName="companyPostalCode"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyPostalCode')"
                placeholder="94105"
              />
              <p *ngIf="getFieldError('companyPostalCode')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyPostalCode') }}
              </p>
            </div>

            <!-- Tax ID -->
            <div class="md:col-span-2">
              <label for="companyTaxId" class="block text-sm font-medium text-text mb-2">
                Tax ID
              </label>
              <input
                id="companyTaxId"
                type="text"
                formControlName="companyTaxId"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-background-dark-secondary text-text dark:text-text-dark-DEFAULT focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                [class.border-accent-red]="getFieldError('companyTaxId')"
                placeholder="XX-XXXXXXX"
              />
              <p *ngIf="getFieldError('companyTaxId')" class="mt-1.5 text-sm text-accent-red">
                {{ getFieldError('companyTaxId') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <app-button
            type="submit"
            variant="primary"
            size="md"
            [fullWidth]="true"
            [loading]="loading$ | async"
            [disabled]="(loading$ | async) || false">
            <span *ngIf="!(loading$ | async)">Create Account</span>
            <span *ngIf="loading$ | async">Creating Account...</span>
          </app-button>
        </div>
      </form>

      <!-- Login Link -->
      <div class="mt-6 text-center">
        <p class="text-sm text-text-light">
          Already have an account?
          <a
            routerLink="/auth/login"
            class="text-primary-500 hover:text-primary-600 font-medium transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </app-card>
  </div>
</div>
```

**Template Design Notes:**
1. **Two-Section Layout:** User info and company info clearly separated
2. **Responsive Grid:** Single column on mobile, two columns on desktop
3. **Consistent Styling:** Matches login page design patterns
4. **Field Grouping:** Related fields grouped logically
5. **Full-width Button:** Clear call-to-action at bottom

---

### 3.3 Authentication Routes

**File:** `src/app/features/auth/auth.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component')
      .then(m => m.LoginComponent),
    title: 'Login - Umbrella'
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component')
      .then(m => m.RegisterComponent),
    title: 'Register - Umbrella'
  }
];
```

**Routing Notes:**
1. **Lazy Loading:** Components loaded on-demand
2. **Default Route:** Redirects /auth to /auth/login
3. **Page Titles:** Descriptive browser tab titles
4. **No Auth Guard:** These are public routes

---

## Phase 4: Dashboard Feature

### Directory Structure

```
src/app/features/dashboard/
├── services/
│   └── dashboard.store.ts
├── dashboard.component.ts
├── dashboard.component.html
└── dashboard.routes.ts
```

---

### 4.1 Dashboard Store

**File:** `src/app/features/dashboard/services/dashboard.store.ts`

#### Purpose
Manages dashboard state including metrics, charts data, and recent transactions using RxJS patterns.

#### Store Architecture

**Dependencies:**
```typescript
import { Injectable, inject } from '@angular/core';
import { forkJoin, catchError, tap, map } from 'rxjs';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Sale } from '../../../shared/models/sale.model';
import { Purchase } from '../../../shared/models/purchase.model';
import { InventoryItem } from '../../../shared/models/inventory.model';
```

**State Interface:**
```typescript
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  inventoryAlerts: number;
}

export interface RecentTransaction {
  id: string;
  type: 'sale' | 'purchase';
  number: string;
  customerOrVendor: string;
  amount: number;
  status: string;
  date: Date;
}

export interface DashboardState {
  metrics: DashboardMetrics;
  revenueData: ChartData | null;
  expenseData: ChartData | null;
  recentTransactions: RecentTransaction[];
  lowStockItems: InventoryItem[];
  loading: boolean;
  error: string | null;
}
```

**Store Implementation:**
```typescript
@Injectable({
  providedIn: 'root'
})
export class DashboardStore extends StoreBase<DashboardState> {
  private readonly mockApi = inject(MockApiService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly metrics$ = this.select(state => state.metrics);
  readonly revenueData$ = this.select(state => state.revenueData);
  readonly expenseData$ = this.select(state => state.expenseData);
  readonly recentTransactions$ = this.select(state => state.recentTransactions);
  readonly lowStockItems$ = this.select(state => state.lowStockItems);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

  // Combined view model for component
  readonly viewModel$ = this.select(state => ({
    metrics: state.metrics,
    revenueData: state.revenueData,
    expenseData: state.expenseData,
    recentTransactions: state.recentTransactions,
    lowStockItems: state.lowStockItems,
    loading: state.loading,
    error: state.error,
    hasData: state.recentTransactions.length > 0
  }));

  constructor() {
    super({
      metrics: {
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
        inventoryAlerts: 0
      },
      revenueData: null,
      expenseData: null,
      recentTransactions: [],
      lowStockItems: [],
      loading: false,
      error: null
    });
  }

  /**
   * Loads all dashboard data in parallel.
   */
  loadDashboardData(): void {
    const companyId = this.companyContext.currentCompanyId;
    if (!companyId) {
      this.patchState({
        error: 'No company selected',
        loading: false
      });
      return;
    }

    this.patchState({ loading: true, error: null });

    forkJoin({
      sales: this.mockApi.getSales(companyId),
      purchases: this.mockApi.getPurchases(companyId),
      inventory: this.mockApi.getInventory(companyId),
      alerts: this.mockApi.getInventoryAlerts(companyId)
    }).pipe(
      tap(({ sales, purchases, inventory, alerts }) => {
        // Calculate metrics
        const metrics = this.calculateMetrics(sales, purchases, alerts.length);

        // Generate chart data
        const revenueData = this.generateRevenueChartData(sales);
        const expenseData = this.generateExpenseChartData(purchases);

        // Get recent transactions
        const recentTransactions = this.getRecentTransactions(sales, purchases);

        // Get low stock items
        const lowStockItems = inventory.filter(item =>
          item.quantity <= item.minThreshold
        ).slice(0, 5); // Top 5 low stock items

        this.patchState({
          metrics,
          revenueData,
          expenseData,
          recentTransactions,
          lowStockItems,
          loading: false
        });
      }),
      catchError(error => {
        this.patchState({
          error: error.message || 'Failed to load dashboard data',
          loading: false
        });
        throw error;
      })
    ).subscribe();
  }

  /**
   * Refreshes only the metrics without reloading all data.
   */
  refreshMetrics(): void {
    const companyId = this.companyContext.currentCompanyId;
    if (!companyId) return;

    forkJoin({
      sales: this.mockApi.getSales(companyId),
      purchases: this.mockApi.getPurchases(companyId),
      alerts: this.mockApi.getInventoryAlerts(companyId)
    }).pipe(
      tap(({ sales, purchases, alerts }) => {
        const metrics = this.calculateMetrics(sales, purchases, alerts.length);
        this.patchState({ metrics });
      }),
      catchError(error => {
        console.error('Failed to refresh metrics:', error);
        throw error;
      })
    ).subscribe();
  }

  // ==================== PRIVATE METHODS ====================

  private calculateMetrics(
    sales: Sale[],
    purchases: Purchase[],
    alertCount: number
  ): DashboardMetrics {
    const totalRevenue = sales
      .filter(s => s.status === 'paid')
      .reduce((sum, sale) => sum + sale.total, 0);

    const totalExpenses = purchases
      .filter(p => p.status === 'received' || p.status === 'paid')
      .reduce((sum, purchase) => sum + purchase.total, 0);

    const profit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      profit,
      inventoryAlerts: alertCount
    };
  }

  private generateRevenueChartData(sales: Sale[]): ChartData {
    // Group sales by month for last 6 months
    const monthlyData = this.groupByMonth(sales, 'createdAt');

    return {
      labels: monthlyData.labels,
      datasets: [
        {
          label: 'Revenue',
          data: monthlyData.values,
          borderColor: '#FF7A59', // Primary coral
          backgroundColor: 'rgba(255, 122, 89, 0.1)',
          borderWidth: 2,
          fill: true
        }
      ]
    };
  }

  private generateExpenseChartData(purchases: Purchase[]): ChartData {
    // Group purchases by category (you may need to add category field)
    // For now, using a simple count by status
    const statuses = ['draft', 'ordered', 'received', 'paid', 'cancelled'];
    const counts = statuses.map(status =>
      purchases.filter(p => p.status === status).length
    );

    return {
      labels: ['Draft', 'Ordered', 'Received', 'Paid', 'Cancelled'],
      datasets: [
        {
          label: 'Purchases by Status',
          data: counts,
          backgroundColor: [
            '#0091AE', // Accent blue
            '#00A862', // Accent green
            '#FFB800', // Accent yellow
            '#FF7A59', // Primary coral
            '#F2545B'  // Accent red
          ],
          borderWidth: 0
        }
      ]
    };
  }

  private getRecentTransactions(
    sales: Sale[],
    purchases: Purchase[]
  ): RecentTransaction[] {
    const saleTransactions: RecentTransaction[] = sales.map(sale => ({
      id: sale.id,
      type: 'sale' as const,
      number: sale.invoiceNumber,
      customerOrVendor: sale.customerName,
      amount: sale.total,
      status: sale.status,
      date: sale.createdAt
    }));

    const purchaseTransactions: RecentTransaction[] = purchases.map(purchase => ({
      id: purchase.id,
      type: 'purchase' as const,
      number: purchase.purchaseOrderNumber,
      customerOrVendor: purchase.vendorName,
      amount: purchase.total,
      status: purchase.status,
      date: purchase.createdAt
    }));

    // Combine and sort by date descending
    return [...saleTransactions, ...purchaseTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Last 10 transactions
  }

  private groupByMonth(items: any[], dateField: string): { labels: string[], values: number[] } {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const last6Months: { month: string, total: number }[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;

      const monthTotal = items
        .filter(item => {
          const itemDate = new Date(item[dateField]);
          return itemDate.getMonth() === date.getMonth() &&
                 itemDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, item) => sum + (item.total || 0), 0);

      last6Months.push({ month: key, total: monthTotal });
    }

    return {
      labels: last6Months.map(m => m.month),
      values: last6Months.map(m => m.total)
    };
  }
}
```

**Store Implementation Notes:**
1. **Parallel Loading:** Uses `forkJoin` to load all data simultaneously
2. **Derived Data:** Calculates metrics and chart data from raw API responses
3. **Type Safety:** Strongly typed state and selectors
4. **Error Handling:** Comprehensive error catching and state updates
5. **Performance:** Limits recent transactions and low stock items to reasonable counts

---

### 4.2 Dashboard Component

**File:** `src/app/features/dashboard/dashboard.component.ts`

#### Purpose
Main dashboard view displaying metrics, charts, and recent data.

**Dependencies:**
```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

// Core Services
import { DashboardStore } from './services/dashboard.store';
import { CurrencyService } from '../../core/services/currency.service';

// Shared Components
import { MainLayout } from '../../shared/components/layout/main-layout/main-layout';
import { StatCard } from '../../shared/components/ui/stat-card/stat-card';
import { Card } from '../../shared/components/ui/card/card';
import { DataTable, TableColumn } from '../../shared/components/data/data-table/data-table';
import { SkeletonLoader } from '../../shared/components/ui/skeleton-loader/skeleton-loader';
import { Alert } from '../../shared/components/ui/alert/alert';
import { Badge } from '../../shared/components/ui/badge/badge';

// Pipes
import { CurrencyPipe as CustomCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
```

**Component Metadata:**
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MainLayout,
    StatCard,
    Card,
    DataTable,
    SkeletonLoader,
    Alert,
    Badge,
    CustomCurrencyPipe,
    DateFormatPipe
  ],
  templateUrl: './dashboard.component.html'
})
```

**Class Implementation:**
```typescript
export class DashboardComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly currencyService = inject(CurrencyService);

  // Observable subscriptions
  readonly viewModel$ = this.dashboardStore.viewModel$;

  // Chart configurations
  revenueChartConfig: ChartConfiguration<'line'> = {
    type: 'line',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => this.currencyService.format(Number(value))
          }
        }
      }
    }
  };

  expenseChartConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  // Table configuration
  transactionColumns: TableColumn[] = [
    { key: 'number', label: 'Number', sortable: true, width: '15%' },
    { key: 'type', label: 'Type', sortable: true, width: '10%' },
    { key: 'customerOrVendor', label: 'Customer/Vendor', sortable: true, width: '30%' },
    { key: 'amount', label: 'Amount', sortable: true, width: '15%', align: 'right' },
    { key: 'status', label: 'Status', sortable: true, width: '15%' },
    { key: 'date', label: 'Date', sortable: true, width: '15%' }
  ];

  ngOnInit(): void {
    this.dashboardStore.loadDashboardData();
  }

  onRefresh(): void {
    this.dashboardStore.loadDashboardData();
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' {
    const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      'paid': 'success',
      'received': 'success',
      'draft': 'info',
      'pending': 'warning',
      'ordered': 'warning',
      'cancelled': 'danger'
    };
    return statusMap[status] || 'info';
  }

  getTypeBadgeVariant(type: string): 'success' | 'danger' {
    return type === 'sale' ? 'success' : 'danger';
  }

  calculateProfitTrend(metrics: any): 'up' | 'down' | 'neutral' {
    if (metrics.profit > 0) return 'up';
    if (metrics.profit < 0) return 'down';
    return 'neutral';
  }
}
```

**Component Implementation Notes:**
1. **Chart.js Integration:** Configured line and bar charts with HubSpot colors
2. **Type-Safe Tables:** Strongly typed column configuration
3. **Currency Formatting:** Uses CurrencyService for consistent formatting
4. **Badge Variants:** Maps statuses to appropriate color schemes
5. **Auto-Load:** Loads data on component initialization

---

**File:** `src/app/features/dashboard/dashboard.component.html`

#### Template Structure

```html
<app-main-layout>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-text dark:text-text-dark-DEFAULT">Dashboard</h1>
        <p class="mt-1 text-sm text-text-light dark:text-text-dark-light">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>
      <button
        (click)="onRefresh()"
        class="px-4 py-2 text-sm font-medium text-text dark:text-text-dark-DEFAULT bg-background-secondary dark:bg-background-dark-secondary rounded-lg hover:bg-background-tertiary dark:hover:bg-background-dark-tertiary transition-colors">
        Refresh
      </button>
    </div>

    <ng-container *ngIf="viewModel$ | async as vm">
      <!-- Error Alert -->
      <app-alert
        *ngIf="vm.error"
        type="error"
        [title]="vm.error">
      </app-alert>

      <!-- Loading State -->
      <div *ngIf="vm.loading" class="space-y-6">
        <!-- Metrics Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-skeleton-loader type="card"></app-skeleton-loader>
          <app-skeleton-loader type="card"></app-skeleton-loader>
          <app-skeleton-loader type="card"></app-skeleton-loader>
          <app-skeleton-loader type="card"></app-skeleton-loader>
        </div>

        <!-- Charts Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-skeleton-loader type="chart"></app-skeleton-loader>
          <app-skeleton-loader type="chart"></app-skeleton-loader>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!vm.loading" class="space-y-6">
        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Revenue -->
          <app-stat-card
            title="Total Revenue"
            [value]="vm.metrics.totalRevenue | customCurrency"
            change="+12.5%"
            trend="up"
            icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
          </app-stat-card>

          <!-- Total Expenses -->
          <app-stat-card
            title="Total Expenses"
            [value]="vm.metrics.totalExpenses | customCurrency"
            change="+8.2%"
            trend="up"
            icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z">
          </app-stat-card>

          <!-- Profit -->
          <app-stat-card
            title="Profit"
            [value]="vm.metrics.profit | customCurrency"
            [change]="vm.metrics.profit > 0 ? '+' + ((vm.metrics.profit / vm.metrics.totalRevenue) * 100).toFixed(1) + '%' : ''"
            [trend]="calculateProfitTrend(vm.metrics)"
            icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6">
          </app-stat-card>

          <!-- Inventory Alerts -->
          <app-stat-card
            title="Low Stock Alerts"
            [value]="vm.metrics.inventoryAlerts.toString()"
            [change]="vm.metrics.inventoryAlerts > 0 ? 'Requires attention' : 'All good'"
            [trend]="vm.metrics.inventoryAlerts > 0 ? 'down' : 'neutral'"
            icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
          </app-stat-card>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Revenue Chart -->
          <app-card>
            <h3 class="text-lg font-semibold text-text dark:text-text-dark-DEFAULT mb-4">
              Revenue Trends
            </h3>
            <div class="h-80">
              <canvas
                *ngIf="vm.revenueData"
                baseChart
                [data]="vm.revenueData"
                [options]="revenueChartConfig.options"
                [type]="revenueChartConfig.type">
              </canvas>
            </div>
          </app-card>

          <!-- Expense Chart -->
          <app-card>
            <h3 class="text-lg font-semibold text-text dark:text-text-dark-DEFAULT mb-4">
              Purchases by Status
            </h3>
            <div class="h-80">
              <canvas
                *ngIf="vm.expenseData"
                baseChart
                [data]="vm.expenseData"
                [options]="expenseChartConfig.options"
                [type]="expenseChartConfig.type">
              </canvas>
            </div>
          </app-card>
        </div>

        <!-- Recent Transactions -->
        <app-card>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-text dark:text-text-dark-DEFAULT">
              Recent Transactions
            </h3>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light dark:text-text-dark-light uppercase tracking-wider">
                    Number
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light dark:text-text-dark-light uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light dark:text-text-dark-light uppercase tracking-wider">
                    Customer/Vendor
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-text-light dark:text-text-dark-light uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light dark:text-text-dark-light uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light dark:text-text-dark-light uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  *ngFor="let transaction of vm.recentTransactions"
                  class="hover:bg-background-secondary dark:hover:bg-background-dark-secondary transition-colors">
                  <td class="px-4 py-3 text-sm text-text dark:text-text-dark-DEFAULT">
                    {{ transaction.number }}
                  </td>
                  <td class="px-4 py-3">
                    <app-badge
                      [text]="transaction.type"
                      [variant]="getTypeBadgeVariant(transaction.type)">
                    </app-badge>
                  </td>
                  <td class="px-4 py-3 text-sm text-text dark:text-text-dark-DEFAULT">
                    {{ transaction.customerOrVendor }}
                  </td>
                  <td class="px-4 py-3 text-sm text-right text-text dark:text-text-dark-DEFAULT font-medium">
                    {{ transaction.amount | customCurrency }}
                  </td>
                  <td class="px-4 py-3">
                    <app-badge
                      [text]="transaction.status"
                      [variant]="getStatusBadgeVariant(transaction.status)">
                    </app-badge>
                  </td>
                  <td class="px-4 py-3 text-sm text-text-light dark:text-text-dark-light">
                    {{ transaction.date | dateFormat }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div
              *ngIf="vm.recentTransactions.length === 0"
              class="py-12 text-center">
              <p class="text-text-light dark:text-text-dark-light">
                No recent transactions found
              </p>
            </div>
          </div>
        </app-card>

        <!-- Low Stock Items -->
        <app-card *ngIf="vm.lowStockItems.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-text dark:text-text-dark-DEFAULT">
              Low Stock Alert
            </h3>
            <app-badge text="Action Required" variant="warning"></app-badge>
          </div>

          <div class="space-y-3">
            <div
              *ngFor="let item of vm.lowStockItems"
              class="flex items-center justify-between p-4 bg-accent-yellow/10 dark:bg-accent-yellow/20 border border-accent-yellow/30 dark:border-accent-yellow/40 rounded-lg">
              <div>
                <p class="font-medium text-text dark:text-text-dark-DEFAULT">
                  {{ item.productName }}
                </p>
                <p class="text-sm text-text-light dark:text-text-dark-light">
                  SKU: {{ item.productSku }} | Location: {{ item.location }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-accent-yellow">
                  {{ item.quantity }} units
                </p>
                <p class="text-xs text-text-light dark:text-text-dark-light">
                  Min: {{ item.minThreshold }}
                </p>
              </div>
            </div>
          </div>
        </app-card>
      </div>
    </ng-container>
  </div>
</app-main-layout>
```

**Template Design Notes:**
1. **Responsive Grid:** Metrics cards stack on mobile, grid on desktop
2. **Chart Integration:** Uses ng2-charts with HubSpot color scheme
3. **Custom Table:** Hand-built table for more control over styling
4. **Badge Components:** Status and type indicators with color coding
5. **Low Stock Alerts:** Highlighted warning section for inventory issues
6. **Loading States:** Skeleton loaders for all major sections

---

### 4.3 Dashboard Routes

**File:** `src/app/features/dashboard/dashboard.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Umbrella'
  }
];
```

**Routing Notes:**
1. **Protected Route:** Uses authGuard to require authentication
2. **Lazy Loading:** Component loaded on-demand
3. **Single Route:** Dashboard is a single-page view

---

## Main Application Routing

**File:** `src/app/app.routes.ts` (Update)

### Updated Routing Configuration

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Root redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Authentication routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes')
      .then(m => m.DASHBOARD_ROUTES)
  },

  // Fallback route - redirect to login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
```

**Routing Architecture Notes:**
1. **Root Redirect:** Unauthenticated users will hit guard and redirect to login
2. **Lazy Loading:** Both features loaded on-demand
3. **Route Protection:** Dashboard protected by authGuard
4. **Fallback:** Invalid routes redirect to login

---

## Integration Points

### 5.1 Core Services Integration

**AuthService Integration:**
- Login component calls `authService.login(credentials)`
- Register component calls `authService.register(data)`
- Auth guard uses `authService.isAuthenticated$`
- Both components subscribe to `authService.loading$` and `authService.error$`

**MockApiService Integration:**
- DashboardStore calls multiple API methods via `forkJoin`
- `getSales()`, `getPurchases()`, `getInventory()`, `getInventoryAlerts()`
- All API calls return Observables with 300ms delay

**CompanyContextService Integration:**
- DashboardStore gets `currentCompanyId` for filtered data
- All API calls filtered by company context

**CurrencyService Integration:**
- Dashboard component uses `currencyService.format()` for chart tooltips
- Custom currency pipe for template formatting

### 5.2 Shared Components Used

**Authentication Features:**
- `Card` - Container for forms
- `FormInput` - Email and password fields (not used due to manual styling for better control)
- `Button` - Submit buttons with loading states
- `Alert` - Error message display

**Dashboard Feature:**
- `MainLayout` - App shell wrapper
- `StatCard` - Metric cards (4 cards)
- `Card` - Chart and table containers
- `Badge` - Status and type indicators
- `SkeletonLoader` - Loading states
- `Alert` - Error display

### 5.3 Models and Types

**Used Interfaces:**
```typescript
// From user.model.ts
LoginCredentials
RegisterDto
AuthResponse
User

// From sale.model.ts
Sale

// From purchase.model.ts
Purchase

// From inventory.model.ts
InventoryItem
InventoryAlert
```

---

## Testing Strategy

### 6.1 Unit Testing

**Component Tests:**
```typescript
// login.component.spec.ts
describe('LoginComponent', () => {
  it('should create', () => {});
  it('should validate form on submit', () => {});
  it('should call authService.login with credentials', () => {});
  it('should display error messages', () => {});
  it('should navigate to dashboard on success', () => {});
  it('should show loading state during login', () => {});
});

// register.component.spec.ts
describe('RegisterComponent', () => {
  it('should create', () => {});
  it('should validate all required fields', () => {});
  it('should check password match', () => {});
  it('should call authService.register', () => {});
  it('should navigate to dashboard on success', () => {});
});

// dashboard.component.spec.ts
describe('DashboardComponent', () => {
  it('should create', () => {});
  it('should load data on init', () => {});
  it('should display metrics', () => {});
  it('should render charts', () => {});
  it('should show loading state', () => {});
  it('should handle errors', () => {});
});
```

**Store Tests:**
```typescript
// dashboard.store.spec.ts
describe('DashboardStore', () => {
  it('should initialize with default state', () => {});
  it('should load dashboard data', () => {});
  it('should calculate metrics correctly', () => {});
  it('should generate chart data', () => {});
  it('should handle API errors', () => {});
  it('should filter by company context', () => {});
});
```

### 6.2 Integration Testing

**Auth Flow Test:**
1. Navigate to /auth/login
2. Enter invalid credentials
3. Verify error message
4. Enter valid credentials
5. Verify navigation to /dashboard
6. Verify token stored

**Dashboard Flow Test:**
1. Navigate to /dashboard (unauthenticated)
2. Verify redirect to /auth/login
3. Login successfully
4. Verify dashboard loads
5. Verify metrics displayed
6. Verify charts rendered

### 6.3 E2E Testing with Cypress

```typescript
// auth.cy.ts
describe('Authentication Flow', () => {
  it('should login successfully', () => {
    cy.visit('/auth/login');
    cy.get('#email').type('admin@techsolutions.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should register new user', () => {
    cy.visit('/auth/register');
    // Fill all fields
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// dashboard.cy.ts
describe('Dashboard', () => {
  beforeEach(() => {
    // Login first
    cy.login('admin@techsolutions.com', 'password123');
    cy.visit('/dashboard');
  });

  it('should display metrics', () => {
    cy.get('app-stat-card').should('have.length', 4);
  });

  it('should render charts', () => {
    cy.get('canvas').should('have.length', 2);
  });

  it('should show recent transactions', () => {
    cy.contains('Recent Transactions').should('be.visible');
  });
});
```

---

## Important Notes

### 7.1 Critical Implementation Requirements

1. **NO Angular Signals for State:**
   - Use RxJS `BehaviorSubject` and `Observable` exclusively
   - All state accessed via `async` pipe in templates
   - Use `takeUntil(destroy$)` for subscription cleanup

2. **Dependency Injection:**
   - Use `inject()` function throughout
   - No constructor injection except for required Angular dependencies

3. **Form Validation:**
   - Submit-only validation pattern (no keystroke validation)
   - Show errors only after form submission
   - Clear, descriptive error messages

4. **Chart.js Setup:**
   - Install: `npm install ng2-charts chart.js`
   - Import `provideCharts(withDefaultRegisterables())` in `app.config.ts`
   - Use HubSpot color palette for consistency

5. **Responsive Design:**
   - Mobile-first approach
   - Grid layouts that stack on mobile
   - Test on multiple screen sizes

### 7.2 Package Dependencies

**Required npm packages:**
```json
{
  "dependencies": {
    "ng2-charts": "^6.0.0",
    "chart.js": "^4.4.0"
  }
}
```

**Installation command:**
```bash
npm install ng2-charts chart.js
```

**app.config.ts update:**
```typescript
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    provideCharts(withDefaultRegisterables())
  ]
};
```

### 7.3 HubSpot Color Palette

**Primary Colors:**
```css
--primary-500: #FF7A59 (coral)
--text-DEFAULT: #2D3E50 (pickled bluewood)
--background-DEFAULT: #FFF1EE (forget me not)
```

**Accent Colors:**
```css
--accent-blue: #0091AE
--accent-green: #00A862
--accent-yellow: #FFB800
--accent-red: #F2545B
```

**Chart Colors Array:**
```typescript
const CHART_COLORS = [
  '#FF7A59', // Primary coral
  '#0091AE', // Accent blue
  '#00A862', // Accent green
  '#FFB800', // Accent yellow
  '#F2545B'  // Accent red
];
```

### 7.4 Mock Data Configuration

**Test Credentials:**
```
Email: admin@techsolutions.com
Password: password123
```

**Seed Data:**
- 3 companies with multiple users
- 50+ products across different categories
- Sample sales and purchases
- Inventory items with low stock scenarios

### 7.5 Accessibility Considerations

1. **Semantic HTML:** Use proper heading hierarchy
2. **Form Labels:** Associate labels with inputs using `for` attribute
3. **ARIA Labels:** Add where necessary for screen readers
4. **Keyboard Navigation:** Ensure tab order makes sense
5. **Color Contrast:** Meet WCAG 2.1 AA standards
6. **Focus Indicators:** Visible focus states on all interactive elements

### 7.6 Performance Optimization

1. **Lazy Loading:** Both features lazy-loaded
2. **OnPush Change Detection:** Consider for dashboard component
3. **TrackBy Functions:** Use in all `*ngFor` loops
4. **Subscription Management:** Always use `takeUntil(destroy$)`
5. **Chart Performance:** Limit data points to reasonable numbers

### 7.7 Error Handling

1. **Form Errors:** Clear, actionable messages
2. **API Errors:** Display user-friendly messages via Alert component
3. **Network Errors:** Retry mechanism or manual refresh option
4. **Auth Errors:** Specific messages for invalid credentials vs. inactive accounts
5. **Loading States:** Show during all async operations

---

## Implementation Checklist

### Phase 3: Authentication

- [ ] Create `src/app/features/auth` directory
- [ ] Implement `LoginComponent` (.ts and .html)
- [ ] Implement `RegisterComponent` (.ts and .html)
- [ ] Create `auth.routes.ts`
- [ ] Test login flow
- [ ] Test registration flow
- [ ] Test form validation
- [ ] Test error handling
- [ ] Verify responsive design

### Phase 4: Dashboard

- [ ] Create `src/app/features/dashboard` directory
- [ ] Install Chart.js dependencies
- [ ] Update `app.config.ts` with chart providers
- [ ] Implement `DashboardStore` (.ts)
- [ ] Implement `DashboardComponent` (.ts and .html)
- [ ] Create `dashboard.routes.ts`
- [ ] Configure Chart.js with HubSpot colors
- [ ] Test data loading
- [ ] Test chart rendering
- [ ] Test metrics calculation
- [ ] Test responsive layout
- [ ] Verify loading states
- [ ] Test error handling

### Main App Integration

- [ ] Update `app.routes.ts` with new routes
- [ ] Test route guards
- [ ] Test navigation flow
- [ ] Verify lazy loading works
- [ ] Test unauthorized access handling

### Testing

- [ ] Write unit tests for components
- [ ] Write unit tests for store
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

---

## Next Steps After Implementation

1. **Add More Features:**
   - Products management
   - Sales tracking
   - Purchase orders
   - Inventory management

2. **Enhance Dashboard:**
   - More chart types
   - Date range filters
   - Export functionality
   - Real-time updates

3. **Improve Authentication:**
   - Password reset flow
   - Email verification
   - Two-factor authentication
   - Remember me functionality

4. **Performance Tuning:**
   - Implement OnPush change detection
   - Add caching layer
   - Optimize bundle size
   - Add service workers

---

## Conclusion

This implementation plan provides complete specifications for building the Authentication and Dashboard features following Angular 20 best practices. All components use standalone architecture, RxJS-based state management, and the established HubSpot-inspired design system.

**Key Success Factors:**
1. Follow the established patterns from Phase 1 and Phase 2
2. Maintain strict TypeScript typing
3. Use existing shared components
4. Implement comprehensive error handling
5. Ensure responsive design
6. Write thorough tests

The implementation is ready to proceed with all necessary details, code structures, and integration points clearly defined.
