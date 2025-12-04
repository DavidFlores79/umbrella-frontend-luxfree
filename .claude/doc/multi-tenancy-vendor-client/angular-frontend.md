# Multi-Tenancy & Vendor/Client Architecture Implementation Plan

**Project**: Umbrella Frontend (Angular 20)
**Feature**: Multi-Tenancy Data Filtering + Vendor/Client Module Architecture
**Date**: 2025-12-02
**Status**: Implementation Plan

---

## Executive Summary

This document provides a detailed implementation plan for:
1. **Multi-tenancy store filtering pattern** - Fixing stores to filter data by companyId
2. **Reactive company switching** - Automatic store reloading on company change
3. **Vendor/Client module architecture** - Decision and implementation strategy
4. **Testing strategy** - Comprehensive testing approach for multi-tenancy

---

## 1. Multi-Tenancy Store Filtering Pattern

### Recommended Solution: **Option B with Enhancements**

**Why Option B (Protected Method in StoreBase)?**

1. **Single Responsibility**: StoreBase already manages state, adding multi-tenancy context fits naturally
2. **DRY Principle**: Eliminates code duplication across 7+ stores
3. **Type Safety**: Centralized logic ensures consistent behavior
4. **Testability**: One place to mock/test company filtering logic
5. **Maintainability**: Changes to filtering logic update all stores automatically

**Why NOT Option A (Inject in Each Store)?**
- Violates DRY - same logic repeated 7+ times
- Error-prone - easy to forget or implement inconsistently
- Hard to maintain - changes require updating every store

**Why NOT Option C (CompanyFilterService)?**
- Over-engineering - adds unnecessary indirection
- Requires injecting in every store anyway
- No real benefit over Option B

### Implementation Steps

#### Step 1: Enhance StoreBase with Multi-Tenancy Support

**File**: `/src/app/core/services/store-base.service.ts`

**Changes**:
1. Add protected injected dependencies
2. Add `getCompanyIdForFiltering()` protected method
3. Add `companyContext$` reactive property for listening to company changes
4. Add optional `reloadOnCompanyChange()` method for stores that need it

**Code Structure**:
```typescript
export abstract class StoreBase<T extends object> {
  private readonly state$: BehaviorSubject<T>;

  // NEW: Multi-tenancy support
  protected readonly companyContext = inject(CompanyContextService);
  protected readonly permissions = inject(PermissionService);

  // NEW: Observable for company changes
  protected readonly companyContext$ = this.companyContext.currentCompany$;

  protected constructor(initialState: T) {
    this.state$ = new BehaviorSubject<T>(initialState);
  }

  // Existing methods: currentState, state, select, patchState, setState, reset
  // ... (keep all existing methods unchanged)

  /**
   * Gets the company ID to use for API filtering.
   * - Admin users: undefined (see all data)
   * - Manager/User: their current companyId
   *
   * @returns companyId for filtering, or undefined for admins
   */
  protected getCompanyIdForFiltering(): string | undefined {
    return this.permissions.isAdmin()
      ? undefined
      : this.companyContext.currentCompanyId ?? undefined;
  }

  /**
   * Optional: Call this in store constructor to automatically reload
   * data when the company context changes (admin switching companies).
   *
   * @param reloadFn - Function to call when company changes (e.g., loadProducts)
   * @param skipInitial - Skip the first emission (default: true)
   */
  protected reloadOnCompanyChange(
    reloadFn: () => void,
    skipInitial = true
  ): void {
    this.companyContext$
      .pipe(
        skipInitial ? skip(1) : tap(() => {}),
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
      )
      .subscribe(() => {
        reloadFn();
      });
  }
}
```

**Important Notes**:
- Uses `inject()` function for DI (Angular 20 best practice)
- `protected` visibility allows stores to access but not external code
- `companyContext$` is exposed as protected Observable for reactive patterns
- `reloadOnCompanyChange()` is opt-in - stores choose if they need it

#### Step 2: Update All Feature Stores

Update these store files to use `getCompanyIdForFiltering()`:

1. `/src/app/features/products/services/products.store.ts`
2. `/src/app/features/sales/services/sales.store.ts`
3. `/src/app/features/purchases/services/purchases.store.ts`
4. `/src/app/features/inventory/services/inventory.store.ts`
5. `/src/app/features/users/services/users.store.ts`

**Pattern for Each Store**:

**Before (Broken)**:
```typescript
loadProducts(): void {
  this.patchState({ loading: true, error: null });

  this.mockApi.getProducts().pipe(  // No companyId filtering
    tap(products => {
      this.patchState({ products, loading: false, error: null });
    }),
    catchError(err => {
      this.patchState({ error: err.message, loading: false });
      return of([]);
    })
  ).subscribe();
}
```

**After (Fixed)**:
```typescript
loadProducts(): void {
  this.patchState({ loading: true, error: null });

  const companyId = this.getCompanyIdForFiltering();  // Get filtered companyId

  this.mockApi.getProducts(companyId).pipe(  // Pass to API
    tap(products => {
      this.patchState({ products, loading: false, error: null });
    }),
    catchError(err => {
      this.patchState({ error: err.message, loading: false });
      return of([]);
    })
  ).subscribe();
}
```

**Methods to Update in Each Store**:
- `loadProducts()` / `loadSales()` / `loadPurchases()` etc.
- `loadInventoryItems()`
- `loadUsers()` (if it filters by company)

**Do NOT change**:
- Create/Update/Delete methods - they receive companyId in DTO
- Companies store - should see all companies for admin selector
- Auth-related stores

#### Step 3: Add Automatic Company Switch Reload (Optional)

For stores that should automatically reload when admin switches company:

**Example: ProductsStore with Auto-Reload**:
```typescript
@Injectable({ providedIn: 'root' })
export class ProductsStore extends StoreBase<ProductsState> {
  private readonly mockApi = inject(MockApiService);

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

    // NEW: Auto-reload when company switches
    this.reloadOnCompanyChange(() => this.loadProducts());
  }

  loadProducts(): void {
    this.patchState({ loading: true, error: null });
    const companyId = this.getCompanyIdForFiltering();  // Use base class method

    this.mockApi.getProducts(companyId).pipe(
      tap(products => {
        this.patchState({ products, loading: false, error: null });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        return of([]);
      })
    ).subscribe();
  }

  // ... rest of methods unchanged
}
```

