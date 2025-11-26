# Phase 2 Implementation Plan - Manifest

**Created**: November 26, 2025
**Project**: Umbrella Frontend - Angular 20 MVP
**Branch**: feat/umbrella-frontend-mvp
**Status**: Ready for Implementation
**Estimated Duration**: 4-5 hours

---

## Documentation Package Contents

### Total Size: 95 KB (5 Files)

#### 1. PHASE-2-INDEX.md (14 KB)
**Start Here - Navigation Hub**
- Quick start guide (3 steps)
- Documentation file descriptions
- File locations for copy-paste
- Recommended implementation order
- Troubleshooting guide
- Common patterns reference

#### 2. PHASE-2-IMPLEMENTATION-SUMMARY.md (17 KB)
**Executive Overview**
- Project context and objectives
- 6 components overview
- Implementation approach
- File structure and dependencies
- Build instructions
- Success criteria
- Timeline estimates

#### 3. phase-2-components-implementation.md (32 KB)
**MAIN REFERENCE - Detailed Specifications**
- Complete plan for each component:
  1. Form Textarea (ControlValueAccessor pattern)
  2. Form Checkbox (Boolean form control)
  3. Main Layout (Layout composition)
  4. Header (Service injection + observables)
  5. Sidebar (RBAC navigation)
  6. Footer (Simple presentational)
- Each section includes:
  - Purpose and pattern
  - Implementation details
  - Full template structure
  - Styling approach
  - Accessibility notes
- Implementation checklist
- Key notes and gotchas

#### 4. phase-2-quick-reference.md (12 KB)
**Quick Lookup During Coding**
- File locations (absolute paths)
- Pattern references with code snippets
- HTML template patterns
- Tailwind CSS classes reference
- Key implementation steps
- Common mistakes to avoid
- Theme colors reference

#### 5. phase-2-code-templates.md (20 KB)
**COPY-PASTE READY CODE**
- Complete TypeScript classes for all 6 components
- Full HTML templates for all components
- CSS files (all empty)
- Component summary table
- Usage examples
- Build and deployment instructions

---

## Component Implementation Checklist

### Form Components (2)

#### 1. Form Textarea
```
File: src/app/shared/components/ui/forms/form-textarea/
├── form-textarea.ts          [UPDATE - 150 lines]
├── form-textarea.html        [UPDATE - 50 lines]
└── form-textarea.css         [EMPTY FILE]

Pattern: ControlValueAccessor
Time: 30-45 minutes
Features:
  - Multiline text input
  - Character counter
  - Configurable rows
  - Touch-based error display
  - Full accessibility
```

#### 2. Form Checkbox
```
File: src/app/shared/components/ui/forms/form-checkbox/
├── form-checkbox.ts          [UPDATE - 130 lines]
├── form-checkbox.html        [UPDATE - 45 lines]
└── form-checkbox.css         [EMPTY FILE]

Pattern: ControlValueAccessor (boolean)
Time: 30-45 minutes
Features:
  - Custom styled checkbox
  - Keyboard support (Space/Enter)
  - Toggle functionality
  - Dark mode
  - Full accessibility
```

### Layout Components (4)

#### 3. Main Layout
```
File: src/app/shared/components/layout/main-layout/
├── main-layout.ts            [UPDATE - 20 lines]
├── main-layout.html          [UPDATE - 30 lines]
└── main-layout.css           [EMPTY FILE]

Pattern: Layout composition
Time: 15-20 minutes
Features:
  - Fixed header/footer
  - Responsive sidebar (hidden on mobile)
  - Router outlet
  - Dark mode background
```

#### 4. Header
```
File: src/app/shared/components/layout/header/
├── header.ts                 [UPDATE - 40 lines]
├── header.html               [UPDATE - 80 lines]
└── header.css                [EMPTY FILE]

Pattern: Service injection with observables
Time: 45-60 minutes
Features:
  - App logo and name
  - Dark mode toggle (uses form-toggle)
  - User menu dropdown
  - User info display
  - Logout button
```

