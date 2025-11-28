# Phase 5: Company Management - Implementation Checklist

## Pre-Implementation Verification

- [x] Phase 1 (Foundation) completed
- [x] Phase 2 (UI Components) completed
- [x] Phase 3 (Authentication) completed
- [x] Phase 4 (Dashboard) completed
- [x] StoreBase service exists
- [x] MockApiService has company methods
- [x] Company model interfaces defined
- [x] Shared UI components available
- [x] authGuard implemented

---

## Implementation Tasks

### 1. CompaniesStore Service

**File**: `src/app/features/companies/services/companies.store.ts`

- [ ] Create file and directory structure
- [ ] Import required dependencies (StoreBase, MockApiService, RxJS operators)
- [ ] Define CompaniesState interface
- [ ] Extend StoreBase<CompaniesState>
- [ ] Inject MockApiService using inject()
- [ ] Define initial state in constructor
- [ ] Create selectors:
  - [ ] `companies$`
  - [ ] `loading$`
  - [ ] `error$`
  - [ ] `selectedCompany$`
- [ ] Implement loadCompanies() method
  - [ ] Set loading state
  - [ ] Call MockAPI
  - [ ] Update state on success
  - [ ] Handle errors
  - [ ] Subscribe (fire-and-forget)
- [ ] Implement createCompany() method
  - [ ] Set loading state
  - [ ] Map to CreateCompanyDto
  - [ ] Call MockAPI
  - [ ] Add to companies array
  - [ ] Return observable
- [ ] Implement updateCompany() method
  - [ ] Set loading state
  - [ ] Map to UpdateCompanyDto
  - [ ] Call MockAPI
  - [ ] Update company in array
  - [ ] Return observable
- [ ] Implement deleteCompany() method
  - [ ] Set loading state
  - [ ] Call MockAPI
  - [ ] Remove from companies array
  - [ ] Return observable
- [ ] Implement selectCompany() method
  - [ ] Find company by ID
  - [ ] Update selectedCompany state
- [ ] Test store in isolation

---

### 2. CompanyList Component

**Files**:
- `src/app/features/companies/company-list/company-list.component.ts`
- `src/app/features/companies/company-list/company-list.component.html`

#### TypeScript Component

- [ ] Create component file and directory
- [ ] Configure standalone component
- [ ] Import all required modules and components
- [ ] Inject dependencies (store, router) using inject()
- [ ] Define observable properties:
  - [ ] `companies$`
  - [ ] `loading$`
  - [ ] `error$`
- [ ] Define local state properties:
  - [ ] `searchTerm`
  - [ ] `filteredCompanies`
- [ ] Implement ngOnInit():
  - [ ] Call store.loadCompanies()
  - [ ] Subscribe to companies$ for filtering
- [ ] Implement onSearch() method
  - [ ] Filter by name, email, phone, city
  - [ ] Case-insensitive search
  - [ ] Update filteredCompanies
- [ ] Implement onCreateCompany() method
  - [ ] Navigate to /companies/create
- [ ] Implement onEditCompany() method
  - [ ] Navigate to /companies/edit/:id
- [ ] Implement onDeleteCompany() method
  - [ ] Show confirmation dialog
  - [ ] Call store.deleteCompany()
  - [ ] Handle success/error
- [ ] Implement onRefresh() method
  - [ ] Call store.loadCompanies()
- [ ] Add helper methods:
  - [ ] getStatusBadgeVariant()
  - [ ] formatDate() (if needed)

#### HTML Template

- [ ] Create template file
- [ ] Add MainLayout wrapper
- [ ] Add page header:
  - [ ] Title
  - [ ] Description
- [ ] Add error alert (conditional)
- [ ] Add actions bar card:
  - [ ] SearchBar component
  - [ ] Refresh button
  - [ ] Create Company button
- [ ] Add data table card:
  - [ ] Table structure (thead, tbody)
  - [ ] Loading skeleton rows
  - [ ] Data rows with *ngFor
  - [ ] Display columns:
    - [ ] Company Name
    - [ ] Email
    - [ ] Phone
    - [ ] Currency
    - [ ] Status (badge)
    - [ ] Created Date (formatted)
    - [ ] Actions (Edit/Delete buttons)
  - [ ] Empty state message
  - [ ] Hover effects on rows
- [ ] Verify responsive design classes
- [ ] Test on mobile, tablet, desktop

---

### 3. CompanyCreate/Edit Component

