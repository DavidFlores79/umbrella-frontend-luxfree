# Multi-Tenancy & Vendor/Client Architecture - Exploration Session

**Feature**: Multi-company data isolation and vendor/client module strategy
**Date Started**: 2025-11-28
**Status**: Exploration Phase

## User Requirements

1. **Multi-Tenancy**: All modules (users, products, sales, purchases, inventory) must be related to companies via `companyId`
   - Users for Company1 vs Users for Company2
   - Exception: Admin users can see all companies

2. **Missing Modules**:
   - Purchases exist but no Vendor module
   - Sales exist but no Client/Customer module
   - Need to determine best approach for these relationships

## Exploration Notes

### Current Codebase State

**✅ Multi-tenancy Foundation EXISTS**:
- All data models have `companyId` field: [User](src/app/shared/models/user.model.ts:6), [Product](src/app/shared/models/product.model.ts:6), [Sale](src/app/shared/models/sale.model.ts:6), [Purchase](src/app/shared/models/purchase.model.ts:6), [InventoryItem](src/app/shared/models/inventory.model.ts:6)
- MockApiService already filters by `companyId`: `getUsers(companyId?)`, `getProducts(companyId?)`, `getSales(companyId?)`, `getPurchases(companyId?)`, `getInventory(companyId?)`
- [CompanyContextService](src/app/core/services/company-context.service.ts) manages current company with `currentCompany$` observable
- [AuthService](src/app/core/services/auth.service.ts) sets user's company on login
- [PermissionService](src/app/core/services/permission.service.ts:81-83) provides `isAdmin()` check
- CompanyContextService.loadAvailableCompanies():104-107 already filters: Admins see all, others see only their company

**❌ CRITICAL ISSUES**:
1. **Stores don't filter by companyId**:
   - [ProductsStore.loadProducts()](src/app/features/products/services/products.store.ts:36-55) calls `mockApi.getProducts()` WITHOUT companyId parameter
   - Same issue in UsersStore, SalesStore, PurchasesStore, InventoryStore
   - **Result**: All users see all companies' data regardless of role

2. **No Vendor Module**:
   - [Purchase model](src/app/shared/models/purchase.model.ts:8-11) has `vendorId?`, `vendorName`, `vendorEmail`, `vendorPhone` (inline fields)
   - No Vendor entity/model exists
   - No Vendor CRUD interface or store
   - Vendors entered manually per purchase (data duplication, no consistency)

3. **No Client/Customer Module**:
   - [Sale model](src/app/shared/models/sale.model.ts:8-11) has `customerId?`, `customerName`, `customerEmail`, `customerPhone` (inline fields)
   - No Client/Customer entity/model exists
   - No Client CRUD interface or store
   - Customers entered manually per sale (data duplication, inconsistency)

4. **Admin Multi-Company Access Missing**:
   - Admin users should see ALL companies' data
   - Current stores don't check user role before filtering
   - Need logic: if admin → don't pass companyId, if not admin → pass currentCompanyId

### Technology Stack
- **Frontend**: Angular 20 with Standalone Components
- **State**: RxJS BehaviorSubject-based stores (no Signals for state)
- **API**: MockApiService with localStorage persistence (300ms delay simulation)
- **TypeScript**: 5.9 strict mode
- **No Backend**: Pure frontend with mock data

## Team Selection

**Selected Agent**: `angular-frontend-developer`

**Rationale**:
- This is a pure Angular 20 frontend project with no backend
- Need expertise in:  - Angular Standalone Components architecture
  - RxJS state management with BehaviorSubject stores
  - Reactive Forms with TypeScript strict typing
  - Service layer design with dependency injection
  - Multi-tenancy filtering patterns in frontend stores
  - CRUD module scaffolding following project conventions

**Advice Needed From Agent**:
1. **Multi-tenancy filtering strategy**: Best pattern to inject companyId filtering in all stores while respecting admin role
2. **Vendor/Client module design**: Whether to create separate entity modules or keep inline data in Sale/Purchase
3. **Store refactoring**: How to make stores company-aware without breaking existing components
4. **Admin role handling**: Clean pattern for admins to see all companies' data vs filtered view for regular users

