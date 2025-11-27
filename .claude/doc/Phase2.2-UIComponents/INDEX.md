# Phase 2.2 UI Components - Documentation Index

## Overview

This directory contains the complete implementation plan for the remaining Phase 2 UI components for the Umbrella Frontend MVP project. The documentation provides detailed specifications, code templates, usage examples, and testing strategies for 11 essential components following Angular 20 standalone architecture and the HubSpot-inspired design system.

**Project**: Umbrella Frontend - Multi-company Income & Expense Management System
**Framework**: Angular 20.3 with Standalone Components
**Design System**: HubSpot-inspired (Tailwind CSS)
**Architecture**: Clean Architecture with RxJS state management

---

## Documentation Files

### 1. angular-frontend.md (Primary Implementation Plan)
**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/.claude/doc/Phase2.2-UIComponents/angular-frontend.md`
**Size**: 62 KB | 2,254 lines
**Purpose**: Complete implementation specifications

**Contents**:
- Project context and architecture overview
- Design system reference (color palette, spacing, typography)
- Detailed implementation for all 11 components:
  1. Badge Component
  2. Alert Component
  3. Empty State Component
  4. Chip Component
  5. Stat Card Component
  6. Skeleton Loader Component
  7. Data Table Component
  8. Pagination Component
  9. Search Bar Component
  10. Currency Pipe
  11. Date Format Pipe
- Complete TypeScript code for each component
- HTML templates with Tailwind CSS classes
- TypeScript interfaces and type definitions
- Testing strategies (unit, integration, e2e)
- Accessibility requirements (WCAG 2.1 AA)
- Performance considerations
- Common patterns and anti-patterns

**Use This For**:
- Implementing any component from scratch
- Understanding component architecture
- Code review and quality assurance
- Learning Angular 20 best practices

---

### 2. IMPLEMENTATION-SUMMARY.md
**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/.claude/doc/Phase2.2-UIComponents/IMPLEMENTATION-SUMMARY.md`
**Size**: 10 KB | 414 lines
**Purpose**: High-level overview and project summary

**Contents**:
- Component list with descriptions
- File structure overview
- Key features checklist
- Color palette reference
- Usage examples
- Implementation checklist (6-day plan)
- Testing requirements
- Integration points with existing components
- Performance metrics
- Accessibility compliance summary

**Use This For**:
- Understanding project scope
- Planning implementation timeline
- Quick feature reference
- Stakeholder communication

---

### 3. QUICK-REFERENCE.md
**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/.claude/doc/Phase2.2-UIComponents/QUICK-REFERENCE.md`
**Size**: 14 KB | 695 lines
**Purpose**: Developer quick lookup guide

**Contents**:
- Component import statements
- Quick usage examples for each component
- TypeScript interface definitions
- Color variant mappings
- Accessibility quick tips
- Dark mode classes reference
- Common implementation patterns
- Performance tips
- Troubleshooting guide
- Testing snippets
- File location reference

**Use This For**:
- Quick component lookup while coding
- Copy-paste code snippets
- Troubleshooting common issues
- Daily development reference

---

### 4. INDEX.md (This File)
**File**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/.claude/doc/Phase2.2-UIComponents/INDEX.md`
**Purpose**: Navigation and documentation overview

**Contents**:
- Documentation file descriptions
- Component quick links
- Feature matrix
- Related documentation
- Getting started guide

---

## Component Quick Links

### UI Components

#### 1. Badge Component
- **File**: `src/app/shared/components/ui/badge/badge.ts`
- **Purpose**: Status indicators with color variants
- **Variants**: success, warning, error, info, default
- **Sizes**: sm, md, lg
- **Documentation**: angular-frontend.md (Component 1)
- **Quick Reference**: QUICK-REFERENCE.md (Badge section)

#### 2. Alert Component
- **File**: `src/app/shared/components/ui/alert/alert.ts`
- **Purpose**: Notification messages with dismissible option
- **Types**: success, warning, error, info
- **Features**: Icon support, dismissible
- **Documentation**: angular-frontend.md (Component 2)
- **Quick Reference**: QUICK-REFERENCE.md (Alert section)