**Files**:
- `src/app/features/companies/company-create/company-create.component.ts`
- `src/app/features/companies/company-create/company-create.component.html`

#### TypeScript Component

- [ ] Create component file and directory
- [ ] Configure standalone component
- [ ] Import ReactiveFormsModule and all required components
- [ ] Inject dependencies (store, router, route, fb) using inject()
- [ ] Define form and state properties:
  - [ ] `companyForm!: FormGroup`
  - [ ] `isEditMode = false`
  - [ ] `companyId: string | null`
  - [ ] `loading = false`
  - [ ] `errorMessage: string | null`
  - [ ] `successMessage: string | null`
- [ ] Define select options:
  - [ ] `currencyOptions[]`
  - [ ] `statusOptions[]`
- [ ] Implement ngOnInit():
  - [ ] Create form with createForm()
  - [ ] Get ID from route params
  - [ ] Set isEditMode if ID exists
  - [ ] Call loadCompany() if edit mode
- [ ] Implement createForm() method:
  - [ ] Define form group with FormBuilder
  - [ ] Add all 13 form controls
  - [ ] Set validators (required, email, minLength)
  - [ ] Return FormGroup
- [ ] Implement loadCompany() method:
  - [ ] Call store.selectCompany()
  - [ ] Subscribe to selectedCompany$
  - [ ] Patch form values
  - [ ] Map settings.currency to currency field
  - [ ] Map isActive boolean to string
- [ ] Implement onSubmit() method:
  - [ ] Validate form (mark touched if invalid)
  - [ ] Get form values
  - [ ] Set loading state
  - [ ] Create DTO (CreateCompanyDto or UpdateCompanyDto)
  - [ ] Map currency to settings object
  - [ ] Map isActive string to boolean
  - [ ] Call appropriate store method
  - [ ] Handle success (show message, navigate)
  - [ ] Handle error (show message)
- [ ] Implement onCancel() method:
  - [ ] Navigate to /companies
- [ ] Implement getFieldError() method:
  - [ ] Check if field touched and has errors
  - [ ] Return appropriate error message
  - [ ] Return null if no error
- [ ] Implement markFormGroupTouched() helper:
  - [ ] Iterate all controls
  - [ ] Mark each as touched
- [ ] Implement getFieldLabel() helper:
  - [ ] Map field names to labels

#### HTML Template

- [ ] Create template file
- [ ] Add MainLayout wrapper
- [ ] Add page header:
  - [ ] Title (dynamic based on mode)
  - [ ] Description (dynamic based on mode)
- [ ] Add success alert (conditional)
- [ ] Add error alert (conditional)
- [ ] Add form card:
  - [ ] Form element with formGroup and ngSubmit
  - [ ] Company Information section:
    - [ ] Section header
    - [ ] Company Name input (required)
    - [ ] Email input (required)
    - [ ] Phone input (required)
    - [ ] Website input
    - [ ] Tax ID input
  - [ ] Address section:
    - [ ] Section header
    - [ ] Address input
    - [ ] City input
    - [ ] State input
    - [ ] Country input
    - [ ] Postal Code input
  - [ ] Settings section:
    - [ ] Section header
    - [ ] Currency select (required)
    - [ ] Status select (edit mode only)
  - [ ] Form actions:
    - [ ] Cancel button
    - [ ] Submit button (with loading state)
- [ ] Verify all formControlName bindings
- [ ] Verify error message displays
- [ ] Test responsive layout

---

### 4. Companies Routes

**File**: `src/app/features/companies/companies.routes.ts`

- [ ] Create routes file
- [ ] Import Routes from @angular/router
- [ ] Import authGuard
- [ ] Define COMPANIES_ROUTES array:
  - [ ] List route (path: '')
  - [ ] Create route (path: 'create')
  - [ ] Edit route (path: 'edit/:id')
- [ ] Use loadComponent for lazy loading
- [ ] Apply authGuard to all routes
- [ ] Export COMPANIES_ROUTES constant

---

### 5. App Routes Integration

**File**: `src/app/app.routes.ts` (modify existing)

- [ ] Open app.routes.ts
- [ ] Add companies route with loadChildren
- [ ] Verify route path is '/companies'
- [ ] Test navigation to companies routes

---

## Testing Tasks

### Manual Testing

- [ ] **Create Flow**:
  - [ ] Navigate to /companies/create
  - [ ] Fill required fields
  - [ ] Submit form
  - [ ] Verify company appears in list
  - [ ] Verify success message
  - [ ] Verify redirect to list

