# Implementation Templates for Phases 6-10

## Overview

Phase 5 (Company Management) is **COMPLETE** and serves as the reference implementation for all remaining phases. Use it as a template!

**Reference Files:**
- Store: `src/app/features/companies/services/companies.store.ts`
- List Component: `src/app/features/companies/company-list/`
- Create/Edit Component: `src/app/features/companies/company-create/`
- Routes: `src/app/features/companies/companies.routes.ts`

---

## Phase 6: User Management

### Files to Create

1. **UsersStore** (`src/app/features/users/services/users.store.ts`)
```typescript
// Copy companies.store.ts pattern
// Replace Company with User
// State: { users: User[], loading: boolean, error: string | null, selectedUser: User | null }
// Methods: loadUsers(), createUser(), updateUser(), deleteUser(), selectUser()
```

2. **UserList Component** (`src/app/features/users/user-list/`)
- Copy `company-list` folder
- Update to display: Name, Email, Role, Company, Status, Created Date
- Add role badge with colors (admin=success, manager=info, user=warning)

3. **UserCreate Component** (`src/app/features/users/user-create/`)
- Copy `company-create` folder
- Form fields: firstName, lastName, email, phone, role, companyId, status
- Use FormSelect for role and company dropdowns

4. **Routes** (`src/app/features/users/users.routes.ts`)
```typescript
export const USERS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent), canActivate: [authGuard] },
  { path: 'create', loadComponent: () => import('./user-create/user-create.component').then(m => m.UserCreateComponent), canActivate: [authGuard] },
  { path: 'edit/:id', loadComponent: () => import('./user-create/user-create.component').then(m => m.UserCreateComponent), canActivate: [authGuard] }
];
```

5. **Add to app.routes.ts**
```typescript
{ path: 'users', loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES) }
```

---

## Phase 7: Products

### Files to Create

1. **ProductsStore** (`src/app/features/products/services/products.store.ts`)
- State: `{ products: Product[], loading: boolean, error: string | null }`
- Methods: loadProducts(), createProduct(), updateProduct(), deleteProduct()

2. **ProductList Component** (`src/app/features/products/product-list/`)
- Display: Name, SKU, Category, Price, Cost, Stock, Status
- Category badge colors (product=blue, service=green, labor=purple)

3. **ProductCreate Component** (`src/app/features/products/product-create/`)
- Fields: name, description, sku, category, type, price, cost, taxable, status
- Use FormSelect for category (product/service/labor) and type (goods/digital/labor)

4. **Routes** (`src/app/features/products/products.routes.ts`)
```typescript
export const PRODUCTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./product-list/product-list.component').then(m => m.ProductListComponent), canActivate: [authGuard] },
  { path: 'create', loadComponent: () => import('./product-create/product-create.component').then(m => m.ProductCreateComponent), canActivate: [authGuard] },
  { path: 'edit/:id', loadComponent: () => import('./product-create/product-create.component').then(m => m.ProductCreateComponent), canActivate: [authGuard] }
];
```

---

## Phase 8: Sales

### Files to Create

1. **SalesStore** (`src/app/features/sales/services/sales.store.ts`)
- State: `{ sales: Sale[], loading: boolean, error: string | null }`
- Methods: loadSales(), createSale(), updateSale(), deleteSale()

2. **SaleList Component** (`src/app/features/sales/sale-list/`)
- Display: Invoice #, Customer, Date, Total, Payment Status, Actions
- Status badges (paid=success, pending=warning, draft=info, cancelled=error)

3. **SaleCreate Component** (`src/app/features/sales/sale-create/`)
- Fields: customerName, customerEmail, saleDate, dueDate, status, notes
- **Line Items Section**: Dynamic FormArray for adding multiple products
  - Each line: product (dropdown), quantity, price, tax, total
  - Calculate totals automatically
- Use FormArray for dynamic line items

4. **Routes** (`src/app/features/sales/sales.routes.ts`)

---

## Phase 9: Purchases

### Files to Create

1. **PurchasesStore** (`src/app/features/purchases/services/purchases.store.ts`)
- Similar to SalesStore

2. **PurchaseList Component** (`src/app/features/purchases/purchase-list/`)
- Display: PO #, Vendor, Date, Total, Status, Actions

3. **PurchaseCreate Component** (`src/app/features/purchases/purchase-create/`)
- Fields: vendorName, vendorEmail, orderDate, expectedDate, status, notes
- Line items with FormArray (same pattern as Sales)

4. **Routes** (`src/app/features/purchases/purchases.routes.ts`)

---

## Phase 10: Inventory

### Files to Create

1. **InventoryStore** (`src/app/features/inventory/services/inventory.store.ts`)
- State: `{ items: InventoryItem[], movements: InventoryMovement[], loading: boolean }`
- Methods: loadInventory(), loadMovements(), createMovement()

2. **InventoryList Component** (`src/app/features/inventory/inventory-list/`)
- Display: Product, SKU, Quantity, Min/Max, Location, Last Restocked
- Alert badges for low stock (quantity < minQuantity)

3. **InventoryDetail Component** (`src/app/features/inventory/inventory-detail/`)
- Show movements history
- Add movement form (in/out/adjustment)

4. **Routes** (`src/app/features/inventory/inventory.routes.ts`)

---

## Common Patterns to Follow