**Which Stores Need Auto-Reload?**
- **YES**: Products, Sales, Purchases, Inventory (data changes per company)
- **NO**: Users store (already filters, but reload may be needed)
- **NO**: Companies store (used in selector, shouldn't reload)
- **NO**: Dashboard store (should reload explicitly from component)

---

## 2. Reactive Company Switching Pattern

### Problem Statement

When an admin user switches company using the header dropdown:
- All feature stores should reload their data for the new company
- Components should reflect the new company's data
- No manual subscriptions should leak memory

### Solution: Store-Level Auto-Reload with Component Coordination

**Architecture**:
1. **CompanyContextService** emits company changes via `currentCompany$`
2. **Stores** use `reloadOnCompanyChange()` to auto-reload (opt-in)
3. **Components** remain simple - just use `async` pipe
4. **Manual reload** option available for components that need control

### Implementation

#### Implementation A: Automatic Store Reload (Recommended for Most Stores)

Use `reloadOnCompanyChange()` in store constructor:

```typescript
constructor() {
  super({ items: [], loading: false, error: null });

  // Automatically reload when company switches
  this.reloadOnCompanyChange(() => this.loadItems());
}
```

**Pros**:
- Components don't need to handle reload logic
- Consistent behavior across all features
- No memory leaks (managed by StoreBase)

**Cons**:
- Store reloads even if component isn't active (minor overhead)

#### Implementation B: Component-Controlled Reload (For Special Cases)

Component listens to company changes and calls store reload:

```typescript
@Component({
  selector: 'app-products-list',
  standalone: true,
  template: `
    <div *ngFor="let product of products$ | async">
      {{ product.name }}
    </div>
  `
})
export class ProductsListComponent implements OnInit, OnDestroy {
  private readonly productsStore = inject(ProductsStore);
  private readonly companyContext = inject(CompanyContextService);
  private readonly destroy$ = new Subject<void>();

  readonly products$ = this.productsStore.products$;
  readonly loading$ = this.productsStore.loading$;

  ngOnInit(): void {
    // Initial load
    this.productsStore.loadProducts();

    // Reload on company change
    this.companyContext.currentCompany$
      .pipe(
        skip(1), // Skip initial value
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.productsStore.loadProducts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Use This When**:
- Dashboard that aggregates multiple stores
- Complex components with multi-step loading
- Components that need to show loading indicators during reload

**Recommended Approach**:
- Use **Implementation A** (automatic) for 90% of stores
- Use **Implementation B** (manual) for Dashboard and complex pages

---

## 3. Vendor/Client Module Architecture Decision

### Current State Analysis

**Sale Model**:
- Inline fields: `customerName`, `customerEmail`, `customerPhone`, `customerId?`
- No Customer entity exists
- Simple form with text inputs

**Purchase Model**:
- Inline fields: `vendorName`, `vendorEmail`, `vendorPhone`, `vendorId?`
- No Vendor entity exists
- Simple form with text inputs

### Recommended Solution: **Hybrid Approach (Start Simple, Evolve)**

#### Phase 1: Enhanced Inline with Smart Features (MVP - Current Sprint)

Keep inline fields but add smart autocomplete and recent history.

**Why This Approach?**
1. **Time to Market**: Faster implementation, no new CRUD modules
2. **User Experience**: Still provides convenience (autocomplete)
3. **Data Integrity**: Basic validation, no foreign key constraints yet
4. **Migration Path**: Easy to upgrade to full CRUD later
5. **Complexity**: Minimal - no breaking changes to Sale/Purchase forms

**Implementation**:

##### Create Vendor/Client History Services

**File**: `/src/app/shared/services/vendor-history.service.ts`

```typescript
export interface VendorHistoryItem {
  name: string;
  email: string;
  phone: string;
  lastUsed: Date;
  usageCount: number;
}

@Injectable({ providedIn: 'root' })
export class VendorHistoryService {
  private readonly STORAGE_KEY = 'umbrella_vendor_history';
  private readonly MAX_HISTORY = 50;

  /**
   * Records a vendor used in a purchase.
   */
  recordVendor(name: string, email: string, phone: string): void {
    const history = this.getHistory();
    const existing = history.find(v =>
      v.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      existing.lastUsed = new Date();
      existing.usageCount++;
      existing.name = name;  // Update name in case it changed
      existing.phone = phone;
    } else {
      history.push({
        name,
        email,
        phone,
        lastUsed: new Date(),
        usageCount: 1
      });
    }

    // Keep only top N most used
    const sorted = history
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, this.MAX_HISTORY);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sorted));
  }

  /**
   * Searches vendor history by name or email.
   */
  searchVendors(query: string): VendorHistoryItem[] {
    if (!query || query.length < 2) return [];

    const history = this.getHistory();
    const lowerQuery = query.toLowerCase();

    return history
      .filter(v =>
        v.name.toLowerCase().includes(lowerQuery) ||
        v.email.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);  // Top 10 matches
  }

  /**
   * Gets recent vendors (last 10 used).
   */
  getRecentVendors(): VendorHistoryItem[] {
    return this.getHistory()
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 10);
  }

  private getHistory(): VendorHistoryItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data) as VendorHistoryItem[];
      // Rehydrate Date objects
      return parsed.map(v => ({
        ...v,
        lastUsed: new Date(v.lastUsed)
      }));
    } catch {
      return [];
    }
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

**File**: `/src/app/shared/services/client-history.service.ts`

Identical structure to VendorHistoryService but for clients:
- Replace "vendor" with "client" terminology
- Use `umbrella_client_history` storage key
- Same methods: `recordClient()`, `searchClients()`, `getRecentClients()`

##### Update Purchase Form Component

**File**: `/src/app/features/purchases/purchase-create/purchase-create.component.ts`

**Changes**:
1. Inject `VendorHistoryService`
2. Add autocomplete Observable: `vendorSuggestions$`
3. On vendor name input change, search history
4. On form submit, record vendor to history

