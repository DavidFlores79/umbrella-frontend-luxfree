# Phase 9: Purchases Management - Quick Summary

**Status**: Implementation Plan Ready
**Complexity**: HIGH (FormArray with dynamic line items)
**Estimated Time**: 6-8 hours
**Dependencies**: Phase 7 (Products) must be implemented first

---

## What This Phase Implements

Full CRUD Purchase Order management with:
- Purchase order list with search and filtering
- Create/edit purchase orders with vendor information
- Dynamic line items using Angular FormArray
- Automatic calculation of subtotals, tax, and totals
- Status workflow: draft → ordered → received → paid → cancelled
- Responsive design (desktop table + mobile cards)

---

## Files to Create (6 new files)

```
src/app/features/purchases/
├── services/
│   └── purchases.store.ts                    (Store - RxJS state management)
├── purchase-list/
│   ├── purchase-list.component.ts            (List view)
│   └── purchase-list.component.html
├── purchase-create/
│   ├── purchase-create.component.ts          (Form with FormArray)
│   └── purchase-create.component.html
└── purchases.routes.ts                       (Routing)
```

## Files to Modify (1 file)

```
src/app/app.routes.ts  (Add purchases route)
```

---

## Key Technical Challenges

### 1. FormArray for Line Items (NEW)

This is the most complex part - not seen in Phase 5:

```typescript
// Form structure
items: FormArray = this.fb.array([
  this.createLineItemFormGroup()  // Start with one empty line
])

// Add line item
addLineItem(): void {
  this.items.push(this.createLineItemFormGroup());
}

// Remove line item
removeLineItem(index: number): void {
  if (this.items.length > 1) {
    this.items.removeAt(index);
  }
}
```

### 2. Auto-Calculation

Calculate totals automatically when line items change:

```typescript
get purchaseTotal(): number {
  return this.purchaseSubtotal + this.purchaseTaxAmount;
}

calculateLineItemTotal(index: number): number {
  const item = this.items.at(index);
  const quantity = item.get('quantity')?.value || 0;
  const unitCost = item.get('unitCost')?.value || 0;
  const taxRate = item.get('taxRate')?.value || 0;

  const subtotal = quantity * unitCost;
  const taxAmount = subtotal * (taxRate / 100);
  return subtotal + taxAmount;
}
```

### 3. Product Dropdown Integration

Load products from ProductsStore:

```typescript
private readonly productsStore = inject(ProductsStore);
readonly products$ = this.productsStore.products$;

readonly productOptions$ = this.products$.pipe(
  map(products => products.map(p => ({
    value: p.id,
    label: `${p.name} (${p.sku}) - $${p.cost}`
  })))
);
```

---

## Implementation Workflow

### Phase 1: Store (30 min)
1. Create `purchases.store.ts`
2. Copy `companies.store.ts` pattern
3. Update types to Purchase
4. Test build

### Phase 2: List Component (1 hour)
1. Create `purchase-list.component.ts/html`
2. Copy `company-list` pattern
3. Update columns: PO#, Vendor, Date, Total, Status
4. Update status badge colors
5. Test build

### Phase 3: Create Component (3-4 hours) - COMPLEX
1. Create `purchase-create.component.ts/html`
2. Copy `company-create` base structure
3. **Add FormArray for line items**
4. Implement add/remove line items
5. Implement auto-calculations
6. Create vendor info section
7. Create line items section with FormArray
8. Create totals display
9. Test build

### Phase 4: Routes (15 min)
1. Create `purchases.routes.ts`
2. Update `app.routes.ts`
3. Test build

### Phase 5: Testing (1-2 hours)
1. Test list view
2. Test create with multiple line items
3. Test edit mode
4. Test calculations
5. Test responsive design

---

## Status Badge Colors

```typescript
getStatusBadgeVariant(status: PurchaseStatus): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'received': return 'success';  // Green
    case 'paid': return 'success';      // Green
    case 'ordered': return 'info';      // Blue
    case 'draft': return 'info';        // Blue
    case 'cancelled': return 'error';   // Red
    default: return 'info';
  }
}
```

