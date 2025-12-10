# Image Management Implementation Guide

This guide covers two image-related features for the Umbrella Frontend system:

1. **Product/Service Images** - Add photos to your product catalog
2. **Installation Documentation** - Track solar panel installations (or any field work) with event logging and photo evidence

## Table of Contents

- [1. Product Images](#1-product-images)
- [2. Installation Documentation Feature](#2-installation-documentation-feature)
- [3. Implementation Steps](#3-implementation-steps)
- [4. Best Practices](#4-best-practices)

---

## 1. Product Images

### Overview

The `ImageUploadComponent` is a standalone, drag-and-drop image uploader with preview support. No external libraries required - uses native HTML5 APIs.

### Features

- ✅ Drag and drop or click to upload
- ✅ Multiple image support
- ✅ Base64 encoding (no backend required for now)
- ✅ File size validation
- ✅ Image preview with thumbnails
- ✅ Remove individual images
- ✅ Angular 20 compatible (uses new control flow syntax)

### Usage in Product Forms

**Example: Product Create/Edit Component**

```typescript
// product-create.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageUploadComponent } from '../../../shared/components/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageUploadComponent,
    // ... other imports
  ],
  templateUrl: './product-create.component.html'
})
export class ProductCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  productImages: string[] = [];
  uploadError = '';

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    // ... other fields
  });

  onImagesChange(images: string[]): void {
    this.productImages = images;
    this.uploadError = '';
  }

  onImageError(error: string): void {
    this.uploadError = error;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const productData = {
        ...this.form.value,
        image: this.productImages[0] || '', // Primary image
        images: this.productImages.slice(1) // Additional images
      };

      // Save via store
      this.productsStore.createProduct(productData);
    }
  }
}
```

**Template Example**

```html
<!-- product-create.component.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <!-- Basic fields -->
  <div class="form-group">
    <label for="name">Product Name</label>
    <input id="name" formControlName="name" />
  </div>

  <!-- Image upload -->
  <div class="form-group">
    <app-image-upload
      [images]="productImages"
      [maxFiles]="5"
      [maxFileSize]="5242880"
      [label]="'Product Images'"
      (imagesChange)="onImagesChange($event)"
      (error)="onImageError($event)"
    ></app-image-upload>

    @if (uploadError) {
      <p class="text-red-500 text-sm mt-1">{{ uploadError }}</p>
    }
  </div>

  <button type="submit">Save Product</button>
</form>
```

### Component API

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `images` | `string[]` | `[]` | Array of image URLs or base64 strings |
| `maxFiles` | `number` | `10` | Maximum number of images allowed |
| `maxFileSize` | `number` | `5242880` | Max file size in bytes (default 5MB) |
| `accept` | `string` | `'image/*'` | Accepted file types |
| `label` | `string` | `'Upload Images'` | Label text |
| `showPreview` | `boolean` | `true` | Show image preview grid |

| Output | Type | Description |
|--------|------|-------------|
| `imagesChange` | `EventEmitter<string[]>` | Emits when images change |
| `error` | `EventEmitter<string>` | Emits validation/upload errors |

---

## 2. Installation Documentation Feature

### Overview

For service-based companies (solar panel installations, construction, HVAC, etc.), this feature provides:

- **Project tracking** with status management
- **Event logging** with timestamps and team member attribution
- **Photo evidence** attached to each event
- **Location tracking** with address and optional GPS coordinates
- **Team management** with role assignments
- **Report generation** ready data structure

### Data Model

The complete data model is defined in `src/app/shared/models/installation.model.ts`:

```typescript
interface Installation {
  id: string;
  companyId: string;
  projectNumber: string; // e.g., "INS-2025-001"
  customerId: string;
  customerName: string;

  // Project details
  title: string;
  description: string;
  location: InstallationLocation;
  projectType: ProjectType;
  status: InstallationStatus;

  // Scheduling
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Team
  assignedToUserId?: string;
  assignedToUserName?: string;
  teamMembers: TeamMember[];

  // Events and documentation
  events: InstallationEvent[];

  // Summary
  summary?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface InstallationEvent {
  id: string;
  timestamp: Date;
  eventType: EventType; // 'site_inspection', 'installation', 'testing', etc.
  title: string;
  description: string;
  performedBy: string;
  performedByUserId: string;
  photos: InstallationPhoto[];
  measurements?: Record<string, string | number>;
  status: EventStatus; // 'completed', 'pending', 'issue'
  issueDescription?: string;
}
```

### Use Cases

**Solar Panel Installation Example:**

```
Installation: "Solar Panel Installation - Residential 5kW"
Events:
  1. Site Inspection (3 photos)
     - Roof condition assessment
     - Electrical panel inspection
     - Measurements: { "roofArea": "500 sqft", "roofAngle": "30 deg" }

  2. Panel Mounting (8 photos)
     - Mounting brackets installed
     - 12 panels positioned on south-facing roof

  3. Electrical Wiring (5 photos)
     - Inverter installation
     - Connection to electrical panel
     - Measurements: { "voltage": "240V", "systemCapacity": "5kW" }

  4. System Testing (2 photos)
     - Power output verification
     - Grid connection test
     - Measurements: { "outputVoltage": "240V", "powerGeneration": "4.8kW" }

  5. Completion (1 photo)
     - Final inspection passed
     - Customer walkthrough completed
```

### Where to Implement

Based on standard software architecture patterns, here are the recommended locations:

#### Option 1: Dedicated Installation Module (RECOMMENDED)

**Best for:**
- Companies with high volume of installations
- Multiple types of installation projects
- Need for detailed reporting and analytics

**Structure:**
```
src/app/features/installations/
├── services/
│   └── installations.store.ts
├── installation-list/
│   ├── installation-list.component.ts
│   └── installation-list.component.html
├── installation-create/
│   ├── installation-create.component.ts
│   └── installation-create.component.html
├── installation-detail/
│   ├── installation-detail.component.ts
│   └── installation-detail.component.html
├── installation-event-form/
│   ├── installation-event-form.component.ts
│   └── installation-event-form.component.html
├── installation-report/
│   ├── installation-report.component.ts
│   └── installation-report.component.html
└── installations.routes.ts
```

**Routing:**
```typescript
// app.routes.ts
{
  path: 'installations',
  loadChildren: () => import('./features/installations/installations.routes')
    .then(m => m.INSTALLATIONS_ROUTES),
  canActivate: [authGuard]
}
```

#### Option 2: Extend Sales Module

**Best for:**
- Installations are tied directly to sales transactions
- Simpler structure with fewer installation types

**Add to existing sales:**
```
src/app/features/sales/
├── installation-detail/  (new)
│   ├── installation-detail.component.ts
│   └── installation-detail.component.html
```

Link from sale detail view with a "Track Installation" button.

#### Option 3: Projects Module (Most Scalable)

**Best for:**
- Multiple project types beyond installations
- Long-term project management needs
- Integration with tasks, timelines, resources

**Structure:**
```
src/app/features/projects/
├── services/
│   └── projects.store.ts
├── project-list/
├── project-detail/
├── project-events/  (installation events here)
└── project-reports/
```

---

## 3. Implementation Steps

### Step 1: Create Installation Feature (Recommended: Option 1)

```bash
# Create feature directory
mkdir -p src/app/features/installations/services

# Generate components
ng generate component features/installations/installation-list --standalone
ng generate component features/installations/installation-create --standalone
ng generate component features/installations/installation-detail --standalone
ng generate component features/installations/installation-event-form --standalone
ng generate component features/installations/installation-report --standalone
```

### Step 2: Create Installation Store

```typescript
// installations.store.ts
import { Injectable, inject } from '@angular/core';
import { tap, catchError, of } from 'rxjs';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Installation, InstallationEvent, CreateInstallationDto, AddInstallationEventDto } from '../../../shared/models/installation.model';

interface InstallationsState {
  installations: Installation[];
  selectedInstallation: Installation | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class InstallationsStore extends StoreBase<InstallationsState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly installations$ = this.select(state => state.installations);
  readonly selectedInstallation$ = this.select(state => state.selectedInstallation);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

  constructor() {
    super({
      installations: [],
      selectedInstallation: null,
      loading: false,
      error: null
    });
  }

  loadInstallations(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getInstallations().pipe(
      tap(installations => this.patchState({ installations, loading: false })),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        return of([]);
      })
    ).subscribe();
  }

  loadInstallationById(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getInstallation(id).pipe(
      tap(installation => {
        const installations = this.currentState.installations;
        const existingIndex = installations.findIndex(i => i.id === id);

        const updatedInstallations = existingIndex >= 0
          ? installations.map(i => i.id === id ? installation : i)
          : [...installations, installation];

        this.patchState({
          installations: updatedInstallations,
          selectedInstallation: installation,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        return of(null);
      })
    ).subscribe();
  }

  createInstallation(dto: CreateInstallationDto): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createInstallation(dto).pipe(
      tap(installation => {
        const installations = [...this.currentState.installations, installation];
        this.patchState({ installations, loading: false });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }

  addEvent(dto: AddInstallationEventDto): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.addInstallationEvent(dto).pipe(
      tap(updatedInstallation => {
        const installations = this.currentState.installations.map(i =>
          i.id === dto.installationId ? updatedInstallation : i
        );
        this.patchState({
          installations,
          selectedInstallation: updatedInstallation,
          loading: false
        });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }
}
```

### Step 3: Add MockAPI Methods

```typescript
// mock-api.service.ts - Add these methods

getInstallations(): Observable<Installation[]> {
  return this.simulateApiCall(() => {
    const stored = localStorage.getItem('installations');
    return stored ? JSON.parse(stored) : [];
  });
}

getInstallation(id: string): Observable<Installation> {
  return this.simulateApiCall(() => {
    const stored = localStorage.getItem('installations');
    const installations: Installation[] = stored ? JSON.parse(stored) : [];
    const installation = installations.find(i => i.id === id);
    if (!installation) {
      throw new Error('Installation not found');
    }
    return installation;
  });
}

createInstallation(dto: CreateInstallationDto): Observable<Installation> {
  return this.simulateApiCall(() => {
    const stored = localStorage.getItem('installations');
    const installations: Installation[] = stored ? JSON.parse(stored) : [];

    const newInstallation: Installation = {
      id: this.generateId(),
      ...dto,
      projectNumber: this.generateProjectNumber(),
      customerName: '', // Lookup from customers
      status: 'scheduled',
      events: [],
      teamMembers: dto.teamMembers || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    installations.push(newInstallation);
    localStorage.setItem('installations', JSON.stringify(installations));
    return newInstallation;
  });
}

addInstallationEvent(dto: AddInstallationEventDto): Observable<Installation> {
  return this.simulateApiCall(() => {
    const stored = localStorage.getItem('installations');
    const installations: Installation[] = stored ? JSON.parse(stored) : [];
    const installation = installations.find(i => i.id === dto.installationId);

    if (!installation) {
      throw new Error('Installation not found');
    }

    const newEvent: InstallationEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      eventType: dto.eventType,
      title: dto.title,
      description: dto.description,
      performedBy: '', // Lookup from users
      performedByUserId: dto.performedByUserId,
      photos: (dto.photos || []).map((photoData, index) => ({
        id: this.generateId(),
        filename: `event-photo-${index + 1}.jpg`,
        url: photoData,
        uploadedAt: new Date(),
        uploadedBy: '' // Lookup from users
      })),
      measurements: dto.measurements,
      status: dto.status,
      issueDescription: dto.issueDescription
    };

    installation.events.push(newEvent);
    installation.updatedAt = new Date();

    // Auto-update status
    if (dto.eventType === 'completion' && dto.status === 'completed') {
      installation.status = 'completed';
      installation.completedAt = new Date();
    }

    localStorage.setItem('installations', JSON.stringify(installations));
    return installation;
  });
}

private generateProjectNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INS-${year}-${random}`;
}
```

### Step 4: Create Installation Detail Component

This is the core component where technicians log events with photos:

```typescript
// installation-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstallationsStore } from '../services/installations.store';
import { ImageUploadComponent } from '../../../shared/components/ui/image-upload/image-upload.component';

@Component({
  selector: 'app-installation-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './installation-detail.component.html'
})
export class InstallationDetailComponent implements OnInit {
  private readonly store = inject(InstallationsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  installation$ = this.store.selectedInstallation$;
  loading$ = this.store.loading$;

  eventPhotos: string[] = [];
  showEventForm = false;

  eventForm: FormGroup = this.fb.group({
    eventType: ['installation', Validators.required],
    title: ['', Validators.required],
    description: ['', Validators.required],
    status: ['completed', Validators.required],
    issueDescription: ['']
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.store.loadInstallationById(params['id']);
      }
    });
  }

  onEventPhotosChange(photos: string[]): void {
    this.eventPhotos = photos;
  }

  submitEvent(): void {
    if (this.eventForm.valid) {
      this.installation$.subscribe(installation => {
        if (installation) {
          this.store.addEvent({
            installationId: installation.id,
            performedByUserId: 'current-user-id', // Get from AuthService
            photos: this.eventPhotos,
            ...this.eventForm.value
          });

          this.eventForm.reset();
          this.eventPhotos = [];
          this.showEventForm = false;
        }
      }).unsubscribe();
    }
  }
}
```

### Step 5: Create Routes

```typescript
// installations.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const INSTALLATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./installation-list/installation-list.component')
      .then(m => m.InstallationListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./installation-create/installation-create.component')
      .then(m => m.InstallationCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./installation-detail/installation-detail.component')
      .then(m => m.InstallationDetailComponent),
    canActivate: [authGuard]
  }
];
```

---

## 4. Best Practices

### Image Storage Strategy

**Current: Base64 Encoding**
- ✅ No backend required
- ✅ Works with localStorage
- ✅ Perfect for MVP/prototype
- ❌ Large storage size
- ❌ Not suitable for production at scale

**Production: Cloud Storage**

When ready for production, integrate cloud storage:

```typescript
// Example: Upload to cloud and store URLs instead of base64

uploadToCloud(base64Image: string): Observable<string> {
  // Convert base64 to blob
  const blob = this.base64ToBlob(base64Image);

  // Upload to S3/Azure/GCP
  return this.http.post<{ url: string }>('/api/upload', blob)
    .pipe(map(response => response.url));
}

// Update product with cloud URLs
onImagesChange(images: string[]): void {
  // Upload each image
  const uploadObservables = images.map(img =>
    this.isBase64(img) ? this.uploadToCloud(img) : of(img)
  );

  forkJoin(uploadObservables).subscribe(urls => {
    this.productImages = urls;
  });
}
```

### Report Generation

For solar installations, generate PDF reports with all events and photos:

```typescript
// installation-report.component.ts
generatePDFReport(installation: Installation): void {
  const reportData = {
    projectNumber: installation.projectNumber,
    customer: installation.customerName,
    location: installation.location.address,
    completedDate: installation.completedAt,
    summary: installation.summary,
    events: installation.events.map(event => ({
      title: event.title,
      timestamp: event.timestamp,
      description: event.description,
      photos: event.photos.map(p => p.url),
      measurements: event.measurements
    }))
  };

  // Use library like jsPDF or generate server-side
  this.pdfService.generateInstallationReport(reportData);
}
```

### Performance Optimization

**Image Compression:**

```typescript
compressImage(base64: string, maxWidth = 1200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = base64;
  });
}
```

### Mobile Optimization

For field technicians using mobile devices:

```typescript
// Enable camera capture on mobile
<app-image-upload
  [accept]="'image/*'"
  [capture]="'environment'"  // Use back camera
  [maxFileSize]="3145728"    // 3MB for mobile
></app-image-upload>
```

---

## Summary

### What You Now Have:

1. ✅ **ImageUploadComponent** - Reusable drag-and-drop image uploader
2. ✅ **Installation Model** - Complete data structure for project tracking
3. ✅ **Product Model** - Enhanced with multi-image support
4. ✅ **Implementation Guide** - Step-by-step instructions

### Next Steps:

1. **For Product Images:**
   - Add `ImageUploadComponent` to your product create/edit forms
   - Update `products.store.ts` to handle image arrays
   - Test upload and preview functionality

2. **For Installation Feature:**
   - Decide on module location (Option 1, 2, or 3)
   - Generate components using Angular CLI
   - Create `InstallationsStore`
   - Add MockAPI methods
   - Build installation detail view with event logging
   - Test complete workflow

3. **Production Readiness:**
   - Implement cloud storage for images
   - Add image compression
   - Create PDF report generation
   - Add offline support for mobile (Progressive Web App)

### Resources:

- Component location: `src/app/shared/components/ui/image-upload/`
- Model location: `src/app/shared/models/installation.model.ts`
- Product model: `src/app/shared/models/product.model.ts`

For questions or issues, refer to the main [CLAUDE.md](CLAUDE.md) documentation.