#### 3. Empty State Component
- **File**: `src/app/shared/components/ui/empty-state/empty-state.ts`
- **Purpose**: Display when no data is available
- **Features**: Custom icon, title, description, action button
- **Content Projection**: Supported
- **Documentation**: angular-frontend.md (Component 3)
- **Quick Reference**: QUICK-REFERENCE.md (Empty State section)

#### 4. Chip Component
- **File**: `src/app/shared/components/ui/chip/chip.ts`
- **Purpose**: Removable tags/labels for filters
- **Variants**: default, primary, success, warning, error, info
- **Features**: Removable, disabled state
- **Documentation**: angular-frontend.md (Component 4)
- **Quick Reference**: QUICK-REFERENCE.md (Chip section)

#### 5. Stat Card Component
- **File**: `src/app/shared/components/ui/stat-card/stat-card.ts`
- **Purpose**: Dashboard metrics with trend indicators
- **Features**: Title, value, change %, trend icon, loading state
- **Trends**: up, down, neutral
- **Documentation**: angular-frontend.md (Component 5)
- **Quick Reference**: QUICK-REFERENCE.md (Stat Card section)

#### 6. Skeleton Loader Component
- **File**: `src/app/shared/components/ui/skeleton-loader/skeleton-loader.ts`
- **Purpose**: Loading state placeholders
- **Variants**: text, circle, rectangle, card, table
- **Features**: Pulse animation, configurable dimensions
- **Documentation**: angular-frontend.md (Component 6)
- **Quick Reference**: QUICK-REFERENCE.md (Skeleton Loader section)

---

### Data Components

#### 7. Data Table Component
- **File**: `src/app/shared/components/data/data-table/data-table.ts`
- **Purpose**: Advanced data grid with sorting and pagination
- **Features**:
  - Sortable columns
  - Row selection (multi-select)
  - Pagination integration
  - Loading states with skeleton
  - Empty state integration
  - Mobile responsive (card view)
- **Inputs**: columns, data, loading, selectable, totalItems, pageSize
- **Outputs**: sortChange, selectionChange, pageChange, rowClick
- **Documentation**: angular-frontend.md (Component 7)
- **Quick Reference**: QUICK-REFERENCE.md (Data Table section)

#### 8. Pagination Component
- **File**: `src/app/shared/components/data/pagination/pagination.ts`
- **Purpose**: Page navigation controls
- **Features**:
  - Next/previous buttons
  - Page number buttons with ellipsis
  - Items per page selector
  - Total count display
- **Inputs**: totalItems, pageSize, currentPage, pageSizeOptions
- **Outputs**: pageChange
- **Documentation**: angular-frontend.md (Component 8)
- **Quick Reference**: QUICK-REFERENCE.md (Pagination section)

#### 9. Search Bar Component
- **File**: `src/app/shared/components/data/search-bar/search-bar.ts`
- **Purpose**: Debounced search input
- **Features**:
  - 300ms debounce (configurable)
  - Clear button
  - Loading indicator
  - Size variants (sm, md, lg)
- **Inputs**: placeholder, debounceTime, loading, size
- **Outputs**: searchChange, clear
- **Documentation**: angular-frontend.md (Component 9)
- **Quick Reference**: QUICK-REFERENCE.md (Search Bar section)

---

### Pipes

#### 10. Currency Pipe
- **File**: `src/app/shared/pipes/currency.pipe.ts`
- **Purpose**: Multi-currency formatting
- **Supported Currencies**: USD, EUR, GBP, MXN, CAD, AUD, JPY, CHF
- **Features**:
  - Auto-detects company currency from CompanyContextService
  - Uses Intl.NumberFormat for proper localization
  - Symbol-only mode
  - Handles null/undefined gracefully
- **Signature**: `transform(value, currencyCode?, symbolOnly?): string`
- **Documentation**: angular-frontend.md (Component 10)
- **Quick Reference**: QUICK-REFERENCE.md (Currency Pipe section)

