# Phases 6-10 Implementation Plan

## Overview
This document outlines the systematic implementation of the remaining 5 phases of the Umbrella Frontend MVP.

## Implementation Status

### Completed Phases (1-5)
- ✅ Phase 1: Foundation & Project Setup
- ✅ Phase 2: Shared Components & Services
- ✅ Phase 3: Authentication
- ✅ Phase 4: Dashboard
- ✅ Phase 5: Companies Management

### To Be Implemented (6-10)

#### Phase 6: User Management
**Complexity**: SIMPLE (follows Companies pattern)
**Files to Create**: 6
```
src/app/features/users/
├── services/users.store.ts
├── user-list/
│   ├── user-list.component.ts
│   └── user-list.component.html
├── user-create/
│   ├── user-create.component.ts
│   └── user-create.component.html
└── users.routes.ts
```
**Key Features**:
- RxJS state management with UsersStore
- List view with search (name, email, phone)
- Create/Edit form with company dropdown
- Role assignment (admin, manager, user)
- Status badges for active/inactive

**Dependencies**:
- CompaniesStore (for company dropdown)
- MockApiService.getUsers/createUser/updateUser/deleteUser

---

#### Phase 7: Products Management
**Complexity**: SIMPLE (follows Companies pattern)
**Files to Create**: 6
```
src/app/features/products/
├── services/products.store.ts
├── product-list/
│   ├── product-list.component.ts
│   └── product-list.component.html
├── product-create/
│   ├── product-create.component.ts
│   └── product-create.component.html
└── products.routes.ts
```
**Key Features**:
- Product catalog management
- Category and type classification
- Price and cost tracking
- Tax rate configuration
- Inventory tracking toggle
- Stock status display

**Dependencies**:
- MockApiService.getProducts/createProduct/updateProduct/deleteProduct
- CurrencyFormatPipe

---

#### Phase 8: Sales Management
**Complexity**: HIGH (FormArray for line items)
**Files to Create**: 6
```
src/app/features/sales/
├── services/sales.store.ts
├── sale-list/
│   ├── sale-list.component.ts
│   └── sale-list.component.html
├── sale-create/
│   ├── sale-create.component.ts (COMPLEX - FormArray)
│   └── sale-create.component.html
└── sales.routes.ts
```
**Key Features**:
- Dynamic line items with FormArray
- Auto-calculation of totals (quantity × price - discount + tax)
- Product selection with auto-fill price/tax
- Invoice number generation
- Status workflow (draft → pending → paid → cancelled)
- Payment tracking

**Dependencies**:
- ProductsStore (for product dropdown in line items)
- MockApiService.getSales/createSale/updateSale/deleteSale
- Understanding of FormArray pattern (see FORMARRAY-PATTERN-GUIDE.md)

**Critical Implementation Notes**:
```typescript
// FormArray structure
items: FormArray [
  FormGroup {
    productId: FormControl,
    quantity: FormControl,
    price: FormControl,
    taxRate: FormControl,
    discount: FormControl,
    total: FormControl (calculated)
  }
]

// Auto-calculation on valueChanges
lineItem.valueChanges.subscribe(() => {
  const total = calculateTotal();
  lineItem.patchValue({ total }, { emitEvent: false }); // Prevent infinite loop!
});
```

---

#### Phase 9: Purchases Management
**Complexity**: HIGH (FormArray for line items)
**Files to Create**: 6
```
src/app/features/purchases/
├── services/purchases.store.ts
├── purchase-list/
│   ├── purchase-list.component.ts
│   └── purchase-list.component.html
├── purchase-create/
│   ├── purchase-create.component.ts (COMPLEX - FormArray)
│   └── purchase-create.component.html
└── purchases.routes.ts
```
**Key Features**:
- Purchase order management
- Dynamic line items with FormArray
- Vendor information
- Auto-calculation (similar to Sales)
- Status workflow (draft → ordered → received → paid → cancelled)
- Purchase order number generation

**Dependencies**:
- ProductsStore (for product dropdown)
- MockApiService.getPurchases/createPurchase/updatePurchase/deletePurchase
- Same FormArray pattern as Sales

---

#### Phase 10: Inventory Management
**Complexity**: MEDIUM (detail view + adjustments)
**Files to Create**: 6
```
src/app/features/inventory/
├── services/inventory.store.ts
├── inventory-list/
│   ├── inventory-list.component.ts
│   └── inventory-list.component.html
├── inventory-detail/
│   ├── inventory-detail.component.ts
│   └── inventory-detail.component.html
└── inventory.routes.ts
```
**Key Features**:
- Inventory tracking per product
- Stock level monitoring (min/max thresholds)
- Stock adjustment form (in, out, adjustment)
- Movement history display
- Low stock alerts
- Location tracking