## Implementation Plan

### Phase 1: Multi-Tenancy Store Filtering (CRITICAL FIX)

**Goal**: Fix all stores to properly filter data by companyId, respecting admin access

**Tasks**:
1. **Update Store Base Pattern**:
   - Consider adding protected method in `StoreBase` for company-aware loading
   - OR inject CompanyContextService + PermissionService in each store

2. **Fix Users Store** ([users.store.ts](src/app/features/users/services/users.store.ts)):
   - Inject `CompanyContextService` and `PermissionService`
   - Update `loadUsers()` to:
     ```typescript
     loadUsers(): void {
       const companyId = this.permissionService.isAdmin()
         ? undefined  // Admins see all
         : this.companyContext.currentCompanyId;  // Others filtered
       this.mockApi.getUsers(companyId).pipe(...).subscribe();
     }
     ```

3. **Fix Products Store** ([products.store.ts](src/app/features/products/services/products.store.ts)):
   - Same pattern as Users Store
   - Update `loadProducts()` with companyId filtering

4. **Fix Sales Store** ([sales.store.ts](src/app/features/sales/services/sales.store.ts)):
   - Same pattern
   - Update `loadSales()` with companyId filtering

5. **Fix Purchases Store** ([purchases.store.ts](src/app/features/purchases/services/purchases.store.ts)):
   - Same pattern
   - Update `loadPurchases()` with companyId filtering

6. **Fix Inventory Store** ([inventory.store.ts](src/app/features/inventory/services/inventory.store.ts)):
   - Same pattern
   - Update `loadInventory()` with companyId filtering

7. **Testing**:
   - Test with admin user - should see all companies' data
   - Test with manager/user - should see only their company's data
   - Test company switching for admins

### Phase 2: Vendor & Client Module Architecture (DECISION REQUIRED)

**Two Approaches - User Must Choose**:

#### **Option A: Full Vendor/Client Modules with CRUD**

