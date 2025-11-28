import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsStore } from '../services/products.store';
import { CompaniesStore } from '../../companies/services/companies.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-create',
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
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(ProductsStore);
  private readonly companiesStore = inject(CompaniesStore);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  readonly companyOptions$ = this.companiesStore.companies$.pipe(
    map(companies => companies.map(c => ({ value: c.id, label: c.name })))
  );

  isEditMode = false;
  productId: string | null = null;
  form!: FormGroup;
  submitted = false;

  readonly categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'tools', label: 'Tools' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'software', label: 'Software' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' }
  ];

  readonly typeOptions = [
    { value: 'product', label: 'Product' },
    { value: 'service', label: 'Service' },
    { value: 'labor', label: 'Labor' }
  ];

  readonly unitOptions = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'hour', label: 'Hour' },
    { value: 'meter', label: 'Meter (m)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'box', label: 'Box' }
  ];

  readonly statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  ngOnInit(): void {
    this.companiesStore.loadCompanies();
    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.loadProduct(params['id']);
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      companyId: ['', Validators.required],
      sku: ['', [Validators.required, Validators.minLength(2)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category: ['other', Validators.required],
      type: ['product', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      unit: ['piece', Validators.required],
      trackInventory: [true],
      isActive: ['true', Validators.required]
    });
  }

  private loadProduct(id: string): void {
    this.store.products$.subscribe(products => {
      const product = products.find(p => p.id === id);
      if (product) {
        this.form.patchValue({
          companyId: product.companyId,
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          category: product.category,
          type: product.type,
          price: product.price,
          cost: product.cost,
          taxRate: product.taxRate,
          unit: product.unit,
          trackInventory: product.trackInventory,
          isActive: product.isActive.toString()
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
    const productData: any = {
      companyId: formValue.companyId,
      sku: formValue.sku,
      name: formValue.name,
      description: formValue.description || undefined,
      category: formValue.category,
      type: formValue.type,
      price: parseFloat(formValue.price),
      cost: parseFloat(formValue.cost),
      taxRate: parseFloat(formValue.taxRate) || 0,
      unit: formValue.unit,
      trackInventory: formValue.trackInventory,
      isActive: formValue.isActive === 'true' || formValue.isActive === true
    };

    if (this.isEditMode && this.productId) {
      this.store.updateProduct(this.productId, productData);
    } else {
      this.store.createProduct(productData);
    }

    // Navigate back on success
    this.loading$.subscribe(loading => {
      if (!loading && this.submitted) {
        this.router.navigate(['/products']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
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
    if (field.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['max'].max}`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      companyId: 'Company',
      sku: 'SKU',
      name: 'Product name',
      description: 'Description',
      category: 'Category',
      type: 'Type',
      price: 'Price',
      cost: 'Cost',
      taxRate: 'Tax rate',
      unit: 'Unit',
      isActive: 'Status'
    };
    return labels[fieldName] || fieldName;
  }
}