**Dependencies**:
- ProductsStore (MUST be implemented first!)
- CompanyContextService (for companyId)
- AuthService (for userId)
- MockApiService.getInventory/getInventoryMovements/createInventoryMovement

**Critical Notes**:
- Uses route param `:productId` (NOT `:id` or `:inventoryItemId`)
- Detail component has complex lifecycle with takeUntil(destroy$)
- Adjustment form is conditionally displayed

---

## Implementation Order

### Recommended: Dependencies First
```
Phase 6 (Users)
  ↓
Phase 7 (Products) ← REQUIRED for Phases 8, 9, 10
  ↓
Phase 10 (Inventory) ← Depends on Products
  ↓
Phase 8 (Sales) ← Depends on Products, HIGH complexity
  ↓
Phase 9 (Purchases) ← Depends on Products, HIGH complexity
```

### Rationale:
1. **Phase 6 (Users)**: Independent, simple warm-up
2. **Phase 7 (Products)**: Required by Sales, Purchases, Inventory
3. **Phase 10 (Inventory)**: Medium complexity, good practice before FormArray
4. **Phase 8 (Sales)**: Complex FormArray, requires Products
5. **Phase 9 (Purchases)**: Similar to Sales, can reuse patterns

---

## File Creation Checklist

### For Each Phase:

#### Store (services/*.store.ts)
- [ ] Define state interface
- [ ] Extend StoreBase<State>
- [ ] Inject MockApiService with `inject()`
- [ ] Create selectors (readonly observables)
- [ ] Implement loadXxx() method
- [ ] Implement createXxx() method
- [ ] Implement updateXxx() method
- [ ] Implement deleteXxx() method
- [ ] Implement selectXxx() method
- [ ] Implement clearError() method
- [ ] Use `patchState()` for all state updates
- [ ] Use `tap` and `catchError` operators

#### List Component (xxx-list/)
- [ ] Import all required dependencies
- [ ] Inject store and router with `inject()`
- [ ] Create observable selectors
- [ ] Implement filteredXxx$ with search logic
- [ ] Implement ngOnInit() to load data
- [ ] Implement onSearch() method
- [ ] Implement onCreate() navigation
- [ ] Implement onEdit() navigation
- [ ] Implement onDelete() with confirmation
- [ ] Implement dismissError() method
- [ ] Implement badge variant methods
- [ ] Create responsive HTML template
- [ ] Desktop table view
- [ ] Mobile cards view
- [ ] Empty state template
- [ ] Loading skeleton template

#### Create/Edit Component (xxx-create/)
- [ ] Import all required dependencies
- [ ] Inject FormBuilder, Router, ActivatedRoute, Store
- [ ] Define form property and submitted flag
- [ ] Create dropdown option arrays
- [ ] Implement ngOnInit() with route param check
- [ ] Implement initializeForm() with validators
- [ ] Implement loadXxx() for edit mode
- [ ] Implement onSubmit() with validation
- [ ] Implement onCancel() navigation
- [ ] Implement validation helper methods
- [ ] Create form sections in HTML
- [ ] Add error messages
- [ ] Add loading states
- [ ] Add action buttons

#### Routes File (xxx.routes.ts)
- [ ] Import Routes and authGuard
- [ ] Define list route ('') with authGuard
- [ ] Define create route ('create') with authGuard
- [ ] Define edit route ('edit/:id') with authGuard
- [ ] Export routes constant
- [ ] Use loadComponent for lazy loading

#### Update app.routes.ts
- [ ] Add route before fallback route
- [ ] Use loadChildren pattern
- [ ] Point to feature routes file

---

## Testing After Each Phase

After implementing each phase:

```bash
# 1. Verify TypeScript compilation
npm run build

# 2. Check for errors in console
ng serve

# 3. Manual testing:
# - Navigate to feature route
# - Test list view loads
# - Test search functionality
# - Test create form
# - Test edit form
# - Test delete with confirmation
# - Test validation errors
# - Test mobile responsive layout
# - Test error handling
# - Verify localStorage persistence

# 4. Verify route protection
# - Logout and try to access route
# - Should redirect to /auth/login
```

---

## Common Patterns to Follow

### 1. State Management (RxJS, NO Signals)
```typescript
// Store pattern
@Injectable({ providedIn: 'root' })
export class XxxStore extends StoreBase<XxxState> {
  private readonly mockApi = inject(MockApiService);

  readonly items$ = this.select(state => state.items);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

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

### 2. Component Dependency Injection
```typescript
// Use inject() function (Angular 20 best practice)
private readonly store = inject(XxxStore);
private readonly router = inject(Router);
private readonly route = inject(ActivatedRoute);
```

### 3. Form Validation
```typescript
// Submit-only validation pattern
onSubmit(): void {
  this.submitted = true;

  // Mark all as touched
  Object.keys(this.form.controls).forEach(key => {
    this.form.get(key)?.markAsTouched();
  });

  if (this.form.invalid) {
    return; // Show errors but don't submit
  }

  // Proceed with submission
}
```

### 4. Template Observables
```html
<!-- Always use async pipe -->
<div *ngIf="(items$ | async) as items; else loading">
  <div *ngFor="let item of items">
    {{ item.name }}
  </div>