#### 11. Date Format Pipe
- **File**: `src/app/shared/pipes/date-format.pipe.ts`
- **Purpose**: Flexible date formatting
- **Formats**:
  - short: MM/DD/YYYY
  - medium: Jan 15, 2024
  - long: January 15, 2024
  - relative: "2 hours ago"
- **Features**: Uses Intl.DateTimeFormat, handles multiple input types
- **Signature**: `transform(value, format?): string`
- **Documentation**: angular-frontend.md (Component 11)
- **Quick Reference**: QUICK-REFERENCE.md (Date Format Pipe section)

---

## Feature Matrix

| Component | Variants | Sizes | Dark Mode | A11y | Mobile | Loading | Events |
|-----------|----------|-------|-----------|------|--------|---------|--------|
| Badge | 5 | 3 | Yes | Yes | Yes | N/A | 0 |
| Alert | 4 | 1 | Yes | Yes | Yes | N/A | 1 |
| Empty State | N/A | 1 | Yes | Yes | Yes | N/A | 1 |
| Chip | 6 | 1 | Yes | Yes | Yes | N/A | 1 |
| Stat Card | N/A | 1 | Yes | Yes | Yes | Yes | 0 |
| Skeleton Loader | 5 | Custom | Yes | Yes | Yes | N/A | 0 |
| Data Table | N/A | 1 | Yes | Yes | Yes | Yes | 4 |
| Pagination | N/A | 1 | Yes | Yes | Yes | N/A | 1 |
| Search Bar | N/A | 3 | Yes | Yes | Yes | Yes | 2 |

**Legend**:
- Variants: Number of style variants (colors, types)
- Sizes: Number of size options
- Dark Mode: Supports dark mode
- A11y: WCAG 2.1 AA compliant
- Mobile: Mobile responsive
- Loading: Has loading state
- Events: Number of output events

---

## Technology Stack

### Core Technologies
- **Angular**: 20.3 (Standalone Components)
- **TypeScript**: 5.9 (Strict mode)
- **RxJS**: 7.8 (State management)
- **Tailwind CSS**: 3.4 (Styling)

### Testing
- **Jasmine**: Unit testing framework
- **Karma**: Test runner
- **Cypress**: E2E testing (optional)

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Angular CLI**: Build and generation

---

## Design System

### Color Palette

**Primary**:
- Coral: #FF7A59 (Primary actions, CTA buttons)

**Text**:
- Pickled Bluewood: #2D3E50 (Primary text)
- Light: #6B7C93 (Secondary text)
- Lighter: #A1B1C4 (Tertiary text)

**Background**:
- White: #FFFFFF (Default)
- Forget Me Not: #FFF1EE (Secondary)
- Tertiary: #F7F9FB

**Accent Colors**:
- Blue: #0091AE (Info, trust)
- Green: #00A862 (Success)
- Yellow: #FFB800 (Warning)
- Red: #F2545B (Error, danger)

**Dark Mode**:
- Background: #1A1F2E
- Secondary BG: #242936
- Text: #E5E9F0

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Text Sizes**: sm (14px), base (16px), lg (18px)

### Spacing
- **Scale**: 4px base unit (1, 2, 3, 4, 6, 8, 12, 16, 24...)
- **Custom**: 18 (72px), 88 (352px), 100 (400px)

### Border Radius
- **Scale**: sm, md, lg, xl, 2xl, 3xl
- **Custom**: rounded-full for pills

### Shadows
- **Scale**: sm, md, lg, xl, 2xl
- **Usage**: Cards (md), Modals (xl), Dropdowns (lg)

---

## Architecture Patterns

### Component Structure
```
component-name/
├── component-name.ts       # Component logic
├── component-name.html     # Template
└── component-name.css      # Styles (usually empty)
```

### Standalone Component Pattern
```typescript
@Component({
  selector: 'app-component-name',
  imports: [CommonModule, OtherComponent],
  templateUrl: './component-name.html',
  styleUrl: './component-name.css',
})
export class ComponentName {
  @Input() prop: string = '';
  @Output() eventName = new EventEmitter<void>();
}
```

