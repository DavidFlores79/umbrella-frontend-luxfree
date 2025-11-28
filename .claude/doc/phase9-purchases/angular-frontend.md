# Phase 9: Purchases Management - Implementation Plan

**Feature**: Purchase Order Management with Line Items (FormArray)
**Based On**: Phase 5 (Companies) + Complex FormArray Pattern for Line Items
**Status**: Ready for Implementation
**Complexity**: HIGH (Dynamic line items with calculations)

---

## Overview

This phase implements a full CRUD Purchase Order management system with dynamic line items using Angular's FormArray. Each purchase order can have multiple line items (products), with automatic subtotal and total calculations.

### Key Features

1. **Purchase Order List** - View, search, and manage purchase orders
2. **Create/Edit Purchase** - Form with vendor details + dynamic line items
3. **Line Items Management** - Add/remove products with auto-calculations
4. **Status Workflow** - draft → ordered → received → paid → cancelled
5. **RxJS State Management** - BehaviorSubject-based PurchasesStore

---

## Architecture Pattern

### Clean Architecture Layers

```
src/app/features/purchases/
├── services/
│   └── purchases.store.ts          # RxJS state management
├── purchase-list/
│   ├── purchase-list.component.ts  # Smart component (list view)
│   └── purchase-list.component.html
├── purchase-create/
│   ├── purchase-create.component.ts  # Smart component (form with FormArray)
│   └── purchase-create.component.html
└── purchases.routes.ts              # Feature routing
```

### Data Flow

```
User Action → Component → Store → MockApiService → Update State → UI Update
```

---

## File 1: PurchasesStore (State Management)

### File Path
```
src/app/features/purchases/services/purchases.store.ts
```

### Implementation Details

**Base Pattern**: Copy `src/app/features/companies/services/companies.store.ts`

**State Interface**:
```typescript
interface PurchasesState {
  purchases: Purchase[];           // All purchases
  loading: boolean;                // Loading indicator
  error: string | null;            // Error message
  selectedPurchase: Purchase | null; // Currently selected purchase for edit
}
```

**Key Methods**:

1. **loadPurchases()**: Fetch all purchases from MockAPI
   - Set loading to true
   - Call `mockApi.getPurchases()`
   - Update state with purchases array
   - Handle errors with catchError

2. **createPurchase(purchase: CreatePurchaseDto)**: Create new purchase
   - Validate purchase data
   - Call `mockApi.createPurchase(purchase)`
   - Add new purchase to state array
   - Navigate to list on success

3. **updatePurchase(id: string, updates: UpdatePurchaseDto)**: Update existing purchase
   - Call `mockApi.updatePurchase({ id, ...updates })`
   - Replace purchase in state array
   - Handle errors

4. **deletePurchase(id: string)**: Delete purchase
   - Show confirmation dialog in component
   - Call `mockApi.deletePurchase(id)`
   - Remove from state array

5. **selectPurchase(id: string)**: Select purchase for editing
   - Find purchase by ID in state
   - Set selectedPurchase in state

6. **clearError()**: Clear error message

**Selectors** (RxJS observables):
```typescript
readonly purchases$ = this.select(state => state.purchases);
readonly loading$ = this.select(state => state.loading);
readonly error$ = this.select(state => state.error);
readonly selectedPurchase$ = this.select(state => state.selectedPurchase);
```

**Dependencies**:
```typescript
import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Purchase, CreatePurchaseDto, UpdatePurchaseDto } from '../../../shared/models/purchase.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
```

**CRITICAL NOTES**:
- Use `inject()` function for DI (Angular 20 pattern)
- Extend `StoreBase<PurchasesState>`
- Use `patchState()` to update state
- Use `catchError` to handle API errors
- Return empty array `of([])` on error to prevent stream breaking

---

## File 2: PurchaseListComponent

### File Paths
```
src/app/features/purchases/purchase-list/purchase-list.component.ts
src/app/features/purchases/purchase-list/purchase-list.component.html
```

### Component TypeScript

**Base Pattern**: Copy `src/app/features/companies/company-list/company-list.component.ts`

**Key Changes from Companies**:

1. **Display Columns**:
   - Purchase Order Number (e.g., "PO-2024-001")
   - Vendor Name
   - Purchase Date
   - Total Amount (formatted as currency)
   - Status (badge with color coding)
   - Actions (Edit, Delete)