- [ ] **Edit Flow**:
  - [ ] Click Edit on a company
  - [ ] Verify form loads with data
  - [ ] Modify fields
  - [ ] Submit form
  - [ ] Verify changes in list
  - [ ] Verify success message

- [ ] **Delete Flow**:
  - [ ] Click Delete on a company
  - [ ] Verify confirmation dialog
  - [ ] Confirm deletion
  - [ ] Verify company removed from list

- [ ] **Search Flow**:
  - [ ] Enter search term
  - [ ] Verify debounced search
  - [ ] Verify filtered results
  - [ ] Clear search
  - [ ] Verify all results shown

- [ ] **Validation**:
  - [ ] Submit empty form
  - [ ] Verify required field errors
  - [ ] Submit invalid email
  - [ ] Verify email error
  - [ ] Fill valid data
  - [ ] Verify submit succeeds

- [ ] **Error Handling**:
  - [ ] Test with network offline (simulate)
  - [ ] Verify error message displays
  - [ ] Verify error is dismissible

- [ ] **Loading States**:
  - [ ] Verify skeleton loader on list load
  - [ ] Verify button loading spinner
  - [ ] Verify disabled state during loading

### Responsive Testing

- [ ] Test on mobile (< 640px)
  - [ ] Form stacks vertically
  - [ ] Table is scrollable
  - [ ] Buttons are full-width where appropriate

- [ ] Test on tablet (640px - 1024px)
  - [ ] Form uses 2-column grid
  - [ ] Table displays properly

- [ ] Test on desktop (> 1024px)
  - [ ] Full layout displays
  - [ ] All columns visible

### Dark Mode Testing

- [ ] Toggle dark mode
- [ ] Verify colors in list view
- [ ] Verify colors in form view
- [ ] Verify contrast is sufficient

### Accessibility Testing

- [ ] Tab through form
- [ ] Verify focus indicators
- [ ] Verify keyboard navigation
- [ ] Test with screen reader (optional)
- [ ] Verify all inputs have labels

---

## Build & Deployment

- [ ] Run `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Verify no template errors
- [ ] Verify no linting errors
- [ ] Check bundle size
- [ ] Test production build locally

---

## Documentation

- [ ] Update project README (if needed)
- [ ] Document any new patterns
- [ ] Add inline code comments
- [ ] Update architecture diagrams (if applicable)

---

## Code Review Checklist

### Code Quality

- [ ] No hardcoded values (use constants)
- [ ] No `any` types (use strict TypeScript)
- [ ] No manual subscriptions without cleanup
- [ ] Consistent naming conventions
- [ ] Proper error handling everywhere
- [ ] Loading states for all async operations
- [ ] User feedback for all actions

### Architecture

- [ ] Follows Clean Architecture
- [ ] Uses RxJS for state (not signals)
- [ ] Uses inject() function for DI
- [ ] Extends StoreBase properly
- [ ] Components are standalone
- [ ] Proper separation of concerns

### UI/UX

- [ ] HubSpot color scheme applied
- [ ] Responsive on all devices
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Success feedback is provided
- [ ] Confirmation for destructive actions
- [ ] Consistent styling with rest of app

### Performance

- [ ] Lazy loading implemented
- [ ] async pipe used everywhere
- [ ] No unnecessary subscriptions
- [ ] trackBy functions in lists
- [ ] Debounced search implemented

---

## Final Verification

- [ ] All CRUD operations work correctly
- [ ] No console errors
- [ ] No console warnings
- [ ] Production build succeeds
- [ ] All routes are accessible
- [ ] Authentication is enforced
- [ ] Data persists in localStorage (MockAPI)
- [ ] Phase 5 is feature complete

---

## Sign-Off

- [ ] Developer: Implementation complete
- [ ] Code Review: Passed
- [ ] Testing: All tests passed
- [ ] Documentation: Updated
- [ ] Ready for Phase 6

---

**Total Tasks**: ~120 discrete tasks
**Estimated Time**: 12-16 hours
**Difficulty**: Intermediate

**Status**: ⏳ Ready to implement

---

**Notes**:
- This checklist should be used alongside the detailed implementation plan in `angular-frontend.md`
- Mark tasks as complete as you progress through implementation
- If you encounter blockers, document them and seek assistance
- Keep git commits small and focused on individual features
- Test frequently during development, not just at the end
