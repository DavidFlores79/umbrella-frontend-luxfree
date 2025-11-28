# Phase 5: Company Management - Implementation Plan

## Overview

This document provides a detailed implementation plan for Phase 5 of the Umbrella Frontend MVP: Company Management feature. This implementation follows Clean Architecture with RxJS state management (NO Angular Signals for state), Angular 20 standalone component architecture, and HubSpot-inspired design.

**Feature**: Complete CRUD operations for company management with a list view, create/edit form, and proper state management.

---

## Prerequisites

The following components and services already exist and are ready to use:

### Core Services
- `c:\laragon\www\angular\umbrella-frontend-luxfree\src\app\core\services\store-base.service.ts` - Base class for RxJS stores
- `c:\laragon\www\angular\umbrella-frontend-luxfree\src\app\core\services\mock-api.service.ts` - Mock API with company CRUD operations
- `c:\laragon\www\angular\umbrella-frontend-luxfree\src\app\core\guards\auth.guard.ts` - Authentication guard

### Data Models
- `c:\laragon\www\angular\umbrella-frontend-luxfree\src\app\shared\models\company.model.ts` - Company interfaces and DTOs

### Shared UI Components (Phase 2 - Completed)
- `DataTable` - Table component with sorting, pagination, selection
- `SearchBar` - Search input with debouncing
- `FormInput` - Form input with ControlValueAccessor
- `FormSelect` - Select dropdown with ControlValueAccessor
- `Button` - Reusable button component
- `Card` - Card container component
- `SkeletonLoader` - Loading skeleton
- `EmptyState` - Empty state component
- `Alert` - Alert/notification component
- `MainLayout` - Main layout wrapper

---

## Architecture Overview

### Directory Structure

