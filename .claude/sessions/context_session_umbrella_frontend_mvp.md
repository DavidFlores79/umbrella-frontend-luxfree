# Session: Umbrella Frontend MVP Implementation

**Feature Name:** umbrella-frontend-mvp
**Date Started:** 2025-11-26
**Status:** Planning Phase

---

## 🎯 Objective

Implement a complete multi-company income and expense management system using Angular 20 standalone architecture with best-in-class UI/UX. This is a frontend-only implementation using MockAPI for data persistence.

---

## 📊 Project Scope

### Core Features to Implement

1. **Authentication System**
   - Login page with form validation
   - Register page with company creation
   - Session management with localStorage
   - Protected routes with functional guards

2. **Company Management**
   - Company listing with search/filter
   - Create/Edit company forms
   - Company settings management
   - Multi-tenancy context switching

3. **User Management**
   - User listing with role badges
   - Create/Edit user forms
   - Role assignment (admin, manager, user)
   - Permission-based UI rendering

4. **Dashboard**
   - Revenue and expense metrics
   - Recent transactions list
   - Inventory alerts
   - Visual charts (revenue trends, expense breakdown)

5. **Product Catalog**
   - Product/Service listing
   - Create/Edit product forms
   - Categories (product, service, labor)
   - Price and cost management

6. **Sales Management**
   - Sales transaction listing
   - Multi-line item invoice creation
   - Payment tracking
   - Status workflow (draft → pending → paid)

7. **Purchase Management**
   - Purchase order listing
   - Vendor management
   - Multi-line item PO creation
   - Receipt and payment tracking

8. **Inventory Management**
   - Stock level monitoring
   - Low-stock alerts
   - Inventory movements (in/out/adjustment)
   - Location tracking

---

## 🏗️ Architecture Overview

### Technology Stack
- **Angular 20.3** - Standalone components (no NgModules)
- **TypeScript 5.9** - Strict mode enabled
- **RxJS 7.8** - State management (BehaviorSubject pattern)
- **Tailwind CSS** - Utility-first styling (needs installation)
- **Jasmine/Karma** - Unit testing

### Project Structure

```
src/app/
├── core/                       # Infrastructure layer
│   ├── guards/
│   │   └── auth.guard.ts       # Functional route guard
│   ├── interceptors/
│   │   └── auth.interceptor.ts # Functional HTTP interceptor
│   └── services/
│       ├── store-base.service.ts      # RxJS store foundation
│       ├── auth.service.ts            # Authentication
│       ├── mock-api.service.ts        # In-memory API
│       ├── company-context.service.ts # Multi-tenancy
│       └── permission.service.ts      # RBAC logic
│
├── shared/                     # Shared resources
│   ├── components/
│   │   ├── layout/            # MainLayout, Header, Sidebar, Footer
│   │   └── ui/                # Reusable UI components
│   └── models/                # TypeScript interfaces
│
├── features/                   # Feature modules
│   ├── auth/
│   ├── companies/
│   ├── users/
│   ├── dashboard/
│   ├── products/
│   ├── sales/
│   ├── purchases/
│   └── inventory/
│
├── app.ts                      # Root component
├── app.config.ts               # ApplicationConfig
└── app.routes.ts               # Main routing
```

### Key Architectural Patterns

**1. RxJS-Based State Management**
- Extend `StoreBase<T>` for all feature stores
- Use `BehaviorSubject` for state
- Expose Observables with selectors
- Use `async` pipe in templates

**2. Dependency Injection with `inject()`**
- Prefer `inject()` over constructor injection
- All services use `providedIn: 'root'`

**3. Functional Guards and Interceptors**
- `CanActivateFn` for route protection
- `HttpInterceptorFn` for auth token injection

**4. Standalone Components**
- All components have `standalone: true`
- Each component declares its own imports
- No NgModules

---

## 🎨 UI/UX Strategy

### Design Principles
- **Modern & Professional** - Clean, business-appropriate interface
- **Responsive** - Mobile-first approach
- **Accessible** - WCAG compliance
- **Intuitive** - Clear information hierarchy
- **Fast** - Optimized performance

### Component Library
- Custom UI components built with Tailwind CSS
- Consistent design tokens (colors, spacing, typography)
- Loading states and error handling
- Form validation feedback

### Layout Structure
- **Authentication Layout** - Centered forms with branding
- **Main Layout** - Sidebar navigation + header + content area
- **Responsive Sidebar** - Collapsible on mobile

---