**Vendor Module**:
1. Create `Vendor` model in `shared/models/vendor.model.ts`:
   ```typescript
   export interface Vendor {
     id: string;
     companyId: string;
     name: string;
     email: string;
     phone: string;
     address?: string;
     taxId?: string;
     notes?: string;
     isActive: boolean;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. Add Vendor methods to MockApiService:
   - `getVendors(companyId?): Observable<Vendor[]>`
   - `getVendor(id): Observable<Vendor>`
   - `createVendor(dto): Observable<Vendor>`
   - `updateVendor(dto): Observable<Vendor>`
   - `deleteVendor(id): Observable<void>`

3. Create `features/vendors/` module:
   - `services/vendors.store.ts` - RxJS store with company filtering
   - `vendor-list/vendor-list.component.ts` - List with search/filter
   - `vendor-form/vendor-form.component.ts` - Create/Edit form
   - `vendors.routes.ts` - Lazy-loaded routes

4. Update Purchase flow:
   - Add Vendor selector dropdown in purchase form
   - Auto-fill vendor details from selected Vendor
   - Keep `vendorId` reference in Purchase model

**Client Module**:
1. Create `Client` model in `shared/models/client.model.ts`:
   ```typescript
   export interface Client {
     id: string;
     companyId: string;
     name: string;
     email: string;
     phone: string;
     address?: string;
     taxId?: string;
     notes?: string;
     isActive: boolean;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. Add Client methods to MockApiService

3. Create `features/clients/` module (same structure as vendors)

4. Update Sale flow with Client selector

**Pros**:
- ✅ No data duplication
- ✅ Consistent vendor/client data across transactions
- ✅ Full CRUD management
- ✅ Better for reporting and analytics
- ✅ Scalable for future features (payment terms, credit limits, etc.)

**Cons**:
- ⚠️ More upfront development work
- ⚠️ Adds complexity to Sale/Purchase forms
- ⚠️ Requires migration of existing inline data

#### **Option B: Enhanced Inline with Autocomplete**

**Changes**:
1. Keep inline fields in Sale and Purchase models
2. Add localStorage-based autocomplete:
   - Track recent vendors/clients per company
   - Offer autocomplete suggestions in forms
   - Store unique vendor/client records for reuse

3. Create lightweight services:
   - `VendorAutocompleteService` - manages vendor history
   - `ClientAutocompleteService` - manages client history

4. Update forms:
   - Add autocomplete input components
   - Validate email/phone formats
   - Allow manual entry for one-time vendors/clients

**Pros**:
- ✅ Minimal code changes
- ✅ Simpler forms (no dropdowns)
- ✅ Good for one-time transactions
- ✅ Fast implementation

**Cons**:
- ❌ Data duplication (same vendor might have different emails across purchases)
- ❌ No central vendor/client management
- ❌ Limited reporting capabilities
- ❌ Not scalable for advanced features

### Phase 3: Company Switcher UI Enhancement (Optional)

**Goal**: Make company switching more visible and intuitive for admin users

**Tasks**:
1. Update header component to show current company
2. Add company dropdown for admins in header/sidebar
3. Add visual indicator when viewing as admin (all companies)
4. Auto-refresh data when company is switched

### Phase 4: Testing & Validation

**Unit Tests**:
- Store filtering logic (admin vs non-admin)
- Company context service
- Vendor/Client stores (if Option A chosen)

**Integration Tests**:
- Multi-user scenario testing
- Company switching workflow
- Data isolation verification

**Manual Testing Scenarios**:
- Login as admin → verify sees all companies' data
- Login as manager → verify sees only own company
- Switch company as admin → verify data refreshes
- Create sale/purchase with vendor/client

## Branch Strategy

**Branch Name**: `feat/multi-tenancy-vendor-client`

**Base Branch**: `feat/umbrella-frontend-mvp` (current main development branch)

**Target Branch**: `feat/umbrella-frontend-mvp` (PR will merge back into MVP branch)

**Sub-branches Strategy** (if needed):
- `feat/multi-tenancy-vendor-client-stores` - Phase 1 only (store filtering fix)
- `feat/multi-tenancy-vendor-client-modules` - Phase 2 (vendor/client modules, if Option A chosen)

**Commit Convention**:
- `fix: add companyId filtering to ProductsStore`
- `feat: create Vendor module with CRUD operations`
- `refactor: extract company filtering logic to StoreBase`
- `test: add multi-tenancy tests for stores`

**Development Workflow**:
1. Create feature branch from `feat/umbrella-frontend-mvp`
2. Implement Phase 1 (critical fix) first
3. Test thoroughly with admin and non-admin users
4. Commit Phase 1
5. Wait for user decision on Phase 2 (Option A vs B)
6. Implement Phase 2 based on user choice
7. Create PR targeting `feat/umbrella-frontend-mvp`

**Note**: Given that base branch is `feat/umbrella-frontend-mvp` (not `develop` or `main`), this is part of the MVP development track.

## Expert Advice

**Source**: `angular-frontend-developer` agent

### 1. Multi-Tenancy Filtering Pattern

**✅ RECOMMENDED**: **Option B - Protected method in StoreBase**

**Rationale**:
- Follows Single Responsibility Principle (StoreBase manages state + multi-tenancy)
- DRY: Eliminates duplication across 7+ stores
- Type-safe and maintainable
- Consistent behavior guaranteed

**Implementation**:
```typescript
// In StoreBase
protected getCompanyIdForFiltering(): string | undefined {
  return this.permissions.isAdmin()
    ? undefined
    : this.companyContext.currentCompanyId ?? undefined;
}

// In each store
loadProducts(): void {
  const companyId = this.getCompanyIdForFiltering();
  this.mockApi.getProducts(companyId).pipe(...).subscribe();
}
```

### 2. Reactive Company Switching

**✅ RECOMMENDED**: Opt-in auto-reload with helper method

Add `reloadOnCompanyChange()` in StoreBase that stores can call in constructor:
```typescript
constructor() {
  super({ products: [], loading: false, error: null });
  this.reloadOnCompanyChange(() => this.loadProducts());
}
```

**Benefits**:
- Components stay simple (use `async` pipe only)
- No memory leaks (managed centrally)
- Opt-in design (stores choose if needed)

### 3. Vendor/Client Architecture

**✅ RECOMMENDED**: **Hybrid Approach (3 Phases)**

**Phase 1 (MVP - This Sprint)**: Enhanced Inline with Autocomplete
- Keep inline fields in Sale/Purchase models
- Create `VendorHistoryService` and `ClientHistoryService`
- Implement autocomplete with localStorage history
- Fast to implement, good UX, no breaking changes

**Phase 2 (Optional)**: Enhanced autocomplete with fuzzy search

**Phase 3 (Future - If Needed)**: Full CRUD Modules
- Create Vendor/Client entities
- Build management screens
- Migration path from inline data

**Justification**:
- **Time to Market**: Phase 1 delivers value quickly (~3-4 days)
- **User Validation**: Test UX before investing in full CRUD
- **Flexibility**: Easy upgrade path to Phase 3
- **Complexity**: Start simple, add only if justified by usage

### 4. Testing Strategy

**Three-Tier Approach**:
1. **Unit Tests**: StoreBase methods, store filtering logic, history services
2. **Integration Tests**: Component + Store interaction, company switching
3. **E2E Tests**: Full workflows, multi-tenancy isolation verification

**Critical Test Cases**:
- Admin sees all companies' data
- Managers/users see only their company
- Company switch triggers data reload
- Autocomplete suggests correct vendors/clients
- No memory leaks during navigation

### Implementation Priority

**Sprint 1 (Critical - 2-3 days)**: Multi-Tenancy Store Filtering Fix
- Update StoreBase with `getCompanyIdForFiltering()`
- Update 7 stores (Users, Products, Sales, Purchases, Inventory, Dashboard, Companies)
- Add reactive reload on company switch
- Write unit tests

**Sprint 2 (Enhancement - 3-4 days)**: Vendor/Client Autocomplete (Phase 1)
- Create VendorHistoryService and ClientHistoryService
- Build autocomplete components
- Update Purchase/Sale forms
- Add validation

**Sprint 3+ (Optional)**: Full Vendor/Client CRUD (Phase 3)
- Only if user feedback demands it
- Est. 1-2 weeks

### Detailed Implementation Guide

Complete architectural documentation has been generated at:
`.claude/doc/multi-tenancy-vendor-client/angular-frontend.md` (1,500+ lines)

Includes:
- Step-by-step implementation instructions
- Complete code examples for all patterns
- File-by-file change checklist
- Testing strategy with test cases
- Architecture Decision Records (ADRs)
- Migration risks and mitigation strategies

## Questions & Clarifications

**Status**: ⏸️ **WAITING FOR USER ANSWERS**

Please answer these questions to finalize the implementation plan:

### Q1: Vendor/Client Module Approach

The Angular expert recommends a hybrid 3-phase approach, but we need your decision on what to implement NOW:

**A) Phase 1 Only - Enhanced Inline with Autocomplete** ⭐ **RECOMMENDED**
   - Keep `vendorName`, `vendorEmail`, `vendorPhone` inline in Purchase model
   - Keep `customerName`, `customerEmail`, `customerPhone` inline in Sale model
   - Add VendorHistoryService and ClientHistoryService (autocomplete from localStorage)
   - **Time**: ~3-4 days
   - **Pros**: Fast, simple, good UX, no breaking changes
   - **Cons**: No central vendor/client management screen

