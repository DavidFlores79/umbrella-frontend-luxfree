# Phase 8: Sales Management - Angular Frontend Implementation Plan

## Overview

This implementation plan provides a complete guide for implementing the Sales Management feature with dynamic line items support following Clean Architecture principles and the established Company Management pattern (Phase 5).

**Key Distinction**: Unlike Company Management, Sales Management requires **FormArray** for dynamic line items with auto-calculation of totals, taxes, and discounts.

---

## Architecture Overview

### Layer Structure

```
features/sales/
├── services/
│   └── sales.store.ts              # RxJS-based state management
├── sale-list/
│   ├── sale-list.component.ts      # Smart component - list view
│   └── sale-list.component.html    # List template
├── sale-create/
│   ├── sale-create.component.ts    # Smart component - create/edit form
│   └── sale-create.component.html  # Form template with line items
└── sales.routes.ts                 # Feature routing configuration
```

### Dependencies

- **Models**: `Sale`, `SaleLineItem`, `CreateSaleDto`, `CreateSaleLineItemDto`, `UpdateSaleDto`, `SaleStatus` (already defined in `src/app/shared/models/sale.model.ts`)
- **Product Store**: Need to inject `ProductsStore` to load product options for dropdowns
- **Services**: `MockApiService` for API calls, `StoreBase<T>` for state management
- **UI Components**: Card, Button, FormInput, FormSelect, Badge, Alert, EmptyState, SearchBar

---

## File 1: Sales Store

**Path**: `src/app/features/sales/services/sales.store.ts`

### Purpose
State management for sales data using RxJS BehaviorSubjects following the StoreBase pattern.

### State Interface

```typescript
interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  selectedSale: Sale | null;
}
```

### Implementation Details

**Pattern Reference**: Copy structure from `src/app/features/companies/services/companies.store.ts`

**Key Methods**:

1. **loadSales()**:
   - Set loading state to true
   - Call `mockApi.getSales()`
   - Update state with sales array on success
   - Handle errors with proper error state
   - Use RxJS `tap` and `catchError` operators

2. **createSale(sale: Partial<Sale>)**:
   - Validate sale data
   - Call `mockApi.createSale()`
   - Add new sale to existing sales array
   - Clear loading and error states

3. **updateSale(id: string, updates: Partial<Sale>)**:
   - Find sale by ID in state
   - Call `mockApi.updateSale()`
   - Update sale in array using `map()`
   - Preserve immutability

4. **deleteSale(id: string)**:
   - Call `mockApi.deleteSale()`
   - Filter out deleted sale from array
   - Update state

5. **selectSale(id: string)**:
   - Find sale by ID
   - Update `selectedSale` in state
   - Used for edit mode

6. **clearError()**:
   - Reset error state to null

**Selectors** (public observables):
- `sales$` - All sales
- `loading$` - Loading state
- `error$` - Error messages
- `selectedSale$` - Currently selected sale

### Code Template

```typescript
import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Sale } from '../../../shared/models/sale.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  selectedSale: Sale | null;
}

@Injectable({
  providedIn: 'root'
})
export class SalesStore extends StoreBase<SalesState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly sales$ = this.select(state => state.sales);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedSale$ = this.select(state => state.selectedSale);

  constructor() {
    super({
      sales: [],
      loading: false,
      error: null,
      selectedSale: null
    });
  }

  loadSales(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getSales().pipe(
      tap(sales => {
        this.patchState({
          sales,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load sales',
          loading: false
        });
        return of([]);
      })
    ).subscribe();
  }

  createSale(sale: Partial<Sale>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createSale(sale as any).pipe(
      tap(newSale => {
        const sales = [...this.currentState.sales, newSale];
        this.patchState({
          sales,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create sale',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateSale(id: string, updates: Partial<Sale>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateSale(updateDto as any).pipe(
      tap(updatedSale => {
        const sales = this.currentState.sales.map((s: Sale) =>
          s.id === id ? updatedSale : s
        );
        this.patchState({
          sales,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update sale',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteSale(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteSale(id).pipe(
      tap(() => {
        const sales = this.currentState.sales.filter((s: Sale) => s.id !== id);
        this.patchState({
          sales,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete sale',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectSale(id: string): void {
    const sale = this.currentState.sales.find((s: Sale) => s.id === id);
    this.patchState({ selectedSale: sale || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
```

**Important Notes**:
- Use `inject()` for dependency injection (Angular 20 best practice)
- All methods return `void` - state updates happen through observables
- Use `patchState()` to update state immutably
- Always handle errors with `catchError` and update error state
- Subscribe to observables to trigger API calls