## 📦 Implementation Phases

### Phase 1: Foundation (Setup & Core Infrastructure)
- [ ] Install and configure Tailwind CSS
- [ ] Create StoreBase service
- [ ] Create MockAPI service
- [ ] Create AuthService
- [ ] Create CompanyContextService
- [ ] Create PermissionService
- [ ] Create auth guard and interceptor
- [ ] Define all TypeScript models

### Phase 2: Shared Components
- [ ] Create MainLayout component
- [ ] Create Header component (user menu, company selector)
- [ ] Create Sidebar component (navigation with permissions)
- [ ] Create Footer component
- [ ] Create Card UI component
- [ ] Create Button component
- [ ] Create Input component
- [ ] Create Table component
- [ ] Create Modal component

### Phase 3: Authentication Feature
- [ ] Create Login component with form
- [ ] Create Register component with form
- [ ] Configure auth routes
- [ ] Integrate with AuthService
- [ ] Add form validation
- [ ] Add loading and error states

### Phase 4: Company Management
- [ ] Create CompaniesStore
- [ ] Create CompanyList component
- [ ] Create CompanyCreate/Edit component
- [ ] Add search and filter
- [ ] Configure routes

### Phase 5: User Management
- [ ] Create UsersStore
- [ ] Create UserList component
- [ ] Create UserCreate/Edit component
- [ ] Add role selection
- [ ] Configure routes

### Phase 6: Dashboard
- [ ] Create DashboardStore
- [ ] Create Dashboard component
- [ ] Add metrics cards
- [ ] Add charts (revenue, expenses)
- [ ] Add recent transactions
- [ ] Add inventory alerts

### Phase 7: Product Catalog
- [ ] Create ProductsStore
- [ ] Create ProductList component
- [ ] Create ProductCreate/Edit component
- [ ] Add category management
- [ ] Configure routes

### Phase 8: Sales Management
- [ ] Create SalesStore
- [ ] Create SaleList component
- [ ] Create SaleCreate/Edit component
- [ ] Add line item management
- [ ] Add payment tracking
- [ ] Configure routes

### Phase 9: Purchase Management
- [ ] Create PurchasesStore
- [ ] Create PurchaseList component
- [ ] Create PurchaseCreate/Edit component
- [ ] Add vendor management
- [ ] Configure routes

### Phase 10: Inventory Management
- [ ] Create InventoryStore
- [ ] Create InventoryList component
- [ ] Create InventoryDetail component
- [ ] Add movement tracking
- [ ] Add alerts for low stock
- [ ] Configure routes

### Phase 11: Testing & Polish
- [ ] Write unit tests for core services
- [ ] Write unit tests for stores
- [ ] Write component tests
- [ ] Add loading animations
- [ ] Add transitions
- [ ] Add error boundaries
- [ ] Accessibility audit
- [ ] Performance optimization

---

## 🌿 Branch Strategy

**Branch Naming Convention:**
```
feat/umbrella-frontend-mvp
```

**Git Workflow:**
1. Create `develop` branch from `main`
2. Create feature branch from `develop`
3. All development happens in feature branch
4. PR targets `develop` branch
5. After approval, merge to `develop`
6. Later release: merge `develop` to `main`

**Commit Strategy:**
- Atomic commits per feature/component
- Conventional commit messages
- Commit after each major milestone

---

## ✅ Requirements Finalized

### User Responses (2025-11-26)

**Priority & Scope:**
- Q1: **A** - Single comprehensive PR with all features
- Q2: **B** - Core admin features first (Auth → Dashboard → Companies → Users)
- Q3: **A** - Full CRUD (Create, Read, Update, Delete) for all entities

**Design & UX:**
- Q4: **HubSpot-Inspired Design System**
  - Primary Brand Color (Coral/Orange): `#FF7A59`
  - Primary Text/UI Color (Pickled Bluewood): `#2D3E50`
  - Background Color (Forget Me Not): `#FFF1EE`
  - UI Palette: Blue variations + red/yellow for data visualization
- Q5: **A** - Yes, implement dark mode toggle
- Q6: **B** - Metrics + simple bar/line charts (Chart.js)

**Data & Testing:**
- Q7: **A** - Comprehensive realistic seed data (3 companies, 10 users, 50+ products)
- Q8: **A** - Simple email/password login (as in blueprint)

