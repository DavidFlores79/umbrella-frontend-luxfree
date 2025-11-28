import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SalesStore } from '../services/sales.store';
import { ProductsStore } from '../../products/services/products.store';
import { CompaniesStore } from '../../companies/services/companies.store';
import { AuthService } from '../../../core/services/auth.service';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sale-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Card, Button, FormInput, FormSelect, Alert],
  templateUrl: './sale-create.component.html'
})
export class SaleCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(SalesStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly companiesStore = inject(CompaniesStore);
  private readonly authService = inject(AuthService);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;
  readonly productOptions$ = this.productsStore.products$.pipe(
    map(products => products.filter(p => p.isActive).map(p => ({
      value: p.id,
      label: `${p.name} (${p.sku}) - ${p.price}`
    })))
  );
  readonly companyOptions$ = this.companiesStore.companies$.pipe(
    map(companies => companies.map(c => ({ value: c.id, label: c.name })))
  );

  isEditMode = false;
  saleId: string | null = null;
  form!: FormGroup;
  submitted = false;

  readonly statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.productsStore.loadProducts();
    this.companiesStore.loadCompanies();
    this.initializeForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.saleId = params['id'];
        this.loadSale(params['id']);
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      companyId: ['', Validators.required],
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: [''],
      items: this.fb.array([this.createLineItem()]),
      status: ['draft', Validators.required],
      paymentMethod: [''],
      notes: ['']
    });
  }

  private createLineItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addLineItem(): void {
    this.items.push(this.createLineItem());
  }

  removeLineItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onProductChange(index: number): void {
    const item = this.items.at(index);
    const productId = item.get('productId')?.value;

    this.productsStore.products$.subscribe(products => {
      const product = products.find(p => p.id === productId);
      if (product) {
        item.patchValue({ unitPrice: product.price });
      }
    });
  }

  private loadSale(id: string): void {
    this.store.sales$.subscribe(sales => {
      const sale = sales.find(s => s.id === id);
      if (sale) {
        this.form.patchValue({
          companyId: sale.companyId,
          customerName: sale.customerName,
          customerEmail: sale.customerEmail,
          customerPhone: sale.customerPhone || '',
          status: sale.status,
          paymentMethod: sale.paymentMethod || '',
          notes: sale.notes || ''
        });

        this.items.clear();
        sale.items.forEach(item => {
          this.items.push(this.fb.group({
            productId: [item.productId, Validators.required],
            quantity: [item.quantity, [Validators.required, Validators.min(1)]],
            unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]]
          }));
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());

    if (this.form.invalid) return;

    const formValue = this.form.value;
    const currentUser = this.authService.currentUser;

    const saleData: any = {
      companyId: formValue.companyId,
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      customerPhone: formValue.customerPhone || undefined,
      items: formValue.items.map((item: any) => ({
        productId: item.productId,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice)
      })),
      status: formValue.status,
      paymentMethod: formValue.paymentMethod || undefined,
      notes: formValue.notes || undefined,
      createdBy: currentUser?.id || 'unknown'
    };

    if (this.isEditMode && this.saleId) {
      this.store.updateSale(this.saleId, saleData);
    } else {
      this.store.createSale(saleData);
    }

    this.loading$.subscribe(loading => {
      if (!loading && this.submitted) {
        this.router.navigate(['/sales']);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/sales']);
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
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    return 'Invalid value';
  }
}