**Code Structure**:
```typescript
@Component({
  selector: 'app-purchase-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, /* autocomplete components */],
  templateUrl: './purchase-create.component.html'
})
export class PurchaseCreateComponent implements OnInit {
  private readonly purchasesStore = inject(PurchasesStore);
  private readonly vendorHistory = inject(VendorHistoryService);
  private readonly router = inject(Router);

  purchaseForm!: FormGroup;
  vendorSuggestions: VendorHistoryItem[] = [];
  showVendorDropdown = false;

  ngOnInit(): void {
    this.purchaseForm = this.createForm();
    this.setupVendorAutocomplete();
  }

  private createForm(): FormGroup {
    return new FormGroup({
      vendorName: new FormControl('', [Validators.required]),
      vendorEmail: new FormControl('', [Validators.required, Validators.email]),
      vendorPhone: new FormControl('', [Validators.required]),
      // ... other fields
    });
  }

  private setupVendorAutocomplete(): void {
    this.purchaseForm.get('vendorName')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query && query.length >= 2) {
          this.vendorSuggestions = this.vendorHistory.searchVendors(query);
          this.showVendorDropdown = this.vendorSuggestions.length > 0;
        } else {
          this.vendorSuggestions = [];
          this.showVendorDropdown = false;
        }
      });
  }

  selectVendor(vendor: VendorHistoryItem): void {
    this.purchaseForm.patchValue({
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      vendorPhone: vendor.phone
    });
    this.showVendorDropdown = false;
  }

  onSubmit(): void {
    if (this.purchaseForm.valid) {
      const formValue = this.purchaseForm.value;

      // Record vendor to history
      this.vendorHistory.recordVendor(
        formValue.vendorName,
        formValue.vendorEmail,
        formValue.vendorPhone
      );

      // Create purchase
      this.purchasesStore.createPurchase({
        ...formValue,
        companyId: this.companyContext.currentCompanyId!,
        createdBy: this.authService.currentUser!.id
      });

      this.router.navigate(['/purchases']);
    }
  }
}
```

**Template**: `/src/app/features/purchases/purchase-create/purchase-create.component.html`

Add autocomplete dropdown below vendor name input:

```html
<div class="form-group relative">
  <label for="vendorName">Vendor Name *</label>
  <input
    id="vendorName"
    type="text"
    formControlName="vendorName"
    class="form-control"
    placeholder="Start typing vendor name..."
    (focus)="showVendorDropdown = vendorSuggestions.length > 0">

  <!-- Autocomplete Dropdown -->
  <div
    *ngIf="showVendorDropdown"
    class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
    <button
      *ngFor="let vendor of vendorSuggestions"
      type="button"
      class="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
      (click)="selectVendor(vendor)">
      <div class="font-medium">{{ vendor.name }}</div>
      <div class="text-sm text-gray-600">{{ vendor.email }}</div>
    </button>
  </div>
</div>

<div class="form-group">
  <label for="vendorEmail">Vendor Email *</label>
  <input
    id="vendorEmail"
    type="email"
    formControlName="vendorEmail"
    class="form-control">
</div>

<div class="form-group">
  <label for="vendorPhone">Vendor Phone *</label>
  <input
    id="vendorPhone"
    type="tel"
    formControlName="vendorPhone"
    class="form-control">
</div>
```

##### Update Sales Form Component

Apply identical pattern to Sales forms with `ClientHistoryService`.

**Files to Update**:
- `/src/app/features/sales/sale-create/sale-create.component.ts`
- `/src/app/features/sales/sale-create/sale-create.component.html`
- `/src/app/features/sales/sale-edit/sale-edit.component.ts` (if exists)

**Changes**: Same as Purchase form but use "customer" instead of "vendor".

#### Phase 2: Full Vendor/Client CRUD Modules (Future Enhancement)

**When to Implement**:
- User feedback requests vendor/client management screens
- Need for vendor/client deduplication and data quality
- Require vendor/client-specific fields (address, tax ID, payment terms)
- Want to generate vendor/client reports

**Implementation Approach**:

##### Create Vendor and Client Domain Models

**File**: `/src/app/shared/models/vendor.model.ts`

```typescript
export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  paymentTerms?: string;  // "Net 30", "Net 60", etc.
  notes?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorDto {
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
  createdBy: string;
}

export interface UpdateVendorDto {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
  isActive?: boolean;
}
```

**File**: `/src/app/shared/models/client.model.ts`

Identical structure to Vendor model.

##### Update Purchase and Sale Models

**File**: `/src/app/shared/models/purchase.model.ts`

**Changes**:
1. Make `vendorId` required (not optional)
2. Keep inline fields for backward compatibility
3. Add relation loading flag

```typescript
export interface Purchase {
  id: string;
  companyId: string;
  purchaseOrderNumber: string;

  // Required vendor reference
  vendorId: string;

  // Denormalized vendor data (for performance)
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;

  items: PurchaseLineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: PurchaseStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;

  // Optional: Loaded vendor details
  vendor?: Vendor;
}
```

**Why Keep Inline Fields?**
- Performance: Avoid JOIN queries in list views
- Backward compatibility: Existing data still works
- Flexibility: Vendor data at time of purchase preserved

##### Add Vendor/Client API Methods to MockApiService

**File**: `/src/app/core/services/mock-api.service.ts`

**Add Methods**:
```typescript
// Vendors
getVendors(companyId?: string): Observable<Vendor[]>
getVendor(id: string): Observable<Vendor>
createVendor(dto: CreateVendorDto): Observable<Vendor>
updateVendor(dto: UpdateVendorDto): Observable<Vendor>
deleteVendor(id: string): Observable<void>

// Clients
getClients(companyId?: string): Observable<Client[]>
getClient(id: string): Observable<Client>
createClient(dto: CreateClientDto): Observable<Client>
updateClient(dto: UpdateClientDto): Observable<Client>
deleteClient(id: string): Observable<void>
```

**Implementation**: Same pattern as existing entity methods.

##### Create Feature Modules

**Vendor Module**:
- `/src/app/features/vendors/services/vendors.store.ts`
- `/src/app/features/vendors/vendor-list/vendor-list.component.ts`
- `/src/app/features/vendors/vendor-create/vendor-create.component.ts`
- `/src/app/features/vendors/vendor-edit/vendor-edit.component.ts`
- `/src/app/features/vendors/vendors.routes.ts`

**Client Module**: Same structure as Vendor module.

**Pattern**: Follow existing features (products, sales, etc.) exactly.

##### Update Purchase/Sale Forms with Vendor/Client Selectors

**Changes to Purchase Create Form**:
1. Replace text inputs with searchable dropdown
2. Add "Create New Vendor" button (opens modal/side panel)
3. On vendor selection, populate inline fields automatically

**Code Structure**:
```typescript
export class PurchaseCreateComponent implements OnInit {
  private readonly vendorsStore = inject(VendorsStore);

  readonly vendors$ = this.vendorsStore.vendors$;
  filteredVendors$!: Observable<Vendor[]>;

  ngOnInit(): void {
    this.vendorsStore.loadVendors();  // Load vendor list
    this.purchaseForm = this.createForm();
    this.setupVendorSearch();
  }

  private setupVendorSearch(): void {
    this.filteredVendors$ = combineLatest([
      this.vendors$,
      this.purchaseForm.get('vendorSearch')!.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([vendors, query]) => {
        if (!query) return vendors;
        const lowerQuery = query.toLowerCase();
        return vendors.filter(v =>
          v.name.toLowerCase().includes(lowerQuery) ||
          v.email.toLowerCase().includes(lowerQuery)
        );
      })
    );
  }

  selectVendor(vendor: Vendor): void {
    this.purchaseForm.patchValue({
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      vendorPhone: vendor.phone
    });
  }
}
```

