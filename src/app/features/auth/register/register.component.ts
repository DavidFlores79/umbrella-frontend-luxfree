import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Core Services
import { AuthService } from '../../../core/services/auth.service';

// Shared Components
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Alert } from '../../../shared/components/ui/alert/alert';

// Models
import { RegisterDto } from '../../../shared/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    Card,
    Button,
    Alert
  ],
  templateUrl: './register.component.html'
})
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
