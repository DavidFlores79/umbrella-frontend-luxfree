import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompaniesStore } from '../services/companies.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';

@Component({
  selector: 'app-company-create',
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
  templateUrl: './company-create.component.html'
})
export class CompanyCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(CompaniesStore);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  isEditMode = false;
  companyId: string | null = null;
  form!: FormGroup;
  submitted = false;

  readonly currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'MXN', label: 'MXN - Mexican Peso' }
  ];

  readonly planOptions = [
    { value: 'free', label: 'Free' },
    { value: 'basic', label: 'Basic' },
    { value: 'premium', label: 'Premium' }
  ];

  readonly statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  ngOnInit(): void {
    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.companyId = params['id'];
        this.loadCompany(params['id']);
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      postalCode: [''],
      taxId: [''],
      website: [''],
      currency: ['USD', Validators.required],
      plan: ['free', Validators.required],
      status: ['active', Validators.required]
    });
  }

  private loadCompany(id: string): void {
    this.store.companies$.subscribe(companies => {
      const company = companies.find(c => c.id === id);
      if (company) {
        this.form.patchValue({
          name: company.name,
          email: company.email,
          phone: company.phone || '',
          address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          country: company.country || '',
          postalCode: company.postalCode || '',
          taxId: company.taxId || '',
          website: company.website || '',
          currency: company.settings.currency,
          plan: company.settings.plan,
          status: company.status
        });
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
      return;
    }

    const formValue = this.form.value;
    const companyData: any = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone || undefined,
      address: formValue.address || undefined,
      city: formValue.city || undefined,
      state: formValue.state || undefined,
      country: formValue.country || undefined,
      postalCode: formValue.postalCode || undefined,
      taxId: formValue.taxId || undefined,
      website: formValue.website || undefined,
      status: formValue.status,
      settings: {
        currency: formValue.currency,
        plan: formValue.plan,
        taxRate: 0,
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY'
      }
    };

    if (this.isEditMode && this.companyId) {
      this.store.updateCompany(this.companyId, companyData);
    } else {
      this.store.createCompany(companyData);
    }

    // Navigate back on success
    this.loading$.subscribe(loading => {
      if (!loading && this.submitted) {
        this.router.navigate(['/companies']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/companies']);
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
      name: 'Company name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Postal code',
      taxId: 'Tax ID',
      website: 'Website',
      currency: 'Currency',
      plan: 'Plan',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }
}