2. **Status Badge Colors**:
```typescript
getStatusBadgeVariant(status: PurchaseStatus): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'received': return 'success';    // Green
    case 'paid': return 'success';        // Green
    case 'pending': return 'warning';     // Yellow (backward compat)
    case 'ordered': return 'info';        // Blue
    case 'draft': return 'info';          // Blue
    case 'cancelled': return 'error';     // Red
    default: return 'info';
  }
}
```

**Note**: The user requirements mention these statuses:
- received = success (green)
- pending = warning (yellow)
- ordered = info (blue)
- cancelled = error (red)

However, the `purchase.model.ts` defines these statuses: `'draft' | 'ordered' | 'received' | 'paid' | 'cancelled'`

**IMPORTANT**: Use the model's actual status values, not the user's outdated list. Map them appropriately.

3. **Search Implementation**:
```typescript
readonly filteredPurchases$ = this.purchases$.pipe(
  map(purchases => {
    if (!this.searchTerm) {
      return purchases;
    }
    const term = this.searchTerm.toLowerCase();
    return purchases.filter(purchase =>
      purchase.purchaseOrderNumber.toLowerCase().includes(term) ||
      purchase.vendorName.toLowerCase().includes(term) ||
      purchase.vendorEmail.toLowerCase().includes(term)
    );
  })
);
```

4. **Currency Formatting**:
   - Use Angular's built-in `currency` pipe
   - Example: `{{ purchase.total | currency:'USD':'symbol':'1.2-2' }}`

**Dependencies**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchasesStore } from '../services/purchases.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Purchase } from '../../../shared/models/purchase.model';
import { map } from 'rxjs/operators';
```

### Component HTML Template

**Base Pattern**: Copy `src/app/features/companies/company-list/company-list.component.html`

**Key Changes**:

1. **Header Section**:
```html
<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 class="text-2xl font-bold text-text">Purchase Orders</h1>
    <p class="mt-1 text-sm text-text-light">Manage your purchase orders and vendor transactions</p>
  </div>
  <app-button variant="primary" (click)="onCreate()">
    <span class="mr-2">+</span>
    Create Purchase Order
  </app-button>
</div>
```

2. **Desktop Table Columns**:
```html
<thead class="bg-gray-50 dark:bg-gray-800">
  <tr>
    <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
      PO Number
    </th>
    <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
      Vendor Name
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
```

3. **Table Body**:
```html
<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
  <tr *ngFor="let purchase of filteredPurchases$ | async" class="hover:bg-gray-50 dark:hover:bg-gray-800">
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm font-medium text-text">{{ purchase.purchaseOrderNumber }}</div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm text-text">{{ purchase.vendorName }}</div>
      <div class="text-xs text-text-light">{{ purchase.vendorEmail }}</div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm text-text-light">{{ purchase.createdAt | appDateFormat }}</div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="text-sm font-semibold text-text">{{ purchase.total | currency:'USD':'symbol':'1.2-2' }}</div>
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <app-badge [variant]="getStatusBadgeVariant(purchase.status)">
        {{ purchase.status | uppercase }}
      </app-badge>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button (click)="onEdit(purchase)" class="text-primary hover:text-primary-700 mr-4">
        Edit
      </button>
      <button (click)="onDelete(purchase)" class="text-accent-red hover:text-red-700">
        Delete
      </button>
    </td>
  </tr>
