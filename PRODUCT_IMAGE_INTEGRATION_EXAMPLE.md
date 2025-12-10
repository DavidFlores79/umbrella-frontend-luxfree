# Product Image Integration Example

This guide shows exactly how to add the ImageUploadComponent to your existing product create/edit form.

## Step 1: Update Product Create Component

Add these changes to `product-create.component.ts`:

```typescript
// ADD THIS IMPORT
import { ImageUploadComponent } from '../../../shared/components/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    Button,
    FormInput,
    FormSelect,
    Alert,
    ImageUploadComponent  // ADD THIS
  ],
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent implements OnInit {
  // ... existing code ...

  // ADD THESE PROPERTIES
  productImages: string[] = [];
  uploadError = '';

  // ... existing code ...

  private loadProduct(id: string): void {
    this.store.products$.subscribe(products => {
      const product = products.find(p => p.id === id);
      if (product) {
        this.form.patchValue({
          // ... existing fields ...
        });

        // ADD THIS: Load existing images
        this.productImages = [];
        if (product.image) {
          this.productImages.push(product.image);
        }
        if (product.images && product.images.length > 0) {
          this.productImages.push(...product.images);
        }
      }
    });
  }

  // ADD THESE METHODS
  onImagesChange(images: string[]): void {
    this.productImages = images;
    this.uploadError = '';
  }

  onImageError(error: string): void {
    this.uploadError = error;
  }

  onSubmit(): void {
    this.submitted = true;

    // ... existing validation ...

    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;
    const productData: any = {
      // ... existing fields ...
      companyId: formValue.companyId,
      sku: formValue.sku,
      name: formValue.name,
      // ... other fields ...

      // ADD THIS: Include images in product data
      image: this.productImages[0] || undefined,
      images: this.productImages.length > 1 ? this.productImages.slice(1) : undefined
    };

    // ... rest of existing code ...
  }
}
```

## Step 2: Update Product Create Template

Add this section to `product-create.component.html` (after the existing form fields):

```html
<app-card [title]="isEditMode ? 'Edit Product' : 'Create Product'">
  <form [formGroup]="form" (ngSubmit)="onSubmit()">

    <!-- Existing error alert -->
    @if (error$ | async; as error) {
      <app-alert
        type="error"
        [message]="error"
        [dismissible]="true"
        (dismiss)="dismissError()"
        class="mb-4"
      />
    }

    <!-- ... existing form fields (company, sku, name, etc.) ... -->

    <!-- ADD THIS SECTION: Product Images -->
    <div class="mb-4">
      <app-image-upload
        [images]="productImages"
        [maxFiles]="5"
        [maxFileSize]="5242880"
        [label]="'Product Images'"
        (imagesChange)="onImagesChange($event)"
        (error)="onImageError($event)"
      ></app-image-upload>

      @if (uploadError) {
        <p class="text-red-500 text-sm mt-2">{{ uploadError }}</p>
      }

      <p class="text-gray-500 text-xs mt-1">
        First image will be used as the primary product image
      </p>
    </div>

    <!-- ... existing buttons ... -->
    <div class="flex gap-2 justify-end">
      <app-button type="button" variant="secondary" (click)="onCancel()">
        Cancel
      </app-button>
      <app-button type="submit" [loading]="loading$ | async">
        {{ isEditMode ? 'Update' : 'Create' }} Product
      </app-button>
    </div>
  </form>
</app-card>
```

## Step 3: Test the Integration

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Navigate to Products:**
   - Go to http://localhost:4200/products
   - Click "Create Product"

3. **Test Image Upload:**
   - Fill in the product details
   - Drag and drop images or click to upload
   - Verify preview shows correctly
   - Remove an image to test deletion
   - Submit the form

4. **Verify Storage:**
   - Open browser DevTools > Application > Local Storage
   - Find the `products` key
   - Verify images are stored as base64 strings

## Step 4: Display Images in Product List

Update `product-list.component.html` to show product images:

```html
<!-- Example: Add to your product list -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  @for (product of products$ | async; track product.id) {
    <div class="bg-white rounded-lg shadow p-4">
      <!-- Product Image -->
      @if (product.image) {
        <img
          [src]="product.image"
          [alt]="product.name"
          class="w-full h-48 object-cover rounded-lg mb-3"
        />
      } @else {
        <div class="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
          <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      }

      <!-- Product Details -->
      <h3 class="font-semibold text-lg">{{ product.name }}</h3>
      <p class="text-gray-600 text-sm">{{ product.sku }}</p>
      <p class="text-gray-900 font-bold mt-2">{{ product.price | currency }}</p>

      <!-- Additional Images Indicator -->
      @if (product.images && product.images.length > 0) {
        <p class="text-gray-500 text-xs mt-1">
          +{{ product.images.length }} more image(s)
        </p>
      }
    </div>
  }
</div>
```

## Step 5: Create Image Gallery Component (Optional)

For viewing all product images, create a gallery modal:

```typescript
// image-gallery.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
         (click)="close.emit()">
      <div class="max-w-4xl w-full bg-white rounded-lg p-6" (click)="$event.stopPropagation()">
        <!-- Main Image -->
        <div class="mb-4">
          <img [src]="images[selectedIndex]" class="w-full h-96 object-contain rounded-lg" />
        </div>

        <!-- Thumbnails -->
        <div class="grid grid-cols-6 gap-2">
          @for (image of images; track image; let i = $index) {
            <img
              [src]="image"
              (click)="selectedIndex = i"
              class="w-full h-20 object-cover rounded cursor-pointer border-2"
              [class.border-blue-500]="i === selectedIndex"
              [class.border-transparent]="i !== selectedIndex"
            />
          }
        </div>

        <!-- Close Button -->
        <button
          (click)="close.emit()"
          class="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  `
})
export class ImageGalleryComponent {
  @Input() images: string[] = [];
  @Output() close = new EventEmitter<void>();

  selectedIndex = 0;
}
```

Use it in your product detail view:

```html
<!-- product-detail.component.html -->
@if (showGallery) {
  <app-image-gallery
    [images]="allProductImages"
    (close)="showGallery = false"
  />
}

<button (click)="showGallery = true">
  View All Images ({{ product.images?.length || 0 }})
</button>
```

## Complete Example: Solar Panel Product

Here's a complete example for adding a solar panel product with images:

```typescript
// In your component or test:
const solarPanelProduct = {
  companyId: 'company-123',
  sku: 'SOLAR-PANEL-400W',
  name: '400W Monocrystalline Solar Panel',
  description: 'High-efficiency 400W solar panel with 25-year warranty. Perfect for residential installations.',
  category: 'electronics' as const,
  type: 'product' as const,
  price: 299.99,
  cost: 180.00,
  taxRate: 10,
  unit: 'piece',
  trackInventory: true,
  isActive: true,

  // Images: first is primary, rest are additional
  image: 'data:image/jpeg;base64,...',  // Primary product image
  images: [
    'data:image/jpeg;base64,...',  // Close-up of connectors
    'data:image/jpeg;base64,...',  // Specifications label
    'data:image/jpeg;base64,...',  // Installation example
  ]
};
```

## Troubleshooting

### Images Not Appearing

**Problem:** Images don't show after upload

**Solution:** Check console for errors. Verify that:
1. Images are being stored in `productImages` array
2. Base64 strings are valid (start with `data:image/`)
3. Component is imported in the imports array

### Large File Size Warning

**Problem:** "File exceeds maximum size" error

**Solution:** Either:
1. Compress images before upload
2. Increase `maxFileSize` (not recommended for production)
3. Implement server-side compression

```typescript
// Increase limit temporarily
<app-image-upload [maxFileSize]="10485760" /> <!-- 10MB -->
```

### Form Not Submitting

**Problem:** Form validation fails with images

**Solution:** Images are optional. Make sure your form validation doesn't require them:

```typescript
// Images are NOT part of the reactive form
// They're managed separately in productImages array
// So they won't affect form.invalid
```

## Next Steps

1. ✅ Add ImageUploadComponent to product form
2. ✅ Test image upload and preview
3. ✅ Update product list to show images
4. ⬜ Create image gallery for viewing all images
5. ⬜ Implement image compression (see main guide)
6. ⬜ Plan cloud storage migration for production

For the complete installation documentation feature, see [IMAGE_IMPLEMENTATION_GUIDE.md](IMAGE_IMPLEMENTATION_GUIDE.md).
