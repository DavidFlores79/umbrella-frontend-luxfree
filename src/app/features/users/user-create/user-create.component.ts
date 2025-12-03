import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersStore } from '../services/users.store';
import { CompaniesStore } from '../../companies/services/companies.store';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { map, filter, take } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    Button,
    FormInput,
    FormSelect,
    Alert
  ],
  templateUrl: './user-create.component.html'
})
export class UserCreateComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(UsersStore);
  private readonly companiesStore = inject(CompaniesStore);
  private readonly mockApi = inject(MockApiService);
  private readonly destroy$ = new Subject<void>();

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  readonly companyOptions$ = this.companiesStore.companies$.pipe(
    map(companies => companies.map(c => ({ value: c.id, label: c.name })))
  );

  isEditMode = false;
  userId: string | null = null;
  form!: FormGroup;
  submitted = false;
  loadError: string | null = null;

  readonly roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' }
  ];

  readonly statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  ngOnInit(): void {
    // Load companies first
    this.companiesStore.loadCompanies();

    // Check if we're in edit mode
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
      }

      // Initialize form after we know the mode
      this.initializeForm();

      // Load user data if in edit mode
      if (this.isEditMode && this.userId) {
        this.loadUser(this.userId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
      companyId: ['', Validators.required],
      phone: [''],
      isActive: ['true', Validators.required]
    });
  }

  private loadUser(id: string): void {
    console.log('🔍 Loading user with ID:', id);

    // Use the API directly to get the user by ID (bypasses company filtering)
    this.mockApi.getUser(id).pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user) => {
        console.log('📝 User data loaded successfully:', user);
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          phone: user.phone || '',
          isActive: user.isActive.toString()
        });
        console.log('✅ Form patched with values:', this.form.value);
      },
      error: (err) => {
        console.error('❌ Error loading user:', err);
        this.loadError = 'Failed to load user data';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    // Mark all fields as touched to show validation errors
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.invalid) {
      console.log('❌ Form is invalid:', this.form.errors);
      return;
    }

    const formValue = this.form.value;
    const userData: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      role: formValue.role,
      companyId: formValue.companyId,
      phone: formValue.phone || undefined,
      isActive: formValue.isActive === 'true'
    };

    if (!this.isEditMode && formValue.password) {
      userData.password = formValue.password;
    }

    console.log('💾 Submitting user data:', { isEditMode: this.isEditMode, userId: this.userId, userData });

    if (this.isEditMode && this.userId) {
      this.store.updateUser(this.userId, userData);
    } else {
      this.store.createUser(userData);
    }

    // Wait for the operation to complete, then navigate
    this.loading$.pipe(
      filter(loading => !loading), // Wait until loading is false
      take(1), // Take only the first emission after loading completes
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Check if there was no error
      this.error$.pipe(
        take(1)
      ).subscribe(error => {
        if (!error) {
          console.log('✅ User saved successfully, navigating back');
          this.router.navigate(['/users']);
        } else {
          console.error('❌ Error saving user:', error);
        }
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  dismissError(): void {
    this.store.clearError();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !(field.touched || this.submitted)) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      role: 'Role',
      companyId: 'Company',
      phone: 'Phone',
      isActive: 'Active status'
    };
    return labels[fieldName] || fieldName;
  }
}