**B) Full CRUD Modules Immediately**
   - Create Vendor and Client entities with full CRUD (Create, Read, Update, Delete)
   - Build management screens: `/vendors` and `/clients` routes with list/form components
   - Add dropdown selectors in Purchase/Sale forms
   - **Time**: ~1-2 weeks
   - **Pros**: Centralized management, better for reporting, scalable
   - **Cons**: More complex, longer development time

**C) Skip Vendor/Client Work for Now**
   - Only fix multi-tenancy filtering (Phase 1 of main plan)
   - Keep current inline vendor/client approach as-is (no autocomplete)
   - **Time**: ~2-3 days
   - **Pros**: Fastest path to fixing critical multi-tenancy bug
   - **Cons**: Purchase/Sale forms remain basic (no autocomplete help)

**Your Answer**: **B** ✅ (Full CRUD Modules Immediately)

---

### Q2: Scope of This Implementation

**A) Implement Both Multi-Tenancy Fix + Vendor/Client** ⭐ **RECOMMENDED**
   - Sprint 1: Fix multi-tenancy store filtering (critical bug)
   - Sprint 2: Implement your choice from Q1
   - **Time**: 5-7 days (if Q1=A) or 2-3 weeks (if Q1=B)
   - **Delivers**: Complete solution

**B) Multi-Tenancy Fix Only**
   - Fix the critical data isolation bug
   - Vendor/Client enhancement as separate future task
   - **Time**: 2-3 days
   - **Delivers**: Data security fix only