**Features & Functionality:**
- Q9: **B** - Advanced filters (date range, status, category, price range)
- Q10: **A** - Yes, multi-currency support (USD, EUR, GBP, MXN)
- Q11: **A** - Yes, CSV/PDF export for all reports
- Q12: **A** - Simple quantity tracking

**Additional Requirements:**
- Q13: **A** - Fully responsive, mobile-first approach
- Q14: **C** - Form validation on submit only
- Q15: **A** - Full loading states with skeleton loaders and smooth transitions

---

## 🎨 Design System Technical Specifications

### HubSpot-Inspired Color Palette

**Light Mode:**
```typescript
primary: {
  DEFAULT: '#FF7A59', // Coral - Primary actions, CTA buttons
  50: '#FFF8F6',
  100: '#FFF1EE',
  200: '#FFE0D9',
  300: '#FFCFC4',
  400: '#FFAE9A',
  500: '#FF7A59',  // Base
  600: '#FF5533',
  700: '#E6381F',
  800: '#B32D19',
  900: '#802113'
}

text: {
  DEFAULT: '#2D3E50', // Pickled Bluewood - Primary text
  light: '#6B7C93',   // Secondary text
  lighter: '#A1B1C4'  // Tertiary text
}

background: {
  DEFAULT: '#FFFFFF',
  secondary: '#FFF1EE', // Forget Me Not
  tertiary: '#F7F9FB'
}

accent: {
  blue: '#0091AE',    // Trust, info
  green: '#00A862',   // Success
  yellow: '#FFB800',  // Warning
  red: '#F2545B'      // Error, danger
}
```

**Dark Mode:**
```typescript
primary: Same coral #FF7A59 (maintains brand consistency)
text: {
  DEFAULT: '#E5E9F0',
  light: '#B8C2D4',
  lighter: '#8A99B0'
}
background: {
  DEFAULT: '#1A1F2E',
  secondary: '#242936',
  tertiary: '#2D3342'
}
```

### Typography
- **Font Family:** Inter (sans-serif)
- **Headings:** 600-700 weight
- **Body:** 400 weight
- **Small:** 500 weight

### Spacing Scale
- 4px base unit
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

---

## 🛠️ Technical Decisions (Based on Expert Advice)

### 1. Tailwind CSS Setup
- **Installation:** `npm install -D tailwindcss postcss autoprefixer`
- **Plugins:** `@tailwindcss/forms`, `@tailwindcss/typography`
- **Dark Mode:** Class-based strategy (`class="dark"` on `<html>`)
- **Configuration:** Custom theme with HubSpot colors + dark mode variants

### 2. Chart.js Integration
- **Library:** `ng2-charts` (official Angular wrapper)
- **Installation:** `npm install chart.js ng2-charts`
- **Chart Types:** Line (revenue trends), Bar (expense breakdown), Doughnut (category distribution)
- **Theming:** Custom colors matching HubSpot palette

### 3. Component Library Structure
**Essential Shared Components (15 components):**
- **Form Components:** FormInput, FormSelect, FormTextarea, FormCheckbox, FormToggle (dark mode)
- **UI Components:** Card (3 variants), Button, Badge (4 variants), Alert (4 types), EmptyState, Chip
- **Data Components:** DataTable (custom with sort/filter/pagination), Pagination, SkeletonLoader
- **Layout Components:** Header, Sidebar, Footer, MainLayout

### 4. Data Table Strategy
- **Decision:** Custom DataTable component (no external library)
- **Why Custom:**
  - Full control over styling with Tailwind CSS
  - Smaller bundle size
  - No library learning curve
  - Easier to customize for specific needs
  - Perfect integration with our design system
- **Features:** Sorting, filtering, pagination, row selection, column visibility
- **Responsive:** Stacked cards on mobile, full table on desktop
- **Performance:** Virtual scrolling for 1000+ rows (use `@angular/cdk/scrolling` if needed)

### 5. Form Validation Pattern
- **Strategy:** Submit-only validation (no keystroke noise)
- **Implementation:**
  - Form stays pristine until first submit attempt
  - On submit, validate all fields
  - Show errors for invalid fields
  - Re-validate on blur after first submit
- **User Experience:** Clean, non-intrusive, professional

### 6. Loading State Patterns
- **Skeleton Loaders:** For tables, cards, forms (content placeholders)
- **Spinners:** For buttons, modals (inline actions)
- **Progress Bars:** For file uploads, bulk operations
- **Optimistic Updates:** Update UI immediately, rollback on error

