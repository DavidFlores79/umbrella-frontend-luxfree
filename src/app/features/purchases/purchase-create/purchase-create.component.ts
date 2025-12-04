import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchasesStore } from '../services/purchases.store';
import { ProductsStore } from '../../products/services/products.store';
import { CompaniesStore } from '../../companies/services/companies.store';
import { VendorsStore } from '../../vendors/services/vendors.store';
import { AuthService } from '../../../core/services/auth.service';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { map, combineLatestWith, filter, take, skip } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-purchase-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Card, Button, FormInput, FormSelect, Alert],
  templateUrl: './purchase-create.component.html'
})
export class PurchaseCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PurchasesStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly companiesStore = inject(CompaniesStore);
  private readonly vendorsStore = inject(VendorsStore);
  private readonly authService = inject(AuthService);

  // Track selected company for cascading filtering
  private readonly selectedCompanyId$ = new BehaviorSubject<string | null>(null);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  // Cascade: Filter products by selected company
  readonly productOptions$ = this.productsStore.products$.pipe(
    combineLatestWith(this.selectedCompanyId$),
    map(([products, companyId]) =>
      products
        .filter(p => p.isActive && (!companyId || p.companyId === companyId))
        .map(p => ({
          value: p.id,
          label: `${p.name} (${p.sku}) - ${p.price}`
        }))
    )
  );

  // Cascade: Filter vendors by selected company
  readonly vendorOptions$ = this.vendorsStore.vendors$.pipe(
    combineLatestWith(this.selectedCompanyId$),
    map(([vendors, companyId]) =>
      vendors
        .filter(v => v.isActive && (!companyId || v.companyId === companyId))
        .map(v => ({
          value: v.id,
          label: `${v.name} - ${v.email}`
        }))
    )
  );

  readonly companyOptions$ = this.companiesStore.companies$.pipe(
    map(companies => companies.map(c => ({ value: c.id, label: c.name })))
  );

  isEditMode = false;
  purchaseId: string | null = null;
  form!: FormGroup;
  submitted = false;

  readonly statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.productsStore.loadProducts();
    this.companiesStore.loadCompanies();
    this.vendorsStore.loadVendors();
    this.initializeForm();

    // Listen to company selection changes for cascading filtering
    this.form.get('companyId')?.valueChanges.subscribe(companyId => {
      this.selectedCompanyId$.next(companyId);
      // Clear product selections when company changes to avoid invalid selections
      this.items.controls.forEach(item => {
        item.get('productId')?.setValue('');
      });
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.purchaseId = params['id'];
        // Load only the specific purchase needed (more efficient for real API)
        this.store.loadPurchaseById(params['id']);
        this.loadPurchase(params['id']);
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      companyId: ['', Validators.required],
      vendorId: ['', Validators.required],
      vendorName: ['', [Validators.required, Validators.minLength(2)]],
      vendorEmail: ['', [Validators.required, Validators.email]],
      vendorPhone: [''],
      items: this.fb.array([this.createLineItem()]),
      status: ['draft', Validators.required],
      paymentMethod: [''],
      notes: ['']
    });

    // Auto-populate vendor details when vendor is selected
    this.form.get('vendorId')?.valueChanges.subscribe(vendorId => {
      this.onVendorChange(vendorId);
    });
  }

  private createLineItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitCost: [0, [Validators.required, Validators.min(0)]]
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

  onVendorChange(vendorId: string): void {
    if (!vendorId) return;

    this.vendorsStore.vendors$.subscribe(vendors => {
      const vendor = vendors.find(v => v.id === vendorId);
      if (vendor) {
        this.form.patchValue({
          vendorName: vendor.name,
          vendorEmail: vendor.email,
          vendorPhone: vendor.phone || ''
        }, { emitEvent: false });
      }
    });
  }

  onProductChange(index: number): void {
    const item = this.items.at(index);
    const productId = item.get('productId')?.value;

    this.productsStore.products$.subscribe(products => {
      const product = products.find(p => p.id === productId);
      if (product) {
        item.patchValue({ unitCost: product.price });
      }
    });
  }

  private loadPurchase(id: string): void {
    // Wait for purchases to be loaded first
    this.store.purchases$.pipe(
      filter(purchases => purchases.length > 0),
      take(1)
    ).subscribe(purchases => {
      const purchase = purchases.find(s => s.id === id);
      if (purchase) {
        // First, wait for companies to load so the company dropdown has options
        this.companiesStore.companies$.pipe(
          filter(companies => companies.length > 0),
          take(1)
        ).subscribe(() => {
          // Set the company FIRST - this triggers the cascading filter
          this.selectedCompanyId$.next(purchase.companyId);
          this.form.patchValue({
            companyId: purchase.companyId
          });

          // Wait for vendors to be loaded from the store
          this.vendorsStore.vendors$.pipe(
            filter(vendors => vendors.length > 0),
            take(1)
          ).subscribe(() => {
            // Patch other form fields except vendorId
            this.form.patchValue({
              vendorName: purchase.vendorName,
              vendorEmail: purchase.vendorEmail,
              vendorPhone: purchase.vendorPhone || '',
              status: purchase.status,
              paymentMethod: purchase.paymentMethod || '',
              notes: purchase.notes || ''
            });

            // Wait for the specific vendor to be in the filtered options
            // This ensures the cascading filter has processed
            this.vendorOptions$.pipe(
              filter(options =>
                options.length > 0 &&
                (!purchase.vendorId || options.some(opt => opt.value === purchase.vendorId))
              ),
              take(1)
            ).subscribe(() => {
              this.form.patchValue({
                vendorId: purchase.vendorId || ''
              }, { emitEvent: false });
            });

            // Load items
            this.items.clear();
            purchase.items.forEach(item => {
              this.items.push(this.fb.group({
                productId: [item.productId, Validators.required],
                quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                unitCost: [item.unitCost, [Validators.required, Validators.min(0)]]
              }));
            });
          });
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

    const purchaseData: any = {
      companyId: formValue.companyId,
      vendorId: formValue.vendorId || undefined,
      vendorName: formValue.vendorName,
      vendorEmail: formValue.vendorEmail,
      vendorPhone: formValue.vendorPhone || undefined,
      items: formValue.items.map((item: any) => ({
        productId: item.productId,
        quantity: parseFloat(item.quantity),
        unitCost: parseFloat(item.unitCost)
      })),
      status: formValue.status,
      paymentMethod: formValue.paymentMethod || undefined,
      notes: formValue.notes || undefined,
      createdBy: currentUser?.id || 'unknown'
    };

    if (this.isEditMode && this.purchaseId) {
      this.store.updatePurchase(this.purchaseId, purchaseData);
    } else {
      this.store.createPurchase(purchaseData);
    }

    // Wait for the loading cycle to complete (skip current value, wait for true, then false)
    this.loading$.pipe(
      skip(1), // Skip current emission
      filter(loading => !loading), // Wait until loading is false
      take(1) // Take only the first false value
    ).subscribe(() => {
      this.router.navigate(['/purchases']);
    });
  }

  onCancel(): void {
    this.router.navigate(['/purchases']);
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