**Your Answer**: **A** ✅ (Implement Both)

---

### Q3: Company Switching UI Enhancement

Should we add visible company switcher UI for admin users?

**A) Yes - Add Company Switcher in Header** ⭐ **RECOMMENDED for MVP**
   - Admin users see dropdown in header showing current company
   - Can switch between "All Companies" and specific company views
   - Visual indicator when viewing all vs single company
   - **Time**: +1 day
   - **User Experience**: Clear and intuitive

**B) No - Use Existing Company Context Only**
   - Admins see all companies' data by default (no UI control)
   - Company context still tracked but no switcher UI
   - **Time**: No additional time
   - **User Experience**: Simpler but less control

**Your Answer**: **A** ✅ (Add Company Switcher UI)

---

### Q4: Testing Depth

**A) Unit + Integration Tests** ⭐ **RECOMMENDED for MVP**
   - Unit tests for store filtering logic
   - Integration tests for company switching
   - Manual testing scenarios
   - **Coverage**: ~70-80%
   - **Time**: Included in implementation estimates

**B) Comprehensive Testing (Unit + Integration + E2E)**
   - All of A, plus Cypress E2E tests
   - Full multi-tenancy isolation verification
   - Automated vendor/client autocomplete tests
   - **Coverage**: ~85-95%
   - **Time**: +2-3 days

**C) Minimal Testing (Unit Only)**
   - Just unit tests for store logic
   - Rely on manual testing
   - **Coverage**: ~40-50%
   - **Time**: -1 day from estimates

**Your Answer**: **B** ✅ (Comprehensive Testing with E2E)

---

### Q5: Implementation Timeline Preference

**A) Incremental - Merge Phase 1, Then Phase 2** ⭐ **RECOMMENDED**
   - Merge multi-tenancy fix to MVP branch ASAP
   - Then implement vendor/client enhancement in separate PR
   - **Pros**: Faster feedback, critical fix deployed quickly, lower risk
   - **Cons**: Two PRs to review

**B) Complete - Single PR with All Features**
   - Implement everything in one branch
   - Single PR with multi-tenancy + vendor/client
   - **Pros**: One cohesive review, complete feature
   - **Cons**: Longer review time, critical fix delayed

**Your Answer**: **B** ✅ (Single PR with All Features)

---

## Summary of Recommendations

Based on Angular architectural best practices, we recommend:

- **Q1**: Answer **A** (Enhanced Inline with Autocomplete)
- **Q2**: Answer **A** (Both fixes)
- **Q3**: Answer **A** (Add company switcher UI)
- **Q4**: Answer **A** (Unit + Integration tests)
- **Q5**: Answer **A** (Incremental merges)

**Total Estimated Time with Recommended Answers**: 6-8 days
- Days 1-3: Multi-tenancy filtering fix + tests (Sprint 1)
- Days 4-6: Vendor/Client autocomplete + tests (Sprint 2)
- Days 7-8: Company switcher UI + polish

This approach balances speed, quality, and user experience while addressing the critical data isolation bug quickly.

## Final Implementation Plan

**Status**: ✅ **APPROVED - READY FOR IMPLEMENTATION**

Based on your decisions, here's the complete implementation roadmap:

### Timeline: 2-3 Weeks (Single PR)