### 7. Export Functionality
- **CSV Export:** Custom service using `Blob` + `URL.createObjectURL()`
- **PDF Export:** Use `jspdf` library with `jspdf-autotable` plugin
- **UX Pattern:** Download button with loading state + success toast

### 8. Multi-Currency Support
- **Storage:** Currency stored per company in `CompanySettings`
- **Formatting:** Use `Intl.NumberFormat` API for locale-aware formatting
- **Implementation:** Create `CurrencyPipe` for template usage
- **Supported:** USD, EUR, GBP, MXN, CAD, AUD, JPY, CHF

### 9. Accessibility Checklist
- WCAG 2.1 AA compliance
- Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- ARIA labels and roles
- Focus management (modals, dropdowns)
- Color contrast ratio ≥ 4.5:1
- Screen reader support
- Semantic HTML

### 10. Performance Optimizations
- Lazy loading for all feature modules
- OnPush change detection for list components
- Virtual scrolling for large datasets (1000+ items)
- Image lazy loading with `loading="lazy"`
- Bundle size monitoring (keep under 500KB initial)

---

## 📂 Detailed File Structure & Implementation Order

### Phase 1: Foundation & Setup (Priority: HIGHEST)

**1.1 Environment Setup**
```bash
# Install dependencies
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography
npm install chart.js ng2-charts
npm install jspdf jspdf-autotable

# Initialize Tailwind
npx tailwindcss init
```

**1.2 Configuration Files**
- `tailwind.config.js` - HubSpot theme configuration
- `src/styles.css` - Tailwind imports + custom CSS
- `src/app/app.config.ts` - Add HttpClient, animations providers

**1.3 Core Services** (Priority Order)
1. `src/app/core/services/store-base.service.ts` - RxJS store foundation
2. `src/app/core/services/mock-api.service.ts` - In-memory API with seed data
3. `src/app/core/services/auth.service.ts` - Authentication logic
4. `src/app/core/services/company-context.service.ts` - Multi-tenancy
5. `src/app/core/services/permission.service.ts` - RBAC logic
6. `src/app/core/services/theme.service.ts` - Dark mode toggle
7. `src/app/core/services/currency.service.ts` - Currency formatting
8. `src/app/core/services/export.service.ts` - CSV/PDF generation

**1.4 Guards & Interceptors**
- `src/app/core/guards/auth.guard.ts` - Functional route guard
- `src/app/core/interceptors/auth.interceptor.ts` - Functional HTTP interceptor

**1.5 Data Models**
- `src/app/shared/models/company.model.ts`
- `src/app/shared/models/user.model.ts`
- `src/app/shared/models/product.model.ts`
- `src/app/shared/models/sale.model.ts`
- `src/app/shared/models/purchase.model.ts`
- `src/app/shared/models/inventory.model.ts`

---

### Phase 2: Shared UI Components (Priority: HIGH)

**2.1 Form Components** (`src/app/shared/components/ui/forms/`)
1. `form-input.component.ts` - Text/email/number inputs with validation
2. `form-select.component.ts` - Dropdown select with search
3. `form-textarea.component.ts` - Multi-line text input
4. `form-checkbox.component.ts` - Checkbox input
5. `form-toggle.component.ts` - Toggle switch (for dark mode, settings)

**2.2 UI Components** (`src/app/shared/components/ui/`)
1. `card.component.ts` - Container with header/footer variants
2. `button.component.ts` - Primary/secondary/danger variants
3. `badge.component.ts` - Status indicators (success, warning, error, info)
4. `alert.component.ts` - Dismissible alerts (4 types)
5. `empty-state.component.ts` - No data placeholder
6. `chip.component.ts` - Tags, labels, filters
7. `stat-card.component.ts` - Dashboard metric display
8. `skeleton-loader.component.ts` - Loading placeholders

**2.3 Data Components** (`src/app/shared/components/data/`)
1. `data-table.component.ts` - Full-featured table (sort, filter, paginate)
2. `pagination.component.ts` - Page navigation controls
3. `search-bar.component.ts` - Search input with debounce

**2.4 Layout Components** (`src/app/shared/components/layout/`)
1. `main-layout.component.ts` - Wrapper with sidebar + header
2. `header.component.ts` - Top bar with user menu, company selector, dark mode toggle
3. `sidebar.component.ts` - Navigation with permission-based menu
4. `footer.component.ts` - Bottom bar with app info

**2.5 Pipes** (`src/app/shared/pipes/`)
1. `currency.pipe.ts` - Multi-currency formatting
2. `date-format.pipe.ts` - Consistent date display