### Dependency Injection Pattern
```typescript
export class MyComponent {
  private readonly service = inject(MyService);
  private readonly router = inject(Router);
}
```

### Pipe Pattern
```typescript
@Pipe({
  name: 'appPipeName',
  pure: true
})
export class PipeNamePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    // Transformation logic
  }
}
```

---

## Directory Structure

```
src/app/shared/
├── components/
│   ├── ui/
│   │   ├── badge/
│   │   │   ├── badge.ts
│   │   │   ├── badge.html
│   │   │   └── badge.css
│   │   ├── alert/
│   │   ├── empty-state/
│   │   ├── chip/
│   │   ├── stat-card/
│   │   ├── skeleton-loader/
│   │   ├── button/          (existing)
│   │   ├── card/            (existing)
│   │   ├── forms/           (existing)
│   │   │   ├── form-input/
│   │   │   ├── form-select/
│   │   │   ├── form-textarea/
│   │   │   ├── form-checkbox/
│   │   │   └── form-toggle/
│   │   └── index.ts
│   ├── data/
│   │   ├── data-table/
│   │   │   ├── data-table.ts
│   │   │   ├── data-table.html
│   │   │   └── data-table.css
│   │   ├── pagination/
│   │   └── search-bar/
│   └── layout/              (existing)
│       ├── main-layout/
│       ├── header/
│       ├── sidebar/
│       └── footer/
├── pipes/
│   ├── currency.pipe.ts
│   └── date-format.pipe.ts
└── models/                  (existing)
```

---

## Implementation Timeline

### Phase 1: UI Components (Days 1-2)
**Deliverables**:
- Badge component
- Alert component
- Empty State component
- Chip component
- Stat Card component
- Skeleton Loader component
- Unit tests for all components
- Accessibility audit

**Estimated Effort**: 2 days (16 hours)

### Phase 2: Data Components (Days 3-4)
**Deliverables**:
- Data Table component (desktop + mobile)
- Pagination component
- Search Bar component
- Integration tests
- Responsive testing

**Estimated Effort**: 2 days (16 hours)

### Phase 3: Pipes (Day 5)
**Deliverables**:
- Currency Pipe
- Date Format Pipe
- Unit tests
- Integration tests

**Estimated Effort**: 1 day (8 hours)

### Phase 4: Integration & Documentation (Day 6)
**Deliverables**:
- Component export index
- Usage documentation
- Storybook/demo pages (optional)
- Performance testing
- Code review

**Estimated Effort**: 1 day (8 hours)

**Total Timeline**: 6 days (48 hours)

---

## Getting Started

### Prerequisites
1. Angular 20.3 installed
2. Tailwind CSS configured
3. Existing components: button, card, form components, layout components
4. CompanyContextService implemented

### Setup Steps

1. **Create Directory Structure**:
```bash
cd /Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend

# Create UI component directories
mkdir -p src/app/shared/components/ui/{badge,alert,empty-state,chip,stat-card,skeleton-loader}

# Create data component directories
mkdir -p src/app/shared/components/data/{data-table,pagination,search-bar}

# Create pipes directory
mkdir -p src/app/shared/pipes
```

2. **Start with Simple Components**:
   - Begin with Badge (simplest)
   - Then Alert, Chip, Empty State
   - Move to Stat Card, Skeleton Loader
   - Pipes next (Currency, Date Format)
   - Finally complex components (Data Table, Pagination, Search Bar)

3. **Test Each Component**:
   - Create `.spec.ts` file
   - Run `ng test`
   - Verify accessibility
   - Test dark mode

4. **Document Usage**:
   - Add usage examples to component file
   - Update export index
   - Create demo page (optional)

### Implementation Checklist

```markdown
## UI Components
- [ ] Badge component (6 files: .ts, .html, .css, .spec.ts)
- [ ] Alert component (6 files)
- [ ] Empty State component (6 files)
- [ ] Chip component (6 files)
- [ ] Stat Card component (6 files)
- [ ] Skeleton Loader component (6 files)

## Data Components
- [ ] Data Table component (6 files)
- [ ] Pagination component (6 files)
- [ ] Search Bar component (6 files)

## Pipes
- [ ] Currency Pipe (2 files: .ts, .spec.ts)
- [ ] Date Format Pipe (2 files)

## Integration
- [ ] Create export index (index.ts)
- [ ] Update app imports
- [ ] Create demo pages
- [ ] Documentation
- [ ] Code review
```

