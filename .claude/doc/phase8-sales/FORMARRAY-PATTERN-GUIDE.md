# FormArray Pattern Guide - Sales Line Items

## Visual Architecture

```
SaleCreateComponent
│
├── Form (FormGroup)
│   ├── customerName (FormControl)
│   ├── customerEmail (FormControl)
│   ├── customerPhone (FormControl)
│   ├── saleDate (FormControl)
│   ├── dueDate (FormControl)
│   ├── status (FormControl)
│   ├── notes (FormControl)
│   │
│   └── items (FormArray) ← DYNAMIC COLLECTION
│       ├── [0] LineItem (FormGroup)
│       │   ├── productId (FormControl)
│       │   ├── quantity (FormControl) ──┐
│       │   ├── price (FormControl) ─────┤
│       │   ├── taxRate (FormControl) ───┼─→ Auto-calculate total
│       │   ├── discount (FormControl) ──┤
│       │   └── total (FormControl - readonly) ←┘
│       │
│       ├── [1] LineItem (FormGroup)
│       │   └── ... same structure
│       │
│       └── [n] LineItem (FormGroup)
│           └── ... same structure
│
├── Products (from ProductsStore) → Auto-fill price/tax
│
└── Calculations (reactive)
    ├── Line Item Total = (qty × price) - discount + tax
    └── Grand Total = Σ all line totals
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interactions                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FormArray Actions                         │
│  • Add Line Item → items.push(newFormGroup)                 │
│  • Remove Line Item → items.removeAt(index)                 │
│  • Select Product → onProductChange(index)                  │
│  • Change Quantity/Price → valueChanges                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Auto-Calculation Chain                      │
│                                                              │
│  1. valueChanges triggered                                  │
│  2. calculateLineItemTotal(lineItem)                        │
│  3. calculateGrandTotal()                                   │
│  4. Update component properties:                            │
│     • subtotalAmount                                        │
│     • taxAmount                                             │
│     • discountAmount                                        │
│     • grandTotal                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Template Rendering                        │
│  • Line items table (formArrayName="items")                 │
│  • Totals summary (bound to component properties)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Calculation Flow

### Line Item Calculation

```
Input:
  quantity = 5
  price = 100
  discount = 50
  taxRate = 10%

Calculation Steps:
  1. Subtotal = quantity × price
     → 5 × 100 = 500

  2. After Discount = subtotal - discount
     → 500 - 50 = 450

  3. Tax Amount = after_discount × (taxRate / 100)
     → 450 × 0.10 = 45

  4. Line Total = after_discount + tax_amount
     → 450 + 45 = 495

Output:
  total = 495
```

### Grand Total Calculation

```
Line Items:
  Item 1: qty=2, price=100, discount=0, tax=10%
    → subtotal=200, tax=20, total=220

  Item 2: qty=3, price=50, discount=10, tax=15%
    → subtotal=150, discount=10, after_discount=140, tax=21, total=161

  Item 3: qty=1, price=200, discount=20, tax=8%
    → subtotal=200, discount=20, after_discount=180, tax=14.4, total=194.4

Grand Total Calculation:
  Subtotal = 200 + 150 + 200 = 550
  Total Discount = 0 + 10 + 20 = 30
  Total Tax = 20 + 21 + 14.4 = 55.4
  Grand Total = 550 - 30 + 55.4 = 575.4
```

---

## Component Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                     ngOnInit()                            │
├──────────────────────────────────────────────────────────┤
│  1. initializeForm()                                     │
│     → Create FormGroup with empty FormArray             │
│                                                          │
│  2. productsStore.loadProducts()                        │
│     → Load products for dropdown                        │
│                                                          │
│  3. Check route params                                  │
│     ┌─────────────────┬─────────────────────────────┐   │
│     │  CREATE MODE    │      EDIT MODE              │   │
│     ├─────────────────┼─────────────────────────────┤   │
│     │ addLineItem()   │ loadSale(id)                │   │
│     │ → Add 1 empty   │ → Load sale data            │   │
│     │   line item     │ → items.clear()             │   │
│     │                 │ → Add line items from sale  │   │
│     │                 │ → calculateGrandTotal()     │   │
│     └─────────────────┴─────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## Form Validation Flow

```
┌──────────────────────────────────────────────────────────┐
│                    onSubmit()                             │
├──────────────────────────────────────────────────────────┤
│  1. Set submitted = true                                 │
│                                                          │
│  2. Mark all form controls as touched                   │
│     → Header fields: customerName, email, etc.          │
│                                                          │
│  3. Mark all line item controls as touched              │
│     → Loop through items.controls                       │
│     → Mark productId, quantity, price, etc.             │
│                                                          │
│  4. Validate                                            │
│     ┌─────────────────┬─────────────────────────────┐   │
│     │   INVALID       │        VALID                │   │
│     ├─────────────────┼─────────────────────────────┤   │
│     │ return early    │ Prepare saleData            │   │
│     │ Show errors     │ Call store method           │   │
│     │                 │ Navigate on success         │   │
│     └─────────────────┴─────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## FormArray Template Pattern