##### Migration Strategy

**Data Migration**:
1. Run migration script to create Vendor/Client entities from existing Sales/Purchases
2. Deduplicate by email address
3. Link existing records via `vendorId`/`customerId`

**UI Migration**:
1. Deploy Phase 2 with feature flag
2. Enable for pilot companies first
3. Gradual rollout based on feedback

---

## 4. Testing Strategy

### Unit Tests for Multi-Tenancy Filtering

#### Test StoreBase Multi-Tenancy Methods

**File**: `/src/app/core/services/store-base.service.spec.ts`

**Test Cases**:
```typescript
describe('StoreBase Multi-Tenancy', () => {
  let store: TestStore;
  let companyContext: CompanyContextService;
  let permissions: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestStore,
        {
          provide: CompanyContextService,
          useValue: {
            currentCompanyId: 'company-123',
            currentCompany$: of({ id: 'company-123', name: 'Test' })
          }
        },
        {
          provide: PermissionService,
          useValue: { isAdmin: () => false }
        }
      ]
    });

    store = TestBed.inject(TestStore);
    companyContext = TestBed.inject(CompanyContextService);
    permissions = TestBed.inject(PermissionService);
  });

  describe('getCompanyIdForFiltering()', () => {
    it('should return currentCompanyId for non-admin users', () => {
      spyOn(permissions, 'isAdmin').and.returnValue(false);

      const result = store['getCompanyIdForFiltering']();

      expect(result).toBe('company-123');
    });

    it('should return undefined for admin users', () => {
      spyOn(permissions, 'isAdmin').and.returnValue(true);

      const result = store['getCompanyIdForFiltering']();

      expect(result).toBeUndefined();
    });

    it('should return undefined when no company context', () => {
      (companyContext as any).currentCompanyId = null;
      spyOn(permissions, 'isAdmin').and.returnValue(false);

      const result = store['getCompanyIdForFiltering']();

      expect(result).toBeUndefined();
    });
  });

  describe('reloadOnCompanyChange()', () => {
    it('should call reload function when company changes', fakeAsync(() => {
      const reloadSpy = jasmine.createSpy('reload');
      const companySubject = new BehaviorSubject({ id: 'company-1', name: 'C1' });
      (companyContext as any).currentCompany$ = companySubject;

      store['reloadOnCompanyChange'](reloadSpy);
      tick();

      // Initial load should be skipped
      expect(reloadSpy).not.toHaveBeenCalled();

      // Change company
      companySubject.next({ id: 'company-2', name: 'C2' });
      tick();

      expect(reloadSpy).toHaveBeenCalledTimes(1);
    }));

    it('should not reload when company ID stays the same', fakeAsync(() => {
      const reloadSpy = jasmine.createSpy('reload');
      const companySubject = new BehaviorSubject({ id: 'company-1', name: 'C1' });
      (companyContext as any).currentCompany$ = companySubject;

      store['reloadOnCompanyChange'](reloadSpy);
      tick();

      // Change company name but not ID
      companySubject.next({ id: 'company-1', name: 'C1 Updated' });
      tick();

      expect(reloadSpy).not.toHaveBeenCalled();
    }));
  });
});
```

#### Test Feature Stores with Multi-Tenancy

**File**: `/src/app/features/products/services/products.store.spec.ts`

**Test Cases**:
```typescript
describe('ProductsStore Multi-Tenancy', () => {
  let store: ProductsStore;
  let mockApi: jasmine.SpyObj<MockApiService>;
  let companyContext: jasmine.SpyObj<CompanyContextService>;
  let permissions: jasmine.SpyObj<PermissionService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('MockApiService', ['getProducts']);
    const contextSpy = jasmine.createSpyObj('CompanyContextService', [], {
      currentCompanyId: 'company-123',
      currentCompany$: of({ id: 'company-123', name: 'Test Co' })
    });
    const permissionsSpy = jasmine.createSpyObj('PermissionService', ['isAdmin']);

    TestBed.configureTestingModule({
      providers: [
        ProductsStore,
        { provide: MockApiService, useValue: apiSpy },
        { provide: CompanyContextService, useValue: contextSpy },
        { provide: PermissionService, useValue: permissionsSpy }
      ]
    });

    store = TestBed.inject(ProductsStore);
    mockApi = TestBed.inject(MockApiService) as jasmine.SpyObj<MockApiService>;
    companyContext = TestBed.inject(CompanyContextService) as jasmine.SpyObj<CompanyContextService>;
    permissions = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
  });

  describe('loadProducts() with multi-tenancy', () => {
    it('should pass companyId for non-admin users', fakeAsync(() => {
      permissions.isAdmin.and.returnValue(false);
      mockApi.getProducts.and.returnValue(of([]));

      store.loadProducts();
      tick();

      expect(mockApi.getProducts).toHaveBeenCalledWith('company-123');
    }));

    it('should pass undefined for admin users to see all products', fakeAsync(() => {
      permissions.isAdmin.and.returnValue(true);
      mockApi.getProducts.and.returnValue(of([]));

      store.loadProducts();
      tick();

      expect(mockApi.getProducts).toHaveBeenCalledWith(undefined);
    }));

    it('should handle null companyId gracefully', fakeAsync(() => {
      permissions.isAdmin.and.returnValue(false);
      (companyContext as any).currentCompanyId = null;
      mockApi.getProducts.and.returnValue(of([]));

      store.loadProducts();
      tick();

      expect(mockApi.getProducts).toHaveBeenCalledWith(undefined);
    }));
  });

  describe('auto-reload on company switch', () => {
    it('should reload products when company changes', fakeAsync(() => {
      const companySubject = new BehaviorSubject({ id: 'company-1', name: 'C1' });
      (companyContext as any).currentCompany$ = companySubject;
      permissions.isAdmin.and.returnValue(true);
      mockApi.getProducts.and.returnValue(of([]));

      // Create new store instance to trigger constructor with reloadOnCompanyChange
      store = new ProductsStore();
      tick();

      // Initial load
      store.loadProducts();
      tick();
      expect(mockApi.getProducts).toHaveBeenCalledTimes(1);

      // Switch company
      companySubject.next({ id: 'company-2', name: 'C2' });
      tick();

      // Should auto-reload
      expect(mockApi.getProducts).toHaveBeenCalledTimes(2);
    }));
  });
});
```

### Integration Tests

#### Test Company Switching Flow

**File**: `/src/app/features/products/product-list/product-list.component.spec.ts`