---

## File 2: Sale List Component

**Path**: `src/app/features/sales/sale-list/sale-list.component.ts`

### Purpose
Display sales in a table with search filtering, status badges, and CRUD actions.

### Pattern Reference
Copy structure from `src/app/features/companies/company-list/company-list.component.ts`

### Key Features

1. **Search Filtering**:
   - Filter by invoice number, customer name, customer email
   - Use RxJS `map` operator with reactive pattern
   - Update on search term change

2. **Table Columns**:
   - Invoice Number
   - Customer Name
   - Date (use DateFormatPipe)
   - Total Amount (format as currency)
   - Payment Status (Badge with color coding)
   - Actions (Edit, Delete buttons)

3. **Status Badge Mapping**:
   ```typescript
   getStatusBadgeVariant(status: SaleStatus): 'success' | 'warning' | 'error' | 'info' {
     switch (status) {
       case 'paid': return 'success';      // Green
       case 'pending': return 'warning';   // Yellow
       case 'draft': return 'info';        // Blue
       case 'cancelled': return 'error';   // Red
       default: return 'info';
     }
   }
   ```

4. **CRUD Actions**:
   - **Create**: Navigate to `/sales/create`
   - **Edit**: Navigate to `/sales/edit/:id` with sale ID
   - **Delete**: Confirm with native dialog, call `store.deleteSale(id)`

5. **Error Handling**:
   - Display errors using `<app-alert>` component
   - Provide dismissible error alert
   - Call `store.clearError()` on dismiss

6. **Responsive Design**:
   - Desktop: Full table layout
   - Mobile: Card-based layout with stacked information

### Component Code Template

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SalesStore } from '../services/sales.store';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { Sale, SaleStatus } from '../../../shared/models/sale.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    CommonModule,
    SearchBar,
    Card,
    Button,
    Badge,
    Alert,
    EmptyState,
    DateFormatPipe,
    CurrencyFormatPipe
  ],
  templateUrl: './sale-list.component.html'
})
export class SaleListComponent implements OnInit {
  private readonly store = inject(SalesStore);
  private readonly router = inject(Router);

  readonly sales$ = this.store.sales$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  searchTerm = '';