### TypeScript Binding

```typescript
// Component
export class SaleCreateComponent {
  form!: FormGroup;

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }
}
```

### HTML Binding

```html
<!-- Template -->
<tbody formArrayName="items">
  <tr *ngFor="let item of items.controls; let i = index"
      [formGroupName]="i">

    <td>
      <select formControlName="productId">
        <!-- options -->
      </select>
    </td>

    <td>
      <input formControlName="quantity" type="number" />
    </td>

    <!-- More fields -->
  </tr>
</tbody>
```

### Binding Explanation

```
formArrayName="items"
  └─→ Binds <tbody> to items FormArray

*ngFor="let item of items.controls; let i = index"
  └─→ Loop through each FormGroup in the array
  └─→ Get index for formGroupName

[formGroupName]="i"
  └─→ Bind <tr> to FormGroup at index i

formControlName="productId"
  └─→ Bind <select> to productId FormControl in FormGroup[i]
```

---

## Product Auto-Fill Flow

```
┌──────────────────────────────────────────────────────────┐
│          User Selects Product from Dropdown               │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│              (change)="onProductChange(i)"                │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│        Get line item FormGroup at index i                 │
│        Get selected productId from FormControl            │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│      products$.pipe(take(1)).subscribe(products => {      │
│        const product = products.find(p => p.id === id);   │
│      })                                                   │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│           lineItem.patchValue({                           │
│             price: product.price,                         │
│             taxRate: product.taxRate                      │
│           })                                              │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│              valueChanges triggered                       │
│              ↓                                            │
│        calculateLineItemTotal()                           │
│              ↓                                            │
│        calculateGrandTotal()                              │
└──────────────────────────────────────────────────────────┘
```

---

## Add/Remove Line Items

### Add Flow

```
User clicks "Add Item" button
         ↓
    addLineItem()
         ↓
this.items.push(this.createLineItemFormGroup())
         ↓
New FormGroup added to FormArray
         ↓
Template re-renders with new row
         ↓
valueChanges subscribed automatically
```

### Remove Flow

```
User clicks "Remove" button on row i
         ↓
    removeLineItem(i)
         ↓
Check if items.length > 1 (prevent removing last item)
         ↓
this.items.removeAt(i)
         ↓
FormGroup removed from FormArray
         ↓
calculateGrandTotal() (update totals)
         ↓
Template re-renders without row
```

---

## ValueChanges Subscription Pattern

### The Problem

```typescript
// ❌ WRONG - Infinite loop
lineItem.valueChanges.subscribe(() => {
  const total = calculateTotal();
  lineItem.patchValue({ total }); // Triggers valueChanges again!
});
```

### The Solution

```typescript
// ✅ CORRECT - Use emitEvent: false
lineItem.valueChanges.subscribe(() => {
  const total = calculateTotal();
  lineItem.patchValue({ total }, { emitEvent: false }); // Stops loop
});
```

### Visual Explanation

```
WITHOUT emitEvent: false (INFINITE LOOP):
┌──────────────────────────────────────────────────────┐
│ User changes quantity                                │
│   ↓                                                  │
│ valueChanges emits                                   │
│   ↓                                                  │
│ calculateTotal()                                     │
│   ↓                                                  │
│ patchValue({ total })                                │
│   ↓                                                  │
│ valueChanges emits (because total changed!)          │
│   ↓                                                  │
│ calculateTotal()                                     │
│   ↓                                                  │
│ patchValue({ total })                                │
│   ↓                                                  │
│ ... LOOP CONTINUES FOREVER ...                       │
└──────────────────────────────────────────────────────┘

WITH emitEvent: false (CORRECT):
┌──────────────────────────────────────────────────────┐
│ User changes quantity                                │
│   ↓                                                  │
│ valueChanges emits                                   │
│   ↓                                                  │
│ calculateTotal()                                     │
│   ↓                                                  │
│ patchValue({ total }, { emitEvent: false })          │
│   ↓                                                  │
│ valueChanges does NOT emit                           │
│   ↓                                                  │
│ DONE ✓                                               │
└──────────────────────────────────────────────────────┘
```

---

## State Management Integration

```
┌──────────────────────────────────────────────────────────┐
│                    SaleCreateComponent                    │
├──────────────────────────────────────────────────────────┤
│  Form State (Local)                                      │
│  • FormGroup with FormArray                              │
│  • Validation state                                      │
│  • Calculation state                                     │
└──────────────────────────────────────────────────────────┘
                        │
                        │ onSubmit()
                        ▼
┌──────────────────────────────────────────────────────────┐
│                      SalesStore                           │
├──────────────────────────────────────────────────────────┤
│  Global State (RxJS)                                     │
│  • sales: Sale[]                                         │
│  • loading: boolean                                      │
│  • error: string | null                                  │
│  • selectedSale: Sale | null                             │
│                                                          │
│  Methods:                                                │
│  • createSale(sale)                                      │
│  • updateSale(id, updates)                               │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                     MockApiService                        │
├──────────────────────────────────────────────────────────┤
│  API Operations                                          │
│  • createSale() → Observable<Sale>                       │
│  • updateSale() → Observable<Sale>                       │
│  • Persist to localStorage                               │
│  • Simulate 300ms delay                                  │
└──────────────────────────────────────────────────────────┘
```