</tbody>
```

4. **Mobile Cards**: Similar structure to desktop but in card format
5. **Empty State**: "No purchase orders found" with "Create Purchase Order" button
6. **Loading State**: Skeleton loader (same as companies)

---

## File 3: PurchaseCreateComponent (COMPLEX - FormArray)

### File Paths
```
src/app/features/purchases/purchase-create/purchase-create.component.ts
src/app/features/purchases/purchase-create/purchase-create.component.html
```

### Component TypeScript

**Base Pattern**: Copy `src/app/features/companies/company-create/company-create.component.ts`

**CRITICAL ADDITIONS**: FormArray for Dynamic Line Items

**Form Structure**:
```typescript
this.form = this.fb.group({
  // Vendor Information
  vendorName: ['', [Validators.required, Validators.minLength(2)]],
  vendorEmail: ['', [Validators.required, Validators.email]],
  vendorPhone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],

  // Purchase Details
  status: ['draft', Validators.required],
  paymentMethod: [''],
  notes: [''],

  // Line Items (FormArray)
  items: this.fb.array([
    this.createLineItemFormGroup()  // Initialize with one empty line item
  ])
});
```

**Line Item FormGroup Factory**:
```typescript
private createLineItemFormGroup(): FormGroup {
  return this.fb.group({
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    taxRate: [0, [Validators.min(0), Validators.max(100)]]
  });
}
```

**FormArray Getter**:
```typescript
get items(): FormArray {
  return this.form.get('items') as FormArray;
}
```

**Add Line Item**:
```typescript
addLineItem(): void {
  this.items.push(this.createLineItemFormGroup());
}
```

**Remove Line Item**:
```typescript
removeLineItem(index: number): void {
  if (this.items.length > 1) {  // Keep at least one line item
    this.items.removeAt(index);
  }
}
```

**Calculate Line Item Total** (Called on value changes):
```typescript
calculateLineItemTotal(index: number): number {
  const item = this.items.at(index);
  if (!item) return 0;

  const quantity = item.get('quantity')?.value || 0;
  const unitCost = item.get('unitCost')?.value || 0;
  const taxRate = item.get('taxRate')?.value || 0;

  const subtotal = quantity * unitCost;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return total;
}
```

**Calculate Purchase Totals**:
```typescript
get purchaseSubtotal(): number {
  let subtotal = 0;
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items.at(i);
    const quantity = item.get('quantity')?.value || 0;
    const unitCost = item.get('unitCost')?.value || 0;
    subtotal += quantity * unitCost;
  }
  return subtotal;
}

get purchaseTaxAmount(): number {
  let taxAmount = 0;
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items.at(i);
    const quantity = item.get('quantity')?.value || 0;
    const unitCost = item.get('unitCost')?.value || 0;
    const taxRate = item.get('taxRate')?.value || 0;
    const subtotal = quantity * unitCost;
    taxAmount += subtotal * (taxRate / 100);
  }
  return taxAmount;
}

get purchaseTotal(): number {
  return this.purchaseSubtotal + this.purchaseTaxAmount;
}
```

**Load Products for Dropdown**:
```typescript
import { ProductsStore } from '../../products/services/products.store';

private readonly productsStore = inject(ProductsStore);
readonly products$ = this.productsStore.products$;

ngOnInit(): void {
  this.productsStore.loadProducts();  // Load products for dropdown
  // ... rest of initialization
}
```

**Transform Form Data to DTO**:
```typescript
onSubmit(): void {
  this.submitted = true;

  Object.keys(this.form.controls).forEach(key => {
    this.form.get(key)?.markAsTouched();
  });

  if (this.form.invalid) {
    return;
  }

  const formValue = this.form.value;
  const companyId = 'current-company-id';  // Get from AuthService or CompanyContextService
  const userId = 'current-user-id';        // Get from AuthService

  // Transform line items
  const lineItems: CreatePurchaseLineItemDto[] = formValue.items.map((item: any) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitCost: item.unitCost
  }));

  const purchaseData: CreatePurchaseDto = {
    companyId,
    vendorName: formValue.vendorName,
    vendorEmail: formValue.vendorEmail,
    vendorPhone: formValue.vendorPhone || '',
    items: lineItems,
    status: formValue.status || 'draft',
    paymentMethod: formValue.paymentMethod || undefined,
    notes: formValue.notes || undefined,
    createdBy: userId
  };

  if (this.isEditMode && this.purchaseId) {
    const updateData: UpdatePurchaseDto = {
      id: this.purchaseId,
      vendorName: purchaseData.vendorName,
      vendorEmail: purchaseData.vendorEmail,
      vendorPhone: purchaseData.vendorPhone,
      items: lineItems,
      status: purchaseData.status,
      paymentMethod: purchaseData.paymentMethod,
      notes: purchaseData.notes
    };
    this.store.updatePurchase(this.purchaseId, updateData);
  } else {
    this.store.createPurchase(purchaseData);
  }

  // Navigate on success
  this.loading$.subscribe(loading => {
    if (!loading && this.submitted) {
      this.router.navigate(['/purchases']);
    }
  });
}
```

**IMPORTANT - Load Purchase for Edit Mode**:
```typescript
private loadPurchase(id: string): void {
  this.store.purchases$.subscribe(purchases => {
    const purchase = purchases.find(p => p.id === id);
    if (purchase) {
      // Clear existing line items
      while (this.items.length > 0) {
        this.items.removeAt(0);
      }

      // Add line items from purchase
      purchase.items.forEach(item => {
        this.items.push(this.fb.group({
          productId: [item.productId, Validators.required],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          unitCost: [item.unitCost, [Validators.required, Validators.min(0)]],
          taxRate: [item.taxRate, [Validators.min(0), Validators.max(100)]]
        }));
      });

      // Patch header fields
      this.form.patchValue({
        vendorName: purchase.vendorName,
        vendorEmail: purchase.vendorEmail,
        vendorPhone: purchase.vendorPhone,
        status: purchase.status,
        paymentMethod: purchase.paymentMethod || '',
        notes: purchase.notes || ''
      });
    }
  });
}
```

**Status Options**:
```typescript
readonly statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'received', label: 'Received' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' }
];
```

**Payment Method Options**:
```typescript
readonly paymentMethodOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
];
```

**Dependencies**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchasesStore } from '../services/purchases.store';
import { ProductsStore } from '../../products/services/products.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { CreatePurchaseDto, UpdatePurchaseDto, CreatePurchaseLineItemDto } from '../../../shared/models/purchase.model';
```