---

### Phase 3: Authentication (Priority: HIGHEST)

**3.1 Components** (`src/app/features/auth/`)
- `login/login.component.ts` + HTML - Login form
- `register/register.component.ts` + HTML - Registration form

**3.2 Routing**
- `auth.routes.ts` - Auth feature routes

---

### Phase 4: Dashboard (Priority: HIGH)

**4.1 Store**
- `src/app/features/dashboard/services/dashboard.store.ts`

**4.2 Components**
- `dashboard.component.ts` + HTML - Main dashboard view
  - 4 metric cards (revenue, expenses, profit, inventory alerts)
  - 2 charts (revenue trend line chart, expense breakdown bar chart)
  - Recent transactions table (last 10)
  - Low stock alerts list

**4.3 Routing**
- `dashboard.routes.ts`

---

### Phase 5: Company Management (Priority: HIGH)

**5.1 Store**
- `src/app/features/companies/services/companies.store.ts`

**5.2 Components**
- `company-list/company-list.component.ts` + HTML - List view with search/filter
- `company-create/company-create.component.ts` + HTML - Create/edit form (reactive form)

**5.3 Routing**
- `companies.routes.ts`

---

### Phase 6: User Management (Priority: HIGH)

**6.1 Store**
- `src/app/features/users/services/users.store.ts`

**6.2 Components**
- `user-list/user-list.component.ts` + HTML - List with role badges
- `user-create/user-create.component.ts` + HTML - Create/edit form with role selection

**6.3 Routing**
- `users.routes.ts`

---

### Phase 7: Products (Priority: MEDIUM)

**7.1 Store**
- `src/app/features/products/services/products.store.ts`

**7.2 Components**
- `product-list/product-list.component.ts` + HTML - List with category filter
- `product-create/product-create.component.ts` + HTML - Create/edit form

**7.3 Routing**
- `products.routes.ts`

---

### Phase 8: Sales (Priority: MEDIUM)

**8.1 Store**
- `src/app/features/sales/services/sales.store.ts`

**8.2 Components**
- `sale-list/sale-list.component.ts` + HTML - List with status filter
- `sale-create/sale-create.component.ts` + HTML - Invoice form with line items
- `sale-line-item/sale-line-item.component.ts` + HTML - Dynamic line item row

**8.3 Routing**
- `sales.routes.ts`

---

### Phase 9: Purchases (Priority: MEDIUM)

**9.1 Store**
- `src/app/features/purchases/services/purchases.store.ts`

**9.2 Components**
- `purchase-list/purchase-list.component.ts` + HTML - List with status filter
- `purchase-create/purchase-create.component.ts` + HTML - PO form with line items
- `purchase-line-item/purchase-line-item.component.ts` + HTML - Dynamic line item row

**9.3 Routing**
- `purchases.routes.ts`

---

### Phase 10: Inventory (Priority: LOW)

**10.1 Store**
- `src/app/features/inventory/services/inventory.store.ts`

**10.2 Components**
- `inventory-list/inventory-list.component.ts` + HTML - Stock levels with alerts
- `inventory-detail/inventory-detail.component.ts` + HTML - Movement history

**10.3 Routing**
- `inventory.routes.ts`

---

### Phase 11: Main Application Wiring

**11.1 Root Files**
- Update `src/app/app.config.ts` - Add all providers (HttpClient, interceptors)
- Update `src/app/app.routes.ts` - Wire all feature routes
- Update `src/app/app.ts` - Add theme service initialization

---

### Phase 12: Testing & Polish (Priority: LOW)

**12.1 Unit Tests**
- Core services (auth, mock-api, stores)
- Shared components
- Feature components

**12.2 UI Polish**
- Loading animations
- Page transitions
- Error handling
- Toast notifications

**12.3 Accessibility Audit**
- Keyboard navigation
- Screen reader testing
- Color contrast validation

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ User can log in and register
- ✅ User can switch between companies
- ✅ User can manage companies (CRUD)
- ✅ User can manage users with roles (CRUD)
- ✅ Dashboard displays real-time metrics and charts
- ✅ User can manage products (CRUD)
- ✅ User can create sales with multiple line items
- ✅ User can create purchases with multiple line items
- ✅ User can view inventory levels and movements
- ✅ User can export data to CSV/PDF
- ✅ User can toggle dark mode
- ✅ Permission-based UI rendering works correctly

