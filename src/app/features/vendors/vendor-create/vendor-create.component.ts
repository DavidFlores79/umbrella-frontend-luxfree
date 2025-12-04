import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorsStore } from '../services/vendors.store';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompaniesStore } from '../../companies/services/companies.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-vendor-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Card, Button, FormInput, FormSelect, Alert],
  templateUrl: './vendor-create.component.html'
})
export class VendorCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(VendorsStore);
  private readonly companyContext = inject(CompanyContextService);
  private readonly permissions = inject(PermissionService);
  private readonly companiesStore = inject(CompaniesStore);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  // Company dropdown options for admins
  readonly companyOptions$ = this.companiesStore.companies$.pipe(
    map(companies => companies.map(c => ({
      value: c.id,
      label: c.name
    })))
  );

  isEditMode = false;
  vendorId: string | null = null;
  form!: FormGroup;
  submitted = false;

  // Check if user is admin to show company dropdown
  get isAdmin(): boolean {
    return this.permissions.isAdmin();
  }

  ngOnInit(): void {
    this.initializeForm();

    // Load companies for admin users
    if (this.isAdmin) {
      this.companiesStore.loadCompanies();
    }

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vendorId = params['id'];
        this.loadVendor(params['id']);
      }
    });
  }

  private initializeForm(): void {
    const formConfig: any = {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      taxId: [''],
      notes: ['']
    };

    // Add company field for admins
    if (this.isAdmin) {
      formConfig.companyId = ['', Validators.required];
    }

    this.form = this.fb.group(formConfig);
  }

  private loadVendor(id: string): void {
    this.store.vendors$.subscribe(vendors => {
      const vendor = vendors.find(v => v.id === id);
      if (vendor) {
        const patchData: any = {
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone || '',
          address: vendor.address || '',
          taxId: vendor.taxId || '',
          notes: vendor.notes || ''
        };

        // Add companyId for admins
        if (this.isAdmin) {
          patchData.companyId = vendor.companyId;
        }

        this.form.patchValue(patchData);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());

    if (this.form.invalid) return;

    const formValue = this.form.value;

    // For admins, use the selected companyId from form, otherwise use current company
    const companyId = this.isAdmin
      ? formValue.companyId
      : this.companyContext.currentCompanyId;

    if (!companyId) {
      console.error('No company selected');
      return;
    }

    const vendorData: any = {
      companyId: companyId,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      address: formValue.address || undefined,
      taxId: formValue.taxId || undefined,
      notes: formValue.notes || undefined
    };

    if (this.isEditMode && this.vendorId) {
      this.store.updateVendor(this.vendorId, vendorData);
    } else {
      this.store.createVendor(vendorData);
    }

    this.loading$.subscribe(loading => {
      if (!loading && this.submitted) {
        this.router.navigate(['/vendors']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/vendors']);
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
    if (!field || !field.errors || !(field.touched || this.submitted)) return '';
    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    return 'Invalid value';
  }
}