```
src/app/features/companies/
├── services/
│   └── companies.store.ts           # RxJS-based state store
├── company-list/
│   ├── company-list.component.ts
│   └── company-list.component.html
├── company-create/
│   ├── company-create.component.ts
│   └── company-create.component.html
└── companies.routes.ts              # Feature routing
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Component Layer                         │
│  ┌──────────────────┐           ┌────────────────────────┐  │
│  │ CompanyList      │           │ CompanyCreate/Edit     │  │
│  │ - Display list   │           │ - Form handling        │  │
│  │ - Actions        │           │ - Validation           │  │
│  └────────┬─────────┘           └──────────┬─────────────┘  │
│           │                                 │                │
└───────────┼─────────────────────────────────┼────────────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                       Store Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CompaniesStore                          │   │
│  │  State: { companies, loading, error, selected }      │   │
│  │  Methods: loadCompanies(), createCompany(), etc.     │   │
│  │  Selectors: companies$, loading$, error$            │   │
│  └────────────────────────┬─────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MockApiService                          │   │
│  │  - getCompanies()                                    │   │
│  │  - createCompany(dto)                                │   │
│  │  - updateCompany(dto)                                │   │
│  │  - deleteCompany(id)                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## File-by-File Implementation Plan

### 1. CompaniesStore Service

**File**: `src/app/features/companies/services/companies.store.ts`

**Purpose**: Centralized RxJS-based state management for company feature

**State Interface**:
```typescript
interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  selectedCompany: Company | null;
}
```

**Key Implementation Details**:

1. **Extend StoreBase**:
   ```typescript
   export class CompaniesStore extends StoreBase<CompaniesState>
   ```

2. **Initial State**:
   ```typescript
   constructor() {
     super({
       companies: [],
       loading: false,
       error: null,
       selectedCompany: null
     });
   }
   ```

3. **Dependency Injection** (use `inject()` function):
   ```typescript
   private readonly mockApi = inject(MockApiService);
   private readonly router = inject(Router);
   ```

4. **Selectors** (public readonly observables):
   ```typescript
   readonly companies$ = this.select(state => state.companies);
   readonly loading$ = this.select(state => state.loading);
   readonly error$ = this.select(state => state.error);
   readonly selectedCompany$ = this.select(state => state.selectedCompany);
   ```

5. **Methods to Implement**:

   **loadCompanies()**:
   - Set `loading: true` before API call
   - Call `this.mockApi.getCompanies()`
   - Use RxJS `tap` operator to update state
   - Use `catchError` to handle errors
   - Update state with `patchState({ companies, loading: false })`
   - On error: `patchState({ error: err.message, loading: false })`
   - Subscribe to trigger the observable

   **createCompany(company: Partial<Company>)**:
   - Return the observable (don't subscribe here)
   - Set loading state
   - Map CreateCompanyDto from input
   - Call `this.mockApi.createCompany(dto)`
   - On success: add new company to existing array
   - Use spread operator: `[...currentCompanies, newCompany]`
   - Update loading and clear error
   - Return Observable<Company>

   **updateCompany(id: string, company: Partial<Company>)**:
   - Return observable
   - Create UpdateCompanyDto with id
   - Call `this.mockApi.updateCompany(dto)`
   - On success: replace company in array using map
   - Update loading state
   - Return Observable<Company>

   **deleteCompany(id: string)**:
   - Confirm deletion (window.confirm or pass confirmation from component)
   - Return observable
   - Call `this.mockApi.deleteCompany(id)`
   - On success: filter out deleted company from array
   - Update loading state
   - Return Observable<void>

   **selectCompany(id: string)**:
   - Find company in current state by id
   - Update `selectedCompany` in state
   - Useful for edit mode

6. **Error Handling Pattern**:
   ```typescript
   .pipe(
     tap(result => {
       this.patchState({ /* success state */ });
     }),
     catchError(err => {
       this.patchState({
         error: err.message || 'An error occurred',
         loading: false
       });
       return throwError(() => err);
     })
   )
   ```

**Important Notes**:
- All methods that modify state should clear previous errors: `error: null`
- Use `patchState` to update state (not `setState`)
- Return observables from create/update/delete (let components subscribe)
- Only `loadCompanies()` should auto-subscribe (fire-and-forget pattern)
- Provider: `{ providedIn: 'root' }` for singleton instance

---

### 2. CompanyList Component

**Files**:
- `src/app/features/companies/company-list/company-list.component.ts`
- `src/app/features/companies/company-list/company-list.component.html`

**Purpose**: Display list of companies with search, filtering, and actions

**Component Class Structure**:

1. **Standalone Configuration**:
   ```typescript
   @Component({
     selector: 'app-company-list',
     standalone: true,
     imports: [
       CommonModule,
       RouterModule,        // For navigation
       MainLayout,
       DataTable,
       SearchBar,
       Button,
       Card,
       Alert,
       Badge,               // For status badges
       DateFormatPipe,      // Custom date pipe
     ],
     templateUrl: './company-list.component.html'
   })
   ```

2. **Dependency Injection** (use `inject()`):
   ```typescript
   private readonly store = inject(CompaniesStore);
   private readonly router = inject(Router);
   ```

3. **Observable Subscriptions**:
   ```typescript
   readonly companies$ = this.store.companies$;
   readonly loading$ = this.store.loading$;
   readonly error$ = this.store.error$;
   ```

4. **Local State Properties**:
   ```typescript
   searchTerm = '';
   filteredCompanies: Company[] = [];
   ```

5. **Lifecycle Hooks**:
   - `ngOnInit()`: Call `this.store.loadCompanies()`
   - Subscribe to `companies$` to populate `filteredCompanies`

6. **Table Configuration**:
   ```typescript
   columns: TableColumn<Company>[] = [
     { key: 'name', label: 'Company Name', sortable: true, align: 'left' },
     { key: 'email', label: 'Email', sortable: true, align: 'left' },
     { key: 'phone', label: 'Phone', sortable: false, align: 'left' },
     { key: 'settings.currency', label: 'Currency', sortable: false, align: 'center' },
     { key: 'isActive', label: 'Status', sortable: true, align: 'center' },
     { key: 'createdAt', label: 'Created', sortable: true, align: 'left' },
     { key: 'actions', label: 'Actions', sortable: false, align: 'right' }
   ];
   ```

7. **Methods to Implement**:

   **onSearch(term: string)**:
   - Store search term
   - Filter companies by name, email, phone, city
   - Case-insensitive search
   - Update `filteredCompanies` array

   **onCreateCompany()**:
   - Navigate to `/companies/create`
   - Use: `this.router.navigate(['/companies/create'])`

   **onEditCompany(company: Company)**:
   - Navigate to `/companies/edit/:id`
   - Use: `this.router.navigate(['/companies/edit', company.id])`

   **onDeleteCompany(company: Company)**:
   - Show confirmation dialog
   - If confirmed, call `this.store.deleteCompany(company.id).subscribe()`
   - Handle success/error with feedback
   - Consider using Alert component for feedback

   **onRefresh()**:
   - Reload companies: `this.store.loadCompanies()`

8. **Template Structure** (HTML):

   ```html
   <app-main-layout>
     <!-- Header Section -->
     <div class="mb-6">
       <h1 class="text-3xl font-bold text-text dark:text-text-dark-DEFAULT mb-2">
         Companies
       </h1>
       <p class="text-text-lighter dark:text-text-dark-lighter">
         Manage your companies and organizations
       </p>
     </div>

     <!-- Error Alert -->
     <app-alert
       *ngIf="error$ | async as error"
       variant="error"
       [closeable]="true"
       class="mb-4">
       {{ error }}
     </app-alert>

     <!-- Actions Bar -->
     <app-card [padding]="'md'" class="mb-6">
       <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
         <!-- Search Bar -->
         <app-search-bar
           class="w-full sm:w-96"
           [placeholder]="'Search companies...'"
           [loading]="loading$ | async"
           (searchChange)="onSearch($event)">
         </app-search-bar>

         <!-- Action Buttons -->
         <div class="flex gap-3">
           <app-button
             variant="secondary"
             (clicked)="onRefresh()"
             [disabled]="loading$ | async">
             Refresh
           </app-button>
           <app-button
             variant="primary"
             (clicked)="onCreateCompany()">
             + Create Company
           </app-button>
         </div>
       </div>
     </app-card>

     <!-- Data Table -->
     <app-card [padding]="'none'">
       <app-data-table
         [columns]="columns"
         [data]="filteredCompanies"
         [loading]="loading$ | async"
         [emptyStateTitle]="'No companies found'"
         [emptyStateDescription]="searchTerm ? 'Try adjusting your search' : 'Create your first company to get started'"
         [showPagination]="true"
         [pageSize]="10">

         <!-- Custom cell templates via ng-template -->
         <!-- Status Badge -->
         <ng-template #statusCell let-row>
           <app-badge [variant]="row.isActive ? 'success' : 'error'">
             {{ row.isActive ? 'Active' : 'Inactive' }}
           </app-badge>
         </ng-template>

         <!-- Date Cell -->
         <ng-template #dateCell let-row>
           {{ row.createdAt | dateFormat }}
         </ng-template>

         <!-- Actions Cell -->
         <ng-template #actionsCell let-row>
           <div class="flex gap-2 justify-end">
             <app-button
               variant="ghost"
               size="sm"
               (clicked)="onEditCompany(row)">
               Edit
             </app-button>
             <app-button
               variant="danger"
               size="sm"
               (clicked)="onDeleteCompany(row)">
               Delete
             </app-button>
           </div>
         </ng-template>
       </app-data-table>
     </app-card>
   </app-main-layout>
   ```

**Important Notes**:
- Use `async` pipe for all observables - no manual subscriptions except in event handlers
- Filter companies client-side (MockAPI returns all companies)
- Implement responsive design (mobile-first with Tailwind)
- Use existing DataTable component (it handles sorting, pagination internally)
- For custom cell rendering, DataTable might need enhancement or use string interpolation with getCellValue

**Simplified Template Approach** (since DataTable doesn't support ng-template slots):

Instead of custom templates, format data in component:

```typescript
getStatusBadgeVariant(isActive: boolean): 'success' | 'error' {
  return isActive ? 'success' : 'error';
}