**Test Cases**:
```typescript
describe('ProductListComponent - Company Switching', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productsStore: ProductsStore;
  let companyContext: CompanyContextService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productsStore = TestBed.inject(ProductsStore);
    companyContext = TestBed.inject(CompanyContextService);
  });

  it('should reload products when admin switches company', fakeAsync(() => {
    spyOn(productsStore, 'loadProducts');

    fixture.detectChanges();
    tick();

    // Initial load
    expect(productsStore.loadProducts).toHaveBeenCalledTimes(1);

    // Admin switches company
    companyContext.setCurrentCompany({
      id: 'company-2',
      name: 'Company 2'
    } as Company);
    tick();

    // Should trigger reload
    expect(productsStore.loadProducts).toHaveBeenCalledTimes(2);
  }));
});
```

### E2E Tests with Cypress

#### Test Multi-Tenancy Data Isolation

**File**: `/cypress/e2e/multi-tenancy.cy.ts`

**Test Cases**:
```typescript
describe('Multi-Tenancy Data Isolation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should show only company-specific products for regular users', () => {
    // Login as manager user for Company 1
    cy.login('manager@company1.com', 'password123');
    cy.visit('/products');

    // Should see only Company 1 products
    cy.get('[data-cy=product-row]').should('have.length', 3);
    cy.get('[data-cy=product-row]').first().should('contain', 'Company 1 Product');
  });

  it('should show all products for admin users', () => {
    // Login as admin
    cy.login('admin@company1.com', 'password123');
    cy.visit('/products');

    // Should see products from all companies
    cy.get('[data-cy=product-row]').should('have.length.greaterThan', 3);
  });

  it('should reload data when admin switches company', () => {
    cy.login('admin@company1.com', 'password123');
    cy.visit('/products');

    // Note initial product count
    cy.get('[data-cy=product-row]').its('length').as('initialCount');

    // Switch company
    cy.get('[data-cy=company-selector]').click();
    cy.get('[data-cy=company-option]').contains('Company 2').click();

    // Should show loading indicator
    cy.get('[data-cy=loading-spinner]').should('be.visible');

    // Products should reload with new company data
    cy.get('[data-cy=product-row]').should('exist');
    cy.get('[data-cy=product-row]').first().should('contain', 'Company 2');
  });
});
```

#### Test Vendor/Client Autocomplete (Phase 1)

**File**: `/cypress/e2e/vendor-autocomplete.cy.ts`

**Test Cases**:
```typescript
describe('Vendor Autocomplete', () => {
  beforeEach(() => {
    cy.login('manager@company1.com', 'password123');
  });

  it('should show vendor suggestions when typing', () => {
    cy.visit('/purchases/create');

    cy.get('[data-cy=vendor-name]').type('Acme');

    // Autocomplete dropdown should appear
    cy.get('[data-cy=vendor-dropdown]').should('be.visible');
    cy.get('[data-cy=vendor-suggestion]').should('have.length.greaterThan', 0);
    cy.get('[data-cy=vendor-suggestion]').first().should('contain', 'Acme');
  });

  it('should populate form when selecting vendor from dropdown', () => {
    cy.visit('/purchases/create');

    cy.get('[data-cy=vendor-name]').type('Acme');
    cy.get('[data-cy=vendor-suggestion]').first().click();

    // Form fields should be populated
    cy.get('[data-cy=vendor-name]').should('have.value', 'Acme Corp');
    cy.get('[data-cy=vendor-email]').should('have.value', 'info@acmecorp.com');
    cy.get('[data-cy=vendor-phone]').should('have.value', '+1-555-0123');
  });

  it('should record vendor to history after purchase creation', () => {
    cy.visit('/purchases/create');

    // Fill form manually (no autocomplete)
    cy.get('[data-cy=vendor-name]').type('New Vendor Inc');
    cy.get('[data-cy=vendor-email]').type('contact@newvendor.com');
    cy.get('[data-cy=vendor-phone]').type('+1-555-9999');

    // Add items and submit (simplified)
    cy.get('[data-cy=add-item]').click();
    cy.get('[data-cy=submit-purchase]').click();

    // Create another purchase
    cy.visit('/purchases/create');
    cy.get('[data-cy=vendor-name]').type('New Vendor');

    // Should see the previously entered vendor in suggestions
    cy.get('[data-cy=vendor-dropdown]').should('be.visible');
    cy.get('[data-cy=vendor-suggestion]').should('contain', 'New Vendor Inc');
  });
});
```

---

## 5. Implementation Checklist

### Phase 1: Multi-Tenancy Store Filtering (Current Sprint)

- [ ] **Step 1: Update StoreBase**
  - [ ] Add `inject()` for CompanyContextService and PermissionService
  - [ ] Add `companyContext$` protected property
  - [ ] Implement `getCompanyIdForFiltering()` method
  - [ ] Implement `reloadOnCompanyChange()` method
  - [ ] Add imports: `skip`, `distinctUntilChanged` from RxJS

- [ ] **Step 2: Update Feature Stores**
  - [ ] ProductsStore: Update `loadProducts()` to pass `companyId`
  - [ ] SalesStore: Update `loadSales()` to pass `companyId`
  - [ ] PurchasesStore: Update `loadPurchases()` to pass `companyId`
  - [ ] InventoryStore: Update `loadInventoryItems()` to pass `companyId`
  - [ ] UsersStore: Update `loadUsers()` to pass `companyId` (if needed)

- [ ] **Step 3: Add Auto-Reload to Stores**
  - [ ] ProductsStore: Call `reloadOnCompanyChange()` in constructor
  - [ ] SalesStore: Call `reloadOnCompanyChange()` in constructor
  - [ ] PurchasesStore: Call `reloadOnCompanyChange()` in constructor
  - [ ] InventoryStore: Call `reloadOnCompanyChange()` in constructor

- [ ] **Step 4: Update Dashboard Component**
  - [ ] Subscribe to `companyContext.currentCompany$` with `skip(1)`
  - [ ] Call `dashboardStore.loadDashboard()` on company change
  - [ ] Add `takeUntil(destroy$)` for cleanup

- [ ] **Step 5: Write Unit Tests**
  - [ ] StoreBase multi-tenancy tests
  - [ ] ProductsStore filtering tests
  - [ ] SalesStore filtering tests
  - [ ] PurchasesStore filtering tests

- [ ] **Step 6: Write Integration Tests**
  - [ ] Product list company switching test
  - [ ] Sales list company switching test
  - [ ] Dashboard reload on company change test

- [ ] **Step 7: Manual Testing**
  - [ ] Login as manager, verify filtered data
  - [ ] Login as admin, verify all data visible
  - [ ] Switch company as admin, verify reload
  - [ ] Check all feature modules (products, sales, purchases, inventory)