  readonly filteredSales$ = this.sales$.pipe(
    map(sales => {
      if (!this.searchTerm) {
        return sales;
      }
      const term = this.searchTerm.toLowerCase();
      return sales.filter(sale =>
        sale.invoiceNumber.toLowerCase().includes(term) ||
        sale.customerName.toLowerCase().includes(term) ||
        sale.customerEmail.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    this.store.loadSales();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onCreate(): void {
    this.router.navigate(['/sales/create']);
  }

  onEdit(sale: Sale): void {
    this.router.navigate(['/sales/edit', sale.id]);
  }

  onDelete(sale: Sale): void {
    if (confirm(`Are you sure you want to delete invoice "${sale.invoiceNumber}"?`)) {
      this.store.deleteSale(sale.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(status: SaleStatus): 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'info';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  }
}
```

### Template Code (`sale-list.component.html`)

**Pattern Reference**: Copy from `src/app/features/companies/company-list/company-list.component.html`

**Key Modifications**:

1. **Replace "Companies" with "Sales"**
2. **Update columns**:
   - Invoice Number (text)
   - Customer Name (text)
   - Date (pipe: `| appDateFormat`)
   - Total Amount (pipe: `| appCurrencyFormat`)
   - Payment Status (Badge component)
   - Actions (Edit/Delete buttons)

3. **Search placeholder**: "Search sales by invoice, customer name, or email..."

4. **Empty state**: "No sales found" / "Create your first sale"

**Template Structure**:

```html
<div class="p-6">
  <!-- Header -->
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold text-text">Sales</h1>
      <p class="mt-1 text-sm text-text-light">Manage sales transactions and invoices</p>
    </div>
    <app-button variant="primary" (click)="onCreate()">
      <span class="mr-2">+</span>
      Create Sale
    </app-button>
  </div>

  <!-- Error Alert -->
  <app-alert
    *ngIf="error$ | async as error"
    type="error"
    [dismissible]="true"
    (dismissed)="dismissError()"
    class="mb-6"
  >
    {{ error }}
  </app-alert>

  <!-- Search Bar -->
  <div class="mb-6">
    <app-search-bar
      placeholder="Search sales by invoice, customer name, or email..."
      (searchChange)="onSearch($event)"
    ></app-search-bar>
  </div>

  <!-- Sales Table -->
  <app-card [loading]="(loading$ | async) || false">
    <div *ngIf="(filteredSales$ | async) as sales; else loading">
      <div *ngIf="sales.length > 0; else empty">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Invoice #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Customer Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Total Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let sale of sales" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-text">{{ sale.invoiceNumber }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text">{{ sale.customerName }}</div>
                  <div class="text-xs text-text-light">{{ sale.customerEmail }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ sale.createdAt | appDateFormat }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-text">{{ sale.total | appCurrencyFormat }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-badge [variant]="getStatusBadgeVariant(sale.status)">
                    {{ sale.status | uppercase }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    (click)="onEdit(sale)"
                    class="text-primary hover:text-primary-700 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    (click)="onDelete(sale)"
                    class="text-accent-red hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4">
          <div
            *ngFor="let sale of sales"
            class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-medium text-text">{{ sale.invoiceNumber }}</h3>
                <p class="text-sm text-text-light mt-1">{{ sale.customerName }}</p>
              </div>
              <div class="flex gap-2">
                <app-badge [variant]="getStatusBadgeVariant(sale.status)">
                  {{ sale.status }}
                </app-badge>
              </div>
            </div>

            <div class="space-y-2 mb-3">
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Date:</span>
                <span class="text-text">{{ sale.createdAt | appDateFormat }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Total:</span>
                <span class="text-text font-semibold">{{ sale.total | appCurrencyFormat }}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                (click)="onEdit(sale)"
                class="flex-1 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md"
              >
                Edit
              </button>
              <button
                (click)="onDelete(sale)"
                class="flex-1 px-4 py-2 text-sm font-medium text-accent-red hover:bg-red-50 dark:hover:bg-gray-800 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #empty>
      <app-empty-state
        title="No sales found"
        description="Get started by creating your first sale"
        [actionLabel]="'Create Sale'"
        (action)="onCreate()"
      ></app-empty-state>
    </ng-template>

    <ng-template #loading>
      <div class="p-6">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </ng-template>
  </app-card>
</div>
```

**Important Notes**:
- Use `CurrencyFormatPipe` for displaying amounts (check if exists, otherwise use built-in `currency` pipe)
- Badge colors must match the status mapping
- Mobile layout stacks information vertically
- Empty state encourages action

---

## File 3: Sale Create Component (MOST COMPLEX)

**Path**: `src/app/features/sales/sale-create/sale-create.component.ts`

### Purpose
Form for creating and editing sales with dynamic line items, auto-calculation, and product selection.

### Pattern Reference
Base structure from `src/app/features/companies/company-create/company-create.component.ts` but with **critical additions** for FormArray and calculations.

### New Angular Patterns (Not in Company Create)

#### 1. FormArray for Line Items

FormArray allows dynamic addition/removal of form groups. Each line item is a FormGroup within the array.

```typescript
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

// In initializeForm()
this.form = this.fb.group({
  // Header fields
  customerName: ['', Validators.required],
  customerEmail: ['', [Validators.required, Validators.email]],
  customerPhone: [''],
  saleDate: [new Date().toISOString().split('T')[0], Validators.required],
  dueDate: [''],
  status: ['draft', Validators.required],
  notes: [''],

  // Line items FormArray
  items: this.fb.array([])
});
```

#### 2. Accessing FormArray

```typescript
get items(): FormArray {
  return this.form.get('items') as FormArray;
}
```

#### 3. Creating Line Item FormGroup

```typescript
private createLineItemFormGroup(item?: SaleLineItem): FormGroup {
  const lineItem = this.fb.group({
    productId: [item?.productId || '', Validators.required],
    quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
    price: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
    taxRate: [item?.taxRate || 0, [Validators.min(0), Validators.max(100)]],
    discount: [0, [Validators.min(0)]],
    total: [{ value: 0, disabled: true }]
  });

  // Subscribe to value changes for auto-calculation
  lineItem.valueChanges.subscribe(() => {
    this.calculateLineItemTotal(lineItem);
    this.calculateGrandTotal();
  });

  return lineItem;
}
```

#### 4. Auto-Calculation Logic

**Line Item Total Calculation**:

```typescript
private calculateLineItemTotal(lineItemGroup: FormGroup): void {
  const quantity = lineItemGroup.get('quantity')?.value || 0;
  const price = lineItemGroup.get('price')?.value || 0;
  const taxRate = lineItemGroup.get('taxRate')?.value || 0;
  const discount = lineItemGroup.get('discount')?.value || 0;

  const subtotal = quantity * price;
  const discountAmount = discount;
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount;

  lineItemGroup.patchValue({ total }, { emitEvent: false });
}
```

**Grand Total Calculation**:

```typescript
subtotalAmount = 0;
taxAmount = 0;
discountAmount = 0;
grandTotal = 0;

private calculateGrandTotal(): void {
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  this.items.controls.forEach(control => {
    const quantity = control.get('quantity')?.value || 0;
    const price = control.get('price')?.value || 0;
    const taxRate = control.get('taxRate')?.value || 0;
    const discount = control.get('discount')?.value || 0;

    const itemSubtotal = quantity * price;
    const itemTax = (itemSubtotal - discount) * (taxRate / 100);

    subtotal += itemSubtotal;
    totalTax += itemTax;
    totalDiscount += discount;
  });

  this.subtotalAmount = subtotal;
  this.taxAmount = totalTax;
  this.discountAmount = totalDiscount;
  this.grandTotal = subtotal - totalDiscount + totalTax;
}
```

#### 5. Adding Line Items

```typescript
addLineItem(): void {
  this.items.push(this.createLineItemFormGroup());
}
```

#### 6. Removing Line Items

```typescript
removeLineItem(index: number): void {
  if (this.items.length > 1) {
    this.items.removeAt(index);
    this.calculateGrandTotal();
  }
}
```

#### 7. Product Selection and Auto-Fill

When user selects a product from dropdown, auto-fill price and tax rate:

```typescript
private readonly productsStore = inject(ProductsStore);
readonly products$ = this.productsStore.products$;

onProductChange(index: number): void {
  const lineItem = this.items.at(index);
  const productId = lineItem.get('productId')?.value;

  this.products$.pipe(take(1)).subscribe(products => {
    const product = products.find(p => p.id === productId);
    if (product) {
      lineItem.patchValue({
        price: product.price,
        taxRate: product.taxRate
      });
    }
  });
}
```

#### 8. Loading Products on Init

```typescript
ngOnInit(): void {
  this.initializeForm();
  this.productsStore.loadProducts(); // Load products for dropdown

  this.route.params.subscribe(params => {
    if (params['id']) {
      this.isEditMode = true;
      this.saleId = params['id'];
      this.loadSale(params['id']);
    } else {
      // Add one empty line item by default for new sales
      this.addLineItem();
    }
  });
}
```

#### 9. Loading Existing Sale with Line Items

```typescript
private loadSale(id: string): void {
  this.store.sales$.pipe(take(1)).subscribe(sales => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      // Patch header fields
      this.form.patchValue({
        customerName: sale.customerName,
        customerEmail: sale.customerEmail,
        customerPhone: sale.customerPhone || '',
        saleDate: new Date(sale.createdAt).toISOString().split('T')[0],
        status: sale.status,
        notes: sale.notes || ''
      });

      // Clear existing line items
      this.items.clear();

      // Add line items from sale
      sale.items.forEach(item => {
        this.items.push(this.createLineItemFormGroup(item));
      });

      this.calculateGrandTotal();
    }
  });
}
```

#### 10. Form Submission

```typescript
onSubmit(): void {
  this.submitted = true;

  // Mark all fields as touched
  Object.keys(this.form.controls).forEach(key => {
    this.form.get(key)?.markAsTouched();
  });

  // Mark line item fields as touched
  this.items.controls.forEach(control => {
    Object.keys((control as FormGroup).controls).forEach(key => {
      control.get(key)?.markAsTouched();
    });
  });

  if (this.form.invalid || this.items.length === 0) {
    return;
  }

  const formValue = this.form.value;

  const saleData: any = {
    customerName: formValue.customerName,
    customerEmail: formValue.customerEmail,
    customerPhone: formValue.customerPhone || undefined,
    status: formValue.status,
    notes: formValue.notes || undefined,
    items: this.items.controls.map(control => ({
      productId: control.get('productId')?.value,
      quantity: control.get('quantity')?.value,
      unitPrice: control.get('price')?.value
    })),
    companyId: 'current-company-id', // Get from CompanyContextService
    createdBy: 'current-user-id' // Get from AuthService
  };

  if (this.isEditMode && this.saleId) {
    this.store.updateSale(this.saleId, saleData);
  } else {
    this.store.createSale(saleData);
  }

  // Navigate on success
  this.loading$.subscribe(loading => {
    if (!loading && this.submitted) {
      this.router.navigate(['/sales']);
    }
  });
}
```

### Complete Component Code

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { SalesStore } from '../services/sales.store';
import { ProductsStore } from '../../products/services/products.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { SaleLineItem } from '../../../shared/models/sale.model';

@Component({
  selector: 'app-sale-create',
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
  templateUrl: './sale-create.component.html'
})
export class SaleCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(SalesStore);
  private readonly productsStore = inject(ProductsStore);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;
  readonly products$ = this.productsStore.products$;

  isEditMode = false;
  saleId: string | null = null;
  form!: FormGroup;
  submitted = false;

  // Calculation totals
  subtotalAmount = 0;
  taxAmount = 0;
  discountAmount = 0;
  grandTotal = 0;

  readonly statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.productsStore.loadProducts();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.saleId = params['id'];
        this.loadSale(params['id']);
      } else {
        this.addLineItem();
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: [''],
      saleDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: [''],
      status: ['draft', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private createLineItemFormGroup(item?: SaleLineItem): FormGroup {
    const lineItem = this.fb.group({
      productId: [item?.productId || '', Validators.required],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      price: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      taxRate: [item?.taxRate || 0, [Validators.min(0), Validators.max(100)]],
      discount: [0, [Validators.min(0)]],
      total: [{ value: 0, disabled: true }]
    });

    lineItem.valueChanges.subscribe(() => {
      this.calculateLineItemTotal(lineItem);
      this.calculateGrandTotal();
    });

    // Initial calculation
    this.calculateLineItemTotal(lineItem);

    return lineItem;
  }

  private calculateLineItemTotal(lineItemGroup: FormGroup): void {
    const quantity = lineItemGroup.get('quantity')?.value || 0;
    const price = lineItemGroup.get('price')?.value || 0;
    const taxRate = lineItemGroup.get('taxRate')?.value || 0;
    const discount = lineItemGroup.get('discount')?.value || 0;

    const subtotal = quantity * price;
    const discountAmount = discount;
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const total = subtotal - discountAmount + taxAmount;

    lineItemGroup.patchValue({ total }, { emitEvent: false });
  }

  private calculateGrandTotal(): void {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    this.items.controls.forEach(control => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      const taxRate = control.get('taxRate')?.value || 0;
      const discount = control.get('discount')?.value || 0;

      const itemSubtotal = quantity * price;
      const itemTax = (itemSubtotal - discount) * (taxRate / 100);

      subtotal += itemSubtotal;
      totalTax += itemTax;
      totalDiscount += discount;
    });

    this.subtotalAmount = subtotal;
    this.taxAmount = totalTax;
    this.discountAmount = totalDiscount;
    this.grandTotal = subtotal - totalDiscount + totalTax;
  }

  addLineItem(): void {
    this.items.push(this.createLineItemFormGroup());
  }

  removeLineItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateGrandTotal();
    }
  }

  onProductChange(index: number): void {
    const lineItem = this.items.at(index);
    const productId = lineItem.get('productId')?.value;

    this.products$.pipe(take(1)).subscribe(products => {
      const product = products.find(p => p.id === productId);
      if (product) {
        lineItem.patchValue({
          price: product.price,
          taxRate: product.taxRate
        });
      }
    });
  }

  private loadSale(id: string): void {
    this.store.sales$.pipe(take(1)).subscribe(sales => {
      const sale = sales.find(s => s.id === id);
      if (sale) {
        this.form.patchValue({
          customerName: sale.customerName,
          customerEmail: sale.customerEmail,
          customerPhone: sale.customerPhone || '',
          saleDate: new Date(sale.createdAt).toISOString().split('T')[0],
          status: sale.status,
          notes: sale.notes || ''
        });

        this.items.clear();
        sale.items.forEach(item => {
          this.items.push(this.createLineItemFormGroup(item));
        });

        this.calculateGrandTotal();
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    this.items.controls.forEach(control => {
      Object.keys((control as FormGroup).controls).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    });

    if (this.form.invalid || this.items.length === 0) {
      return;
    }

    const formValue = this.form.value;

    const saleData: any = {
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      customerPhone: formValue.customerPhone || undefined,
      status: formValue.status,
      notes: formValue.notes || undefined,
      items: this.items.controls.map(control => ({
        productId: control.get('productId')?.value,
        quantity: control.get('quantity')?.value,
        unitPrice: control.get('price')?.value
      })),
      companyId: 'current-company-id',
      createdBy: 'current-user-id'
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
      customerName: 'Customer name',
      customerEmail: 'Email',
      customerPhone: 'Phone',
      saleDate: 'Sale date',
      dueDate: 'Due date',
      status: 'Status',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }
}
```

### Template Code (`sale-create.component.html`)

**Pattern Reference**: Base structure from company-create template

**Key Sections**:

1. **Header Section**: Customer info, dates, status
2. **Line Items Section**: FormArray table with add/remove
3. **Totals Section**: Subtotal, tax, discount, grand total
4. **Action Buttons**: Submit and Cancel

```html
<div class="p-6 max-w-6xl mx-auto">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-text">
      {{ isEditMode ? 'Edit Sale' : 'Create Sale' }}
    </h1>
    <p class="mt-1 text-sm text-text-light">
      {{ isEditMode ? 'Update sale information' : 'Create a new sales transaction' }}
    </p>
  </div>

  <!-- Error Alert -->
  @if (error$ | async; as error) {
    <app-alert
      type="error"
      [dismissible]="true"
      (dismissed)="dismissError()"
      class="mb-6"
    >
      {{ error }}
    </app-alert>
  }

  <!-- Form -->
  <app-card>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="space-y-6">
        <!-- Customer Information -->
        <div>
          <h3 class="text-lg font-medium text-text mb-4">Customer Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-form-input
              formControlName="customerName"
              label="Customer Name"
              placeholder="Enter customer name"
              [required]="true"
              [errorMessage]="getFieldError('customerName')"
            ></app-form-input>

            <app-form-input
              formControlName="customerEmail"
              label="Email"
              type="email"
              placeholder="customer@example.com"
              [required]="true"
              [errorMessage]="getFieldError('customerEmail')"
            ></app-form-input>

            <app-form-input
              formControlName="customerPhone"
              label="Phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              [errorMessage]="getFieldError('customerPhone')"
            ></app-form-input>
          </div>
        </div>

        <!-- Sale Details -->
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-text mb-4">Sale Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-form-input
              formControlName="saleDate"
              label="Sale Date"
              type="date"
              [required]="true"
              [errorMessage]="getFieldError('saleDate')"
            ></app-form-input>

            <app-form-input
              formControlName="dueDate"
              label="Due Date"
              type="date"
              [errorMessage]="getFieldError('dueDate')"
            ></app-form-input>

            <app-form-select
              formControlName="status"
              label="Status"
              [options]="statusOptions"
              [required]="true"
              [errorMessage]="getFieldError('status')"
            ></app-form-select>
          </div>

          <div class="mt-4">
            <app-form-input
              formControlName="notes"
              label="Notes"
              placeholder="Additional notes or comments"
              [errorMessage]="getFieldError('notes')"
            ></app-form-input>
          </div>
        </div>

        <!-- Line Items -->
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-text">Line Items</h3>
            <app-button
              type="button"
              variant="secondary"
              (click)="addLineItem()"
            >
              <span class="mr-2">+</span>
              Add Item
            </app-button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Product
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Quantity
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Price
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Tax %
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Discount
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Total
                  </th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" formArrayName="items">
                <tr *ngFor="let item of items.controls; let i = index" [formGroupName]="i">
                  <td class="px-4 py-3">
                    <select
                      formControlName="productId"
                      (change)="onProductChange(i)"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      [class.border-red-500]="item.get('productId')?.invalid && (item.get('productId')?.touched || submitted)"
                    >
                      <option value="">Select product</option>
                      <option *ngFor="let product of products$ | async" [value]="product.id">
                        {{ product.name }} ({{ product.sku }})
                      </option>
                    </select>
                  </td>
                  <td class="px-4 py-3">
                    <input
                      type="number"
                      formControlName="quantity"
                      class="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      [class.border-red-500]="item.get('quantity')?.invalid && (item.get('quantity')?.touched || submitted)"
                      min="1"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <input
                      type="number"
                      formControlName="price"
                      class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      [class.border-red-500]="item.get('price')?.invalid && (item.get('price')?.touched || submitted)"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <input
                      type="number"
                      formControlName="taxRate"
                      class="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <input
                      type="number"
                      formControlName="discount"
                      class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <input
                      type="text"
                      formControlName="total"
                      class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-text"
                      readonly
                    />
                  </td>
                  <td class="px-4 py-3">
                    <button
                      type="button"
                      (click)="removeLineItem(i)"
                      class="text-accent-red hover:text-red-700"
                      [disabled]="items.length === 1"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Validation Message for Empty Line Items -->
          <div *ngIf="submitted && items.length === 0" class="mt-2 text-sm text-accent-red">
            At least one line item is required
          </div>
        </div>

        <!-- Totals Summary -->
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="max-w-md ml-auto space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-text-light">Subtotal:</span>
              <span class="text-text font-medium">{{ subtotalAmount | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-text-light">Discount:</span>
              <span class="text-text font-medium">-{{ discountAmount | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-text-light">Tax:</span>
              <span class="text-text font-medium">{{ taxAmount | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
              <span class="text-text">Grand Total:</span>
              <span class="text-primary">{{ grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <app-button
            type="submit"
            variant="primary"
            [loading]="(loading$ | async) || false"
            [disabled]="(loading$ | async) || false"
          >
            {{ isEditMode ? 'Update Sale' : 'Create Sale' }}
          </app-button>
          <app-button
            type="button"
            variant="secondary"
            (click)="onCancel()"
            [disabled]="(loading$ | async) || false"
          >
            Cancel
          </app-button>
        </div>
      </div>
    </form>
  </app-card>
</div>
```

**Important Template Notes**:
- Use `formArrayName="items"` on tbody
- Use `[formGroupName]="i"` on each tr
- Table is horizontally scrollable on mobile
- Remove button disabled when only 1 line item
- Totals section aligned to right
- Use Angular number pipe for formatting

---

## File 4: Sales Routes

**Path**: `src/app/features/sales/sales.routes.ts`

### Purpose
Define lazy-loaded routes for the sales feature with authentication guards.

### Implementation

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sale-list/sale-list.component')
      .then(m => m.SaleListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./sale-create/sale-create.component')
      .then(m => m.SaleCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./sale-create/sale-create.component')
      .then(m => m.SaleCreateComponent),
    canActivate: [authGuard]
  }
];
```

**Important Notes**:
- All routes protected by `authGuard`
- Use lazy loading with `loadComponent`
- Edit route uses same component as create (reusable)
- Empty path ('') loads the list component

---

## File 5: Update Main App Routes

**Path**: `src/app/app.routes.ts`

### Purpose
Add the sales feature to the main application routing.

### Implementation

**Add this route to the existing routes array**:

```typescript
{
  path: 'sales',
  loadChildren: () => import('./features/sales/sales.routes')
    .then(m => m.SALES_ROUTES)
}
```

**Important Notes**:
- Place after other feature routes (companies, products, etc.)
- Use `loadChildren` for feature route modules
- No need for `canActivate` here (routes already protected in SALES_ROUTES)

---

## Critical Implementation Notes

### 1. FormArray Best Practices

- **Always subscribe to valueChanges** for auto-calculation
- **Use `{ emitEvent: false }`** when patching calculated values to avoid infinite loops
- **Initial calculation**: Call `calculateLineItemTotal()` after creating FormGroup
- **Clear before adding**: Use `this.items.clear()` when loading existing data

### 2. Product Dropdown Integration

- **Load products on init**: `this.productsStore.loadProducts()`
- **Use `take(1)`** operator when reading products synchronously
- **Auto-fill on selection**: Listen to `(change)` event on select

### 3. Validation Strategy

- **Submit-only validation**: Only show errors after form submission
- **Mark all as touched**: On submit, mark form AND FormArray items
- **Minimum line items**: Check `this.items.length === 0` and show error

### 4. Calculation Edge Cases

- **Handle null/undefined**: Use `|| 0` for all numeric values
- **Discount logic**: Subtract discount BEFORE calculating tax
- **Readonly total**: Use `{ value: 0, disabled: true }` for total field
- **Recalculate on remove**: Call `calculateGrandTotal()` after `removeAt()`

### 5. Performance Considerations

- **Unsubscribe**: Use `take(1)` for one-time reads
- **Debounce calculations**: If performance issues, add `debounceTime(300)` to valueChanges
- **Product list caching**: ProductsStore already caches, no need to reload

### 6. Angular 20 Specific Patterns

- **Use `inject()`**: All dependency injection via inject() function
- **Standalone components**: All components have `standalone: true`
- **FormArray is tricky**: Ensure proper typing with `as FormArray` and `as FormGroup`

### 7. Testing Checklist

After implementation, verify:
- [ ] Can create sale with multiple line items
- [ ] Can edit existing sale and modify line items
- [ ] Can add/remove line items dynamically
- [ ] Totals auto-calculate correctly
- [ ] Product selection auto-fills price and tax
- [ ] Form validation prevents invalid submission
- [ ] Search filtering works in list view
- [ ] Status badges display correct colors
- [ ] Mobile responsive layout works
- [ ] Navigation flows correctly (create → list, edit → list)

---

## Common Pitfalls to Avoid

### 1. FormArray Type Errors

**Problem**: TypeScript errors when accessing FormArray controls

**Solution**:
```typescript
// WRONG
const items = this.form.get('items');

// CORRECT
get items(): FormArray {
  return this.form.get('items') as FormArray;
}
```

### 2. Infinite valueChanges Loop

**Problem**: Calculations trigger valueChanges which trigger more calculations

**Solution**:
```typescript
// Use emitEvent: false when patching calculated values
lineItemGroup.patchValue({ total }, { emitEvent: false });
```

### 3. Missing Product Data on Edit

**Problem**: Product dropdown empty when editing

**Solution**:
```typescript
// Load products BEFORE loading sale data
ngOnInit(): void {
  this.initializeForm();
  this.productsStore.loadProducts(); // <-- FIRST

  this.route.params.subscribe(params => {
    if (params['id']) {
      this.loadSale(params['id']); // <-- THEN
    }
  });
}
```

### 4. FormArray Not Cleared on Load

**Problem**: Edit mode adds items on top of existing items

**Solution**:
```typescript
// Always clear before adding
this.items.clear();
sale.items.forEach(item => {
  this.items.push(this.createLineItemFormGroup(item));
});
```

### 5. Remove Button Deletes Last Item

**Problem**: User can remove all line items

**Solution**:
```typescript
removeLineItem(index: number): void {
  if (this.items.length > 1) { // <-- Guard condition
    this.items.removeAt(index);
    this.calculateGrandTotal();
  }
}
```

---

## File Structure Summary

```
src/app/features/sales/
├── services/
│   └── sales.store.ts                    (180 lines)
├── sale-list/
│   ├── sale-list.component.ts            (95 lines)
│   └── sale-list.component.html          (185 lines)
├── sale-create/
│   ├── sale-create.component.ts          (280 lines)
│   └── sale-create.component.html        (260 lines)
└── sales.routes.ts                       (20 lines)

Total: ~1020 lines of code
```

---

## Implementation Sequence

Follow this order to minimize errors:

1. **Create sales.store.ts** (simplest, no dependencies on other sales files)
2. **Create sales.routes.ts** (requires store to exist)
3. **Create sale-list component** (requires store, simpler than create)
4. **Test list functionality** (verify CRUD operations work)
5. **Create sale-create component** (most complex, requires all patterns)
6. **Test FormArray** (verify line items add/remove/calculate)
7. **Update app.routes.ts** (final integration)
8. **End-to-end testing** (full user flow)

---

## Dependencies to Verify

Before starting implementation, ensure these exist:

### Stores
- [x] ProductsStore at `src/app/features/products/services/products.store.ts`
- [x] AuthService (for user context)
- [x] CompanyContextService (for company context)

### Models
- [x] Sale, SaleLineItem, SaleStatus at `src/app/shared/models/sale.model.ts`
- [x] Product at `src/app/shared/models/product.model.ts`

### UI Components
- [x] Card
- [x] Button
- [x] FormInput
- [x] FormSelect
- [x] Badge
- [x] Alert
- [x] EmptyState
- [x] SearchBar

### Pipes
- [x] DateFormatPipe
- [ ] CurrencyFormatPipe (create if missing, or use Angular's built-in `currency`)

### Guards
- [x] authGuard

---

## Final Checklist

Before marking as complete:

- [ ] All TypeScript files compile without errors
- [ ] All components are standalone with proper imports
- [ ] FormArray properly typed with `as FormArray`
- [ ] Line items auto-calculate totals correctly
- [ ] Product dropdown loads and auto-fills price/tax
- [ ] Search filter works in list view
- [ ] Status badges show correct colors
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Navigation flows correctly
- [ ] Error handling displays properly
- [ ] Mobile responsive layouts tested
- [ ] Edit mode loads existing line items
- [ ] Can add/remove line items dynamically
- [ ] Totals section displays correctly
- [ ] Routes registered in app.routes.ts

---

## Summary

This implementation plan provides a complete, production-ready Sales Management feature with dynamic line items following Clean Architecture and Angular 20 best practices. The key innovation is the FormArray pattern for line items with auto-calculation, which is significantly more complex than the Company Management CRUD pattern but follows the same architectural structure.

**Total Effort Estimate**: 4-6 hours for experienced Angular developer

**Complexity Level**: Advanced (due to FormArray and calculations)

**Reusability**: This pattern can be reused for Purchases feature with minimal modifications.
