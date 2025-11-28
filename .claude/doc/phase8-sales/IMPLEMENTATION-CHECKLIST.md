# Phase 8: Sales Management - Implementation Checklist

## Quick Reference

**Feature**: Sales Management with Dynamic Line Items
**Base Pattern**: Company Management (Phase 5)
**New Pattern**: FormArray for line items with auto-calculation
**Complexity**: Advanced
**Estimated Time**: 4-6 hours

---

## Files to Create

### 1. Sales Store
- **Path**: `src/app/features/sales/services/sales.store.ts`
- **Lines**: ~180
- **Pattern**: Copy from `src/app/features/companies/services/companies.store.ts`
- **Key Changes**: Replace "Company" with "Sale", add `selectedSale` state

### 2. Sale List Component
- **Path**: `src/app/features/sales/sale-list/sale-list.component.ts`
- **Path**: `src/app/features/sales/sale-list/sale-list.component.html`
- **Lines**: ~280 total
- **Pattern**: Copy from `src/app/features/companies/company-list/`
- **Key Changes**:
  - Search by invoice #, customer name, customer email
  - Columns: Invoice #, Customer, Date, Total, Status, Actions
  - Status badges: paid=green, pending=yellow, draft=blue, cancelled=red

### 3. Sale Create Component (COMPLEX - NEW PATTERN)
- **Path**: `src/app/features/sales/sale-create/sale-create.component.ts`
- **Path**: `src/app/features/sales/sale-create/sale-create.component.html`
- **Lines**: ~540 total
- **Pattern**: Base from company-create + **FormArray for line items**
- **Key Features**:
  - Header form: customer info, dates, status, notes
  - Line items FormArray with add/remove buttons
  - Auto-calculation: line totals, subtotal, tax, discount, grand total
  - Product dropdown with auto-fill price and tax

### 4. Sales Routes
- **Path**: `src/app/features/sales/sales.routes.ts`
- **Lines**: ~20
- **Pattern**: Standard feature routes with lazy loading

### 5. Update Main Routes
- **Path**: `src/app/app.routes.ts`
- **Change**: Add sales route with loadChildren

---

## Implementation Sequence

Follow this order to minimize errors:

1. **Create Store** (30 min)
   - Copy companies.store.ts
   - Replace Company with Sale
   - Test state management

2. **Create Routes** (10 min)
   - Create sales.routes.ts
   - Update app.routes.ts

3. **Create List Component** (60 min)
   - Copy company-list structure
   - Update columns and search
   - Test list/delete functionality

4. **Create Form Component** (180-240 min) - MOST COMPLEX
   - Copy company-create base structure
   - Add FormArray for line items
   - Implement auto-calculation logic
   - Add product dropdown integration
   - Test add/remove line items
   - Test calculations
   - Test edit mode

5. **Integration Testing** (30 min)
   - Create new sale
   - Edit existing sale
   - Delete sale
   - Search filtering
   - Mobile responsive

**Total Time**: 4-6 hours

---

## Critical New Patterns (Not in Company CRUD)

### FormArray Declaration

```typescript
this.form = this.fb.group({
  // ... other fields
  items: this.fb.array([])
});

get items(): FormArray {
  return this.form.get('items') as FormArray;
}
```

### Creating Line Item FormGroup

```typescript
private createLineItemFormGroup(item?: SaleLineItem): FormGroup {
  const lineItem = this.fb.group({
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0)]],
    taxRate: [0, [Validators.min(0), Validators.max(100)]],
    discount: [0, [Validators.min(0)]],
    total: [{ value: 0, disabled: true }]
  });

  // Auto-calculate on changes
  lineItem.valueChanges.subscribe(() => {
    this.calculateLineItemTotal(lineItem);
    this.calculateGrandTotal();
  });

  return lineItem;
}
```

### Auto-Calculation

```typescript
private calculateLineItemTotal(lineItemGroup: FormGroup): void {
  const quantity = lineItemGroup.get('quantity')?.value || 0;
  const price = lineItemGroup.get('price')?.value || 0;
  const taxRate = lineItemGroup.get('taxRate')?.value || 0;
  const discount = lineItemGroup.get('discount')?.value || 0;

  const subtotal = quantity * price;
  const discountAmount = discount;
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount;

  // emitEvent: false prevents infinite loop
  lineItemGroup.patchValue({ total }, { emitEvent: false });
}
```

### Add/Remove Line Items

```typescript
addLineItem(): void {
  this.items.push(this.createLineItemFormGroup());
}

removeLineItem(index: number): void {
  if (this.items.length > 1) {
    this.items.removeAt(index);
    this.calculateGrandTotal();
  }
}
```

### Product Auto-Fill

```typescript
onProductChange(index: number): void {
  const lineItem = this.items.at(index);
  const productId = lineItem.get('productId')?.value;

  this.products$.pipe(take(1)).subscribe(products => {
    const product = products.find(p => p.id === productId);
    if (product) {
      lineItem.patchValue({
        price: product.price,
        taxRate: product.taxRate
      });
    }
  });
}
```

### Template FormArray Binding

```html
<tbody formArrayName="items">
  <tr *ngFor="let item of items.controls; let i = index" [formGroupName]="i">
    <td>
      <select formControlName="productId" (change)="onProductChange(i)">
        <option value="">Select product</option>
        <option *ngFor="let product of products$ | async" [value]="product.id">
          {{ product.name }}
        </option>
      </select>
    </td>
    <td>
      <input type="number" formControlName="quantity" min="1" />
    </td>
    <!-- ... more fields -->
    <td>
      <button type="button" (click)="removeLineItem(i)">Remove</button>
    </td>
  </tr>
</tbody>
```