---

## Purchase Order Form Fields

### Vendor Information
- vendorName (required, min 2 chars)
- vendorEmail (required, email format)
- vendorPhone (optional, phone pattern)

### Purchase Details
- status (required, dropdown: draft/ordered/received/paid/cancelled)
- paymentMethod (optional, dropdown: cash/check/credit_card/bank_transfer/other)
- notes (optional, textarea)

### Line Items (FormArray)
Each line item has:
- productId (required, dropdown from ProductsStore)
- quantity (required, min 1)
- unitCost (required, min 0)
- taxRate (optional, 0-100%)
- **Total (calculated, read-only)**

### Purchase Totals (Calculated)
- Subtotal (sum of all line item subtotals)
- Tax Amount (sum of all line item taxes)
- Total (subtotal + tax amount)

---

## DTO Transformation

**CRITICAL**: Line item DTO only includes productId, quantity, unitCost

```typescript
const lineItems: CreatePurchaseLineItemDto[] = formValue.items.map((item: any) => ({
  productId: item.productId,
  quantity: item.quantity,
  unitCost: item.unitCost
  // NO taxRate - backend calculates it from product
}));

const purchaseData: CreatePurchaseDto = {
  companyId,
  vendorName,
  vendorEmail,
  vendorPhone,
  items: lineItems,
  status,
  paymentMethod,
  notes,
  createdBy: userId
};
```

---

## Common Pitfalls

1. **FormArray Type Errors**: Use getter `get items(): FormArray`
2. **Missing Products**: Implement Phase 7 first
3. **Calculation Timing**: Use getters (not properties) for totals
4. **DTO Transformation**: Don't include taxRate in line item DTO
5. **Edit Mode**: Clear FormArray before adding items
6. **Minimum Items**: Disable remove when only one item
7. **Currency Format**: Use `currency` pipe with proper format
8. **Async Pipe**: Don't forget `| async` on observables

---

## Success Criteria

- [ ] Build passes without errors
- [ ] Can view purchases list
- [ ] Can search/filter purchases
- [ ] Can create purchase with multiple line items
- [ ] Can add/remove line items dynamically
- [ ] Totals calculate correctly
- [ ] Can edit existing purchase
- [ ] Can delete purchases
- [ ] Status badges show correct colors
- [ ] Responsive design works
- [ ] Product dropdown loads products
- [ ] Navigation works

---

## Dependencies

### Required (Must implement first)
- **Phase 7: Products** - For product dropdown in line items

### Used (Already implemented)
- Phase 1: Core services (StoreBase, MockApiService, AuthService)
- Phase 2: UI Components (Card, Button, Badge, Alert, FormInput, FormSelect)
- Phase 5: Pattern reference (CompaniesStore, company-list, company-create)

---

## Reference Files

**Copy these patterns**:
```
src/app/features/companies/services/companies.store.ts
src/app/features/companies/company-list/company-list.component.ts
src/app/features/companies/company-create/company-create.component.ts
```

**Data models**:
```
src/app/shared/models/purchase.model.ts
```

**MockAPI methods** (already implemented):
```typescript
getPurchases(companyId?: string): Observable<Purchase[]>
getPurchase(id: string): Observable<Purchase>
createPurchase(dto: CreatePurchaseDto): Observable<Purchase>
updatePurchase(dto: UpdatePurchaseDto): Observable<Purchase>
deletePurchase(id: string): Observable<void>
```

---

## Next Steps

1. **Read full plan**: `.claude/doc/phase9-purchases/angular-frontend.md`
2. **Implement Phase 7** if not done (Products required)
3. **Create directory structure**
4. **Start with PurchasesStore** (easiest)
5. **Then PurchaseListComponent**
6. **Finally PurchaseCreateComponent** (hardest - FormArray)
7. **Test incrementally**

---

**Total Estimated Time**: 6-8 hours
**Difficulty**: HIGH (FormArray complexity)
**Status**: Ready for implementation
