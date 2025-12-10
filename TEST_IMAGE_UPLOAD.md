# Test ImageUploadComponent (2 minutes)

Quick test to verify the component works.

## Create a Test Component

```bash
ng generate component test-image-upload --standalone
```

## Update test-image-upload.component.ts

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from '../shared/components/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-test-image-upload',
  standalone: true,
  imports: [CommonModule, ImageUploadComponent],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">Test Image Upload</h1>

      <app-image-upload
        [images]="testImages"
        [maxFiles]="5"
        [label]="'Test Images'"
        (imagesChange)="onImagesChange($event)"
        (error)="onError($event)"
      ></app-image-upload>

      @if (errorMessage) {
        <p class="text-red-500 mt-2">{{ errorMessage }}</p>
      }

      @if (testImages.length > 0) {
        <div class="mt-4">
          <h2 class="font-bold">Images uploaded: {{ testImages.length }}</h2>
          <pre class="text-xs mt-2">{{ testImages[0].substring(0, 100) }}...</pre>
        </div>
      }
    </div>
  `
})
export class TestImageUploadComponent {
  testImages: string[] = [];
  errorMessage = '';

  onImagesChange(images: string[]): void {
    this.testImages = images;
    this.errorMessage = '';
    console.log('Images updated:', images.length);
  }

  onError(error: string): void {
    this.errorMessage = error;
    console.error('Upload error:', error);
  }
}
```

## Add Route (temporarily)

```typescript
// app.routes.ts - add this temporarily
{
  path: 'test-upload',
  loadComponent: () => import('./test-image-upload/test-image-upload.component')
    .then(m => m.TestImageUploadComponent)
}
```

## Test It

```bash
npm start
```

Navigate to: http://localhost:4200/test-upload

Try:
1. Drag and drop an image
2. Click to upload
3. Upload multiple images
4. Remove an image
5. Check console for base64 output

## Clean Up After Testing

```bash
# Remove test component
rm -rf src/app/test-image-upload

# Remove route from app.routes.ts
```

---

If this works, you know the ImageUploadComponent is ready to add to your product forms!