---

## Common Pitfalls

### 1. Infinite Loop in valueChanges

**Problem**: Patching values triggers valueChanges infinitely

**Solution**: Use `{ emitEvent: false }`
```typescript
lineItemGroup.patchValue({ total }, { emitEvent: false });
```

### 2. FormArray Not Clearing on Edit

**Problem**: Edit mode duplicates line items

**Solution**: Clear before adding
```typescript
this.items.clear();
sale.items.forEach(item => {
  this.items.push(this.createLineItemFormGroup(item));
});
```

### 3. Product Dropdown Empty

**Problem**: Products not loaded when form opens

**Solution**: Load products in ngOnInit BEFORE route params
```typescript
ngOnInit(): void {
  this.initializeForm();
  this.productsStore.loadProducts(); // First
  this.route.params.subscribe(...);  // Then
}
```

### 4. Can Delete All Line Items

**Problem**: User removes all items

**Solution**: Guard with minimum check
```typescript
if (this.items.length > 1) {
  this.items.removeAt(index);
}
```

### 5. Type Errors with FormArray

**Problem**: TypeScript errors accessing controls

**Solution**: Use getter with proper type casting
```typescript
get items(): FormArray {
  return this.form.get('items') as FormArray;
}
```

---

## Testing Checklist

### Store Tests
- [ ] loadSales() populates state
- [ ] createSale() adds to array
- [ ] updateSale() modifies existing
- [ ] deleteSale() removes from array
- [ ] selectSale() sets selectedSale
- [ ] Error states handled correctly

### List Component Tests
- [ ] Displays sales in table
- [ ] Search filters by invoice/customer
- [ ] Status badges show correct colors
- [ ] Edit navigates with ID
- [ ] Delete confirms and removes
- [ ] Empty state shows when no sales
- [ ] Mobile cards display properly

### Form Component Tests
- [ ] Form initializes empty with 1 line item
- [ ] Can add multiple line items
- [ ] Can remove line items (min 1)
- [ ] Product selection auto-fills price/tax
- [ ] Line item totals calculate correctly
- [ ] Grand total calculates correctly
- [ ] Validation prevents invalid submission
- [ ] Edit mode loads existing sale
- [ ] Edit mode loads all line items
- [ ] Submit creates new sale
- [ ] Submit updates existing sale
- [ ] Navigation after save works

### Integration Tests
- [ ] Create → List flow works
- [ ] Edit → List flow works
- [ ] Delete from list works
- [ ] Search updates filtered list
- [ ] Responsive layouts work
- [ ] Error alerts display and dismiss

---

## Dependencies Checklist

### Existing Services
- [x] MockApiService with getSales(), createSale(), updateSale(), deleteSale()
- [x] ProductsStore with loadProducts()
- [x] AuthService (for createdBy)
- [x] CompanyContextService (for companyId)

### Existing Models
- [x] Sale interface
- [x] SaleLineItem interface
- [x] SaleStatus type
- [x] CreateSaleDto interface
- [x] Product interface

### Existing Components
- [x] Card
- [x] Button
- [x] FormInput
- [x] FormSelect
- [x] Badge
- [x] Alert
- [x] EmptyState
- [x] SearchBar

### Existing Pipes
- [x] DateFormatPipe
- [ ] CurrencyFormatPipe (or use built-in currency pipe)

### Existing Guards
- [x] authGuard

---

## Status Badge Color Mapping

```typescript
getStatusBadgeVariant(status: SaleStatus): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'paid': return 'success';      // Green
    case 'pending': return 'warning';   // Yellow
    case 'draft': return 'info';        // Blue
    case 'cancelled': return 'error';   // Red
    default: return 'info';
  }
}
```

---

## Quick Start Commands

```bash
# Verify ProductsStore exists
# Should find: src/app/features/products/services/products.store.ts

# Create directory structure
mkdir -p src/app/features/sales/services
mkdir -p src/app/features/sales/sale-list
mkdir -p src/app/features/sales/sale-create

# Create files (in order)
# 1. src/app/features/sales/services/sales.store.ts
# 2. src/app/features/sales/sales.routes.ts
# 3. src/app/features/sales/sale-list/sale-list.component.ts
# 4. src/app/features/sales/sale-list/sale-list.component.html
# 5. src/app/features/sales/sale-create/sale-create.component.ts
# 6. src/app/features/sales/sale-create/sale-create.component.html
# 7. Update src/app/app.routes.ts

# Verify compilation
ng build

# Start dev server
ng serve
```

---

## Success Criteria

Implementation is complete when:

1. **All files created** without TypeScript errors
2. **List view displays** sales with search and badges
3. **Create form** allows adding multiple line items
4. **Line items** auto-calculate totals correctly
5. **Product dropdown** auto-fills price and tax
6. **Edit mode** loads sale with all line items
7. **CRUD operations** work end-to-end
8. **Navigation flows** correctly between views
9. **Mobile responsive** layouts work
10. **Routes registered** in app.routes.ts

---

## Documentation Reference

For complete implementation details, code templates, and architectural explanations, see:

**Main Document**: `.claude/doc/phase8-sales/angular-frontend.md`

This checklist is a quick reference. Refer to the main document for:
- Complete code templates
- Architectural explanations
- Detailed pattern descriptions
- Edge case handling
- Performance optimization tips