---

## Comparison: Simple Form vs FormArray

### Simple Form (Company Create)

```typescript
// Structure
form = {
  name: FormControl,
  email: FormControl,
  phone: FormControl
}

// Complexity: LOW
// No dynamic fields
// No auto-calculation
// Straightforward validation
```

### FormArray Form (Sale Create)

```typescript
// Structure
form = {
  customerName: FormControl,
  customerEmail: FormControl,
  items: FormArray [
    FormGroup {
      productId: FormControl,
      quantity: FormControl,
      price: FormControl,
      taxRate: FormControl,
      discount: FormControl,
      total: FormControl
    },
    ... more FormGroups
  ]
}

// Complexity: HIGH
// Dynamic add/remove
// Auto-calculation on changes
// Nested validation
// Integration with ProductsStore
```

---

## TypeScript Type Safety

### Proper Type Casting

```typescript
// ❌ WRONG - Type errors
const items = this.form.get('items');
items.push(...); // ERROR: push doesn't exist on AbstractControl

// ✅ CORRECT - Use getter with type casting
get items(): FormArray {
  return this.form.get('items') as FormArray;
}

this.items.push(...); // ✓ Works perfectly
```

### Accessing FormGroup in FormArray

```typescript
// ❌ WRONG - No type safety
const lineItem = this.items.at(0);
lineItem.get('productId'); // Type is AbstractControl

// ✅ CORRECT - Cast to FormGroup
const lineItem = this.items.at(0) as FormGroup;
lineItem.get('productId'); // Type is FormControl
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('SaleCreateComponent', () => {
  it('should initialize form with empty items array', () => {
    component.ngOnInit();
    expect(component.items.length).toBe(0);
  });

  it('should add line item', () => {
    component.addLineItem();
    expect(component.items.length).toBe(1);
  });

  it('should remove line item', () => {
    component.addLineItem();
    component.addLineItem();
    component.removeLineItem(0);
    expect(component.items.length).toBe(1);
  });

  it('should calculate line item total correctly', () => {
    component.addLineItem();
    const lineItem = component.items.at(0) as FormGroup;
    lineItem.patchValue({
      quantity: 5,
      price: 100,
      discount: 50,
      taxRate: 10
    });

    const total = lineItem.get('total')?.value;
    expect(total).toBe(495); // (5*100 - 50) + 45 tax
  });

  it('should calculate grand total correctly', () => {
    component.addLineItem();
    component.addLineItem();

    // Set values for both line items
    // ...

    component.calculateGrandTotal();
    expect(component.grandTotal).toBe(expectedTotal);
  });

  it('should auto-fill price when product selected', () => {
    // Mock products$ observable
    // Select product
    // Verify price and taxRate updated
  });
});
```

---

## Performance Optimization

### Debouncing Calculations

If calculations become slow with many line items:

```typescript
private createLineItemFormGroup(item?: SaleLineItem): FormGroup {
  const lineItem = this.fb.group({ /* ... */ });

  // Add debounce to reduce calculation frequency
  lineItem.valueChanges.pipe(
    debounceTime(300) // Wait 300ms after last change
  ).subscribe(() => {
    this.calculateLineItemTotal(lineItem);
    this.calculateGrandTotal();
  });

  return lineItem;
}
```

### ChangeDetection Strategy

```typescript
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleCreateComponent {
  // Use OnPush for better performance
  // Works well with reactive forms and observables
}
```

---

## Summary

### Key Concepts

1. **FormArray** = Dynamic collection of FormGroups
2. **ValueChanges** = Auto-calculation trigger
3. **emitEvent: false** = Prevent infinite loops
4. **Type Casting** = Proper TypeScript type safety
5. **Auto-fill** = Product selection integration
6. **Validation** = Nested form validation
7. **Calculation** = Reactive total updates

### Complexity Comparison

| Feature | Company CRUD | Sales CRUD |
|---------|-------------|------------|
| Form Type | Simple FormGroup | FormGroup + FormArray |
| Fields | Static | Dynamic |
| Calculation | None | Auto-calculate totals |
| Dependencies | None | ProductsStore |
| Validation | Simple | Nested |
| Complexity | LOW | HIGH |
| Time to Implement | 1-2 hours | 4-6 hours |

### When to Use FormArray

Use FormArray when you need:
- Dynamic number of form fields
- Add/remove items functionality
- Table-like data entry
- Line items, comments, tags, etc.

Examples:
- Sales line items ✓
- Purchase line items ✓
- Invoice items ✓
- Order items ✓
- Dynamic form sections ✓

Avoid for:
- Static forms (use FormGroup)
- Simple key-value pairs (use FormControl)
- Very large datasets (use virtual scrolling)

---

This guide provides visual and conceptual understanding of the FormArray pattern used in Sales Management. Refer to the main implementation document for complete code templates.