#### 5. Sidebar
```
File: src/app/shared/components/layout/sidebar/
├── sidebar.ts                [UPDATE - 60 lines]
├── sidebar.html              [UPDATE - 30 lines]
└── sidebar.css               [EMPTY FILE]

Pattern: Service injection with RBAC
Time: 45-60 minutes
Features:
  - 7 navigation items
  - Active route highlighting
  - Role-based filtering
  - Emoji icons
  - Scrollable content
```

#### 6. Footer
```
File: src/app/shared/components/layout/footer/
├── footer.ts                 [UPDATE - 15 lines]
├── footer.html               [UPDATE - 25 lines]
└── footer.css                [EMPTY FILE]

Pattern: Simple presentational
Time: 15-20 minutes
Features:
  - Dynamic copyright year
  - Version display
  - Policy links
  - Responsive layout
```

---

## Key Technologies & Patterns

### Angular 20 Features Used
- Standalone components (`standalone: true`)
- `inject()` function for DI
- Control flow syntax (`@if`, `@for`, `@else`)
- `async` pipe for observables
- Reactive forms integration
- Routing with `routerLink`

### Design Patterns Applied
- ControlValueAccessor (form integration)
- Dependency injection (service access)
- Observable pattern (reactive data)
- Component composition (layout structure)
- RBAC (role-based navigation)

### Styling Approach
- Tailwind CSS utilities only
- HubSpot color palette
- Dark mode support (`dark:` prefix)
- Mobile-first responsive design
- Accessibility-first ARIA attributes

---

## Dependencies & Services

### Existing Services (Already Implemented)
- `AuthService` - User authentication
- `ThemeService` - Dark mode toggle
- `PermissionService` - RBAC
- `Router` - Angular routing

### Existing Components (Reference Only)
- `FormInput` - Reference for form patterns
- `FormToggle` - Reference for form patterns
- `FormSelect` - Reference for form patterns
- `Button` - Reference for Tailwind styling
- `Card` - Reference for container styling

### Angular Modules
- `CommonModule` - Control flow and pipes
- `FormsModule` - Form controls
- `RouterModule` - Routing directives

---

## Build & Deploy

### Development
```bash
ng build          # Build for development
ng serve          # Start dev server
ng test           # Run tests
```

### Production
```bash
ng build --configuration production  # Production build
```

### Verification
```bash
npx tsc --noEmit  # Check TypeScript
ng lint           # Check linting (if configured)
```

---

## Implementation Timeline

### Phase 1: Planning (0-2 hours)
- Read PHASE-2-INDEX.md (5 min)
- Read PHASE-2-IMPLEMENTATION-SUMMARY.md (10 min)
- Review phase-2-components-implementation.md sections (20 min per component)

### Phase 2: Implementation (3-4 hours)
- Footer: 15-20 min
- Form Textarea: 30-45 min
- Form Checkbox: 30-45 min
- Main Layout: 15-20 min
- Header: 45-60 min
- Sidebar: 45-60 min

### Phase 3: Testing & Build (30-45 min)
- Manual testing
- Dark mode testing
- Accessibility testing
- Final build

### Total: 4-5 hours

---

## Success Criteria

After completing all implementations:

- [ ] TypeScript strict mode: no errors
- [ ] Build succeeds: `ng build`
- [ ] No console warnings
- [ ] Layout renders correctly
- [ ] Dark mode works
- [ ] Navigation works
- [ ] Form components work with reactive forms
- [ ] Responsive on mobile/tablet/desktop
- [ ] All ARIA attributes present
- [ ] Keyboard navigation works
- [ ] No build size increase

---

## File Locations (Absolute Paths)

### Form Textarea
```
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-textarea/form-textarea.ts
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-textarea/form-textarea.html
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-textarea/form-textarea.css
```

### Form Checkbox
```
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-checkbox/form-checkbox.ts
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-checkbox/form-checkbox.html
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/ui/forms/form-checkbox/form-checkbox.css
```

### Main Layout
```
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/main-layout/main-layout.ts
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/main-layout/main-layout.html
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/main-layout/main-layout.css
```

### Header
```
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/header/header.ts
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/header/header.html
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/header/header.css
```

### Sidebar
```
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/sidebar/sidebar.ts
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/sidebar/sidebar.html
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/sidebar/sidebar.css
```