formatDate(date: Date): string {
  // Use DateFormatPipe or date formatting
  return date.toLocaleDateString();
}

getTableData(): any[] {
  return this.filteredCompanies.map(company => ({
    ...company,
    statusBadge: company.isActive ? 'Active' : 'Inactive',
    formattedDate: this.formatDate(company.createdAt)
  }));
}
```

Then bind to actions column separately with buttons outside the table.

**Alternative Approach** (Recommended):

Create table rows manually instead of using DataTable for more control:

```html
<app-card [padding]="'none'">
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead class="bg-background-secondary dark:bg-background-dark-tertiary border-b">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-text-lighter uppercase tracking-wider">
            Company Name
          </th>
          <!-- More headers -->
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <!-- Loading Skeleton -->
        <ng-container *ngIf="loading$ | async">
          <tr *ngFor="let i of [1,2,3,4,5]">
            <td colspan="7" class="px-6 py-4">
              <app-skeleton-loader height="40px"></app-skeleton-loader>
            </td>
          </tr>
        </ng-container>

        <!-- Data Rows -->
        <tr *ngFor="let company of filteredCompanies"
            class="hover:bg-background-secondary dark:hover:bg-background-dark-secondary transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-text dark:text-text-dark-DEFAULT">
              {{ company.name }}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-text-lighter">
            {{ company.email }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-text-lighter">
            {{ company.phone }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <span class="text-sm">{{ company.settings.currency }}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <app-badge [variant]="company.isActive ? 'success' : 'error'">
              {{ company.isActive ? 'Active' : 'Inactive' }}
            </app-badge>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-text-lighter">
            {{ company.createdAt | dateFormat }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right">
            <div class="flex gap-2 justify-end">
              <app-button variant="ghost" size="sm" (clicked)="onEditCompany(company)">
                Edit
              </app-button>
              <app-button variant="danger" size="sm" (clicked)="onDeleteCompany(company)">
                Delete
              </app-button>
            </div>
          </td>
        </tr>

        <!-- Empty State -->
        <tr *ngIf="!(loading$ | async) && filteredCompanies.length === 0">
          <td colspan="7" class="px-6 py-12">
            <app-empty-state
              [title]="'No companies found'"
              [description]="searchTerm ? 'Try adjusting your search' : 'Create your first company to get started'">
            </app-empty-state>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</app-card>
```

---

### 3. CompanyCreate/Edit Component

**Files**:
- `src/app/features/companies/company-create/company-create.component.ts`
- `src/app/features/companies/company-create/company-create.component.html`

**Purpose**: Single component handling both create and edit modes for companies

**Component Class Structure**:

1. **Standalone Configuration**:
   ```typescript
   @Component({
     selector: 'app-company-create',
     standalone: true,
     imports: [
       CommonModule,
       ReactiveFormsModule,  // IMPORTANT: Use Reactive Forms
       RouterModule,
       MainLayout,
       Card,
       FormInput,
       FormSelect,
       Button,
       Alert
     ],
     templateUrl: './company-create.component.html'
   })
   ```

2. **Dependency Injection**:
   ```typescript
   private readonly store = inject(CompaniesStore);
   private readonly router = inject(Router);
   private readonly route = inject(ActivatedRoute);
   private readonly fb = inject(FormBuilder);
   ```

3. **Form and State Properties**:
   ```typescript
   companyForm!: FormGroup;
   isEditMode = false;
   companyId: string | null = null;
   loading = false;
   errorMessage: string | null = null;
   successMessage: string | null = null;
   ```

4. **Select Options** (for form dropdowns):
   ```typescript
   currencyOptions: SelectOption[] = [
     { value: 'USD', label: 'USD - US Dollar' },
     { value: 'EUR', label: 'EUR - Euro' },
     { value: 'GBP', label: 'GBP - British Pound' },
     { value: 'MXN', label: 'MXN - Mexican Peso' },
     { value: 'CAD', label: 'CAD - Canadian Dollar' },
     { value: 'AUD', label: 'AUD - Australian Dollar' },
   ];

   statusOptions: SelectOption[] = [
     { value: 'true', label: 'Active' },
     { value: 'false', label: 'Inactive' }
   ];
   ```

5. **Lifecycle Hooks**:

   **ngOnInit()**:
   - Initialize form with `createForm()`
   - Get `id` from route params: `this.route.snapshot.paramMap.get('id')`
   - If id exists: set `isEditMode = true`, load company data
   - Subscribe to `selectedCompany$` to populate form in edit mode

   ```typescript
   ngOnInit(): void {
     this.companyForm = this.createForm();

     this.companyId = this.route.snapshot.paramMap.get('id');
     if (this.companyId) {
       this.isEditMode = true;
       this.loadCompany();
     }
   }
   ```

6. **Form Creation** (createForm method):

   ```typescript
   private createForm(): FormGroup {
     return this.fb.group({
       name: ['', [Validators.required, Validators.minLength(2)]],
       email: ['', [Validators.required, Validators.email]],
       phone: ['', [Validators.required]],
       address: [''],
       city: [''],
       state: [''],
       country: [''],
       postalCode: [''],
       taxId: [''],
       website: [''],
       currency: ['USD', [Validators.required]],
       isActive: ['true', [Validators.required]]
     });
   }
   ```

   **Important**:
   - All fields match CreateCompanyDto structure
   - Only name, email, phone are required (matches business rules)
   - Settings.currency is flattened to `currency` field in form
   - isActive is string ('true'/'false') for select compatibility

7. **Methods to Implement**:

   **loadCompany()**:
   - Call `this.store.selectCompany(this.companyId!)`
   - Subscribe to `this.store.selectedCompany$`
   - Patch form values: `this.companyForm.patchValue({ ... })`
   - Convert company.settings.currency to currency field
   - Convert company.isActive boolean to string for select

   ```typescript
   private loadCompany(): void {
     this.store.selectCompany(this.companyId!);

     this.store.selectedCompany$.pipe(
       filter(company => company !== null),
       take(1)
     ).subscribe(company => {
       if (company) {
         this.companyForm.patchValue({
           name: company.name,
           email: company.email,
           phone: company.phone,
           address: company.address,
           city: company.city,
           state: company.state,
           country: company.country,
           postalCode: company.postalCode,
           taxId: company.taxId,
           website: company.website,
           currency: company.settings.currency,
           isActive: company.isActive.toString()
         });
       }
     });
   }
   ```

   **onSubmit()**:
   - Check form validity: `if (!this.companyForm.valid) return;`
   - Get form values
   - Create DTO (CreateCompanyDto or UpdateCompanyDto)
   - Map form fields to DTO structure
   - Convert currency to settings object
   - Convert isActive string to boolean
   - Set loading state
   - Call appropriate store method (create or update)
   - Navigate back to list on success
   - Show error message on failure

   ```typescript
   onSubmit(): void {
     if (!this.companyForm.valid) {
       this.markFormGroupTouched(this.companyForm);
       return;
     }

     const formValue = this.companyForm.value;
     this.loading = true;
     this.errorMessage = null;

     if (this.isEditMode && this.companyId) {
       const updateDto: UpdateCompanyDto = {
         id: this.companyId,
         name: formValue.name,
         email: formValue.email,
         phone: formValue.phone,
         address: formValue.address,
         city: formValue.city,
         state: formValue.state,
         country: formValue.country,
         postalCode: formValue.postalCode,
         taxId: formValue.taxId,
         website: formValue.website,
         settings: {
           currency: formValue.currency
         },
         isActive: formValue.isActive === 'true'
       };

       this.store.updateCompany(this.companyId, updateDto).subscribe({
         next: () => {
           this.loading = false;
           this.successMessage = 'Company updated successfully';
           setTimeout(() => this.router.navigate(['/companies']), 1500);
         },
         error: (err) => {
           this.loading = false;
           this.errorMessage = err.message || 'Failed to update company';
         }
       });
     } else {
       const createDto: CreateCompanyDto = {
         name: formValue.name,
         email: formValue.email,
         phone: formValue.phone,
         address: formValue.address,
         city: formValue.city,
         state: formValue.state,
         country: formValue.country,
         postalCode: formValue.postalCode,
         taxId: formValue.taxId,
         website: formValue.website,
         settings: {
           currency: formValue.currency
         }
       };

       this.store.createCompany(createDto).subscribe({
         next: () => {
           this.loading = false;
           this.successMessage = 'Company created successfully';
           setTimeout(() => this.router.navigate(['/companies']), 1500);
         },
         error: (err) => {
           this.loading = false;
           this.errorMessage = err.message || 'Failed to create company';
         }
       });
     }
   }
   ```

   **onCancel()**:
   - Navigate back to list: `this.router.navigate(['/companies'])`

   **markFormGroupTouched(formGroup: FormGroup)**:
   - Helper to mark all fields as touched for validation display
   - Iterate through all controls and call `markAsTouched()`

   **getFieldError(fieldName: string)**:
   - Return validation error message for display
   - Check if field is touched and has errors
   - Return appropriate error message string

   ```typescript
   getFieldError(fieldName: string): string | null {
     const control = this.companyForm.get(fieldName);

     if (control?.touched && control?.errors) {
       if (control.errors['required']) {
         return `${this.getFieldLabel(fieldName)} is required`;
       }
       if (control.errors['email']) {
         return 'Please enter a valid email address';
       }
       if (control.errors['minlength']) {
         return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
       }
     }

     return null;
   }

   private getFieldLabel(fieldName: string): string {
     const labels: Record<string, string> = {
       name: 'Company name',
       email: 'Email',
       phone: 'Phone',
       // ... more labels
     };
     return labels[fieldName] || fieldName;
   }
   ```

8. **Template Structure** (HTML):

   ```html
   <app-main-layout>
     <!-- Header -->
     <div class="mb-6">
       <h1 class="text-3xl font-bold text-text dark:text-text-dark-DEFAULT mb-2">
         {{ isEditMode ? 'Edit Company' : 'Create Company' }}
       </h1>
       <p class="text-text-lighter dark:text-text-dark-lighter">
         {{ isEditMode ? 'Update company information' : 'Add a new company to your account' }}
       </p>
     </div>

     <!-- Success Alert -->
     <app-alert
       *ngIf="successMessage"
       variant="success"
       class="mb-4">
       {{ successMessage }}
     </app-alert>

     <!-- Error Alert -->
     <app-alert
       *ngIf="errorMessage"
       variant="error"
       [closeable]="true"
       (closed)="errorMessage = null"
       class="mb-4">
       {{ errorMessage }}
     </app-alert>

     <!-- Form Card -->
     <app-card [padding]="'lg'">
       <form [formGroup]="companyForm" (ngSubmit)="onSubmit()">

         <!-- Company Information Section -->
         <div class="mb-8">
           <h2 class="text-xl font-semibold text-text dark:text-text-dark-DEFAULT mb-4 border-b pb-2">
             Company Information
           </h2>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Company Name -->
             <div class="md:col-span-2">
               <app-form-input
                 label="Company Name"
                 formControlName="name"
                 [required]="true"
                 placeholder="Enter company name"
                 [errorMessage]="getFieldError('name') || ''">
               </app-form-input>
             </div>

             <!-- Email -->
             <app-form-input
               label="Email"
               type="email"
               formControlName="email"
               [required]="true"
               placeholder="company@example.com"
               [errorMessage]="getFieldError('email') || ''">
             </app-form-input>

             <!-- Phone -->
             <app-form-input
               label="Phone"
               type="tel"
               formControlName="phone"
               [required]="true"
               placeholder="+1 (555) 000-0000"
               [errorMessage]="getFieldError('phone') || ''">
             </app-form-input>

             <!-- Website -->
             <app-form-input
               label="Website"
               type="url"
               formControlName="website"
               placeholder="https://example.com"
               [errorMessage]="getFieldError('website') || ''">
             </app-form-input>

             <!-- Tax ID -->
             <app-form-input
               label="Tax ID"
               formControlName="taxId"
               placeholder="Tax identification number"
               [errorMessage]="getFieldError('taxId') || ''">
             </app-form-input>
           </div>
         </div>

         <!-- Address Section -->
         <div class="mb-8">
           <h2 class="text-xl font-semibold text-text dark:text-text-dark-DEFAULT mb-4 border-b pb-2">
             Address
           </h2>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Address -->
             <div class="md:col-span-2">
               <app-form-input
                 label="Street Address"
                 formControlName="address"
                 placeholder="123 Main Street"
                 [errorMessage]="getFieldError('address') || ''">
               </app-form-input>
             </div>

             <!-- City -->
             <app-form-input
               label="City"
               formControlName="city"
               placeholder="City name"
               [errorMessage]="getFieldError('city') || ''">
             </app-form-input>

             <!-- State/Province -->
             <app-form-input
               label="State/Province"
               formControlName="state"
               placeholder="State or province"
               [errorMessage]="getFieldError('state') || ''">
             </app-form-input>

             <!-- Country -->
             <app-form-input
               label="Country"
               formControlName="country"
               placeholder="Country"
               [errorMessage]="getFieldError('country') || ''">
             </app-form-input>

             <!-- Postal Code -->
             <app-form-input
               label="Postal Code"
               formControlName="postalCode"
               placeholder="Postal code"
               [errorMessage]="getFieldError('postalCode') || ''">
             </app-form-input>
           </div>
         </div>

         <!-- Settings Section -->
         <div class="mb-8">
           <h2 class="text-xl font-semibold text-text dark:text-text-dark-DEFAULT mb-4 border-b pb-2">
             Settings
           </h2>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <!-- Currency -->
             <app-form-select
               label="Currency"
               formControlName="currency"
               [options]="currencyOptions"
               [required]="true"
               placeholder="Select currency"
               [errorMessage]="getFieldError('currency') || ''">
             </app-form-select>

             <!-- Status (only show in edit mode) -->
             <app-form-select
               *ngIf="isEditMode"
               label="Status"
               formControlName="isActive"
               [options]="statusOptions"
               [required]="true"
               [errorMessage]="getFieldError('isActive') || ''">
             </app-form-select>
           </div>
         </div>

         <!-- Form Actions -->
         <div class="flex justify-end gap-4 pt-6 border-t">
           <app-button
             type="button"
             variant="secondary"
             (clicked)="onCancel()"
             [disabled]="loading">
             Cancel
           </app-button>

           <app-button
             type="submit"
             variant="primary"
             [loading]="loading"
             [disabled]="loading || !companyForm.valid">
             {{ isEditMode ? 'Update Company' : 'Create Company' }}
           </app-button>
         </div>
       </form>
     </app-card>
   </app-main-layout>
   ```

**Important Notes**:
- Use ReactiveFormsModule (not FormsModule)
- FormInput and FormSelect components work with formControlName directive
- Validation only shows on submit (touch all fields in onSubmit if invalid)
- Show/hide fields based on mode (isEditMode)
- Provide visual feedback with loading state on button
- Auto-navigate after success with delay for user to see success message
- Clear error messages when user takes action

---

### 4. Companies Routes

**File**: `src/app/features/companies/companies.routes.ts`

**Purpose**: Define routing configuration for companies feature

**Implementation**:

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./company-list/company-list.component')
      .then(m => m.CompanyListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./company-create/company-create.component')
      .then(m => m.CompanyCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./company-create/company-create.component')
      .then(m => m.CompanyCreateComponent),
    canActivate: [authGuard]
  }
];
```

**Key Points**:
- All routes protected by `authGuard`
- Use `loadComponent` for lazy loading
- Create and edit routes use same component
- Edit route includes `:id` parameter
- Export as `COMPANIES_ROUTES` constant

**Integration with App Routes**:

Add to `src/app/app.routes.ts`:

```typescript
{
  path: 'companies',
  loadChildren: () => import('./features/companies/companies.routes')
    .then(m => m.COMPANIES_ROUTES)
}
```

---

## Styling Guidelines

### HubSpot Color Scheme

Apply these Tailwind classes consistently:

**Primary Colors**:
- Primary action: `bg-primary-500 text-white hover:bg-primary-600` (#FF7A59 coral)
- Text: `text-text dark:text-text-dark-DEFAULT` (#2D3E50 pickled bluewood)
- Background: `bg-background dark:bg-background-dark` (#FFF1EE forget me not)

**Component Styling**:

1. **Buttons**:
   - Primary: Use `variant="primary"` (coral background)
   - Secondary: Use `variant="secondary"` (gray outline)
   - Danger: Use `variant="danger"` (red background)

2. **Cards**:
   - Use `shadow="md"` for elevated appearance
   - Use `padding="md"` or `padding="lg"` for content spacing

3. **Forms**:
   - Consistent spacing: `gap-6` between fields
   - Section dividers: `border-b pb-2` for section headers
   - Required indicators: Use `[required]="true"` on form components

4. **Tables**:
   - Header: `bg-background-secondary dark:bg-background-dark-tertiary`
   - Rows: `hover:bg-background-secondary` for interactivity
   - Borders: `divide-y divide-gray-200 dark:divide-gray-700`

5. **Badges**:
   - Success (Active): `variant="success"` (green)
   - Error (Inactive): `variant="error"` (red)

6. **Responsive Design**:
   - Mobile-first: Stack on mobile, side-by-side on desktop
   - Breakpoints: `sm:`, `md:`, `lg:` prefixes
   - Form grid: `grid-cols-1 md:grid-cols-2`

---

## Validation Rules

### Form Validation

**Required Fields**:
- Company Name (minimum 2 characters)
- Email (valid email format)
- Phone (any format)
- Currency (must select)

**Optional Fields**:
- Website
- Tax ID
- Address
- City
- State
- Country
- Postal Code

**Validation Strategy**:
- **No live validation**: Errors only show after submit attempt
- **Mark all fields touched** on submit if form invalid
- **Display errors** next to each field using `getFieldError()` method
- **Disable submit button** while loading or if form invalid

**Error Messages**:
- Required: "{Field name} is required"
- Email: "Please enter a valid email address"
- MinLength: "Minimum {n} characters required"

---

## State Management Patterns

### RxJS Observable Patterns

1. **Select Pattern**:
   ```typescript
   readonly companies$ = this.store.companies$;
   // In template: companies$ | async
   ```

2. **Fire-and-Forget** (loadCompanies):
   ```typescript
   loadCompanies(): void {
     this.patchState({ loading: true });
     this.mockApi.getCompanies().pipe(
       tap(companies => this.patchState({ companies, loading: false })),
       catchError(err => {
         this.patchState({ error: err.message, loading: false });
         throw err;
       })
     ).subscribe();
   }
   ```

3. **Return Observable** (create/update/delete):
   ```typescript
   createCompany(company: Partial<Company>): Observable<Company> {
     this.patchState({ loading: true, error: null });
     return this.mockApi.createCompany(dto).pipe(
       tap(newCompany => {
         const companies = [...this.currentState.companies, newCompany];
         this.patchState({ companies, loading: false });
       }),
       catchError(err => {
         this.patchState({ error: err.message, loading: false });
         return throwError(() => err);
       })
     );
   }
   ```

4. **Component Subscription**:
   ```typescript
   this.store.createCompany(dto).subscribe({
     next: () => { /* success */ },
     error: (err) => { /* handle error */ }
   });
   ```

### State Shape

```typescript
{
  companies: Company[],        // All loaded companies
  loading: boolean,            // Global loading state
  error: string | null,        // Last error message
  selectedCompany: Company | null  // Currently selected for editing
}
```

---

## Error Handling Strategy

### Store-Level Error Handling

- Catch all API errors with `catchError` operator
- Update state with error message
- Re-throw error for component handling
- Clear errors on new operations: `error: null`

### Component-Level Error Handling

- Subscribe to store methods with error callback
- Display errors using Alert component
- Provide user-friendly error messages
- Allow dismissing errors
- Log errors to console for debugging

### Network Errors

- MockAPI simulates 300ms delay
- Handle timeout scenarios
- Provide retry mechanisms (refresh button)

---

## Testing Considerations

### Unit Testing

**CompaniesStore**:
- Test initial state
- Test each method updates state correctly
- Test error handling
- Mock MockApiService

**CompanyListComponent**:
- Test component initialization
- Test search filtering
- Test navigation to create/edit
- Test delete confirmation
- Mock CompaniesStore

**CompanyCreateComponent**:
- Test form initialization
- Test form validation
- Test create submission
- Test edit mode loading
- Test update submission
- Mock CompaniesStore and Router

### Integration Testing (Future)

- Test complete create flow
- Test complete edit flow
- Test complete delete flow
- Test navigation between views

---

## Performance Considerations

### Lazy Loading

- Feature module loaded on-demand via `loadChildren`
- Components lazy loaded with `loadComponent`
- Reduces initial bundle size

### Change Detection

- Use OnPush strategy (future enhancement)
- Use `async` pipe to minimize subscriptions
- Avoid manual subscriptions where possible

### Data Optimization

- Client-side filtering (small dataset)
- Consider pagination for large datasets (future)
- Use `trackBy` functions in *ngFor loops

---

## Accessibility

### Form Accessibility

- All form inputs have labels
- Use semantic HTML (`<form>`, `<button>`, `<input>`)
- Required fields indicated
- Error messages associated with fields
- Keyboard navigation support

### Table Accessibility

- Use semantic table elements
- Provide descriptive headers
- Ensure sufficient color contrast
- Support keyboard navigation

---

## Mobile Responsiveness

### Breakpoint Strategy

- **Mobile** (default): Stack vertically, full width
- **Tablet** (`sm:`): 2-column grid for forms, side-by-side actions
- **Desktop** (`md:`, `lg:`): Full multi-column layouts

### Touch Targets

- Buttons minimum 44x44px touch target
- Adequate spacing between interactive elements
- Larger text on mobile for readability

---

## Integration Points

### Update Main App Routes

Add to `src/app/app.routes.ts`:

```typescript
{
  path: 'companies',
  loadChildren: () => import('./features/companies/companies.routes')
    .then(m => m.COMPANIES_ROUTES)
}
```

### Update Navigation Menu

If sidebar navigation exists, add Companies link:

```html
<a routerLink="/companies" routerLinkActive="active">
  <svg><!-- Icon --></svg>
  Companies
</a>
```

---

## Checklist for Implementation

### Phase 5 Tasks

- [ ] Create `services/companies.store.ts` extending StoreBase
- [ ] Implement all store methods (load, create, update, delete, select)
- [ ] Create `company-list.component.ts` and `.html`
- [ ] Implement table display with custom cells
- [ ] Implement search functionality
- [ ] Implement delete with confirmation
- [ ] Create `company-create.component.ts` and `.html`
- [ ] Implement reactive form with all fields
- [ ] Implement create mode
- [ ] Implement edit mode with data loading
- [ ] Implement form validation
- [ ] Create `companies.routes.ts`
- [ ] Integrate routes into app.routes.ts
- [ ] Test all CRUD operations
- [ ] Verify responsive design on mobile
- [ ] Verify dark mode support
- [ ] Run build to ensure no errors

---

## Common Pitfalls to Avoid

1. **Don't use Angular Signals for state** - Use RxJS BehaviorSubject via StoreBase
2. **Don't forget to use `inject()` function** - Not constructor injection
3. **Don't manually subscribe in templates** - Always use `async` pipe
4. **Don't forget to unsubscribe** - Use `async` pipe or `takeUntil` pattern
5. **Don't use FormControl directly** - Use FormBuilder for consistency
6. **Don't forget to mark form as touched** - For validation display on submit
7. **Don't hardcode strings** - Extract to constants/config where applicable
8. **Don't forget error handling** - Always handle observable errors
9. **Don't forget loading states** - Provide visual feedback during operations
10. **Don't skip accessibility** - Include labels, ARIA attributes, keyboard support

---

## Final Notes

### Key Architectural Decisions

1. **Single Component for Create/Edit**: Reduces code duplication, uses route parameter to differentiate
2. **Client-Side Filtering**: Sufficient for small company datasets, avoids additional API calls
3. **Manual Table Rendering**: More control than DataTable component for custom cells
4. **Validation on Submit Only**: Cleaner UX, follows user request
5. **RxJS State Management**: Consistent with existing codebase pattern

### Future Enhancements

1. **Bulk Operations**: Select multiple companies for batch actions
2. **Advanced Filtering**: Filter by status, currency, date range
3. **Export Functionality**: Export company list to CSV/Excel
4. **Company Settings**: Dedicated page for detailed company settings
5. **Audit Log**: Track changes to company records
6. **Company Switcher**: Quick switch between companies in header
7. **Search Optimization**: Server-side search for large datasets

---

## File Paths Summary

All files to be created under `src/app/features/companies/`:

1. **Store**: `services/companies.store.ts`
2. **List Component**: `company-list/company-list.component.ts`, `company-list.component.html`
3. **Create/Edit Component**: `company-create/company-create.component.ts`, `company-create.component.html`
4. **Routes**: `companies.routes.ts`

**Files to modify**:
- `src/app/app.routes.ts` - Add companies route

---

## Implementation Sequence

### Recommended Order

1. **Start with Store**: Build foundation for state management
2. **Build List Component**: Display data, test store integration
3. **Add Navigation**: Wire up routing and navigation
4. **Build Create Mode**: Implement form and create functionality
5. **Add Edit Mode**: Extend form component for editing
6. **Implement Delete**: Add delete with confirmation
7. **Add Search**: Implement client-side search filtering
8. **Polish UI**: Refine styling, responsiveness, loading states
9. **Test**: Verify all CRUD operations work correctly
10. **Build**: Run production build to verify no errors

---

## Success Criteria

Phase 5 is complete when:

✅ Users can view a list of all companies
✅ Users can search/filter companies by name, email, or phone
✅ Users can create new companies with all required fields
✅ Users can edit existing companies
✅ Users can delete companies with confirmation
✅ Form validation works correctly (submit-only)
✅ Loading states are displayed during API operations
✅ Errors are handled gracefully with user feedback
✅ UI is responsive on mobile, tablet, and desktop
✅ Dark mode is supported throughout
✅ Navigation works between list and create/edit views
✅ Production build completes without errors

---

**End of Implementation Plan**
