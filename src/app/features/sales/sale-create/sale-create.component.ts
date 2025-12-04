import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SalesStore } from '../services/sales.store';
import { ProductsStore } from '../../products/services/products.store';
import { CompaniesStore } from '../../companies/services/companies.store';
import { ClientsStore } from '../../clients/services/clients.store';
import { AuthService } from '../../../core/services/auth.service';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { map, combineLatestWith, filter, take, skip } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

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
  private readonly clientsStore = inject(ClientsStore);
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

  // Cascade: Filter clients by selected company
  readonly clientOptions$ = this.clientsStore.clients$.pipe(
    combineLatestWith(this.selectedCompanyId$),
    map(([clients, companyId]) =>
      clients
        .filter(c => c.isActive && (!companyId || c.companyId === companyId))
        .map(c => ({
          value: c.id,
          label: `${c.name} - ${c.email}`
        }))
    )
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
    this.clientsStore.loadClients();
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
        this.saleId = params['id'];
        // Load only the specific sale needed (more efficient for real API)
        this.store.loadSaleById(params['id']);
        this.loadSale(params['id']);
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      companyId: ['', Validators.required],
      clientId: ['', Validators.required],
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: [''],
      items: this.fb.array([this.createLineItem()]),
      status: ['draft', Validators.required],
      paymentMethod: [''],
      notes: ['']
    });

    // Auto-populate customer details when client is selected
    this.form.get('clientId')?.valueChanges.subscribe(clientId => {
      this.onClientChange(clientId);
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

  onClientChange(clientId: string): void {
    if (!clientId) return;

    this.clientsStore.clients$.subscribe(clients => {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        this.form.patchValue({
          customerName: client.name,
          customerEmail: client.email,
          customerPhone: client.phone || ''
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
        item.patchValue({ unitPrice: product.price });
      }
    });
  }

  private loadSale(id: string): void {
    // Wait for sales to be loaded first
    this.store.sales$.pipe(
      filter(sales => sales.length > 0),
      take(1)
    ).subscribe(sales => {
      const sale = sales.find(s => s.id === id);
      if (sale) {
        // First, wait for companies to load so the company dropdown has options
        this.companiesStore.companies$.pipe(
          filter(companies => companies.length > 0),
          take(1)
        ).subscribe(companies => {
          // Set the company FIRST - this triggers the cascading filter
          this.selectedCompanyId$.next(sale.companyId);
          console.log('Available companies:', companies);
          console.log('Setting companyId:', sale.companyId, 'Type:', typeof sale.companyId);
          this.form.patchValue({
            companyId: sale.companyId
          });
          console.log('Form companyId value after patch:', this.form.get('companyId')?.value);

          // Wait for clients to be loaded from the store
          this.clientsStore.clients$.pipe(
            filter(clients => clients.length > 0),
            take(1)
          ).subscribe(() => {
            // Patch other form fields except clientId
            this.form.patchValue({
              customerName: sale.customerName,
              customerEmail: sale.customerEmail,
              customerPhone: sale.customerPhone || '',
              status: sale.status,
              paymentMethod: sale.paymentMethod || '',
              notes: sale.notes || ''
            });

            // Wait for the specific client to be in the filtered options
            // This ensures the cascading filter has processed
            console.log('Sale customerId:', sale.customerId);
            console.log('Sale customerEmail:', sale.customerEmail);
            console.log('Current selectedCompanyId:', this.selectedCompanyId$.value);

            this.clientOptions$.pipe(
              filter(options => {
                console.log('clientOptions$ emitted:', options.length, 'options');
                console.log('Looking for customerId:', sale.customerId);

                // If no customerId, try to find client by email
                let clientId = sale.customerId;
                if (!clientId && sale.customerEmail) {
                  this.clientsStore.clients$.pipe(take(1)).subscribe(clients => {
                    const matchingClient = clients.find(c =>
                      c.email.toLowerCase() === sale.customerEmail.toLowerCase() &&
                      c.companyId === sale.companyId
                    );
                    if (matchingClient) {
                      console.log('Found matching client by email:', matchingClient);
                      clientId = matchingClient.id;
                    }
                  });
                }

                const hasClient = !clientId || options.some(opt => opt.value === clientId);
                console.log('Has client in options:', hasClient, 'clientId:', clientId);
                return options.length > 0 && hasClient;
              }),
              take(1)
            ).subscribe(options => {
              console.log('✅ Available client options:', options);

              // Try to find matching client by email if no customerId
              let clientIdToSet = sale.customerId;
              if (!clientIdToSet && sale.customerEmail) {
                this.clientsStore.clients$.pipe(take(1)).subscribe(clients => {
                  const matchingClient = clients.find(c =>
                    c.email.toLowerCase() === sale.customerEmail.toLowerCase() &&
                    c.companyId === sale.companyId
                  );
                  if (matchingClient) {
                    clientIdToSet = matchingClient.id;
                    console.log('✅ Auto-matched client by email:', matchingClient.name);
                  }
                });
              }

              console.log('✅ Setting clientId:', clientIdToSet);
              this.form.patchValue({
                clientId: clientIdToSet || ''
              }, { emitEvent: false });
              console.log('✅ Form clientId value after patch:', this.form.get('clientId')?.value);
            });

            // Load items
            this.items.clear();
            sale.items.forEach(item => {
              this.items.push(this.fb.group({
                productId: [item.productId, Validators.required],
                quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]]
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

    const saleData: any = {
      companyId: formValue.companyId,
      customerId: formValue.clientId || undefined,
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

    // Wait for the loading cycle to complete (skip current value, wait for true, then false)
    this.loading$.pipe(
      skip(1), // Skip current emission
      filter(loading => !loading), // Wait until loading is false
      take(1) // Take only the first false value
    ).subscribe(() => {
      this.router.navigate(['/sales']);
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