### Footer
```
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/footer/footer.ts
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/footer/footer.html
/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/src/app/shared/components/layout/footer/footer.css
```

---

## Documentation File Map

```
.claude/doc/
├── PHASE-2-INDEX.md                      (Navigation hub)
├── PHASE-2-IMPLEMENTATION-SUMMARY.md      (Executive summary)
├── phase-2-components-implementation.md   (Detailed specs) *** MAIN REFERENCE
├── phase-2-quick-reference.md             (Quick lookup)
├── phase-2-code-templates.md              (Copy-paste code)
├── MANIFEST.md                            (This file)
└── [Other documentation files]
```

---

## How to Use This Package

### Step 1: Understand the Scope
1. Read: PHASE-2-INDEX.md (5 min)
2. Quick overview of all 6 components

### Step 2: Learn the Details
1. Read: PHASE-2-IMPLEMENTATION-SUMMARY.md (10 min)
2. Understand architecture approach
3. Review timeline estimates

### Step 3: Implement Each Component
**For each component:**
1. Read relevant section in phase-2-components-implementation.md (20 min)
2. Copy code from phase-2-code-templates.md (5 min)
3. Update .ts and .html files (30-60 min)
4. Build and verify: `ng build` (2 min)
5. Use phase-2-quick-reference.md for quick lookups as needed

### Step 4: Test & Deploy
1. Manual testing (10 min)
2. Accessibility testing (5 min)
3. Dark mode testing (5 min)
4. Final build: `ng build --configuration production` (5 min)

---

## Important Reminders

### Do NOT
- Modify existing components (form-input, form-toggle, button, card, etc.)
- Create custom CSS files (use Tailwind only)
- Change Tailwind configuration
- Implement features (leave for next phase)
- Skip any component

### Do
- Follow the recommended implementation order
- Build after each component to catch errors early
- Test dark mode and responsiveness
- Check accessibility as you go
- Use provided code templates

---

## What's Included vs Not Included

### Included (in this package)
- ✓ Detailed specifications for all 6 components
- ✓ Complete working code templates
- ✓ Pattern references and examples
- ✓ Styling guidelines
- ✓ Accessibility guidelines
- ✓ Build instructions
- ✓ Testing guidelines

### NOT Included (out of scope)
- ✗ Actual feature implementation
- ✗ Feature routes and navigation
- ✗ Feature stores and state management
- ✗ API integration
- ✗ Backend connectivity
- ✗ Unit/e2e tests

---

## Next Steps After Completion

1. Update app.ts to use main-layout
2. Add feature routes to app.routes.ts
3. Implement feature modules:
   - Dashboard
   - Companies
   - Users
   - Products
   - Sales
   - Purchases
   - Inventory
4. Integrate form components in feature forms
5. Deploy to production

---

## Reference Materials

### Angular 20
- https://angular.io/docs
- Standalone Components: https://angular.io/guide/standalone-components
- Reactive Forms: https://angular.io/guide/reactive-forms
- Dependency Injection: https://angular.io/guide/dependency-injection

### Tailwind CSS
- https://tailwindcss.com/docs
- Dark Mode: https://tailwindcss.com/docs/dark-mode
- Responsive Design: https://tailwindcss.com/docs/responsive-design

### Accessibility
- ARIA Guidelines: https://www.w3.org/WAI/ARIA/apg/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

## Contact & Questions

All questions should be answered by reviewing:
1. PHASE-2-INDEX.md (quick navigation)
2. phase-2-components-implementation.md (detailed specs)
3. phase-2-quick-reference.md (quick lookups)
4. phase-2-code-templates.md (working code)

---

## Version History

| Date | Version | Status |
|------|---------|--------|
| Nov 26, 2025 | 1.0 | Documentation Complete |

---

## Sign-Off

This implementation plan has been thoroughly prepared and is ready for implementation.

All scaffolds exist, all code templates are complete, and all dependencies are available.

**Estimated completion: 4-5 hours**

Ready to build!

---

**Created by**: Claude Code - Angular Expert
**For**: Umbrella Frontend MVP - Phase 2/3 Transition
**Archive Date**: November 26, 2025
