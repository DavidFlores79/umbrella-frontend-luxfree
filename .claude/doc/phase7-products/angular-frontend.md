# Phase 7: Products Management - Implementation Plan

**Reference Implementation**: Phase 5 (Company Management)
**Feature**: Complete CRUD functionality for Products/Services catalog
**Pattern**: RxJS-based state management with Angular 20 standalone components

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Implementation Details](#implementation-details)
4. [Data Models](#data-models)
5. [Important Notes](#important-notes)

---

## Overview

This implementation follows the EXACT pattern established in Phase 5 (Company Management). The Products Management feature provides complete CRUD operations for managing products and services in the catalog with the following capabilities:

- **Product Listing** with search, filtering, and responsive layout
- **Product Creation/Editing** with comprehensive form validation
- **Product Deletion** with confirmation
- **Multi-tenancy Support** via companyId association
- **Category and Type Classification** with visual badges
- **Inventory Tracking** option toggle
- **Stock Level Display** (when inventory tracking enabled)

### Key Features
- RxJS-based state management (NO Angular Signals)
- Angular 20 standalone components
- Reactive forms with submit-only validation
- Tailwind CSS responsive design
- MainLayout wrapper integration
- MockApiService integration for backend simulation

---

## File Structure

```
src/app/features/products/
├── services/
│   └── products.store.ts                 # RxJS state store
├── product-list/
│   ├── product-list.component.ts         # List view component
│   └── product-list.component.html       # List view template
├── product-create/
│   ├── product-create.component.ts       # Create/Edit component
│   └── product-create.component.html     # Create/Edit template
└── products.routes.ts                    # Feature routing

Modified Files:
└── src/app/app.routes.ts                 # Add products route
```

---

## Implementation Details

### 1. ProductsStore Service

**File**: `src/app/features/products/services/products.store.ts`

**Purpose**: Centralized RxJS-based state management for products

**Pattern Reference**: `src/app/features/companies/services/companies.store.ts`

#### State Interface

```typescript
interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}
```

#### Implementation Structure

```typescript
import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Product } from '../../../shared/models/product.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsStore extends StoreBase<ProductsState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly products$ = this.select(state => state.products);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedProduct$ = this.select(state => state.selectedProduct);

  constructor() {
    super({
      products: [],
      loading: false,
      error: null,
      selectedProduct: null
    });
  }

  loadProducts(): void {
    // Set loading state and clear errors
    // Call mockApi.getProducts()
    // Update state on success/error
  }

  createProduct(product: Partial<Product>): void {
    // Set loading state
    // Call mockApi.createProduct()
    // Add new product to state array
    // Handle errors with catchError
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    // Set loading state
    // Call mockApi.updateProduct()
    // Update product in state array (map and replace)
    // Handle errors
  }

  deleteProduct(id: string): void {
    // Set loading state
    // Call mockApi.deleteProduct()
    // Remove product from state array (filter)
    // Handle errors
  }

  selectProduct(id: string): void {
    // Find product by id in current state
    // Update selectedProduct in state
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
```

#### Key Methods

1. **loadProducts()**
   - Sets `loading: true`, `error: null`
   - Calls `this.mockApi.getProducts()`
   - Updates state with products array on success
   - Catches errors and updates error state

2. **createProduct(product: Partial<Product>)**
   - Sets `loading: true`, `error: null`
   - Calls `this.mockApi.createProduct(product as any)`
   - Adds new product to existing products array: `[...this.currentState.products, newProduct]`
   - Throws error on failure (for component handling)

3. **updateProduct(id: string, updates: Partial<Product>)**
   - Constructs update DTO: `{ id, ...updates }`
   - Calls `this.mockApi.updateProduct(updateDto as any)`
   - Maps products array and replaces updated product
   - Handles errors with catchError

4. **deleteProduct(id: string)**
   - Calls `this.mockApi.deleteProduct(id)`
   - Filters products array to remove deleted product
   - Updates state with filtered array

5. **selectProduct(id: string)**
   - Finds product using `find((p: Product) => p.id === id)`
   - Updates `selectedProduct` in state

#### Important Notes

- **Extends StoreBase<ProductsState>** from `core/services/store-base.service.ts`
- **Uses `inject()` function** for dependency injection (Angular 20 best practice)
- **All selectors are readonly observables** using `this.select()`
- **Always use `patchState()`** to update state
- **Access current state** via `this.currentState` property
- **Error handling pattern**: Use `catchError` and `patchState` for errors
- **Loading pattern**: Set loading=true before API call, false in tap/catchError

---

### 2. ProductListComponent

**Files**:
- `src/app/features/products/product-list/product-list.component.ts`
- `src/app/features/products/product-list/product-list.component.html`

**Purpose**: Display products in a responsive table with search and actions

**Pattern Reference**: `src/app/features/companies/company-list/`

#### Component Structure (TypeScript)

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsStore } from '../services/products.store';
import { DataTable } from '../../../shared/components/data/data-table/data-table';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { Product } from '../../../shared/models/product.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    DataTable,
    SearchBar,
    Card,
    Button,
    Badge,
    Alert,
    EmptyState,
    DateFormatPipe,
    CurrencyFormatPipe
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  private readonly store = inject(ProductsStore);
  private readonly router = inject(Router);

  readonly products$ = this.store.products$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  searchTerm = '';

  readonly filteredProducts$ = this.products$.pipe(
    map(products => {
      if (!this.searchTerm) {
        return products;
      }
      const term = this.searchTerm.toLowerCase();
      return products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    })
  );

  readonly columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'cost', label: 'Cost', sortable: true },
    { key: 'stock', label: 'Stock', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  ngOnInit(): void {
    this.store.loadProducts();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onCreate(): void {
    this.router.navigate(['/products/create']);
  }

  onEdit(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  onDelete(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.store.deleteProduct(product.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(isActive: boolean): 'success' | 'warning' | 'error' | 'info' {
    return isActive ? 'success' : 'warning';
  }

  getCategoryBadgeVariant(category: string): 'success' | 'warning' | 'error' | 'info' {
    // Category badge colors:
    // - product (physical goods) = blue (info)
    // - service = green (success)
    // - labor = purple (warning with custom styling)
    switch (category) {
      case 'product':
        return 'info';
      case 'service':
        return 'success';
      case 'labor':
        return 'warning';
      default:
        return 'info';
    }
  }

  getTypeBadgeVariant(type: string): 'success' | 'warning' | 'error' | 'info' {
    switch (type) {
      case 'product':
        return 'info';
      case 'service':
        return 'success';
      case 'labor':
        return 'warning';
      default:
        return 'info';
    }
  }
}
```

#### Key Features

1. **Dependency Injection**: Uses `inject()` for ProductsStore and Router
2. **Reactive Search**: `filteredProducts$` observable filters by name, SKU, description, category
3. **Column Configuration**: Defines table columns with sortable flags
4. **CRUD Actions**:
   - `onCreate()`: Navigate to `/products/create`
   - `onEdit(product)`: Navigate to `/products/edit/:id`
   - `onDelete(product)`: Confirm dialog then call store.deleteProduct()
5. **Error Handling**: `dismissError()` clears store error state
6. **Badge Variants**: Helper methods for category, type, and status badge colors

#### Badge Color Mapping

- **Category Badges**:
  - `product` (physical goods) → `info` (blue)
  - `service` → `success` (green)
  - `labor` → `warning` (purple/yellow)

- **Type Badges**:
  - Same as category mapping

- **Status Badges**:
  - `isActive: true` → `success` (green)
  - `isActive: false` → `warning` (yellow)

---

#### Template Structure (HTML)

**File**: `src/app/features/products/product-list/product-list.component.html`

```html
<div class="p-6">
  <!-- Header -->
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold text-text">Products & Services</h1>
      <p class="mt-1 text-sm text-text-light">Manage your product catalog</p>
    </div>
    <app-button variant="primary" (click)="onCreate()">
      <span class="mr-2">+</span>
      Create Product
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
      placeholder="Search products by name, SKU, description, or category..."
      (searchChange)="onSearch($event)"
    ></app-search-bar>
  </div>

  <!-- Products Table -->
  <app-card [loading]="(loading$ | async) || false">
    <div *ngIf="(filteredProducts$ | async) as products; else loading">
      <div *ngIf="products.length > 0; else empty">

        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  SKU
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                  Price
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                  Cost
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">
                  Stock
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let product of products" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-text">{{ product.name }}</div>
                  <div class="text-xs text-text-light truncate max-w-xs">{{ product.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ product.sku }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-badge [variant]="getCategoryBadgeVariant(product.type)">
                    {{ product.category | uppercase }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-badge [variant]="getTypeBadgeVariant(product.type)">
                    {{ product.type | uppercase }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm text-text">{{ product.price | appCurrency }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm text-text-light">{{ product.cost | appCurrency }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="text-sm text-text-light">
                    {{ product.trackInventory ? 'Tracked' : 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <app-badge [variant]="getStatusBadgeVariant(product.isActive)">
                    {{ product.isActive ? 'ACTIVE' : 'INACTIVE' }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    (click)="onEdit(product)"
                    class="text-primary hover:text-primary-700 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    (click)="onDelete(product)"
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
            *ngFor="let product of products"
            class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-medium text-text">{{ product.name }}</h3>
                <p class="text-xs text-text-light mt-1">{{ product.sku }}</p>
                <p class="text-sm text-text-light mt-1 line-clamp-2">{{ product.description }}</p>
              </div>
              <div class="flex flex-col gap-1">
                <app-badge [variant]="getStatusBadgeVariant(product.isActive)">
                  {{ product.isActive ? 'Active' : 'Inactive' }}
                </app-badge>
              </div>
            </div>

            <div class="space-y-2 mb-3">
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Category:</span>
                <app-badge [variant]="getCategoryBadgeVariant(product.type)">
                  {{ product.category }}
                </app-badge>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Type:</span>
                <app-badge [variant]="getTypeBadgeVariant(product.type)">
                  {{ product.type }}
                </app-badge>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Price:</span>
                <span class="text-text font-medium">{{ product.price | appCurrency }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Cost:</span>
                <span class="text-text">{{ product.cost | appCurrency }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Inventory:</span>
                <span class="text-text">{{ product.trackInventory ? 'Tracked' : 'N/A' }}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                (click)="onEdit(product)"
                class="flex-1 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md"
              >
                Edit
              </button>
              <button
                (click)="onDelete(product)"
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
        title="No products found"
        description="Get started by creating your first product or service"
        [actionLabel]="'Create Product'"
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

#### Template Features

1. **Responsive Layout**: Desktop table + mobile card layout
2. **Search Integration**: SearchBar component with placeholder text
3. **Error Display**: Alert component with dismissible errors
4. **Empty State**: EmptyState component when no products exist
5. **Loading State**: Skeleton loading animation
6. **Table Columns**: Name/Description, SKU, Category, Type, Price, Cost, Stock, Status, Actions
7. **Mobile Cards**: Compact view with all essential product information
8. **Currency Formatting**: Uses `appCurrency` pipe for price/cost display
9. **Badge Display**: Category, Type, and Status badges with color variants
10. **Action Buttons**: Edit and Delete buttons with hover effects

---

### 3. ProductCreateComponent

**Files**:
- `src/app/features/products/product-create/product-create.component.ts`
- `src/app/features/products/product-create/product-create.component.html`

**Purpose**: Create new products or edit existing products

**Pattern Reference**: `src/app/features/companies/company-create/`

#### Component Structure (TypeScript)

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsStore } from '../services/products.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { FormTextarea } from '../../../shared/components/ui/forms/form-textarea/form-textarea';
import { FormCheckbox } from '../../../shared/components/ui/forms/form-checkbox/form-checkbox';
import { Alert } from '../../../shared/components/ui/alert/alert';

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
    FormTextarea,
    FormCheckbox,
    Alert
  ],
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(ProductsStore);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  isEditMode = false;
  productId: string | null = null;
  form!: FormGroup;
  submitted = false;

  readonly categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'tools', label: 'Tools & Equipment' },
    { value: 'supplies', label: 'Office Supplies' },
    { value: 'software', label: 'Software & Digital' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Other' }
  ];

  readonly typeOptions = [
    { value: 'product', label: 'Physical Product' },
    { value: 'service', label: 'Service' },
    { value: 'labor', label: 'Labor' }
  ];

  readonly statusOptions = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  readonly unitOptions = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'lb', label: 'Pound' },
    { value: 'hour', label: 'Hour' },
    { value: 'day', label: 'Day' },
    { value: 'meter', label: 'Meter' },
    { value: 'liter', label: 'Liter' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' }
  ];

  ngOnInit(): void {
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
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      sku: ['', [Validators.required]],
      category: ['other', Validators.required],
      type: ['product', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      unit: ['piece', Validators.required],
      trackInventory: [false],
      isActive: ['true', Validators.required]
    });
  }

  private loadProduct(id: string): void {
    this.store.products$.subscribe(products => {
      const product = products.find(p => p.id === id);
      if (product) {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          sku: product.sku,
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
      name: formValue.name,
      description: formValue.description,
      sku: formValue.sku,
      category: formValue.category,
      type: formValue.type,
      price: Number(formValue.price),
      cost: Number(formValue.cost),
      taxRate: Number(formValue.taxRate) || 0,
      unit: formValue.unit,
      trackInventory: formValue.trackInventory,
      isActive: formValue.isActive === 'true'
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
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (field.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `${this.getFieldLabel(fieldName)} cannot exceed ${field.errors['max'].max}`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Product name',
      description: 'Description',
      sku: 'SKU',
      category: 'Category',
      type: 'Type',
      price: 'Price',
      cost: 'Cost',
      taxRate: 'Tax rate',
      unit: 'Unit',
      trackInventory: 'Track inventory',
      isActive: 'Status'
    };
    return labels[fieldName] || fieldName;
  }
}
```

#### Key Features

1. **Dual Mode**: Handles both create and edit operations
2. **Route Parameter Detection**: Checks for `:id` to determine edit mode
3. **Form Validation**:
   - Required: name, description, sku, category, type, price, cost, unit, status
   - Min length: name (2 characters)
   - Min value: price (0), cost (0), taxRate (0)
   - Max value: taxRate (100)
4. **Submit-Only Validation**: Errors shown only after form submission or field touch
5. **Data Type Conversion**:
   - Price/Cost/TaxRate converted to numbers
   - isActive converted from string to boolean
6. **Navigation**: Returns to `/products` after successful save or cancel
7. **Error Handling**: Displays store errors and allows dismissal

---

#### Template Structure (HTML)

**File**: `src/app/features/products/product-create/product-create.component.html`

```html
<div class="p-6 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-text">
      {{ isEditMode ? 'Edit Product' : 'Create Product' }}
    </h1>
    <p class="mt-1 text-sm text-text-light">
      {{ isEditMode ? 'Update product information' : 'Add a new product or service to your catalog' }}
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

        <!-- Basic Information -->
        <div>
          <h3 class="text-lg font-medium text-text mb-4">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <app-form-input
                formControlName="name"
                label="Product Name"
                placeholder="Enter product name"
                [required]="true"
                [errorMessage]="getFieldError('name')"
              ></app-form-input>
            </div>

            <div class="md:col-span-2">
              <app-form-textarea
                formControlName="description"
                label="Description"
                placeholder="Enter product description"
                [required]="true"
                [errorMessage]="getFieldError('description')"
                [rows]="4"
              ></app-form-textarea>
            </div>

            <app-form-input
              formControlName="sku"
              label="SKU"
              placeholder="Enter SKU code"
              [required]="true"
              [errorMessage]="getFieldError('sku')"
            ></app-form-input>

            <app-form-select
              formControlName="unit"
              label="Unit of Measure"
              [options]="unitOptions"
              [required]="true"
              [errorMessage]="getFieldError('unit')"
            ></app-form-select>
          </div>
        </div>

        <!-- Classification -->
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-text mb-4">Classification</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-form-select
              formControlName="category"
              label="Category"
              [options]="categoryOptions"
              [required]="true"
              [errorMessage]="getFieldError('category')"
            ></app-form-select>

            <app-form-select
              formControlName="type"
              label="Type"
              [options]="typeOptions"
              [required]="true"
              [errorMessage]="getFieldError('type')"
            ></app-form-select>
          </div>
        </div>

        <!-- Pricing -->
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-text mb-4">Pricing</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-form-input
              formControlName="price"
              label="Sale Price"
              type="number"
              placeholder="0.00"
              [required]="true"
              [errorMessage]="getFieldError('price')"
            ></app-form-input>

            <app-form-input
              formControlName="cost"
              label="Cost Price"
              type="number"
              placeholder="0.00"
              [required]="true"
              [errorMessage]="getFieldError('cost')"
            ></app-form-input>

            <app-form-input
              formControlName="taxRate"
              label="Tax Rate (%)"
              type="number"
              placeholder="0"
              [errorMessage]="getFieldError('taxRate')"
            ></app-form-input>
          </div>
        </div>

        <!-- Inventory & Status -->
        <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-text mb-4">Inventory & Status</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <app-form-checkbox
                formControlName="trackInventory"
                label="Track Inventory"
              ></app-form-checkbox>
              <p class="mt-1 text-xs text-text-light">
                Enable inventory tracking for this product
              </p>
            </div>

            <app-form-select
              formControlName="isActive"
              label="Status"
              [options]="statusOptions"
              [required]="true"
              [errorMessage]="getFieldError('isActive')"
            ></app-form-select>
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
            {{ isEditMode ? 'Update Product' : 'Create Product' }}
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

#### Form Sections

1. **Basic Information**:
   - Product Name (required, min 2 chars)
   - Description (required, textarea with 4 rows)
   - SKU (required)
   - Unit of Measure (dropdown: piece, kg, hour, etc.)

2. **Classification**:
   - Category (dropdown: electronics, clothing, food, furniture, tools, supplies, software, services, other)
   - Type (dropdown: product, service, labor)

3. **Pricing**:
   - Sale Price (required, min 0, number input)
   - Cost Price (required, min 0, number input)
   - Tax Rate (optional, 0-100%, number input)

4. **Inventory & Status**:
   - Track Inventory (checkbox with helper text)
   - Status (dropdown: Active/Inactive)

5. **Action Buttons**:
   - Submit button (shows "Create" or "Update" based on mode)
   - Cancel button (navigates back to list)

#### Template Features

- **Responsive Grid**: 2-column layout on md+ screens
- **Section Dividers**: Visual separation with borders
- **Form Components**: Uses shared form components (FormInput, FormSelect, FormTextarea, FormCheckbox)
- **Validation Messages**: Inline error messages below each field
- **Loading States**: Disabled buttons during submission
- **Helper Text**: Additional context for checkbox fields

---

### 4. Products Routes

**File**: `src/app/features/products/products.routes.ts`

**Purpose**: Define routing configuration for products feature

**Pattern Reference**: `src/app/features/companies/companies.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./product-list/product-list.component')
      .then(m => m.ProductListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./product-create/product-create.component')
      .then(m => m.ProductCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-create/product-create.component')
      .then(m => m.ProductCreateComponent),
    canActivate: [authGuard]
  }
];
```

#### Route Configuration

1. **List Route** (`/products`)
   - Loads ProductListComponent
   - Protected by authGuard
   - Lazy-loaded with `loadComponent`

2. **Create Route** (`/products/create`)
   - Loads ProductCreateComponent
   - Protected by authGuard
   - Same component handles create mode

3. **Edit Route** (`/products/edit/:id`)
   - Loads ProductCreateComponent with route parameter
   - Protected by authGuard
   - Component detects edit mode via route params

#### Important Notes

- **Lazy Loading**: All components use `loadComponent` for code splitting
- **Auth Protection**: All routes require authentication via `authGuard`
- **Shared Component**: Create and Edit use the same component (dual mode)
- **Route Params**: Edit route includes `:id` parameter for product identification

---

### 5. App Routes Update

**File**: `src/app/app.routes.ts`

**Purpose**: Add products route to main application routing

**Change Required**: Add products lazy-loaded route

```typescript
import { Routes } from '@angular/router';

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

  // Products routes (protected) - NEW
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes')
      .then(m => m.PRODUCTS_ROUTES)
  },

  // Fallback route - redirect to login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
```

#### Addition Details

**Location**: After companies routes, before fallback route

**Pattern**: Lazy-loaded child routes with `loadChildren`

**Import Path**: `./features/products/products.routes`

**Export Name**: `PRODUCTS_ROUTES`

---

## Data Models

### Product Interface

**File**: `src/app/shared/models/product.model.ts` (already exists)

```typescript
export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  price: number;
  cost: number;
  taxRate: number;
  unit: string;
  image?: string;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory =
  | 'electronics'
  | 'clothing'
  | 'food'
  | 'furniture'
  | 'tools'
  | 'supplies'
  | 'software'
  | 'services'
  | 'other';

export type ProductType = 'product' | 'service' | 'labor';

export interface CreateProductDto {
  companyId: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  price: number;
  cost: number;
  taxRate?: number;
  unit: string;
  trackInventory?: boolean;
}

export interface UpdateProductDto {
  id: string;
  sku?: string;
  name?: string;
  description?: string;
  category?: ProductCategory;
  type?: ProductType;
  price?: number;
  cost?: number;
  taxRate?: number;
  unit?: string;
  isActive?: boolean;
  trackInventory?: boolean;
}
```

### Field Descriptions

- **id**: Unique product identifier (generated by backend)
- **companyId**: Associated company (multi-tenancy)
- **sku**: Stock Keeping Unit code (unique identifier)
- **name**: Product name (display name)
- **description**: Detailed description
- **category**: Product category for classification
- **type**: Product type (physical, service, labor)
- **price**: Sale price (selling price)
- **cost**: Cost price (purchase/production cost)
- **taxRate**: Tax percentage (0-100)
- **unit**: Unit of measure (piece, kg, hour, etc.)
- **image**: Optional image URL
- **isActive**: Active status (true/false)
- **trackInventory**: Enable inventory tracking (true/false)
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

---

## Important Notes

### 1. Angular 20 Standalone Architecture

- **NO NgModules**: All components have `standalone: true`
- **Component Imports**: Each component declares its own dependencies in `imports` array
- **Dependency Injection**: Use `inject()` function (preferred over constructor injection)
- **Lazy Loading**: Routes use `loadComponent` and `loadChildren`

### 2. RxJS State Management (NO Signals)

- **Store Pattern**: Extend `StoreBase<T>` for all feature stores
- **Selectors**: Use `this.select()` to create observable selectors
- **State Updates**: Always use `patchState()` to update state
- **Current State**: Access via `this.currentState` property
- **Subscriptions**: Use `async` pipe in templates (avoid manual subscriptions)
- **NO Angular Signals**: Project uses RxJS exclusively for state management

### 3. Form Validation Pattern

- **Submit-Only Validation**: Errors shown only after submit or field touch
- **Mark All Touched**: On submit, mark all fields as touched to show errors
- **Field Error Helper**: `getFieldError()` method provides user-friendly messages
- **Field Label Helper**: `getFieldLabel()` provides human-readable field names
- **Reactive Forms**: Use FormBuilder with typed FormGroup
- **Required Validation**: Mark fields with `[required]="true"` prop on form components

### 4. Tailwind CSS Styling

- **Responsive Design**: Mobile-first approach with `md:` breakpoints
- **Desktop Table**: Hidden on mobile (`hidden md:block`)
- **Mobile Cards**: Hidden on desktop (`md:hidden`)
- **Dark Mode**: Uses `dark:` variants for theme support
- **Utility Classes**: Leverage Tailwind utility classes for all styling
- **Shared Components**: Use existing UI components (Card, Button, Badge, Alert, EmptyState)

### 5. Navigation and Routing

- **Navigate After Save**: Use loading$ subscription to detect completion
- **Route Back**: Navigate to `/products` after successful save or cancel
- **Edit Mode Detection**: Check `route.params['id']` to determine edit mode
- **Product ID Storage**: Store productId in component property for update operations

### 6. Badge Color Conventions

**Category Badges** (based on `type` field):
- `product` → `info` variant (blue)
- `service` → `success` variant (green)
- `labor` → `warning` variant (purple/yellow)

**Status Badges** (based on `isActive` field):
- `true` → `success` variant (green)
- `false` → `warning` variant (yellow)

**Type Badges** (same as category):
- `product` → `info` variant (blue)
- `service` → `success` variant (green)
- `labor` → `warning` variant (purple/yellow)

### 7. MockApiService Integration

**API Methods Required** (ensure these exist in MockApiService):
- `getProducts(): Observable<Product[]>`
- `createProduct(product: CreateProductDto): Observable<Product>`
- `updateProduct(product: UpdateProductDto): Observable<Product>`
- `deleteProduct(id: string): Observable<void>`

**Pattern**:
- All methods return Observables
- 300ms delay simulation
- localStorage persistence
- Automatic ID generation for new products
- Timestamp management (createdAt, updatedAt)

### 8. Error Handling

- **Store-Level**: Use `catchError` in store methods
- **Component-Level**: Display errors via `error$` observable
- **Dismissible**: Allow users to dismiss errors via `dismissError()`
- **User-Friendly Messages**: Provide clear, actionable error messages

### 9. Search Functionality

**Search Fields**:
- Product name
- SKU code
- Description
- Category

**Implementation**:
- Case-insensitive search
- Real-time filtering via RxJS `map` operator
- `filteredProducts$` observable combines search term with products$

### 10. Component Reusability

**Shared Components Used**:
- `Card` - Container with loading state
- `Button` - Primary, secondary variants with loading state
- `Badge` - Color-coded labels (success, info, warning, error)
- `Alert` - Error messages with dismissible option
- `EmptyState` - No data state with action button
- `SearchBar` - Search input with change event
- `FormInput` - Text/number input with validation
- `FormSelect` - Dropdown with options
- `FormTextarea` - Multi-line text input
- `FormCheckbox` - Boolean toggle

**Pipes Used**:
- `appDateFormat` - Date formatting
- `appCurrency` - Currency formatting (for price/cost)
- `uppercase` - Text transformation

### 11. Type Safety

- **Strict TypeScript**: All types defined via interfaces
- **Form Types**: Use FormGroup and FormBuilder for type safety
- **Component Properties**: Explicitly type all component properties
- **Observable Types**: Type observables with proper generic parameters
- **Avoid `any`**: Use proper types, only use `any` when interfacing with loosely-typed APIs

### 12. Testing Considerations

**Unit Tests** (future implementation):
- ProductsStore: Test all CRUD methods, selectors, error handling
- ProductListComponent: Test search, navigation, badge variants
- ProductCreateComponent: Test form validation, edit mode detection, submission

**Integration Tests**:
- End-to-end product creation flow
- Edit existing product flow
- Delete with confirmation flow
- Search and filter functionality

### 13. Accessibility

- **Form Labels**: All inputs have associated labels
- **Required Indicators**: Visual and semantic required field marking
- **Error Messages**: ARIA-compatible error message display
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Focus Management**: Proper focus states on buttons and inputs

### 14. Performance Optimization

- **Lazy Loading**: All routes lazy-loaded with loadComponent/loadChildren
- **Change Detection**: OnPush strategy (if implemented in base components)
- **Async Pipe**: Automatic subscription management, no manual unsubscribe needed
- **Filtered Observables**: Efficient filtering via RxJS operators
- **Code Splitting**: Feature modules loaded on demand

### 15. Documentation

**Code Comments**:
- JSDoc comments for public methods
- Interface property descriptions
- Complex logic explanations

**README Updates** (if applicable):
- Add Products feature to feature list
- Document badge color conventions
- Update routing documentation

---

## Implementation Checklist

### Pre-Implementation

- [ ] Verify MockApiService has product CRUD methods
- [ ] Confirm Product model interface exists
- [ ] Verify all shared components are available
- [ ] Check authGuard is properly configured
- [ ] Ensure CurrencyFormatPipe exists

### Store Implementation

- [ ] Create `products.store.ts` extending StoreBase
- [ ] Define ProductsState interface
- [ ] Implement all selectors (products$, loading$, error$, selectedProduct$)
- [ ] Implement loadProducts() method
- [ ] Implement createProduct() method
- [ ] Implement updateProduct() method
- [ ] Implement deleteProduct() method
- [ ] Implement selectProduct() method
- [ ] Implement clearError() method
- [ ] Test store with console logging

### List Component Implementation

- [ ] Create product-list directory
- [ ] Create product-list.component.ts with proper imports
- [ ] Implement component class with inject() DI
- [ ] Create filteredProducts$ observable with search logic
- [ ] Implement onSearch(), onCreate(), onEdit(), onDelete() methods
- [ ] Implement badge variant helper methods
- [ ] Create product-list.component.html template
- [ ] Implement desktop table layout
- [ ] Implement mobile card layout
- [ ] Add empty state template
- [ ] Add loading state template
- [ ] Test search functionality
- [ ] Test navigation to create/edit
- [ ] Test delete with confirmation

### Create Component Implementation

- [ ] Create product-create directory
- [ ] Create product-create.component.ts with proper imports
- [ ] Implement component class with inject() DI
- [ ] Define all dropdown options (category, type, unit, status)
- [ ] Implement initializeForm() with validation rules
- [ ] Implement loadProduct() for edit mode
- [ ] Implement onSubmit() with data transformation
- [ ] Implement onCancel() navigation
- [ ] Implement validation helper methods
- [ ] Create product-create.component.html template
- [ ] Implement all form sections (basic, classification, pricing, inventory)
- [ ] Add proper form validation display
- [ ] Test create flow
- [ ] Test edit flow
- [ ] Test validation errors
- [ ] Test cancel navigation

### Routing Implementation

- [ ] Create products.routes.ts file
- [ ] Define list route with authGuard
- [ ] Define create route with authGuard
- [ ] Define edit/:id route with authGuard
- [ ] Update app.routes.ts with products route
- [ ] Test route navigation
- [ ] Test lazy loading
- [ ] Test auth protection

### Final Testing

- [ ] Create new product from scratch
- [ ] Edit existing product
- [ ] Delete product with confirmation
- [ ] Search for products
- [ ] Test mobile responsive layout
- [ ] Verify badge colors
- [ ] Test loading states
- [ ] Test error handling
- [ ] Verify currency formatting
- [ ] Test empty state
- [ ] Verify dark mode compatibility

### Documentation

- [ ] Add inline code comments
- [ ] Document any deviations from pattern
- [ ] Update project README if needed
- [ ] Create usage examples
- [ ] Document known issues or limitations

---

## Success Criteria

The implementation is complete when:

1. All 4 product files are created and properly structured
2. ProductsStore manages state with RxJS (no signals)
3. Product list displays with search and filtering
4. Product create/edit form works with validation
5. Products routes are properly configured and protected
6. App routes include products feature
7. Badge colors follow specification
8. Mobile responsive layout works
9. All CRUD operations function correctly
10. Error handling and loading states work properly

---

## Reference Files

**Study these files for exact patterns**:

1. **Store Pattern**:
   - `src/app/features/companies/services/companies.store.ts`

2. **List Component Pattern**:
   - `src/app/features/companies/company-list/company-list.component.ts`
   - `src/app/features/companies/company-list/company-list.component.html`

3. **Create Component Pattern**:
   - `src/app/features/companies/company-create/company-create.component.ts`
   - `src/app/features/companies/company-create/company-create.component.html`

4. **Routing Pattern**:
   - `src/app/features/companies/companies.routes.ts`
   - `src/app/app.routes.ts`

5. **Data Model**:
   - `src/app/shared/models/product.model.ts`

6. **Shared Components**:
   - `src/app/shared/components/ui/` directory
   - `src/app/shared/components/data/` directory

7. **Pipes**:
   - `src/app/shared/pipes/date-format.pipe.ts`
   - `src/app/shared/pipes/currency-format.pipe.ts`

---

## End of Implementation Plan

This document provides complete specifications for implementing Phase 7: Products Management. Follow the patterns exactly as demonstrated in Phase 5 (Company Management) for consistency and maintainability.

**DO NOT implement yet** - this is the planning document. Review, approve, and then proceed with implementation following this blueprint.
