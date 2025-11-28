# Phase 10: Inventory Management - Implementation Plan

## Overview
This document provides a detailed implementation plan for Phase 10: Inventory Management following Angular 20 Clean Architecture patterns. The implementation mirrors the Company Management structure (Phase 5) with RxJS-based state management and standalone components.

## Architecture Pattern Reference
**Reference Implementation**: Phase 5 - Company Management
- Store: `src/app/features/companies/services/companies.store.ts`
- List Component: `src/app/features/companies/company-list/`
- Create Component: `src/app/features/companies/company-create/`

## Files to Create

### 1. Inventory Store
**File**: `src/app/features/inventory/services/inventory.store.ts`

#### Purpose
Manage inventory items and movements state using RxJS BehaviorSubjects following the StoreBase pattern.

#### State Interface
```typescript
interface InventoryState {
  items: InventoryItem[];
  movements: InventoryMovement[];
  loading: boolean;
  error: string | null;
  selectedItem: InventoryItem | null;
}
```

#### Key Implementation Details

**Imports Required**:
```typescript
import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { InventoryItem, InventoryMovement, InventoryAlert, CreateInventoryMovementDto } from '../../../shared/models/inventory.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
```

**Selectors to Create**:
```typescript
readonly items$ = this.select(state => state.items);
readonly movements$ = this.select(state => state.movements);
readonly loading$ = this.select(state => state.loading);
readonly error$ = this.select(state => state.error);
readonly selectedItem$ = this.select(state => state.selectedItem);
```

**Methods to Implement**:

1. **loadInventory(companyId?: string): void**
   - Sets loading state to true
   - Calls `mockApi.getInventory(companyId)`
   - Updates items array on success
   - Sets error and loading state on failure
   - Pattern: Same as `loadCompanies()` in CompaniesStore

2. **loadMovements(inventoryItemId: string): void**
   - Sets loading state to true
   - Calls `mockApi.getInventoryMovements(inventoryItemId)`
   - Updates movements array on success
   - Sets error state on failure

3. **adjustStock(adjustment: CreateInventoryMovementDto): void**
   - Sets loading state to true
   - Calls `mockApi.createInventoryMovement(adjustment)`
   - Reloads inventory after successful adjustment
   - Updates error state on failure
   - Pattern: Similar to `createCompany()` but reloads data instead of appending

4. **getAlerts(companyId: string): Observable&lt;InventoryAlert[]&gt;**
   - Returns `mockApi.getInventoryAlerts(companyId)`
   - Used for displaying low stock alerts
   - No state mutation needed (direct API call)

5. **clearError(): void**
   - Resets error state to null
   - Pattern: Same as CompaniesStore

**Initial State**:
```typescript
constructor() {
  super({
    items: [],
    movements: [],
    loading: false,
    error: null,
    selectedItem: null
  });
}
```

**Critical Notes**:
- Use `patchState()` for all state updates (from StoreBase)
- All API calls must use pipe with `tap()` for success and `catchError()` for errors
- Follow the exact pattern from CompaniesStore for consistency
- MockApiService already has all inventory methods implemented (lines 741-896)

---

### 2. Inventory List Component
**Files**:
- `src/app/features/inventory/inventory-list/inventory-list.component.ts`
- `src/app/features/inventory/inventory-list/inventory-list.component.html`

#### TypeScript Component

**Purpose**: Display inventory items with stock status, search filtering, and navigation to detail view.

**Imports Required**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryStore } from '../services/inventory.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { InventoryItem } from '../../../shared/models/inventory.model';
import { map } from 'rxjs/operators';
```

**Component Decorator**:
```typescript
@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    Card,
    Button,
    Badge,
    Alert,
    EmptyState,
    SearchBar,
    DateFormatPipe
  ],
  templateUrl: './inventory-list.component.html'
})
```

**Class Properties**:
```typescript
private readonly store = inject(InventoryStore);
private readonly router = inject(Router);

readonly items$ = this.store.items$;
readonly loading$ = this.store.loading$;
readonly error$ = this.store.error$;