### Phase 2: Vendor/Client Autocomplete (Next Sprint)

- [ ] **Step 1: Create History Services**
  - [ ] Create `VendorHistoryService` in `/shared/services/`
  - [ ] Implement `recordVendor()`, `searchVendors()`, `getRecentVendors()`
  - [ ] Create `ClientHistoryService` with identical pattern
  - [ ] Write unit tests for both services

- [ ] **Step 2: Update Purchase Form**
  - [ ] Inject `VendorHistoryService`
  - [ ] Add `vendorSuggestions: VendorHistoryItem[]` property
  - [ ] Add `showVendorDropdown: boolean` flag
  - [ ] Implement `setupVendorAutocomplete()` with `debounceTime(300)`
  - [ ] Implement `selectVendor(vendor)` method
  - [ ] Call `vendorHistory.recordVendor()` on submit
  - [ ] Update template with autocomplete dropdown

- [ ] **Step 3: Update Sale Form**
  - [ ] Apply same pattern as Purchase form
  - [ ] Use `ClientHistoryService`
  - [ ] Update template with autocomplete dropdown

- [ ] **Step 4: Styling with Tailwind CSS**
  - [ ] Style autocomplete dropdown (position, shadow, hover states)
  - [ ] Add loading spinner during search (optional)
  - [ ] Mobile-responsive dropdown width

- [ ] **Step 5: Write Tests**
  - [ ] VendorHistoryService unit tests
  - [ ] ClientHistoryService unit tests
  - [ ] Purchase form autocomplete integration test
  - [ ] Sale form autocomplete integration test

- [ ] **Step 6: E2E Tests**
  - [ ] Vendor autocomplete Cypress test
  - [ ] Client autocomplete Cypress test
  - [ ] History recording test

### Phase 3: Full Vendor/Client CRUD (Future)

- [ ] **Step 1: Create Domain Models**
  - [ ] Create `vendor.model.ts` with full entity
  - [ ] Create `client.model.ts` with full entity
  - [ ] Update `purchase.model.ts` to require `vendorId`
  - [ ] Update `sale.model.ts` to require `customerId`

- [ ] **Step 2: Add API Methods**
  - [ ] Add Vendor CRUD to MockApiService
  - [ ] Add Client CRUD to MockApiService
  - [ ] Add seed data for vendors and clients

- [ ] **Step 3: Create Feature Modules**
  - [ ] Vendor module (store, list, create, edit, routes)
  - [ ] Client module (store, list, create, edit, routes)
  - [ ] Add routes to main `app.routes.ts`

- [ ] **Step 4: Update Purchase/Sale Forms**
  - [ ] Replace text inputs with searchable dropdown
  - [ ] Load vendors/clients from store
  - [ ] Add "Create New" modal/side panel
  - [ ] Update form validation

- [ ] **Step 5: Data Migration**
  - [ ] Write migration script for existing data
  - [ ] Deduplicate vendors/clients by email
  - [ ] Link existing purchases/sales to vendors/clients

- [ ] **Step 6: Testing**
  - [ ] Full test suite for Vendor module
  - [ ] Full test suite for Client module
  - [ ] Integration tests for updated Purchase/Sale forms
  - [ ] E2E tests for full workflow

---

## 6. Architecture Decisions Record (ADR)

### ADR-001: Multi-Tenancy Filtering in StoreBase

**Status**: Approved
**Date**: 2025-12-02
**Context**: Stores need to filter data by companyId. Three options considered.
**Decision**: Option B - Add protected method in StoreBase
**Consequences**:
- Single implementation point
- Easy to test and maintain
- Consistent behavior across all stores
- Minor coupling between StoreBase and multi-tenancy services

### ADR-002: Auto-Reload on Company Switch

**Status**: Approved
**Date**: 2025-12-02
**Context**: Stores need to reload when admin switches company.
**Decision**: Opt-in auto-reload via `reloadOnCompanyChange()` in store constructor
**Consequences**:
- Stores choose if they need auto-reload
- Components remain simple (no reload logic)
- Potential minor overhead if component not active
- Memory leaks prevented by StoreBase lifecycle management

### ADR-003: Vendor/Client Architecture - Phase 1

**Status**: Approved
**Date**: 2025-12-02
**Context**: Need vendor/client functionality. Full CRUD vs inline with autocomplete.
**Decision**: Hybrid approach - Start with enhanced inline (Phase 1), evolve to full CRUD (Phase 3)
**Consequences**:
- Faster time to market
- Lower implementation complexity
- Easy migration path to full CRUD
- Some data quality concerns (duplicates)
- No foreign key constraints

### ADR-004: Testing Strategy for Multi-Tenancy

**Status**: Approved
**Date**: 2025-12-02
**Context**: Need comprehensive testing for multi-tenancy features.
**Decision**: Three-tier testing: Unit (StoreBase + Stores), Integration (Components), E2E (Cypress)
**Consequences**:
- High confidence in multi-tenancy correctness
- Tests serve as documentation
- Requires time investment upfront
- Prevents regressions during future changes

---

## 7. File Structure Summary