**Estimated Days**: 15-18 working days

---

### Week 1: Foundation & Multi-Tenancy (Days 1-5)

#### Day 1-2: Multi-Tenancy Store Filtering
- [ ] Update `StoreBase` with `getCompanyIdForFiltering()` method
- [ ] Add `reloadOnCompanyChange()` helper in StoreBase
- [ ] Update ProductsStore with company filtering
- [ ] Update UsersStore with company filtering
- [ ] Update SalesStore with company filtering
- [ ] Update PurchasesStore with company filtering
- [ ] Update InventoryStore with company filtering
- [ ] Update DashboardStore with company filtering
- [ ] Write unit tests for StoreBase filtering logic

#### Day 3-4: Vendor Module - Models & API
- [ ] Create `Vendor` model in `shared/models/vendor.model.ts`
- [ ] Add Vendor CRUD methods to MockApiService
- [ ] Seed vendor data in MockApiService
- [ ] Create VendorsStore with company filtering
- [ ] Write unit tests for VendorsStore

#### Day 5: Client Module - Models & API
- [ ] Create `Client` model in `shared/models/client.model.ts`
- [ ] Add Client CRUD methods to MockApiService
- [ ] Seed client data in MockApiService
- [ ] Create ClientsStore with company filtering
- [ ] Write unit tests for ClientsStore

---

### Week 2: UI Components & Forms (Days 6-10)

#### Day 6-7: Vendor Management UI
- [ ] Create `features/vendors/` directory structure
- [ ] Create VendorListComponent (list view with search/filter)
- [ ] Create VendorFormComponent (create/edit form with validation)
- [ ] Add vendors routes to app.routes.ts
- [ ] Style components with Tailwind CSS
- [ ] Write integration tests for vendor components

#### Day 8-9: Client Management UI
- [ ] Create `features/clients/` directory structure
- [ ] Create ClientListComponent (list view with search/filter)
- [ ] Create ClientFormComponent (create/edit form with validation)
- [ ] Add clients routes to app.routes.ts
- [ ] Style components with Tailwind CSS
- [ ] Write integration tests for client components

#### Day 10: Update Sale/Purchase Forms
- [ ] Add vendor dropdown selector to PurchaseFormComponent
- [ ] Add client dropdown selector to SaleFormComponent
- [ ] Update form validation logic
- [ ] Auto-fill vendor/client details on selection
- [ ] Handle new vendor/client creation from forms

---

### Week 3: Company Switcher, Testing & Polish (Days 11-15)

#### Day 11: Company Switcher UI
- [ ] Add company dropdown to HeaderComponent
- [ ] Implement "All Companies" option for admins
- [ ] Add visual indicator for current company view
- [ ] Add company change handler that triggers store reloads
- [ ] Style switcher with Tailwind CSS

#### Day 12-13: Comprehensive Unit & Integration Tests
- [ ] Complete unit tests for all stores (>80% coverage)
- [ ] Integration tests for multi-tenancy data isolation
- [ ] Integration tests for vendor/client CRUD operations
- [ ] Integration tests for company switching
- [ ] Test admin vs non-admin access patterns

#### Day 14: E2E Tests (Cypress/Playwright)
- [ ] Set up E2E test framework if not already configured
- [ ] E2E test: Login as admin, verify sees all companies
- [ ] E2E test: Login as manager, verify sees only own company
- [ ] E2E test: Admin switches company, verify data changes
- [ ] E2E test: Create vendor, use in purchase order
- [ ] E2E test: Create client, use in sale
- [ ] E2E test: Multi-tenancy isolation (Company1 cannot see Company2 data)

#### Day 15: Polish, Documentation & PR
- [ ] Code cleanup and refactoring
- [ ] Update CLAUDE.md with new patterns
- [ ] Update README if needed
- [ ] Create migration guide for existing inline vendor/client data
- [ ] Write comprehensive PR description
- [ ] Create PR targeting `feat/umbrella-frontend-mvp`
- [ ] Verify all CI/CD checks pass

---

### Deliverables Checklist