searchTerm = '';
```

**Filtered Items Observable**:
```typescript
readonly filteredItems$ = this.items$.pipe(
  map(items => {
    if (!this.searchTerm) {
      return items;
    }
    const term = this.searchTerm.toLowerCase();
    return items.filter(item =>
      item.productName.toLowerCase().includes(term) ||
      item.productSku.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term)
    );
  })
);
```

**Methods to Implement**:

1. **ngOnInit(): void**
   - Load inventory: `this.store.loadInventory();`
   - Pattern: Same as company-list

2. **onSearch(term: string): void**
   - Update searchTerm: `this.searchTerm = term;`
   - Reactive filtering handled by filteredItems$ observable

3. **onViewDetail(item: InventoryItem): void**
   - Navigate to detail view: `this.router.navigate(['/inventory/detail', item.productId]);`

4. **onAdjustStock(item: InventoryItem): void**
   - Navigate to detail with adjustment flag: `this.router.navigate(['/inventory/detail', item.productId], { queryParams: { adjust: true } });`

5. **dismissError(): void**
   - Clear error: `this.store.clearError();`

6. **getStockStatus(item: InventoryItem): 'low' | 'ok' | 'overstocked'**
   ```typescript
   getStockStatus(item: InventoryItem): 'low' | 'ok' | 'overstocked' {
     if (item.quantity <= item.minThreshold) {
       return 'low';
     } else if (item.quantity >= item.maxThreshold) {
       return 'overstocked';
     }
     return 'ok';
   }
   ```

7. **getStockBadgeVariant(status: string): BadgeVariant**
   ```typescript
   getStockBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
     switch (status) {
       case 'low':
         return 'error';
       case 'overstocked':
         return 'warning';
       default:
         return 'success';
     }
   }
   ```

8. **getStockLabel(status: string): string**
   ```typescript
   getStockLabel(status: string): string {
     const labels: Record<string, string> = {
       low: 'Low Stock',
       ok: 'In Stock',
       overstocked: 'Overstocked'
     };
     return labels[status] || 'Unknown';
   }
   ```

#### HTML Template

**Header Section** (similar to company-list):
```html
<div class="p-6">
  <!-- Header -->
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold text-text">Inventory</h1>
      <p class="mt-1 text-sm text-text-light">Track product stock levels and movements</p>
    </div>
  </div>
```

**Error Alert** (same pattern as company-list):
```html
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
```

**Search Bar** (same pattern):
```html
  <!-- Search Bar -->
  <div class="mb-6">
    <app-search-bar
      placeholder="Search by product name, SKU, or location..."
      (searchChange)="onSearch($event)"
    ></app-search-bar>
  </div>