### Component HTML Template

**Structure**:

1. **Header Section** - Title (Create/Edit Purchase Order)
2. **Error Alert** - Display errors from store
3. **Vendor Information Section** - vendorName, vendorEmail, vendorPhone
4. **Purchase Details Section** - status, paymentMethod, notes
5. **Line Items Section** - Dynamic FormArray with Add/Remove buttons
6. **Totals Display** - Subtotal, Tax Amount, Total (read-only calculated)
7. **Action Buttons** - Submit, Cancel

**Line Items Section HTML**:
```html
<!-- Line Items Section -->
<div class="pt-6 border-t border-gray-200 dark:border-gray-700">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-medium text-text">Line Items</h3>
    <app-button
      type="button"
      variant="secondary"
      size="sm"
      (click)="addLineItem()"
    >
      <span class="mr-2">+</span>
      Add Item
    </app-button>
  </div>

  <div formArrayName="items" class="space-y-4">
    <div
      *ngFor="let item of items.controls; let i = index"
      [formGroupName]="i"
      class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-start gap-4">
        <!-- Product Dropdown -->
        <div class="flex-1">
          <app-form-select
            formControlName="productId"
            label="Product"
            [options]="productOptions$ | async"
            [required]="true"
            [errorMessage]="getLineItemFieldError(i, 'productId')"
          ></app-form-select>
        </div>

        <!-- Quantity -->
        <div class="w-24">
          <app-form-input
            formControlName="quantity"
            label="Qty"
            type="number"
            min="1"
            [required]="true"
            [errorMessage]="getLineItemFieldError(i, 'quantity')"
          ></app-form-input>
        </div>

        <!-- Unit Cost -->
        <div class="w-32">
          <app-form-input
            formControlName="unitCost"
            label="Unit Cost"
            type="number"
            min="0"
            step="0.01"
            [required]="true"
            [errorMessage]="getLineItemFieldError(i, 'unitCost')"
          ></app-form-input>
        </div>

        <!-- Tax Rate -->
        <div class="w-24">
          <app-form-input
            formControlName="taxRate"
            label="Tax %"
            type="number"
            min="0"
            max="100"
            step="0.1"
            [errorMessage]="getLineItemFieldError(i, 'taxRate')"
          ></app-form-input>
        </div>

        <!-- Total (Calculated) -->
        <div class="w-32">
          <label class="block text-sm font-medium text-text-light mb-2">Total</label>
          <div class="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-semibold text-text">
            {{ calculateLineItemTotal(i) | currency:'USD':'symbol':'1.2-2' }}
          </div>
        </div>

        <!-- Remove Button -->
        <div class="pt-7">
          <button
            type="button"
            (click)="removeLineItem(i)"
            [disabled]="items.length <= 1"
            class="text-accent-red hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove item"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Totals Display Section**:
```html
<!-- Purchase Totals -->
<div class="pt-6 border-t border-gray-200 dark:border-gray-700">
  <div class="flex justify-end">
    <div class="w-full max-w-md space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Subtotal:</span>
        <span class="font-semibold text-text">{{ purchaseSubtotal | currency:'USD':'symbol':'1.2-2' }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-text-light">Tax Amount:</span>
        <span class="font-semibold text-text">{{ purchaseTaxAmount | currency:'USD':'symbol':'1.2-2' }}</span>
      </div>
      <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
        <span class="text-text">Total:</span>
        <span class="text-primary">{{ purchaseTotal | currency:'USD':'symbol':'1.2-2' }}</span>
      </div>
    </div>
  </div>
</div>
```

**Full Template Structure**:
```html
<div class="p-6 max-w-6xl mx-auto">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-text">
      {{ isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order' }}
    </h1>
    <p class="mt-1 text-sm text-text-light">
      {{ isEditMode ? 'Update purchase order details' : 'Create a new purchase order' }}
    </p>
  </div>

  <!-- Error Alert -->
  @if (error$ | async; as error) {
    <app-alert type="error" [dismissible]="true" (dismissed)="dismissError()" class="mb-6">
      {{ error }}
    </app-alert>
  }

  <!-- Form -->
  <app-card>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="space-y-6">

        <!-- Vendor Information Section -->
        <!-- Purchase Details Section -->
        <!-- Line Items Section (shown above) -->
        <!-- Totals Display (shown above) -->

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <app-button
            type="submit"
            variant="primary"
            [loading]="(loading$ | async) || false"
            [disabled]="(loading$ | async) || false"
          >
            {{ isEditMode ? 'Update Purchase Order' : 'Create Purchase Order' }}
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

---

## File 4: Purchases Routes

### File Path
```
src/app/features/purchases/purchases.routes.ts
```

### Implementation

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PURCHASES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./purchase-list/purchase-list.component')
      .then(m => m.PurchaseListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./purchase-create/purchase-create.component')
      .then(m => m.PurchaseCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./purchase-create/purchase-create.component')
      .then(m => m.PurchaseCreateComponent),
    canActivate: [authGuard]
  }
];
```

**Key Points**:
- All routes protected by `authGuard`
- Lazy-loaded components with `loadComponent`
- Single component for create/edit (mode detected via route param)

---

## File 5: Update App Routes

### File Path
```
src/app/app.routes.ts
```

### Changes Required

**Add this route** after the companies route:

```typescript
// Purchases routes (protected)
{
  path: 'purchases',
  loadChildren: () => import('./features/purchases/purchases.routes')
    .then(m => m.PURCHASES_ROUTES)
},
```

**Complete Updated Section**:
```typescript
export const routes: Routes = [
  // Root redirect to dashboard
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

  // Companies routes (protected)
  {
    path: 'companies',
    loadChildren: () => import('./features/companies/companies.routes')
      .then(m => m.COMPANIES_ROUTES)
  },

  // Purchases routes (protected) ← NEW
  {
    path: 'purchases',
    loadChildren: () => import('./features/purchases/purchases.routes')
      .then(m => m.PURCHASES_ROUTES)
  },

  // Fallback route - redirect to login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
```

---

## Implementation Checklist

### Pre-Implementation Setup
- [ ] Ensure Phase 5 (Companies) is complete and working
- [ ] Ensure Phase 7 (Products) is complete (needed for product dropdown)
- [ ] Verify `purchase.model.ts` is correct
- [ ] Verify MockApiService has purchase methods

### Implementation Steps

**Step 1: Create Feature Directory**
```bash
mkdir -p src/app/features/purchases/services
mkdir -p src/app/features/purchases/purchase-list
mkdir -p src/app/features/purchases/purchase-create
```

**Step 2: Implement PurchasesStore**
- [ ] Create `purchases.store.ts`
- [ ] Define `PurchasesState` interface
- [ ] Implement selectors (purchases$, loading$, error$, selectedPurchase$)
- [ ] Implement `loadPurchases()` method
- [ ] Implement `createPurchase()` method
- [ ] Implement `updatePurchase()` method
- [ ] Implement `deletePurchase()` method
- [ ] Implement `selectPurchase()` method
- [ ] Implement `clearError()` method
- [ ] Test build: `npm run build`

**Step 3: Implement PurchaseListComponent**
- [ ] Create `purchase-list.component.ts`
- [ ] Create `purchase-list.component.html`
- [ ] Inject PurchasesStore
- [ ] Implement search functionality
- [ ] Implement status badge variant logic
- [ ] Implement onCreate(), onEdit(), onDelete() methods
- [ ] Create desktop table layout
- [ ] Create mobile card layout
- [ ] Add empty state
- [ ] Add loading state
- [ ] Test build: `npm run build`

**Step 4: Implement PurchaseCreateComponent**
- [ ] Create `purchase-create.component.ts`
- [ ] Create `purchase-create.component.html`
- [ ] Define form structure with FormArray
- [ ] Implement `createLineItemFormGroup()` factory
- [ ] Implement `addLineItem()` method
- [ ] Implement `removeLineItem()` method
- [ ] Implement `calculateLineItemTotal()` method
- [ ] Implement `purchaseSubtotal` getter
- [ ] Implement `purchaseTaxAmount` getter
- [ ] Implement `purchaseTotal` getter
- [ ] Load products from ProductsStore
- [ ] Implement `onSubmit()` with DTO transformation
- [ ] Implement edit mode loading
- [ ] Create vendor information section in template
- [ ] Create line items section with FormArray
- [ ] Create totals display section
- [ ] Add validation and error messages
- [ ] Test build: `npm run build`

**Step 5: Create Routes**
- [ ] Create `purchases.routes.ts`
- [ ] Define routes (list, create, edit/:id)
- [ ] Add authGuard to all routes
- [ ] Update `app.routes.ts`
- [ ] Test build: `npm run build`

**Step 6: Testing**
- [ ] Start dev server: `npm start`
- [ ] Navigate to `/purchases`
- [ ] Test list view with existing purchases
- [ ] Test search functionality
- [ ] Test create new purchase with multiple line items
- [ ] Test add/remove line items
- [ ] Test auto-calculation of totals
- [ ] Test edit existing purchase
- [ ] Test delete purchase
- [ ] Test validation errors
- [ ] Test responsive design (mobile + desktop)
- [ ] Test error handling

**Step 7: Final Verification**
- [ ] Build passes without errors: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] All CRUD operations working
- [ ] FormArray add/remove working
- [ ] Calculations correct
- [ ] Navigation working
- [ ] Loading states working
- [ ] Error messages displayed

---

## CRITICAL Implementation Notes

### 1. FormArray Pattern (NEW - Not in Phase 5)

This is the **most complex** part of this implementation. Key points:

**Initialize with One Item**:
```typescript
items: this.fb.array([
  this.createLineItemFormGroup()  // Start with one empty line
])
```

**Subscribe to Value Changes for Auto-Calc** (Optional Enhancement):
```typescript
ngOnInit(): void {
  this.items.valueChanges.subscribe(() => {
    // Trigger change detection for totals
  });
}
```

**Minimum One Item Validation**:
```typescript
removeLineItem(index: number): void {
  if (this.items.length > 1) {  // Always keep at least one
    this.items.removeAt(index);
  }
}
```

### 2. Product Dropdown Integration

**Dependency**: Requires ProductsStore to be implemented (Phase 7)

**Product Options Observable**:
```typescript
readonly productOptions$ = this.products$.pipe(
  map(products => products.map(p => ({
    value: p.id,
    label: `${p.name} (${p.sku}) - $${p.cost}`
  })))
);
```

**Template Usage**:
```html
<app-form-select
  formControlName="productId"
  label="Product"
  [options]="productOptions$ | async"
  [required]="true"
></app-form-select>
```

### 3. Calculation Logic

**Tax Calculation**:
```
subtotal = quantity * unitCost
taxAmount = subtotal * (taxRate / 100)
total = subtotal + taxAmount
```

**Purchase Totals**:
```
purchaseSubtotal = sum of all line item subtotals
purchaseTaxAmount = sum of all line item tax amounts
purchaseTotal = purchaseSubtotal + purchaseTaxAmount
```

### 4. DTO Transformation

**Line Items Need Transformation**:
- Form has: `productId`, `quantity`, `unitCost`, `taxRate`
- DTO needs: `productId`, `quantity`, `unitCost` (NO taxRate in DTO!)

**Important**: The `CreatePurchaseLineItemDto` only has `productId`, `quantity`, `unitCost`. The tax calculation is done on the backend based on the product's tax configuration.

**Backend Calculates**:
- productName (from productId lookup)
- productSku (from productId lookup)
- taxRate (from product taxable flag)
- taxAmount (calculated)
- subtotal (calculated)
- total (calculated)

### 5. User Context

**Get Current User and Company**:
```typescript
import { AuthService } from '../../../core/services/auth.service';
import { CompanyContextService } from '../../../core/services/company-context.service';

private readonly authService = inject(AuthService);
private readonly companyContext = inject(CompanyContextService);

onSubmit(): void {
  const companyId = this.companyContext.getCurrentCompanyId();
  const userId = this.authService.getCurrentUserId();

  const purchaseData: CreatePurchaseDto = {
    companyId,
    createdBy: userId,
    // ... rest of fields
  };
}
```

**Note**: Check if these methods exist in the services. If not, use placeholder values for MVP.

### 6. Status Workflow

**Correct Status Values** (from model):
- `draft` - Initial state
- `ordered` - Sent to vendor
- `received` - Items received
- `paid` - Payment completed
- `cancelled` - Order cancelled

**NOT** the user's outdated list (pending, received, ordered, cancelled)

### 7. Responsive Design

**Desktop**: Full table with all columns
**Mobile**: Cards with key info + expand for details
**Line Items on Mobile**: Stack vertically, one item per card

### 8. Validation Strategy

**Submit-Only Validation** (same as Phase 5):
- Don't show errors until submit is clicked
- Use `submitted` flag
- Mark all fields as touched on submit
- Show errors only if `field.touched || submitted`

### 9. Performance Considerations

**Large Line Item Arrays**:
- If performance issues occur with many line items, consider:
  - Debouncing calculation updates
  - Virtual scrolling (not needed for MVP)
  - Lazy rendering

**For MVP**: Support up to 20 line items without optimization

### 10. MockAPI Integration

**Available Methods** (already in MockApiService):
```typescript
getPurchases(companyId?: string): Observable<Purchase[]>
getPurchase(id: string): Observable<Purchase>
createPurchase(dto: CreatePurchaseDto): Observable<Purchase>
updatePurchase(dto: UpdatePurchaseDto): Observable<Purchase>
deletePurchase(id: string): Observable<void>
```

**Backend Auto-Generates**:
- `id` (UUID)
- `purchaseOrderNumber` (e.g., "PO-2024-001")
- `createdAt`, `updatedAt` timestamps
- Line item calculations (subtotal, tax, total)
- Purchase totals (subtotal, taxAmount, total)

---

## Testing Strategy

### Unit Testing (Phase 11 - Future)

**PurchasesStore Tests**:
- Test initial state
- Test loadPurchases() updates state
- Test createPurchase() adds to array
- Test updatePurchase() modifies array
- Test deletePurchase() removes from array
- Test error handling

**PurchaseCreateComponent Tests**:
- Test form initialization
- Test addLineItem() adds to FormArray
- Test removeLineItem() removes from FormArray
- Test calculation methods
- Test DTO transformation
- Test edit mode loading

### Manual Testing (Now)

1. **Create Purchase**:
   - Fill vendor details
   - Add 3 line items
   - Set different quantities, costs, tax rates
   - Verify totals calculate correctly
   - Submit and verify navigation

2. **Edit Purchase**:
   - Navigate to edit
   - Verify form loads with existing data
   - Verify line items populate correctly
   - Modify line items
   - Submit and verify update

3. **Delete Purchase**:
   - Click delete on a purchase
   - Verify confirmation dialog
   - Confirm deletion
   - Verify removal from list

4. **Search**:
   - Search by PO number
   - Search by vendor name
   - Search by vendor email
   - Verify results filter correctly

5. **Responsive**:
   - Test on desktop (table view)
   - Test on mobile (card view)
   - Test line items layout on mobile
   - Verify all functions work on both

---

## Common Pitfalls to Avoid

### 1. FormArray Type Errors

**Wrong**:
```typescript
this.form.get('items')  // Returns AbstractControl | null
```

**Correct**:
```typescript
get items(): FormArray {
  return this.form.get('items') as FormArray;
}
```

### 2. Missing Product Store Dependency

**Error**: "ProductsStore not found"

**Solution**: Implement Phase 7 (Products) first, or create mock product data in component.

### 3. Calculation Timing

**Issue**: Totals don't update when line items change

**Solution**: Use getters (not properties) for calculated values:
```typescript
get purchaseTotal(): number {  // Getter, not property
  return this.purchaseSubtotal + this.purchaseTaxAmount;
}
```

### 4. Line Item DTO Transformation

**Wrong**:
```typescript
const lineItems = formValue.items;  // Includes taxRate
```

**Correct**:
```typescript
const lineItems = formValue.items.map((item: any) => ({
  productId: item.productId,
  quantity: item.quantity,
  unitCost: item.unitCost
  // NO taxRate - backend calculates it
}));
```

### 5. Edit Mode Line Items

**Issue**: Line items don't load in edit mode

**Solution**: Clear FormArray first, then add items:
```typescript
while (this.items.length > 0) {
  this.items.removeAt(0);
}

purchase.items.forEach(item => {
  this.items.push(this.createLineItemFormGroup());
});
```

### 6. Minimum Line Items

**Issue**: User removes all line items, form invalid

**Solution**: Disable remove button when only one item:
```html
[disabled]="items.length <= 1"
```

### 7. Currency Formatting

**Wrong**:
```html
{{ total }}  <!-- Shows 123.456789 -->
```

**Correct**:
```html
{{ total | currency:'USD':'symbol':'1.2-2' }}  <!-- Shows $123.46 -->
```

### 8. Async Pipe Missing

**Wrong**:
```html
<div *ngFor="let item of items$">  <!-- Won't work -->
```

**Correct**:
```html
<div *ngFor="let item of items$ | async">  <!-- Works -->
```

---

## File Summary

### Files to Create (5 new files)

1. **Store**: `src/app/features/purchases/services/purchases.store.ts`
2. **List Component**: `src/app/features/purchases/purchase-list/purchase-list.component.ts`
3. **List Template**: `src/app/features/purchases/purchase-list/purchase-list.component.html`
4. **Create Component**: `src/app/features/purchases/purchase-create/purchase-create.component.ts`
5. **Create Template**: `src/app/features/purchases/purchase-create/purchase-create.component.html`
6. **Routes**: `src/app/features/purchases/purchases.routes.ts`

### Files to Modify (1 existing file)

1. **App Routes**: `src/app/app.routes.ts` - Add purchases route

---

## Estimated Implementation Time

- **PurchasesStore**: 30 minutes
- **PurchaseListComponent**: 1 hour
- **PurchaseCreateComponent** (FormArray complexity): 3-4 hours
- **Routes**: 15 minutes
- **Testing**: 1 hour
- **Bug Fixes**: 1 hour

**Total**: **6-8 hours** for complete implementation

---

## Dependencies

### Must Be Implemented First

1. **Phase 7 (Products)** - Required for product dropdown in line items

### Optional Enhancements (Post-MVP)

1. Auto-save draft purchases
2. Print purchase order (PDF export)
3. Email purchase order to vendor
4. Inventory integration (auto-update stock on receive)
5. Payment tracking with receipts
6. Multi-currency support
7. Vendor management (separate feature)
8. Purchase order approval workflow

---

## Success Criteria

Phase 9 is complete when:

1. [ ] All files created and build passes
2. [ ] Can view list of purchases with search
3. [ ] Can create new purchase with multiple line items
4. [ ] Line items can be added/removed dynamically
5. [ ] Totals calculate correctly and automatically
6. [ ] Can edit existing purchase and modify line items
7. [ ] Can delete purchases with confirmation
8. [ ] Status badges display with correct colors
9. [ ] Responsive design works on mobile and desktop
10. [ ] No console errors
11. [ ] Navigation works correctly (/purchases, /purchases/create, /purchases/edit/:id)
12. [ ] FormArray validation works
13. [ ] Product dropdown loads products
14. [ ] Currency formatting is correct

---

## Quick Reference

### Key Commands
```bash
# Development
npm start

# Build
npm run build

# Test
npm test
```

### Navigation URLs
```
/purchases          → List view
/purchases/create   → Create new
/purchases/edit/:id → Edit existing
```

### Key Files Reference
```
Phase 5 (Companies) - Copy this pattern:
  src/app/features/companies/services/companies.store.ts
  src/app/features/companies/company-list/company-list.component.ts
  src/app/features/companies/company-create/company-create.component.ts

Data Models:
  src/app/shared/models/purchase.model.ts

MockAPI Methods:
  src/app/core/services/mock-api.service.ts
```

---

**IMPORTANT FINAL NOTES**:

1. **Do NOT implement** - This is a plan only
2. **Phase 7 (Products) must be done first** - Required for product dropdown
3. **FormArray is complex** - Take time to understand the pattern
4. **Test calculations thoroughly** - Math errors are hard to debug
5. **Follow Phase 5 pattern exactly** - Proven and working
6. **Use TypeScript strict mode** - Let compiler catch errors
7. **Test responsive design** - Mobile view is different from desktop

---

**Next Steps**:
1. Implement Phase 7 (Products) if not done
2. Review this plan thoroughly
3. Create feature directory structure
4. Start with PurchasesStore (simplest)
5. Then PurchaseListComponent
6. Finally PurchaseCreateComponent (most complex)
7. Test incrementally after each component

Good luck! 🚀