</div>

<ng-template #loading>
  <div class="animate-pulse">Loading...</div>
</ng-template>
```

### 5. Responsive Design
```html
<!-- Desktop table -->
<div class="hidden md:block">
  <table>...</table>
</div>

<!-- Mobile cards -->
<div class="md:hidden space-y-4">
  <div class="card">...</div>
</div>
```

---

## Critical Implementation Notes

### Angular 20 Standalone Architecture
- ✅ All components have `standalone: true`
- ✅ NO NgModules
- ✅ Components declare own imports
- ✅ Use `inject()` for DI
- ✅ Lazy load with `loadComponent` and `loadChildren`

### RxJS State Management
- ✅ BehaviorSubject in stores (NO Signals)
- ✅ Extend StoreBase<T>
- ✅ Use `patchState()` for updates
- ✅ Use `async` pipe in templates
- ✅ Use `takeUntil(destroy$)` if manual subscription needed

### Form Validation
- ✅ Submit-only validation
- ✅ Mark all as touched on submit
- ✅ Show errors after submit or touch
- ✅ Use shared form components (FormInput, FormSelect, etc.)

### Routing
- ✅ All routes protected by `authGuard`
- ✅ Lazy load with `loadChildren`
- ✅ Edit mode uses same component as create

### Styling
- ✅ Tailwind CSS utility classes
- ✅ Responsive design (mobile cards + desktop tables)
- ✅ Dark mode support with `dark:` variants
- ✅ Use semantic color classes (text-text, bg-surface, etc.)

---

## Expected Results

### File Count
- **New Files**: 30 (5 phases × 6 files each)
- **Updated Files**: 1 (app.routes.ts)
- **Total Changes**: 31 files

### Routes Added to app.routes.ts
```typescript
// Users
{ path: 'users', loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES) },

// Products
{ path: 'products', loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES) },

// Sales
{ path: 'sales', loadChildren: () => import('./features/sales/sales.routes').then(m => m.SALES_ROUTES) },

// Purchases
{ path: 'purchases', loadChildren: () => import('./features/purchases/purchases.routes').then(m => m.PURCHASES_ROUTES) },

// Inventory
{ path: 'inventory', loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES) },
```

### Build Verification
```bash
npm run build
# Expected: SUCCESS with 0 errors
```

---

## Reference Documents

- **Phase 6 Plan**: `.claude/doc/phase-6-user-management/angular-frontend.md`
- **Phase 7 Plan**: `.claude/doc/phase7-products/angular-frontend.md`
- **Phase 8 Plan**: `.claude/doc/phase8-sales/angular-frontend.md`
- **Phase 8 FormArray Guide**: `.claude/doc/phase8-sales/FORMARRAY-PATTERN-GUIDE.md`
- **Phase 9 Plan**: `.claude/doc/phase9-purchases/angular-frontend.md`
- **Phase 10 Plan**: `.claude/doc/phase-10-inventory/angular-frontend.md`

- **Reference Implementation**: `src/app/features/companies/` (Phase 5)
- **Models**: `src/app/shared/models/`
- **Shared Components**: `src/app/shared/components/`

---

## Next Steps

1. ✅ Read all implementation plans
2. ✅ Create implementation checklist
3. ⏳ Start with Phase 6 (Users)
4. ⏳ Proceed to Phase 7 (Products)
5. ⏳ Implement Phase 10 (Inventory)
6. ⏳ Implement Phase 8 (Sales with FormArray)
7. ⏳ Implement Phase 9 (Purchases with FormArray)
8. ⏳ Update app.routes.ts
9. ⏳ Run build verification
10. ⏳ Create final implementation report

---

## Time Estimate

- **Phase 6 (Users)**: 1-2 hours (simple CRUD)
- **Phase 7 (Products)**: 1-2 hours (simple CRUD)
- **Phase 10 (Inventory)**: 2-3 hours (detail view + forms)
- **Phase 8 (Sales)**: 3-4 hours (complex FormArray)
- **Phase 9 (Purchases)**: 2-3 hours (FormArray, can reuse Sales patterns)

**Total Estimated Time**: 9-14 hours for experienced Angular developer

---

This implementation plan provides a comprehensive blueprint for completing Phases 6-10 of the Umbrella Frontend MVP. The systematic approach ensures consistency, maintainability, and adherence to Angular 20 best practices and Clean Architecture principles.