```

**Table Structure** (desktop view):
```html
  <!-- Inventory Table -->
  <app-card [loading]="(loading$ | async) || false">
    <div *ngIf="(filteredItems$ | async) as items; else loading">
      <div *ngIf="items.length > 0; else empty">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Product
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  SKU
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Location
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Current Stock
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Min Stock
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Max Stock
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
              <tr *ngFor="let item of items" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-text">{{ item.productName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ item.productSku }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ item.location }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-text">{{ item.quantity }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ item.minThreshold }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ item.maxThreshold }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-badge [variant]="getStockBadgeVariant(getStockStatus(item))">
                    {{ getStockLabel(getStockStatus(item)) }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    (click)="onViewDetail(item)"
                    class="text-primary hover:text-primary-700 mr-4"
                  >
                    View Details
                  </button>
                  <button
                    (click)="onAdjustStock(item)"
                    class="text-accent-blue hover:text-blue-700"
                  >
                    Adjust Stock
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
```

**Mobile Cards View** (similar to company-list pattern):
```html
        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4">
          <div
            *ngFor="let item of items"
            class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="font-medium text-text">{{ item.productName }}</h3>
                <p class="text-sm text-text-light mt-1">{{ item.productSku }}</p>
              </div>
              <app-badge [variant]="getStockBadgeVariant(getStockStatus(item))">
                {{ getStockLabel(getStockStatus(item)) }}
              </app-badge>
            </div>

            <div class="space-y-2 mb-3">
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Location:</span>
                <span class="text-text">{{ item.location }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Current Stock:</span>
                <span class="text-text font-semibold">{{ item.quantity }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Min / Max:</span>
                <span class="text-text">{{ item.minThreshold }} / {{ item.maxThreshold }}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                (click)="onViewDetail(item)"
                class="flex-1 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 dark:hover:bg-gray-800 rounded-md"
              >
                View Details
              </button>
              <button
                (click)="onAdjustStock(item)"
                class="flex-1 px-4 py-2 text-sm font-medium text-accent-blue hover:bg-blue-50 dark:hover:bg-gray-800 rounded-md"
              >
                Adjust Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
```

**Empty State and Loading Templates**:
```html
    <ng-template #empty>
      <app-empty-state
        title="No inventory items found"
        description="Start tracking inventory by adding products"
        [actionLabel]="'View Products'"
        (action)="router.navigate(['/products'])"
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

**Critical Notes for List Component**:
- Use `async` pipe for all observables (no manual subscriptions)
- Stock status calculation should be in component method, not template
- Badge variants: `error` (red) for low stock, `success` (green) for OK, `warning` (yellow) for overstocked
- Use responsive design with desktop table and mobile cards (same pattern as company-list)
- SearchBar filters by product name, SKU, or location
- Navigation to detail view uses productId, not inventory item id

---

### 3. Inventory Detail Component
**Files**:
- `src/app/features/inventory/inventory-detail/inventory-detail.component.ts`
- `src/app/features/inventory/inventory-detail/inventory-detail.component.html`

#### TypeScript Component

**Purpose**: Display detailed inventory information, movement history, and provide stock adjustment functionality.

**Imports Required**:
```typescript
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { InventoryStore } from '../services/inventory.store';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { AuthService } from '../../../core/services/auth.service';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { InventoryItem, InventoryMovement, CreateInventoryMovementDto, MovementType } from '../../../shared/models/inventory.model';
```

**Component Decorator**:
```typescript
@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    Button,
    Badge,
    Alert,
    FormInput,
    FormSelect,
    DateFormatPipe
  ],
  templateUrl: './inventory-detail.component.html'
})
```

**Class Properties**:
```typescript
private readonly fb = inject(FormBuilder);
private readonly router = inject(Router);
private readonly route = inject(ActivatedRoute);
private readonly store = inject(InventoryStore);
private readonly companyContext = inject(CompanyContextService);
private readonly authService = inject(AuthService);

private destroy$ = new Subject<void>();

readonly items$ = this.store.items$;
readonly movements$ = this.store.movements$;
readonly loading$ = this.store.loading$;
readonly error$ = this.store.error$;

productId: string | null = null;
currentItem: InventoryItem | null = null;
adjustmentForm!: FormGroup;
showAdjustmentForm = false;

readonly movementTypeOptions = [
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
  { value: 'adjustment', label: 'Adjustment' }
];
```

**Lifecycle Methods**:

1. **ngOnInit(): void**
   ```typescript
   ngOnInit(): void {
     this.initializeForm();

     // Get productId from route params
     this.route.params.pipe(
       takeUntil(this.destroy$)
     ).subscribe(params => {
       if (params['productId']) {
         this.productId = params['productId'];
         this.loadInventoryData();
       }
     });

     // Check if adjustment form should be shown
     this.route.queryParams.pipe(
       takeUntil(this.destroy$)
     ).subscribe(params => {
       if (params['adjust'] === 'true') {
         this.showAdjustmentForm = true;
       }
     });

     // Subscribe to items to get current item
     this.items$.pipe(
       takeUntil(this.destroy$),
       filter(items => items.length > 0)
     ).subscribe(items => {
       this.currentItem = items.find(i => i.productId === this.productId) || null;
       if (this.currentItem) {
         this.store.loadMovements(this.currentItem.id);
       }
     });
   }
   ```

2. **ngOnDestroy(): void**
   ```typescript
   ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
   }
   ```

**Methods to Implement**:

1. **initializeForm(): void**
   ```typescript
   private initializeForm(): void {
     this.adjustmentForm = this.fb.group({
       type: ['in', Validators.required],
       quantity: [0, [Validators.required, Validators.min(1)]],
       reason: ['', Validators.required],
       notes: ['']
     });
   }
   ```

2. **loadInventoryData(): void**
   ```typescript
   private loadInventoryData(): void {
     this.store.loadInventory();
   }
   ```

3. **onToggleAdjustmentForm(): void**
   ```typescript
   onToggleAdjustmentForm(): void {
     this.showAdjustmentForm = !this.showAdjustmentForm;
     if (!this.showAdjustmentForm) {
       this.adjustmentForm.reset({ type: 'in', quantity: 0 });
     }
   }
   ```

4. **onSubmitAdjustment(): void**
   ```typescript
   onSubmitAdjustment(): void {
     if (this.adjustmentForm.invalid || !this.currentItem) {
       Object.keys(this.adjustmentForm.controls).forEach(key => {
         this.adjustmentForm.get(key)?.markAsTouched();
       });
       return;
     }

     const companyId = this.companyContext.getCurrentCompanyId();
     const userId = this.authService.getCurrentUserId();

     if (!companyId || !userId) {
       console.error('Company ID or User ID not found');
       return;
     }

     const formValue = this.adjustmentForm.value;
     const adjustment: CreateInventoryMovementDto = {
       companyId,
       inventoryItemId: this.currentItem.id,
       productId: this.currentItem.productId,
       type: formValue.type as MovementType,
       quantity: formValue.quantity,
       reason: formValue.reason,
       location: this.currentItem.location,
       performedBy: userId,
       notes: formValue.notes || undefined
     };

     this.store.adjustStock(adjustment);

     // Reset form and hide on success
     this.loading$.pipe(
       takeUntil(this.destroy$)
     ).subscribe(loading => {
       if (!loading && this.adjustmentForm.value.quantity > 0) {
         this.adjustmentForm.reset({ type: 'in', quantity: 0 });
         this.showAdjustmentForm = false;
       }
     });
   }
   ```

5. **onCancel(): void**
   ```typescript
   onCancel(): void {
     this.router.navigate(['/inventory']);
   }
   ```

6. **dismissError(): void**
   ```typescript
   dismissError(): void {
     this.store.clearError();
   }
   ```

7. **getMovementTypeBadgeVariant(type: MovementType): BadgeVariant**
   ```typescript
   getMovementTypeBadgeVariant(type: MovementType): 'success' | 'warning' | 'error' | 'info' {
     switch (type) {
       case 'in':
         return 'success';
       case 'out':
         return 'error';
       case 'adjustment':
         return 'info';
       default:
         return 'info';
     }
   }
   ```

8. **getMovementTypeLabel(type: MovementType): string**
   ```typescript
   getMovementTypeLabel(type: MovementType): string {
     const labels: Record<MovementType, string> = {
       in: 'Stock In',
       out: 'Stock Out',
       adjustment: 'Adjustment'
     };
     return labels[type];
   }
   ```

9. **getStockStatus(item: InventoryItem): 'low' | 'ok' | 'overstocked'**
   ```typescript
   getStockStatus(item: InventoryItem): 'low' | 'ok' | 'overstocked' {
     if (item.quantity <= item.minThreshold) {
       return 'low';
     } else if (item.quantity >= item.maxThreshold) {
       return 'overstocked';
     }
     return 'ok';
   }
   ```

10. **getStockBadgeVariant(status: string): BadgeVariant**
    ```typescript
    getStockBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
      switch (status) {
        case 'low':
          return 'error';
        case 'overstocked':
          return 'warning';
        default:
          return 'success';
      }
    }
    ```

11. **isFieldInvalid(fieldName: string): boolean**
    ```typescript
    isFieldInvalid(fieldName: string): boolean {
      const field = this.adjustmentForm.get(fieldName);
      return !!(field && field.invalid && field.touched);
    }
    ```

12. **getFieldError(fieldName: string): string**
    ```typescript
    getFieldError(fieldName: string): string {
      const field = this.adjustmentForm.get(fieldName);
      if (!field || !field.errors || !field.touched) {
        return '';
      }

      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `Quantity must be at least ${field.errors['min'].min}`;
      }

      return 'Invalid value';
    }
    ```

13. **getFieldLabel(fieldName: string): string**
    ```typescript
    private getFieldLabel(fieldName: string): string {
      const labels: { [key: string]: string } = {
        type: 'Movement type',
        quantity: 'Quantity',
        reason: 'Reason',
        notes: 'Notes'
      };
      return labels[fieldName] || fieldName;
    }
    ```

#### HTML Template

**Header and Product Info**:
```html
<div class="p-6 max-w-6xl mx-auto">
  <!-- Header -->
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-text">Inventory Details</h1>
      <p class="mt-1 text-sm text-text-light">View stock levels and movement history</p>
    </div>
    <app-button variant="secondary" (click)="onCancel()">
      Back to Inventory
    </app-button>
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

  <!-- Current Stock Information -->
  <app-card *ngIf="currentItem" class="mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Product Info -->
      <div>
        <h3 class="text-sm font-medium text-text-light mb-2">Product Information</h3>
        <p class="text-lg font-semibold text-text">{{ currentItem.productName }}</p>
        <p class="text-sm text-text-light mt-1">SKU: {{ currentItem.productSku }}</p>
        <p class="text-sm text-text-light mt-1">Location: {{ currentItem.location }}</p>
      </div>

      <!-- Stock Levels -->
      <div>
        <h3 class="text-sm font-medium text-text-light mb-2">Stock Levels</h3>
        <div class="flex items-center gap-3">
          <div>
            <p class="text-3xl font-bold text-text">{{ currentItem.quantity }}</p>
            <p class="text-sm text-text-light mt-1">Current Stock</p>
          </div>
          <app-badge [variant]="getStockBadgeVariant(getStockStatus(currentItem))">
            {{ getStockStatus(currentItem) | uppercase }}
          </app-badge>
        </div>
        <div class="mt-3 text-sm text-text-light">
          <p>Min: {{ currentItem.minThreshold }} | Max: {{ currentItem.maxThreshold }}</p>
        </div>
      </div>

      <!-- Last Restocked -->
      <div>
        <h3 class="text-sm font-medium text-text-light mb-2">Last Activity</h3>
        <p class="text-sm text-text">
          <span *ngIf="currentItem.lastRestocked">
            {{ currentItem.lastRestocked | appDateFormat }}
          </span>
          <span *ngIf="!currentItem.lastRestocked" class="text-text-light">
            No recent activity
          </span>
        </p>
        <div class="mt-4">
          <app-button
            variant="primary"
            size="sm"
            (click)="onToggleAdjustmentForm()"
          >
            {{ showAdjustmentForm ? 'Cancel Adjustment' : 'Adjust Stock' }}
          </app-button>
        </div>
      </div>
    </div>
  </app-card>
```

**Adjustment Form**:
```html
  <!-- Stock Adjustment Form -->
  <app-card *ngIf="showAdjustmentForm && currentItem" class="mb-6">
    <h3 class="text-lg font-medium text-text mb-4">Adjust Stock</h3>
    <form [formGroup]="adjustmentForm" (ngSubmit)="onSubmitAdjustment()">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <app-form-select
          formControlName="type"
          label="Movement Type"
          [options]="movementTypeOptions"
          [required]="true"
          [errorMessage]="getFieldError('type')"
        ></app-form-select>

        <app-form-input
          formControlName="quantity"
          label="Quantity"
          type="number"
          placeholder="Enter quantity"
          [required]="true"
          [errorMessage]="getFieldError('quantity')"
        ></app-form-input>

        <div class="md:col-span-2">
          <app-form-input
            formControlName="reason"
            label="Reason"
            placeholder="Enter reason for adjustment"
            [required]="true"
            [errorMessage]="getFieldError('reason')"
          ></app-form-input>
        </div>

        <div class="md:col-span-2">
          <app-form-input
            formControlName="notes"
            label="Notes"
            placeholder="Additional notes (optional)"
            [errorMessage]="getFieldError('notes')"
          ></app-form-input>
        </div>
      </div>

      <div class="flex gap-4 mt-6">
        <app-button
          type="submit"
          variant="primary"
          [loading]="(loading$ | async) || false"
          [disabled]="(loading$ | async) || false"
        >
          Submit Adjustment
        </app-button>
        <app-button
          type="button"
          variant="secondary"
          (click)="onToggleAdjustmentForm()"
          [disabled]="(loading$ | async) || false"
        >
          Cancel
        </app-button>
      </div>
    </form>
  </app-card>
```

**Movement History Table**:
```html
  <!-- Movement History -->
  <app-card [loading]="(loading$ | async) || false">
    <h3 class="text-lg font-medium text-text mb-4">Movement History</h3>

    <div *ngIf="(movements$ | async) as movements; else loadingMovements">
      <div *ngIf="movements.length > 0; else noMovements">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Previous
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  New
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Reason
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let movement of movements" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text">{{ movement.createdAt | appDateFormat }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <app-badge [variant]="getMovementTypeBadgeVariant(movement.type)">
                    {{ getMovementTypeLabel(movement.type) }}
                  </app-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-text">
                    <span *ngIf="movement.type === 'in'" class="text-accent-green">+{{ movement.quantity }}</span>
                    <span *ngIf="movement.type === 'out'" class="text-accent-red">-{{ movement.quantity }}</span>
                    <span *ngIf="movement.type === 'adjustment'">{{ movement.quantity }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-light">{{ movement.previousQuantity }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-text">{{ movement.newQuantity }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text">{{ movement.reason }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-text-light">{{ movement.notes || '-' }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4">
          <div
            *ngFor="let movement of movements"
            class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm text-text-light">{{ movement.createdAt | appDateFormat }}</p>
                <p class="text-sm font-medium text-text mt-1">{{ movement.reason }}</p>
              </div>
              <app-badge [variant]="getMovementTypeBadgeVariant(movement.type)">
                {{ getMovementTypeLabel(movement.type) }}
              </app-badge>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Quantity Change:</span>
                <span class="font-semibold"
                      [class.text-accent-green]="movement.type === 'in'"
                      [class.text-accent-red]="movement.type === 'out'"
                      [class.text-accent-blue]="movement.type === 'adjustment'">
                  <span *ngIf="movement.type === 'in'">+{{ movement.quantity }}</span>
                  <span *ngIf="movement.type === 'out'">-{{ movement.quantity }}</span>
                  <span *ngIf="movement.type === 'adjustment'">{{ movement.quantity }}</span>
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-light">Stock Level:</span>
                <span class="text-text">{{ movement.previousQuantity }} → {{ movement.newQuantity }}</span>
              </div>
              <div *ngIf="movement.notes" class="text-sm text-text-light pt-2 border-t border-gray-200 dark:border-gray-700">
                <span class="font-medium">Notes:</span> {{ movement.notes }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noMovements>
        <div class="text-center py-8 text-text-light">
          <p>No movement history available</p>
        </div>
      </ng-template>
    </div>

    <ng-template #loadingMovements>
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

**Critical Notes for Detail Component**:
- Use `takeUntil(destroy$)` pattern for all subscriptions
- Movement type badges: `success` (green) for 'in', `error` (red) for 'out', `info` (blue) for 'adjustment'
- Quantity display shows +/- symbols for in/out movements
- Form validation should prevent negative quantities
- Get companyId from CompanyContextService and userId from AuthService
- Adjustment form is toggled, not always visible
- Load movements only after currentItem is found

---

### 4. Inventory Routes
**File**: `src/app/features/inventory/inventory.routes.ts`

#### Purpose
Define lazy-loaded routes for the inventory feature with authentication guard.

#### Implementation
```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory-list/inventory-list.component')
      .then(m => m.InventoryListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'detail/:productId',
    loadComponent: () => import('./inventory-detail/inventory-detail.component')
      .then(m => m.InventoryDetailComponent),
    canActivate: [authGuard]
  }
];
```

**Critical Notes**:
- Both routes protected by `authGuard`
- List component on root path (`''`)
- Detail component uses `:productId` parameter (NOT `:id` or `:inventoryItemId`)
- Uses `loadComponent` for lazy loading (Angular 20 standalone pattern)

---

### 5. Update Main App Routes
**File**: `src/app/app.routes.ts`

#### Changes Required
Add the inventory route to the main routes array before the fallback route:

```typescript
// Add this import at the top
import { authGuard } from './core/guards/auth.guard';

// Add this route after the companies route and before the fallback
{
  path: 'inventory',
  loadChildren: () => import('./features/inventory/inventory.routes')
    .then(m => m.INVENTORY_ROUTES)
},
```

**Complete Updated Routes**:
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

  // Inventory routes (protected) - NEW
  {
    path: 'inventory',
    loadChildren: () => import('./features/inventory/inventory.routes')
      .then(m => m.INVENTORY_ROUTES)
  },

  // Fallback route - redirect to login
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
```

---

## Data Models Reference

### InventoryItem Interface
```typescript
interface InventoryItem {
  id: string;                    // Inventory item ID
  companyId: string;             // Company ID
  productId: string;             // Product ID (used for navigation)
  productName: string;           // Product name
  productSku: string;            // Product SKU
  quantity: number;              // Current stock level
  minThreshold: number;          // Minimum stock threshold
  maxThreshold: number;          // Maximum stock threshold
  location: string;              // Storage location
  lastRestocked?: Date;          // Last restock date
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### InventoryMovement Interface
```typescript
interface InventoryMovement {
  id: string;                    // Movement ID
  companyId: string;             // Company ID
  inventoryItemId: string;       // Inventory item ID
  productId: string;             // Product ID
  productName: string;           // Product name
  productSku: string;            // Product SKU
  type: MovementType;            // 'in' | 'out' | 'adjustment'
  quantity: number;              // Quantity moved
  previousQuantity: number;      // Stock level before
  newQuantity: number;           // Stock level after
  reason: string;                // Movement reason
  referenceId?: string;          // Sale/Purchase ID
  referenceType?: 'sale' | 'purchase' | 'adjustment';
  location: string;              // Storage location
  performedBy: string;           // User ID
  notes?: string;                // Additional notes
  createdAt: Date;               // Movement timestamp
}
```

### CreateInventoryMovementDto Interface
```typescript
interface CreateInventoryMovementDto {
  companyId: string;
  inventoryItemId: string;
  productId: string;
  type: MovementType;            // 'in' | 'out' | 'adjustment'
  quantity: number;
  reason: string;
  referenceId?: string;
  referenceType?: 'sale' | 'purchase' | 'adjustment';
  location: string;
  performedBy: string;
  notes?: string;
}
```

### InventoryAlert Interface
```typescript
interface InventoryAlert {
  id: string;
  companyId: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  productSku: string;
  currentQuantity: number;
  minThreshold: number;
  severity: 'low' | 'critical';
  isRead: boolean;
  createdAt: Date;
}
```

---

## MockApiService Methods Available

The following methods are already implemented in MockApiService (lines 741-896):

1. **getInventory(companyId?: string): Observable&lt;InventoryItem[]&gt;**
   - Returns all inventory items
   - Filters by companyId if provided
   - Includes 300ms delay

2. **getInventoryItem(id: string): Observable&lt;InventoryItem&gt;**
   - Returns single inventory item by ID
   - Throws error if not found

3. **createInventoryItem(dto: CreateInventoryItemDto): Observable&lt;InventoryItem&gt;**
   - Creates new inventory item
   - Validates product exists
   - Returns created item

4. **updateInventoryItem(dto: UpdateInventoryItemDto): Observable&lt;InventoryItem&gt;**
   - Updates existing inventory item
   - Returns updated item

5. **getInventoryMovements(inventoryItemId: string): Observable&lt;InventoryMovement[]&gt;**
   - Returns movement history for an inventory item
   - Filters by inventoryItemId

6. **createInventoryMovement(dto: CreateInventoryMovementDto): Observable&lt;InventoryMovement&gt;**
   - Creates new movement record
   - Automatically updates inventory quantity
   - Handles 'in', 'out', and 'adjustment' types
   - Creates alerts for low stock

7. **getInventoryAlerts(companyId: string): Observable&lt;InventoryAlert[]&gt;**
   - Returns unread alerts for company
   - Used for low stock notifications

8. **markAlertAsRead(alertId: string): Observable&lt;void&gt;**
   - Marks an alert as read

---

## Implementation Checklist

### Phase 1: Create Inventory Store
- [ ] Create directory: `src/app/features/inventory/services/`
- [ ] Create file: `inventory.store.ts`
- [ ] Define InventoryState interface
- [ ] Extend StoreBase with InventoryState
- [ ] Inject MockApiService
- [ ] Create selectors (items$, movements$, loading$, error$, selectedItem$)
- [ ] Implement loadInventory() method
- [ ] Implement loadMovements() method
- [ ] Implement adjustStock() method
- [ ] Implement getAlerts() method
- [ ] Implement clearError() method
- [ ] Add @Injectable decorator with providedIn: 'root'

### Phase 2: Create Inventory List Component
- [ ] Create directory: `src/app/features/inventory/inventory-list/`
- [ ] Create TypeScript file: `inventory-list.component.ts`
- [ ] Create HTML template: `inventory-list.component.html`
- [ ] Import all required components and services
- [ ] Inject InventoryStore and Router
- [ ] Create observable streams (items$, loading$, error$)
- [ ] Implement searchTerm property
- [ ] Implement filteredItems$ with search logic
- [ ] Implement ngOnInit() to load inventory
- [ ] Implement onSearch() method
- [ ] Implement onViewDetail() navigation
- [ ] Implement onAdjustStock() navigation
- [ ] Implement dismissError() method
- [ ] Implement getStockStatus() calculation
- [ ] Implement getStockBadgeVariant() method
- [ ] Implement getStockLabel() method
- [ ] Create HTML template with header
- [ ] Add error alert section
- [ ] Add search bar
- [ ] Create desktop table view with 8 columns
- [ ] Create mobile cards view
- [ ] Add empty state template
- [ ] Add loading skeleton template
- [ ] Test responsive design (desktop and mobile)

### Phase 3: Create Inventory Detail Component
- [ ] Create directory: `src/app/features/inventory/inventory-detail/`
- [ ] Create TypeScript file: `inventory-detail.component.ts`
- [ ] Create HTML template: `inventory-detail.component.html`
- [ ] Import all required components and services
- [ ] Inject all required services (Store, Router, Route, CompanyContext, AuthService)
- [ ] Create destroy$ Subject for cleanup
- [ ] Create observable streams
- [ ] Define properties (productId, currentItem, adjustmentForm, showAdjustmentForm)
- [ ] Define movementTypeOptions
- [ ] Implement ngOnInit() with route params subscription
- [ ] Implement ngOnDestroy() for cleanup
- [ ] Implement initializeForm() with validators
- [ ] Implement loadInventoryData() method
- [ ] Implement onToggleAdjustmentForm() method
- [ ] Implement onSubmitAdjustment() with full logic
- [ ] Implement onCancel() navigation
- [ ] Implement dismissError() method
- [ ] Implement getMovementTypeBadgeVariant() method
- [ ] Implement getMovementTypeLabel() method
- [ ] Implement getStockStatus() calculation
- [ ] Implement getStockBadgeVariant() method
- [ ] Implement isFieldInvalid() validation
- [ ] Implement getFieldError() with messages
- [ ] Implement getFieldLabel() helper
- [ ] Create HTML header section
- [ ] Create current stock information card
- [ ] Create stock adjustment form (conditional)
- [ ] Create movement history table (desktop)
- [ ] Create movement history cards (mobile)
- [ ] Add empty state for no movements
- [ ] Add loading skeleton
- [ ] Test form validation
- [ ] Test movement submission
- [ ] Test navigation between list and detail

### Phase 4: Create Inventory Routes
- [ ] Create file: `src/app/features/inventory/inventory.routes.ts`
- [ ] Import Routes from @angular/router
- [ ] Import authGuard
- [ ] Define INVENTORY_ROUTES constant
- [ ] Add root route ('') with InventoryListComponent
- [ ] Add detail route ('detail/:productId') with InventoryDetailComponent
- [ ] Apply authGuard to both routes
- [ ] Export INVENTORY_ROUTES

### Phase 5: Update Main App Routes
- [ ] Open file: `src/app/app.routes.ts`
- [ ] Add inventory route object before fallback route
- [ ] Use loadChildren with import statement
- [ ] Point to INVENTORY_ROUTES
- [ ] Save file
- [ ] Test route navigation

### Phase 6: Testing and Validation
- [ ] Test inventory list page loads
- [ ] Test search functionality
- [ ] Test stock status badges (low, ok, overstocked)
- [ ] Test navigation to detail view
- [ ] Test detail page displays correct item
- [ ] Test movement history loads
- [ ] Test adjustment form validation
- [ ] Test stock adjustment submission
- [ ] Test error handling and display
- [ ] Test loading states
- [ ] Test responsive design on mobile
- [ ] Test back navigation
- [ ] Verify all observables use async pipe
- [ ] Verify no memory leaks (destroy$ cleanup)
- [ ] Test with multiple companies
- [ ] Verify route protection with authGuard

---

## Critical Angular 20 Best Practices

### 1. State Management
- **Use RxJS Observables**: BehaviorSubject for state, NOT Angular Signals
- **Extend StoreBase**: All feature stores extend `StoreBase<T>`
- **Use async pipe**: Automatic subscription management in templates
- **Avoid manual subscriptions**: Use `takeUntil(destroy$)` if unavoidable
- **Immutable updates**: Always use `patchState()` from StoreBase

### 2. Component Architecture
- **Standalone components**: All components have `standalone: true`
- **Explicit imports**: Declare all dependencies in imports array
- **Use inject()**: Prefer `inject()` over constructor injection
- **Smart/Dumb pattern**: List is smart, detail is smart with forms
- **OnDestroy cleanup**: Unsubscribe with Subject in detail component

### 3. Routing
- **Lazy loading**: Use `loadChildren` for feature routes
- **Functional guards**: Use `authGuard` (CanActivateFn)
- **Route parameters**: Use `:productId` for consistency
- **Query params**: Use for optional flags like `adjust=true`

### 4. Forms
- **Reactive Forms**: Use FormBuilder and FormGroup
- **Validation**: Implement both synchronous and template validation
- **Error messages**: Show contextual error messages
- **Mark as touched**: On submit to trigger validation display

### 5. Styling
- **Tailwind CSS**: Use utility classes throughout
- **Responsive design**: Desktop table, mobile cards pattern
- **Dark mode**: Use dark: variants for all colors
- **Semantic colors**: Use text-text, text-text-light, bg-surface, etc.

### 6. TypeScript
- **Strict mode**: All types must be explicit
- **Interfaces**: Use for all data structures
- **Type guards**: Check for null/undefined before use
- **No any**: Avoid `any` type completely

---

## Common Pitfalls to Avoid

1. **Using Signals for State**: Don't use Angular Signals; use RxJS BehaviorSubject
2. **Missing destroy$**: Always implement OnDestroy and complete Subject
3. **Manual subscriptions**: Use async pipe instead of subscribe() when possible
4. **Wrong route parameter**: Use `productId` not `id` or `inventoryItemId`
5. **Missing imports**: All components must be in imports array
6. **Forgetting authGuard**: All inventory routes need authentication
7. **Not handling errors**: Always implement error states and dismissal
8. **Missing loading states**: Show loading indicator for async operations
9. **Hardcoded IDs**: Get companyId and userId from services, not hardcoded
10. **Badge variant typos**: Use exact strings: 'success', 'error', 'warning', 'info'

---

## Navigation Flow

```
/inventory
  → InventoryListComponent
    → Displays all inventory items with search
    → Click "View Details" → /inventory/detail/:productId
    → Click "Adjust Stock" → /inventory/detail/:productId?adjust=true

/inventory/detail/:productId
  → InventoryDetailComponent
    → Shows current stock info
    → Shows movement history
    → Optional adjustment form (if adjust=true in query params)
    → Submit adjustment → Reloads inventory and movements
    → Click "Back to Inventory" → /inventory
```

---

## API Integration Points

All API methods are available in MockApiService. No backend configuration needed.

**Store → MockApiService Mapping**:
- `loadInventory()` → `mockApi.getInventory(companyId)`
- `loadMovements()` → `mockApi.getInventoryMovements(inventoryItemId)`
- `adjustStock()` → `mockApi.createInventoryMovement(dto)`
- `getAlerts()` → `mockApi.getInventoryAlerts(companyId)`

**MockApiService Features**:
- Simulates 300ms network delay
- Persists data in localStorage
- Auto-creates alerts for low stock
- Automatically updates inventory quantities
- Validates product existence
- Returns typed Observables

---

## Seed Data Available

MockApiService provides seed data with:
- 55+ products across 3 companies
- Inventory items for products with `trackInventory: true`
- Initial stock quantities (random 10-100)
- Default min/max thresholds (10/100)
- Sample sales and purchases
- Movement history from sales/purchases

**Test Scenarios**:
- Low stock items (quantity <= minThreshold)
- Normal stock items
- Overstocked items (quantity >= maxThreshold)
- Items with movement history
- Items without movements

---

## Testing the Implementation

### Manual Testing Steps

1. **Test Inventory List**:
   - Navigate to `/inventory`
   - Verify all inventory items display
   - Test search by product name
   - Test search by SKU
   - Test search by location
   - Verify badge colors (low=red, ok=green, overstocked=yellow)
   - Test responsive layout (resize browser)

2. **Test Navigation**:
   - Click "View Details" on an item
   - Verify detail page loads with correct item
   - Click "Back to Inventory"
   - Verify return to list
   - Click "Adjust Stock"
   - Verify form appears

3. **Test Stock Adjustment**:
   - Fill out adjustment form
   - Test form validation (required fields)
   - Submit valid adjustment
   - Verify stock quantity updates
   - Verify movement appears in history
   - Verify badge color changes if crossing threshold

4. **Test Error Handling**:
   - Clear localStorage
   - Verify empty state appears
   - Add inventory
   - Test error dismissal

5. **Test Loading States**:
   - Slow network simulation (DevTools)
   - Verify loading skeletons appear
   - Verify loading button states

### Unit Testing Considerations

**Store Tests**:
- Test initial state
- Test loadInventory() updates state
- Test loadMovements() updates state
- Test adjustStock() creates movement
- Test error handling

**Component Tests**:
- Test component initialization
- Test search filtering
- Test stock status calculation
- Test badge variant mapping
- Test form validation
- Test navigation methods

---

## Summary

This implementation plan provides a complete blueprint for Phase 10: Inventory Management following Angular 20 best practices and Clean Architecture principles. The implementation mirrors the proven Company Management pattern while adding inventory-specific features like stock status calculation, movement tracking, and adjustment forms.

**Key Files to Create**:
1. `src/app/features/inventory/services/inventory.store.ts` (State management)
2. `src/app/features/inventory/inventory-list/inventory-list.component.ts` (List view)
3. `src/app/features/inventory/inventory-list/inventory-list.component.html` (List template)
4. `src/app/features/inventory/inventory-detail/inventory-detail.component.ts` (Detail/Adjustment view)
5. `src/app/features/inventory/inventory-detail/inventory-detail.component.html` (Detail template)
6. `src/app/features/inventory/inventory.routes.ts` (Feature routes)

**Key File to Update**:
1. `src/app/app.routes.ts` (Add inventory route)

**Dependencies**:
- All required shared components exist
- All required models exist
- All required services exist
- MockApiService has all inventory methods implemented
- Seed data is available

**Estimated Implementation Time**: 4-6 hours for experienced Angular developer

This plan can be handed to any Angular developer familiar with the project structure, and they should be able to implement Phase 10 successfully without additional guidance.