### 1. Store Pattern
```typescript
import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';

interface MyState {
  items: MyModel[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class MyStore extends StoreBase<MyState> {
  private readonly mockApi = inject(MockApiService);

  readonly items$ = this.select(state => state.items);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

  constructor() {
    super({ items: [], loading: false, error: null });
  }

  loadItems(): void {
    this.patchState({ loading: true, error: null });
    this.mockApi.getItems().pipe(
      tap(items => this.patchState({ items, loading: false })),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        return of([]);
      })
    ).subscribe();
  }
}
```

### 2. List Component Pattern
- Inject store with `inject()`
- Expose observables: `items$`, `loading$`, `error$`
- Use `async` pipe in template
- Implement search with filteredItems$ observable
- Use Card component as wrapper
- Use DataTable or custom table
- Mobile-first responsive design

### 3. Create/Edit Component Pattern
- Single component for both modes
- Detect mode via route param `id`
- Use ReactiveFormsModule with FormBuilder
- Validation on submit only
- Use form components: FormInput, FormSelect, etc.
- Navigate back on success

### 4. Import Pattern (CRITICAL!)
```typescript
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
```

### 5. Template Patterns

**Loading with null coalescing:**
```html
<app-card [loading]="(loading$ | async) || false">
```

**Error alert:**
```html
@if (error$ | async; as error) {
  <app-alert type="error" [dismissible]="true" (dismissed)="dismissError()">
    {{ error }}
  </app-alert>
}
```

**Search bar:**
```html
<app-search-bar
  placeholder="Search..."
  (searchChange)="onSearch($event)"
></app-search-bar>
```

**Date formatting:**
```html
{{ item.createdAt | appDateFormat }}
```

**Badge variants:**
```html
<app-badge [variant]="getStatusBadgeVariant(item.status)">
  {{ item.status | uppercase }}
</app-badge>
```

### 6. Routing Pattern
```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const MY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./my-list/my-list.component').then(m => m.MyListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./my-create/my-create.component').then(m => m.MyCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./my-create/my-create.component').then(m => m.MyCreateComponent),
    canActivate: [authGuard]
  }
];
```

---

## MockAPI Methods Available

All these methods are already implemented in `MockApiService`:

### Users
- `getUsers(companyId?: string): Observable<User[]>`
- `getUser(id: string): Observable<User>`
- `createUser(dto: CreateUserDto): Observable<User>`
- `updateUser(dto: UpdateUserDto): Observable<User>`
- `deleteUser(id: string): Observable<void>`

### Products
- `getProducts(companyId?: string): Observable<Product[]>`
- `getProduct(id: string): Observable<Product>`
- `createProduct(dto: CreateProductDto): Observable<Product>`
- `updateProduct(dto: UpdateProductDto): Observable<Product>`
- `deleteProduct(id: string): Observable<void>`

### Sales
- `getSales(companyId?: string): Observable<Sale[]>`
- `getSale(id: string): Observable<Sale>`
- `createSale(dto: CreateSaleDto): Observable<Sale>`
- `updateSale(dto: UpdateSaleDto): Observable<Sale>`
- `deleteSale(id: string): Observable<void>`

### Purchases
- `getPurchases(companyId?: string): Observable<Purchase[]>`
- `getPurchase(id: string): Observable<Purchase>`
- `createPurchase(dto: CreatePurchaseDto): Observable<Purchase>`
- `updatePurchase(dto: UpdatePurchaseDto): Observable<Purchase>`
- `deletePurchase(id: string): Observable<void>`

### Inventory
- `getInventory(companyId?: string): Observable<InventoryItem[]>`
- `getInventoryItem(id: string): Observable<InventoryItem>`
- `createInventoryItem(dto: CreateInventoryItemDto): Observable<InventoryItem>`
- `updateInventoryItem(dto: UpdateInventoryItemDto): Observable<InventoryItem>`
- `getInventoryMovements(itemId?: string): Observable<InventoryMovement[]>`
- `createInventoryMovement(dto: CreateInventoryMovementDto): Observable<InventoryMovement>`

---

## Quick Start Checklist for Each Phase

1. [ ] Create feature folder under `src/app/features/`
2. [ ] Create `services/` subfolder with store
3. [ ] Create list component folder
4. [ ] Create create/edit component folder
5. [ ] Create routes file
6. [ ] Add route to `app.routes.ts`
7. [ ] Test build: `npm run build`
8. [ ] Test in browser: `npm start`

---

## Estimated Time per Phase

- **Phase 6 (Users)**: 2-3 hours
- **Phase 7 (Products)**: 2-3 hours
- **Phase 8 (Sales)**: 4-5 hours (complex with line items)
- **Phase 9 (Purchases)**: 3-4 hours (similar to Sales)
- **Phase 10 (Inventory)**: 3-4 hours

**Total**: 14-19 hours for Phases 6-10

---

## Tips for Success

1. **Copy, Don't Type**: Start by copying Phase 5 files and modifying them
2. **Follow Naming**: Keep consistent naming (PascalCase for classes, kebab-case for files)
3. **Test Incrementally**: Build after each phase to catch errors early
4. **Use Phase 5 as Reference**: When in doubt, check how Phase 5 does it
5. **Don't Skip Types**: Use proper TypeScript types from models
6. **Mobile-First**: Test responsive design as you go

---

## Next Steps

1. Implement Phase 6 (Users) using Company Management as template
2. Build and test
3. Commit
4. Repeat for Phases 7-10

Good luck! 🚀