---

## Related Documentation

### Project Documentation
- **Project Instructions**: `/CLAUDE.md`
- **Angular 20 Guide**: `/.claude/doc/angular20_module_instructions.md`
- **Design System**: `/.claude/doc/design-system-implementation.md`
- **Component Blueprints**: `/.claude/doc/component-blueprints.md`

### Phase Documentation
- **Phase 2 Index**: `/.claude/doc/PHASE-2-INDEX.md`
- **Phase 2 Summary**: `/.claude/doc/PHASE-2-IMPLEMENTATION-SUMMARY.md`
- **Phase 2.1 Forms**: `/.claude/doc/Phase2.1-FormComponents/`

### Configuration
- **Tailwind Config**: `/tailwind.config.js`
- **TypeScript Config**: `/tsconfig.json`
- **Angular Config**: `/angular.json`

---

## Support and Resources

### Documentation Locations
- **Implementation Plan**: `angular-frontend.md` (This directory)
- **Summary**: `IMPLEMENTATION-SUMMARY.md` (This directory)
- **Quick Reference**: `QUICK-REFERENCE.md` (This directory)
- **Index**: `INDEX.md` (This file)

### External Resources
- **Angular Docs**: https://angular.dev
- **Tailwind CSS**: https://tailwindcss.com
- **RxJS**: https://rxjs.dev
- **TypeScript**: https://www.typescriptlang.org

### Common Commands
```bash
# Generate component
ng generate component shared/components/ui/component-name

# Run tests
ng test

# Build project
ng build

# Serve app
ng serve

# Lint code
ng lint
```

---

## FAQ

### Q: Can I use Angular Signals for state management?
**A**: No. This project uses RxJS (BehaviorSubject) for state management. Signals may be used for local UI state only, but are not preferred.

### Q: Why separate .ts and .html files?
**A**: Following the existing project pattern. All components use `component-name.ts` (not `component-name.component.ts`) with separate template files.

### Q: Do all components need to support dark mode?
**A**: Yes. All components must support dark mode using Tailwind's `dark:` utility classes.

### Q: Are these components accessible?
**A**: Yes. All components meet WCAG 2.1 AA standards with proper ARIA labels, keyboard navigation, and focus management.

### Q: Can I customize component styles?
**A**: Yes, but use Tailwind utility classes. Avoid custom CSS unless absolutely necessary.

### Q: How do I add a new variant to a component?
**A**: Update the variant type definition, add color classes to the variant classes object, and update documentation.

---

## Version History

- **v1.0** (November 27, 2025): Initial documentation release
  - 11 components specified
  - Complete implementation plan
  - Testing strategies
  - Accessibility requirements

---

## Contributing

When implementing these components:

1. **Follow Angular 20 patterns**: Standalone components, inject() DI
2. **Use TypeScript strictly**: No any types, proper interfaces
3. **Maintain accessibility**: WCAG 2.1 AA compliance
4. **Support dark mode**: All components must work in both modes
5. **Test thoroughly**: Unit, integration, and accessibility tests
6. **Document usage**: Add JSDoc comments and usage examples

---

## File Summary

This directory contains **4 documentation files** with **3,363 total lines**:

1. **angular-frontend.md**: 62 KB, 2,254 lines - Primary implementation plan
2. **IMPLEMENTATION-SUMMARY.md**: 10 KB, 414 lines - Project overview
3. **QUICK-REFERENCE.md**: 14 KB, 695 lines - Developer quick reference
4. **INDEX.md**: This file - Documentation index and navigation

**Total Documentation Size**: ~86 KB

---

**Location**: `/Users/LAPTOP-david-001/Development/apps/Angular/umbrella-frontend/.claude/doc/Phase2.2-UIComponents/`

**Last Updated**: November 27, 2025

**Status**: Ready for Implementation