```
src/app/
├── core/
│   └── services/
│       ├── store-base.service.ts              [MODIFY - Add multi-tenancy methods]
│       ├── store-base.service.spec.ts         [CREATE - Unit tests]
│       ├── company-context.service.ts         [NO CHANGE]
│       ├── permission.service.ts              [NO CHANGE]
│       └── mock-api.service.ts                [NO CHANGE for Phase 1]
│
├── shared/
│   ├── models/
│   │   ├── vendor.model.ts                    [CREATE - Phase 3 only]
│   │   ├── client.model.ts                    [CREATE - Phase 3 only]
│   │   ├── sale.model.ts                      [NO CHANGE Phase 1, MODIFY Phase 3]
│   │   └── purchase.model.ts                  [NO CHANGE Phase 1, MODIFY Phase 3]
│   │
│   └── services/
│       ├── vendor-history.service.ts          [CREATE - Phase 2]
│       ├── vendor-history.service.spec.ts     [CREATE - Phase 2]
│       ├── client-history.service.ts          [CREATE - Phase 2]
│       └── client-history.service.spec.ts     [CREATE - Phase 2]
│
├── features/
│   ├── products/
│   │   └── services/
│   │       ├── products.store.ts              [MODIFY - Add companyId filtering]
│   │       └── products.store.spec.ts         [MODIFY - Add multi-tenancy tests]
│   │
│   ├── sales/
│   │   ├── services/
│   │   │   ├── sales.store.ts                 [MODIFY - Add companyId filtering]
│   │   │   └── sales.store.spec.ts            [MODIFY - Add multi-tenancy tests]
│   │   │
│   │   ├── sale-create/
│   │   │   ├── sale-create.component.ts       [MODIFY - Phase 2: Add autocomplete]
│   │   │   └── sale-create.component.html     [MODIFY - Phase 2: Add dropdown]
│   │   │
│   │   └── sale-edit/
│   │       ├── sale-edit.component.ts         [MODIFY - Phase 2: Add autocomplete]
│   │       └── sale-edit.component.html       [MODIFY - Phase 2: Add dropdown]
│   │
│   ├── purchases/
│   │   ├── services/
│   │   │   ├── purchases.store.ts             [MODIFY - Add companyId filtering]
│   │   │   └── purchases.store.spec.ts        [MODIFY - Add multi-tenancy tests]
│   │   │
│   │   ├── purchase-create/
│   │   │   ├── purchase-create.component.ts   [MODIFY - Phase 2: Add autocomplete]
│   │   │   └── purchase-create.component.html [MODIFY - Phase 2: Add dropdown]
│   │   │
│   │   └── purchase-edit/
│   │       ├── purchase-edit.component.ts     [MODIFY - Phase 2: Add autocomplete]
│   │       └── purchase-edit.component.html   [MODIFY - Phase 2: Add dropdown]
│   │
│   ├── inventory/
│   │   └── services/
│   │       ├── inventory.store.ts             [MODIFY - Add companyId filtering]
│   │       └── inventory.store.spec.ts        [MODIFY - Add multi-tenancy tests]
│   │
│   ├── users/
│   │   └── services/
│   │       ├── users.store.ts                 [MODIFY - Add companyId filtering]
│   │       └── users.store.spec.ts            [MODIFY - Add multi-tenancy tests]
│   │
│   ├── dashboard/
│   │   ├── services/
│   │   │   └── dashboard.store.ts             [REVIEW - May need manual reload]
│   │   │
│   │   └── dashboard.component.ts             [MODIFY - Add company change listener]
│   │
│   ├── vendors/                               [CREATE - Phase 3 only]
│   │   ├── services/
│   │   │   └── vendors.store.ts
│   │   ├── vendor-list/
│   │   ├── vendor-create/
│   │   ├── vendor-edit/
│   │   └── vendors.routes.ts
│   │
│   └── clients/                               [CREATE - Phase 3 only]
│       ├── services/
│       │   └── clients.store.ts
│       ├── client-list/
│       ├── client-create/
│       ├── client-edit/
│       └── clients.routes.ts
│
└── app.routes.ts                              [MODIFY - Phase 3: Add vendor/client routes]

cypress/
└── e2e/
    ├── multi-tenancy.cy.ts                    [CREATE - Phase 1]
    ├── vendor-autocomplete.cy.ts              [CREATE - Phase 2]
    └── vendor-crud.cy.ts                      [CREATE - Phase 3]
```

---

## 8. Key Technical Notes

### RxJS Operators Required

**Phase 1 (Multi-Tenancy)**:
- `skip(1)` - Skip initial emission in `reloadOnCompanyChange()`
- `distinctUntilChanged()` - Prevent reload on same company
- `tap()` - Side effects in store methods
- `catchError()` - Error handling
- `takeUntil()` - Component cleanup

**Phase 2 (Autocomplete)**:
- `debounceTime(300)` - Delay search during typing
- `distinctUntilChanged()` - Prevent duplicate searches
- `startWith('')` - Initial empty value for combineLatest
- `map()` - Transform and filter results
- `combineLatest()` - Combine vendors$ and search query

### Tailwind CSS Classes for Autocomplete

**Dropdown Container**:
```css
absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto
```

**Dropdown Item**:
```css
w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
```

**Selected State** (add via Angular):
```css
bg-blue-50 border-l-4 border-blue-500
```

### TypeScript Configuration

Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "esModuleInterop": true
  }
}
```

### Performance Considerations

**Store Auto-Reload**:
- Only fires when company ID changes (not name/other fields)
- Uses `distinctUntilChanged` with custom comparator
- No memory leaks - subscriptions managed by StoreBase

**Autocomplete**:
- Debounced search (300ms) prevents excessive localStorage reads
- Limits results to top 10 matches
- Uses string `.includes()` for simple fuzzy matching

**Vendor/Client History**:
- Max 50 items in localStorage
- Sorted by usage count for relevance
- Deduplication by email address (case-insensitive)

---

## 9. Migration Risks and Mitigation

### Risk 1: Existing Data Without CompanyId

**Scenario**: Old data in localStorage missing `companyId` field.

**Mitigation**:
- MockApiService seed data includes companyId for all entities
- Add migration utility in `MockApiService` constructor:
  ```typescript
  private migrateOldData(): void {
    const products = this.getFromStorage<Product>('umbrella_products');
    const defaultCompanyId = 'company-1';

    const migrated = products.map(p => ({
      ...p,
      companyId: p.companyId || defaultCompanyId
    }));

    this.saveToStorage('umbrella_products', migrated);
  }
  ```

### Risk 2: Component Subscriptions Not Cleaned Up

**Scenario**: Manual subscriptions in components leak memory on company switch.

**Mitigation**:
- Use `async` pipe wherever possible (auto-cleanup)
- Use `takeUntil(destroy$)` pattern for manual subscriptions
- ESLint rule to detect missing `ngOnDestroy`

### Risk 3: Store Reload Triggers Multiple API Calls

**Scenario**: Multiple stores reload simultaneously, overwhelming API.

**Mitigation**:
- 300ms delay in MockApiService simulates rate limiting
- Real API would handle this with HTTP/2 multiplexing
- Future: Add request deduplication in HTTP interceptor

### Risk 4: Vendor/Client Autocomplete Shows Wrong Company Data

**Scenario**: Vendor history from Company A shows in Company B.

**Mitigation**:
- Store vendor/client history per company:
  ```typescript
  private STORAGE_KEY = `umbrella_vendor_history_${this.companyContext.currentCompanyId}`;
  ```
- Clear history on logout
- Future: Backend API would filter by companyId automatically

---

## 10. Future Enhancements

### 1. Optimistic UI Updates

Update stores to optimistically update state before API call:

```typescript
createProduct(product: Partial<Product>): void {
  const tempId = `temp-${Date.now()}`;
  const optimisticProduct = { ...product, id: tempId } as Product;

  // Optimistic update
  this.patchState({
    products: [...this.currentState.products, optimisticProduct]
  });

  this.mockApi.createProduct(product as any).pipe(
    tap(newProduct => {
      // Replace temp with real product
      const products = this.currentState.products.map(p =>
        p.id === tempId ? newProduct : p
      );
      this.patchState({ products, loading: false });
    }),
    catchError(err => {
      // Rollback optimistic update
      const products = this.currentState.products.filter(p => p.id !== tempId);
      this.patchState({ products, error: err.message });
      throw err;
    })
  ).subscribe();
}
```

### 2. Real-Time Sync with WebSockets

Add WebSocket subscription in stores for real-time updates:

```typescript
constructor() {
  super({ products: [], loading: false, error: null });

  this.setupRealtimeSync();
}