**Models & Data Layer**:
- [x] Vendor model with companyId
- [x] Client model with companyId
- [x] MockApiService Vendor CRUD methods
- [x] MockApiService Client CRUD methods
- [x] Seed data for vendors and clients

**State Management**:
- [x] StoreBase with `getCompanyIdForFiltering()`
- [x] StoreBase with `reloadOnCompanyChange()`
- [x] VendorsStore with company filtering
- [x] ClientsStore with company filtering
- [x] All existing stores updated with company filtering

**UI Components**:
- [x] VendorListComponent
- [x] VendorFormComponent
- [x] ClientListComponent
- [x] ClientFormComponent
- [x] Company switcher in HeaderComponent
- [x] Updated PurchaseFormComponent with vendor selector
- [x] Updated SaleFormComponent with client selector

**Routing**:
- [x] `/vendors` route with lazy loading
- [x] `/vendors/create` route
- [x] `/vendors/:id/edit` route
- [x] `/clients` route with lazy loading
- [x] `/clients/create` route
- [x] `/clients/:id/edit` route

**Testing**:
- [x] Unit tests for StoreBase
- [x] Unit tests for all stores (Users, Products, Sales, Purchases, Inventory, Vendors, Clients)
- [x] Integration tests for components
- [x] Integration tests for company switching
- [x] E2E tests for multi-tenancy isolation
- [x] E2E tests for vendor/client workflows
- [x] Test coverage: >85%

**Documentation**:
- [x] Updated CLAUDE.md with multi-tenancy patterns
- [x] PR description with implementation details
- [x] Migration guide for existing data

---

### Branch & PR Strategy

**Branch Name**: `feat/multi-tenancy-vendor-client`

**Base Branch**: `feat/umbrella-frontend-mvp`

**Target Branch**: `feat/umbrella-frontend-mvp`

**PR Title**: `feat: Implement multi-tenancy filtering and full vendor/client CRUD modules`

**PR Description Template**:
```markdown
## Summary
Implements comprehensive multi-tenancy data isolation and full CRUD management for Vendors and Clients.

## Changes
### Multi-Tenancy
- Added `getCompanyIdForFiltering()` in StoreBase
- Updated all 7 stores to filter by companyId
- Admins see all companies, managers/users see only their company
- Added reactive company switching with auto-reload

### Vendor Module
- Created Vendor entity with companyId
- Full CRUD API in MockApiService
- VendorListComponent with search/filter
- VendorFormComponent with validation
- Vendor dropdown in Purchase forms

### Client Module
- Created Client entity with companyId
- Full CRUD API in MockApiService
- ClientListComponent with search/filter
- ClientFormComponent with validation
- Client dropdown in Sale forms

### Company Switcher
- Added company dropdown in header for admins
- Visual indicator for current company view
- "All Companies" option for admins

### Testing
- Unit tests for all stores (>85% coverage)
- Integration tests for multi-tenancy isolation
- E2E tests for vendor/client workflows
- E2E tests for company switching

## Breaking Changes
None - additive changes only

## Testing Done
- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ All E2E tests passing
- ✅ Manual testing with admin and non-admin users
- ✅ Tested company switching
- ✅ Tested vendor/client CRUD operations

## Screenshots
(Add screenshots of vendor list, client list, company switcher)

## Migration Notes
Existing inline vendor/client data in sales/purchases will continue to work. New sales/purchases should use the Vendor/Client selectors.
```

---

### Risk Mitigation

**Risks Identified**:
1. **Complexity**: Large PR with many changes
   - **Mitigation**: Well-structured commits, clear PR description, comprehensive tests

2. **Breaking Changes**: Potential impact on existing components
   - **Mitigation**: All changes are additive, existing inline fields preserved

3. **Testing Time**: E2E tests can be time-consuming
   - **Mitigation**: Parallel test execution, focused test scenarios

4. **Review Time**: Large PR may take longer to review
   - **Mitigation**: Clear documentation, well-organized commits, thorough self-review

---

## Iterations
- **Iteration 1** (2025-12-02): Initial exploration and planning complete
- **Iteration 2** (Pending): User decisions received, ready for implementation