### Non-Functional Requirements
- ✅ Responsive on mobile, tablet, desktop
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Page load time < 2 seconds
- ✅ Smooth animations and transitions
- ✅ Works offline with localStorage
- ✅ No console errors or warnings
- ✅ TypeScript strict mode passes
- ✅ All unit tests pass (80%+ coverage)

---

## 📊 Estimated Implementation Timeline

**Single PR Approach (as per Q1: A)**

### Week 1: Foundation & Core
- **Day 1-2:** Setup (Tailwind, dependencies, config) + Core services
- **Day 3-4:** Shared UI components + Layout components
- **Day 5:** Authentication feature + routing

### Week 2: Core Features
- **Day 6-7:** Dashboard with charts
- **Day 8:** Company management
- **Day 9:** User management
- **Day 10:** Products module

### Week 3: Business Features
- **Day 11-12:** Sales module (complex forms)
- **Day 13:** Purchases module
- **Day 14:** Inventory module
- **Day 15:** Export functionality

### Week 4: Testing & Polish
- **Day 16-17:** Unit tests for core services and stores
- **Day 18:** Component tests
- **Day 19:** UI polish, animations, accessibility
- **Day 20:** Final QA, bug fixes, documentation

**Total Estimate:** 20 working days (4 weeks, 1 developer)

---

## 🤝 Next Steps - AWAITING APPROVAL

### Before Implementation Begins:

**User Action Required:**
Please review this comprehensive plan and confirm:

1. ✅ **Scope approval** - Do all features, priorities, and technical decisions align with your vision?
2. ✅ **Design approval** - Are you satisfied with the HubSpot-inspired design system?
3. ✅ **Timeline approval** - Is the 4-week timeline acceptable?
4. ✅ **Any changes needed?** - Anything you'd like to add, remove, or modify?

**Once approved, I will:**
1. Create `develop` branch from `main`
2. Create feature branch `feat/umbrella-frontend-mvp` from `develop`
3. Begin Phase 1: Foundation & Setup
4. Provide progress updates after each phase
5. Create comprehensive PR when complete

**Ready to begin implementation?** 🚀

---

## 📝 Notes

- This is a **planning session only** - no implementation yet
- All code will follow Angular 20 standalone architecture
- No Angular Signals for state (RxJS only as per CLAUDE.md)
- Focus on best-in-class UI/UX
- MockAPI will simulate 300ms network delay for realism
- localStorage will persist all data

---

## 🔄 Iteration History

### Iteration 1 (2025-11-26 - Initial Planning)
- ✅ Created session file
- ✅ Defined project scope (8 feature modules)
- ✅ Outlined architecture (Angular 20 standalone)
- ✅ Prepared 15 clarification questions
- ✅ Status: Waiting for user feedback

### Iteration 2 (2025-11-26 - Requirements Finalization)
- ✅ Received user responses to all 15 questions
- ✅ Finalized design system (HubSpot-inspired)
- ✅ Consulted angular-frontend-developer agent
- ✅ Received comprehensive UI/UX guidance (8 documentation files created)
- ✅ Defined technical decisions:
  - Tailwind CSS with custom HubSpot theme
  - Chart.js integration via ng2-charts
  - Custom DataTable component (no external library)
  - Submit-only form validation
  - Skeleton loaders for loading states
  - CSV/PDF export functionality
  - Multi-currency support via Intl API
- ✅ Created detailed implementation roadmap (12 phases, 90+ files)
- ✅ Estimated timeline: 4 weeks (20 working days)
- ✅ Status: **APPROVED - READY TO BEGIN IMPLEMENTATION**

### Iteration 3 (2025-11-26 - Final Approval)
- ✅ User approved scope, design, and timeline
- ✅ User confirmed custom DataTable (no library)
- ✅ All decisions finalized
- ✅ Status: **READY TO START CODING**

---

## 📚 Additional Resources

### Agent-Generated Documentation
The angular-frontend-developer agent created comprehensive documentation in `.claude/doc/`:

1. **README.md** - Navigation guide
2. **ONE-PAGE-CHEATSHEET.md** - Quick reference (print this!)
3. **IMPLEMENTATION-SUMMARY.md** - Executive overview
4. **design-system-implementation.md** - Complete 20-section guide
5. **quick-reference-guide.md** - 12 actionable patterns
6. **component-blueprints.md** - 15 ready-to-copy components
7. **tailwind-config-reference.js** - Complete Tailwind config
8. **INDEX.md** - Documentation index

All documentation is production-ready and can be used during implementation.