private setupRealtimeSync(): void {
  this.websocketService.on('product:created')
    .pipe(
      filter(product => product.companyId === this.getCompanyIdForFiltering())
    )
    .subscribe(product => {
      const products = [...this.currentState.products, product];
      this.patchState({ products });
    });
}
```

### 3. Advanced Vendor/Client Search

Implement fuzzy search with ranking:

```typescript
searchVendors(query: string): VendorHistoryItem[] {
  if (!query || query.length < 2) return [];

  const history = this.getHistory();
  const lowerQuery = query.toLowerCase();

  return history
    .map(vendor => ({
      vendor,
      score: this.calculateMatchScore(vendor, lowerQuery)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(item => item.vendor);
}

private calculateMatchScore(vendor: VendorHistoryItem, query: string): number {
  let score = 0;

  // Exact name match
  if (vendor.name.toLowerCase() === query) score += 100;
  // Name starts with query
  else if (vendor.name.toLowerCase().startsWith(query)) score += 50;
  // Name contains query
  else if (vendor.name.toLowerCase().includes(query)) score += 25;

  // Email match
  if (vendor.email.toLowerCase().includes(query)) score += 10;

  // Boost by usage count
  score += Math.min(vendor.usageCount, 20);

  return score;
}
```

### 4. Vendor/Client Import from CSV

Add bulk import feature:

```typescript
@Component({ ... })
export class VendorImportComponent {
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.parseCSV(file).pipe(
      switchMap(vendors => this.vendorsStore.bulkCreate(vendors))
    ).subscribe({
      next: () => this.showSuccess('Vendors imported successfully'),
      error: (err) => this.showError(err.message)
    });
  }

  private parseCSV(file: File): Observable<CreateVendorDto[]> {
    // Implementation using Papa Parse or similar library
  }
}
```

---

## 11. FAQ and Troubleshooting

### Q1: Why not use Angular Signals for multi-tenancy?

**Answer**: Project uses RxJS BehaviorSubject stores (per CLAUDE.md). Signals are not used for state management. The `companyContext$` Observable integrates seamlessly with existing RxJS patterns.

### Q2: Should we filter on the backend or frontend?

**Answer**: Both. MockApiService filters by `companyId` parameter (simulating backend). Stores pass the correct companyId. In production, the real backend API would enforce multi-tenancy at the database query level.

### Q3: What if user opens multiple browser tabs with different companies?

**Answer**: CompanyContextService uses localStorage with a single key. All tabs share the same company context. Future enhancement: Use BroadcastChannel API to sync across tabs.

### Q4: How do we handle company-specific permissions?

**Answer**: Current PermissionService checks user role + permissions. Future: Add company-level permission overrides in Company.settings.

### Q5: Why not use NgRx for state management?

**Answer**: Project explicitly avoids NgRx (per CLAUDE.md). Custom RxJS stores with StoreBase provide a lighter-weight alternative with sufficient functionality for this application's needs.

### Q6: How to test stores that use `inject()`?

**Answer**: Use TestBed.configureTestingModule with provider overrides:

```typescript
TestBed.configureTestingModule({
  providers: [
    MyStore,
    { provide: CompanyContextService, useValue: mockCompanyContext },
    { provide: PermissionService, useValue: mockPermissions }
  ]
});
```

### Q7: What if MockApiService doesn't have `companyId` parameter?

**Answer**: Per analysis, MockApiService already has `companyId?` parameter in relevant methods:
- `getProducts(companyId?: string)`
- `getSales(companyId?: string)`
- `getPurchases(companyId?: string)`

If missing for other entities, add it following the same pattern.

---

## 12. Success Criteria

**Phase 1 Success Criteria** (Multi-Tenancy Store Filtering):
- [ ] Manager users see only their company's data
- [ ] Admin users see all companies' data
- [ ] Company switch triggers automatic data reload
- [ ] All 7 stores use `getCompanyIdForFiltering()`
- [ ] Zero memory leaks during company switching
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass

**Phase 2 Success Criteria** (Vendor/Client Autocomplete):
- [ ] Typing in vendor/client name shows suggestions within 300ms
- [ ] Selecting suggestion populates all related fields
- [ ] Vendor/client recorded to history after purchase/sale creation
- [ ] History limited to 50 items per company
- [ ] Autocomplete dropdown styled with Tailwind CSS
- [ ] Mobile-responsive autocomplete
- [ ] Unit tests for history services pass
- [ ] E2E autocomplete tests pass

**Phase 3 Success Criteria** (Full CRUD):
- [ ] Vendor and Client entities exist with companyId
- [ ] Full CRUD UI for vendors and clients
- [ ] Purchase/Sale forms use vendor/client dropdowns
- [ ] Existing data migrated successfully (no data loss)
- [ ] Foreign key relationships enforced (vendorId, customerId)
- [ ] Vendor/Client reports available
- [ ] All tests updated and passing

---

## Conclusion

This implementation plan provides a comprehensive, phased approach to:

1. **Multi-Tenancy Store Filtering**: Centralized in StoreBase using Option B pattern
2. **Reactive Company Switching**: Automatic store reload with opt-in design
3. **Vendor/Client Architecture**: Hybrid approach starting simple, evolving to full CRUD
4. **Testing Strategy**: Three-tier testing (unit, integration, e2e)

**Recommended Implementation Order**:
1. **Sprint 1**: Phase 1 (Multi-Tenancy Store Filtering) - Critical bug fix
2. **Sprint 2**: Phase 2 (Vendor/Client Autocomplete) - UX enhancement
3. **Sprint 3+**: Phase 3 (Full CRUD) - Feature expansion based on user feedback

**Key Architectural Decisions**:
- Use StoreBase protected methods for DRY multi-tenancy logic
- Opt-in auto-reload prevents unnecessary API calls
- Start with enhanced inline fields, evolve to full entities
- Comprehensive testing at all levels

This plan follows Angular 20 best practices, Clean Architecture principles, and RxJS reactive patterns while maintaining simplicity and testability.

---

**Document Version**: 1.0
**Last Updated**: 2025-12-02
**Author**:
**Review Status**: Ready for Implementation
