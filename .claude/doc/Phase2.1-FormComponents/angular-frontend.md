# Phase 2.1: Form Components Implementation Plan
## Umbrella Frontend MVP - Form Input Components

**Date**: 2025-11-26
**Framework**: Angular 20 Standalone
**Styling**: Tailwind CSS (HubSpot Theme - Primary: #FF7A59)
**State Management**: RxJS (no Signals for business state)
**Testing**: Jasmine/Karma + Angular Testing Library

---

## Overview

This phase focuses on creating 5 reusable, accessible, and styled form components that support Angular's Reactive Forms pattern through `ControlValueAccessor` implementation. These components will be used across all feature modules for consistent form handling.

### Components to Create

1. **FormInputComponent** - Text/email/number/password input field
2. **FormSelectComponent** - Dropdown select field
3. **FormTextareaComponent** - Multi-line text area
4. **FormCheckboxComponent** - Checkbox input
5. **FormToggleComponent** - Toggle switch (for settings/preferences)

---

## Architecture & Design Decisions

### 1. Component Structure

All form components follow this structure:

```
src/app/shared/components/ui/forms/
├── form-input/
│   ├── form-input.component.ts
│   ├── form-input.component.html
│   └── form-input.component.spec.ts
├── form-select/
│   ├── form-select.component.ts
│   ├── form-select.component.html
│   └── form-select.component.spec.ts
├── form-textarea/
│   ├── form-textarea.component.ts
│   ├── form-textarea.component.html
│   └── form-textarea.component.spec.ts
├── form-checkbox/
│   ├── form-checkbox.component.ts
│   ├── form-checkbox.component.html
│   └── form-checkbox.component.spec.ts
├── form-toggle/
│   ├── form-toggle.component.ts
│   ├── form-toggle.component.html
│   └── form-toggle.component.spec.ts
└── index.ts (barrel export)
```

### 2. ControlValueAccessor Implementation

Each component implements `ControlValueAccessor` to work seamlessly with Reactive Forms:

- Implements `writeValue()` - handles initial value binding
- Implements `registerOnChange()` - registers callback for form control updates
- Implements `registerOnTouched()` - registers callback for touch events
- Implements `setDisabledState()` - handles disabled state
- Provides `NG_VALUE_ACCESSOR` via useExisting

This allows components to be used directly in FormControl:
```typescript
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  firstName: ['', [Validators.required]],
  // etc...
});
```

And in templates:
```html
<app-form-input
  label="Email Address"
  type="email"
  placeholder="example@domain.com"
  formControlName="email"
  [errorMessage]="getErrorMessage('email')">
</app-form-input>
```

### 3. Styling Architecture

All components use:
- **Tailwind CSS utility classes** - no custom CSS files
- **HubSpot Color Palette** - Primary coral #FF7A59, dark variants
- **Dark Mode Support** - `dark:` class variants for light/dark themes
- **@tailwindcss/forms plugin** - provides form reset and base styles
- **Responsive Design** - mobile-first with breakpoint utilities

#### Color Usage

- **Primary Actions**: #FF7A59 (coral - focus borders, active states)
- **Text**: #2D3E50 (dark blue - primary text)
- **Text Light**: #6B7C93 (secondary text for labels)
- **Background**: #FFFFFF light / #1A1F2E dark
- **Error**: #F2545B (red for validation errors)
- **Success**: #00A862 (green - success states)
- **Borders**: Gray-300 light / Gray-600 dark

#### Key Tailwind Classes

```
Inputs:
- form-input (from @tailwindcss/forms)
- px-3 py-2 (padding)
- border border-gray-300 (light mode)
- dark:border-gray-600 (dark mode)
- focus:ring-2 focus:ring-primary focus:border-transparent
- disabled:bg-gray-100 disabled:cursor-not-allowed

Labels:
- block text-sm font-medium text-gray-700
- dark:text-gray-300

Error Messages:
- text-xs text-accent-red mt-1

Focus States:
- focus:outline-none
- focus:ring-2 focus:ring-primary
- focus:ring-offset-2 (optional for better visibility)
```

### 4. Error Handling & Validation Display

- Errors display **only after field is touched**
- Custom `getFieldError()` method shows appropriate error message
- Supports multiple validation types: `required`, `email`, `minlength`, `maxlength`, `pattern`, `custom`
- Error borders and text color (#F2545B)
- ARIA attributes for accessibility

### 5. Accessibility (A11y)

All components include:

- **ARIA Labels**: `aria-label`, `aria-labelledby`, `aria-describedby`
- **ARIA States**: `aria-invalid`, `aria-required`, `aria-disabled`
- **ARIA Live Regions**: `aria-live="polite"` for error messages
- **Proper Label Association**: `<label for="inputId">`
- **Semantic HTML**: Proper heading hierarchy, form elements
- **Keyboard Navigation**: Full keyboard support, focus visible outlines
- **Screen Reader Support**: Descriptive text, error announcements

---

## Component Specifications

### 1. FormInputComponent

**File**: `/src/app/shared/components/ui/forms/form-input/`

#### Inputs (Decorators)

```typescript
@Input() label: string | null = null;              // Label text
@Input() type: 'text' | 'email' | 'number' | 'password' | 'tel' | 'url' = 'text';
@Input() placeholder: string = '';                 // Placeholder text
@Input() value: any = null;                        // Initial value
@Input() required: boolean = false;                // Required indicator
@Input() disabled: boolean = false;                // Disabled state
@Input() errorMessage: string | null = null;      // Error message to display
@Input() hint: string | null = null;              // Helper text below input
@Input() maxLength: number | null = null;         // Character limit
@Input() minLength: number | null = null;         // Minimum characters
@Input() pattern: string | null = null;           // Regex pattern
@Input() autocomplete: string = 'off';            // Autocomplete attribute
@Input() showCharCount: boolean = false;          // Show char counter
@Input() className: string = '';                  // Additional CSS classes
@Input() ariaLabel: string | null = null;         // ARIA label
@Input() ariaDescribedBy: string | null = null;   // ARIA describedBy ID
```

#### Outputs

```typescript
@Output() blur = new EventEmitter<FocusEvent>();  // Blur event
@Output() focus = new EventEmitter<FocusEvent>(); // Focus event
@Output() change = new EventEmitter<Event>();     // Change event
```

#### Key Methods

```typescript
/**
 * Generates a unique ID for the input field and label association
 * Format: form-input-{random-hash}
 */
private generateId(): string

/**
 * Marks field as touched on blur event
 */
onBlur(event: FocusEvent): void

/**
 * Emits focus event
 */
onFocus(event: FocusEvent): void

/**
 * Emits change event and updates form value
 */
onChange(event: Event): void
```

#### ControlValueAccessor Implementation

```typescript
writeValue(obj: any): void {
  if (obj !== null && obj !== undefined) {
    this.value = obj;
  }
}

registerOnChange(fn: any): void {
  this.onChange = fn;
}

registerOnTouched(fn: any): void {
  this.onTouched = fn;
}

setDisabledState(isDisabled: boolean): void {
  this.disabled = isDisabled;
}
```

#### Template Structure

```html
<div class="form-group">
  <!-- Label -->
  <label *ngIf="label" [for]="fieldId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    {{ label }}
    <span *ngIf="required" class="text-accent-red">*</span>
  </label>

  <!-- Input Field -->
  <input
    [id]="fieldId"
    [type]="type"
    [value]="value"
    [disabled]="disabled"
    [required]="required"
    [placeholder]="placeholder"
    [maxlength]="maxLength"
    [attr.aria-label]="ariaLabel || label"
    [attr.aria-invalid]="(isTouched && !!errorMessage)"
    [attr.aria-describedby]="errorMessage ? fieldId + '-error' : hint ? fieldId + '-hint' : null"
    [attr.aria-required]="required"
    class="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
    [class.border-accent-red]="isTouched && !!errorMessage"
    (blur)="onBlur($event)"
    (focus)="onFocus($event)"
    (input)="onChange($event)">

  <!-- Character Counter -->
  <div *ngIf="showCharCount && maxLength" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
    {{ (value?.length || 0) }} / {{ maxLength }}
  </div>

  <!-- Hint Text -->
  <p *ngIf="hint && !errorMessage" [id]="fieldId + '-hint'" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
    {{ hint }}
  </p>

  <!-- Error Message -->
  <p *ngIf="isTouched && errorMessage"
     [id]="fieldId + '-error'"
     class="text-xs text-accent-red mt-1 animate-fade-in"
     role="alert"
     aria-live="polite">
    {{ errorMessage }}
  </p>
</div>
```

#### Styling Details

```css
/* Focus state */
focus:ring-2 focus:ring-primary (2px ring at #FF7A59)
focus:ring-offset-2 (optional for nested layouts)

/* Dark mode */
dark:bg-gray-700
dark:border-gray-600
dark:text-white
dark:placeholder-gray-400
dark:text-gray-300 (for labels)

/* Disabled state */
disabled:bg-gray-100
disabled:text-gray-500
disabled:cursor-not-allowed
disabled:border-gray-200

/* Error state */
border-accent-red (#F2545B)
text-accent-red
```

---

### 2. FormSelectComponent

**File**: `/src/app/shared/components/ui/forms/form-select/`

#### Interface: SelectOption

```typescript
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;  // Optional grouping
}
```

#### Inputs

```typescript
@Input() label: string | null = null;              // Label text
@Input() options: SelectOption[] = [];             // Options array
@Input() value: any = null;                        // Selected value
@Input() placeholder: string = 'Select an option'; // Placeholder
@Input() required: boolean = false;                // Required
@Input() disabled: boolean = false;                // Disabled state
@Input() errorMessage: string | null = null;      // Error message
@Input() hint: string | null = null;              // Helper text
@Input() allowSearch: boolean = false;             // Enable search (future)
@Input() multiple: boolean = false;                // Multi-select (future)
@Input() className: string = '';                  // Additional classes
@Input() ariaLabel: string | null = null;         // ARIA label
```

#### Key Methods

```typescript
/**
 * Handle option selection
 */
onSelectChange(event: Event): void

/**
 * Get display label for current value
 */
getSelectedLabel(): string

/**
 * Group options by group property (optional)
 */groupedOptions(): Map<string | undefined, SelectOption[]>
```

#### Template Structure

```html
<div class="form-group">
  <!-- Label -->
  <label *ngIf="label" [for]="fieldId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    {{ label }}
    <span *ngIf="required" class="text-accent-red">*</span>
  </label>

  <!-- Select Field -->
  <select
    [id]="fieldId"
    [value]="value"
    [disabled]="disabled"
    [required]="required"
    [attr.aria-label]="ariaLabel || label"
    [attr.aria-invalid]="isTouched && !!errorMessage"
    [attr.aria-describedby]="errorMessage ? fieldId + '-error' : hint ? fieldId + '-hint' : null"
    class="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    [class.border-accent-red]="isTouched && !!errorMessage"
    (change)="onSelectChange($event)"
    (blur)="onTouched()">

    <option value="" [disabled]="required">{{ placeholder }}</option>
    <option *ngFor="let option of options" [value]="option.value" [disabled]="option.disabled">
      {{ option.label }}
    </option>
  </select>

  <!-- Hint Text -->
  <p *ngIf="hint && !errorMessage" [id]="fieldId + '-hint'" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
    {{ hint }}
  </p>

  <!-- Error Message -->
  <p *ngIf="isTouched && errorMessage"
     [id]="fieldId + '-error'"
     class="text-xs text-accent-red mt-1 animate-fade-in"
     role="alert"
     aria-live="polite">
    {{ errorMessage }}
  </p>
</div>
```

#### Styling Details

Tailwind's @tailwindcss/forms provides base select styling. Additional customizations:

```css
/* Appearance reset */
appearance: none;  /* Remove default browser styling */

/* Custom dropdown arrow */
background-image: url("data:image/svg+xml,%3Csvg...") /* Coral color arrow */

/* Focus state */
focus:ring-2 focus:ring-primary
focus:ring-offset-2

/* Dark mode select */
dark:bg-gray-700
dark:border-gray-600
dark:text-white
```

---

### 3. FormTextareaComponent

**File**: `/src/app/shared/components/ui/forms/form-textarea/`

#### Inputs

```typescript
@Input() label: string | null = null;              // Label text
@Input() placeholder: string = '';                 // Placeholder
@Input() value: string = '';                       // Initial value
@Input() rows: number = 4;                         // Number of rows
@Input() cols: number | null = null;              // Number of columns
@Input() maxLength: number | null = null;         // Character limit
@Input() minLength: number | null = null;         // Minimum characters
@Input() required: boolean = false;                // Required
@Input() disabled: boolean = false;                // Disabled state
@Input() errorMessage: string | null = null;      // Error message
@Input() hint: string | null = null;              // Helper text
@Input() showCharCount: boolean = true;            // Show character counter
@Input() resizable: boolean = true;                // Allow resizing
@Input() autoExpand: boolean = false;              // Auto-expand on input
@Input() className: string = '';                  // Additional classes
@Input() ariaLabel: string | null = null;         // ARIA label
```

#### Key Methods

```typescript
/**
 * Calculate remaining characters
 */
getRemainingChars(): number

/**
 * Auto-expand textarea height based on content
 */
autoExpandHeight(): void
```

#### Template Structure

```html
<div class="form-group">
  <!-- Label -->
  <label *ngIf="label" [for]="fieldId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    {{ label }}
    <span *ngIf="required" class="text-accent-red">*</span>
  </label>

  <!-- Textarea -->
  <textarea
    [id]="fieldId"
    [value]="value"
    [disabled]="disabled"
    [required]="required"
    [placeholder]="placeholder"
    [rows]="rows"
    [cols]="cols"
    [maxlength]="maxLength"
    [attr.aria-label]="ariaLabel || label"
    [attr.aria-invalid]="isTouched && !!errorMessage"
    [attr.aria-describedby]="errorMessage ? fieldId + '-error' : null"
    class="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 font-sans text-base leading-normal"
    [class.border-accent-red]="isTouched && !!errorMessage"
    [class.resize-none]="!resizable"
    [class.resize-vertical]="resizable && !autoExpand"
    (blur)="onTouched()"
    (input)="onChange($event); autoExpand()">
  </textarea>

  <!-- Character Counter + Remaining -->
  <div *ngIf="showCharCount" class="flex justify-between items-center mt-2">
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {{ value.length || 0 }} <span *ngIf="maxLength">/ {{ maxLength }} characters</span>
    </p>
    <p *ngIf="maxLength && getRemainingChars() < 20" class="text-xs text-accent-yellow">
      {{ getRemainingChars() }} remaining
    </p>
  </div>

  <!-- Hint Text -->
  <p *ngIf="hint && !errorMessage" [id]="fieldId + '-hint'" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
    {{ hint }}
  </p>

  <!-- Error Message -->
  <p *ngIf="isTouched && errorMessage"
     [id]="fieldId + '-error'"
     class="text-xs text-accent-red mt-1 animate-fade-in"
     role="alert"
     aria-live="polite">
    {{ errorMessage }}
  </p>
</div>
```

#### Styling Details

```css
/* Base textarea styling */
font-family: sans-serif (matches form-input)
resize: vertical (default, can be removed with resize-none)
overflow: auto (for scrolling when needed)

/* Auto-expand variant */
resize: none (when autoExpand = true)
overflow: hidden (prevent scrollbar)
transition: height 0.2s ease-in-out

/* Dark mode */
dark:bg-gray-700
dark:border-gray-600
dark:text-white

/* Focus state */
focus:ring-2 focus:ring-primary (#FF7A59)
```

---

### 4. FormCheckboxComponent

**File**: `/src/app/shared/components/ui/forms/form-checkbox/`

#### Inputs

```typescript
@Input() label: string | null = null;              // Label text
@Input() checked: boolean = false;                 // Checked state
@Input() value: any = null;                        // Checkbox value
@Input() disabled: boolean = false;                // Disabled state
@Input() required: boolean = false;                // Required
@Input() errorMessage: string | null = null;      // Error message
@Input() hint: string | null = null;              // Helper text
@Input() indeterminate: boolean = false;           // Indeterminate state (for groups)
@Input() className: string = '';                  // Additional classes
@Input() ariaLabel: string | null = null;         // ARIA label
@Input() ariaDescribedBy: string | null = null;   // ARIA describedBy ID
```

#### Outputs

```typescript
@Output() change = new EventEmitter<boolean>();   // Change event with checked state
```

#### Key Methods

```typescript
/**
 * Toggle checkbox state
 */
toggle(): void

/**
 * Handle change event
 */
onChange(event: Event): void
```

#### Template Structure

```html
<div class="form-group">
  <!-- Checkbox Container -->
  <div class="flex items-start">
    <!-- Custom Checkbox -->
    <div class="flex items-center h-5 pt-0.5">
      <input
        [id]="fieldId"
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        [value]="value"
        [required]="required"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="errorMessage ? fieldId + '-error' : hint ? fieldId + '-hint' : null"
        [attr.aria-invalid]="!!errorMessage"
        class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700"
        (change)="onChange($event)"
        (blur)="onTouched()">
    </div>

    <!-- Label and Meta -->
    <div class="ml-3 flex flex-col">
      <label *ngIf="label" [for]="fieldId" class="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
        {{ label }}
        <span *ngIf="required" class="text-accent-red">*</span>
      </label>

      <!-- Hint Text -->
      <p *ngIf="hint && !errorMessage" [id]="fieldId + '-hint'" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {{ hint }}
      </p>

      <!-- Error Message -->
      <p *ngIf="errorMessage"
         [id]="fieldId + '-error'"
         class="text-xs text-accent-red mt-0.5 animate-fade-in"
         role="alert"
         aria-live="polite">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</div>
```

#### Styling Details

```css
/* Custom checkbox */
appearance: none;
width: 1rem (16px);
height: 1rem;
border: 1px solid #D1D5DB;
border-radius: 0.375rem;
cursor: pointer;

/* Checked state */
background-color: #FF7A59 (primary);
border-color: #FF7A59;

/* Focus state */
box-shadow: 0 0 0 3px rgba(255, 122, 89, 0.1);

/* Disabled state */
background-color: #F3F4F6;
border-color: #E5E7EB;
cursor: not-allowed;

/* Dark mode */
dark:border-gray-600
dark:bg-gray-700
dark:checked:bg-primary
```

---

### 5. FormToggleComponent

**File**: `/src/app/shared/components/ui/forms/form-toggle/`

#### Inputs

```typescript
@Input() label: string | null = null;              // Label text
@Input() checked: boolean = false;                 // Toggle state
@Input() disabled: boolean = false;                // Disabled state
@Input() size: 'sm' | 'md' | 'lg' = 'md';         // Toggle size
@Input() color: string = 'primary';               // Color (primary by default)
@Input() errorMessage: string | null = null;      // Error message
@Input() hint: string | null = null;              // Helper text
@Input() className: string = '';                  // Additional classes
@Input() ariaLabel: string | null = null;         // ARIA label
@Input() ariaDescribedBy: string | null = null;   // ARIA describedBy ID
```

#### Outputs

```typescript
@Output() change = new EventEmitter<boolean>();   // Change event with state
@Output() toggle = new EventEmitter<void>();      // Toggle event
```

#### Key Methods

```typescript
/**
 * Toggle the switch on/off
 */
toggle(): void

/**
 * Handle keyboard interactions (Space/Enter)
 */
handleKeydown(event: KeyboardEvent): void
```

#### Template Structure

```html
<div class="form-group">
  <!-- Toggle Label and Switch -->
  <div class="flex items-center justify-between">
    <div class="flex flex-col">
      <label class="text-sm font-medium text-gray-900 dark:text-gray-100">
        {{ label || 'Toggle' }}
      </label>
      <p *ngIf="hint && !errorMessage" [id]="fieldId + '-hint'" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {{ hint }}
      </p>
    </div>

    <!-- Toggle Switch -->
    <button
      [id]="fieldId"
      type="button"
      role="switch"
      [attr.aria-checked]="checked"
      [attr.aria-label]="ariaLabel || label"
      [attr.aria-describedby]="errorMessage ? fieldId + '-error' : hint ? fieldId + '-hint' : null"
      [disabled]="disabled"
      (click)="toggle()"
      (keydown)="handleKeydown($event)"
      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900"
      [class.bg-primary]="checked"
      [class.bg-gray-300]="!checked"
      [class.dark:bg-gray-600]="!checked && true">

      <!-- Toggle Dot -->
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out"
        [class.translate-x-5]="checked"
        [class.translate-x-1]="!checked">
      </span>
    </button>
  </div>

  <!-- Error Message -->
  <p *ngIf="errorMessage"
     [id]="fieldId + '-error'"
     class="text-xs text-accent-red mt-1 animate-fade-in"
     role="alert"
     aria-live="polite">
    {{ errorMessage }}
  </p>
</div>
```

#### Styling Details

```css
/* Toggle Container */
display: inline-flex;
height: 1.5rem (24px for md size);
width: 2.75rem (44px for md size);
border-radius: 9999px (fully rounded);
background-color: #D1D5DB (off) / #FF7A59 (on);
cursor: pointer;
transition: background-color 200ms ease;

/* Toggle Dot (switch circle) */
width: 1rem (16px);
height: 1rem;
background-color: #FFFFFF;
border-radius: 9999px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
transform: translateX(0.25rem) (off) / translateX(1.25rem) (on);
transition: transform 200ms ease-in-out;

/* Sizes */
sm: h-5 w-10, dot h-3 w-3, translate-x-4
md: h-6 w-11, dot h-4 w-4, translate-x-5 (default)
lg: h-7 w-12, dot h-5 w-5, translate-x-5.5

/* Focus state */
focus:ring-2 focus:ring-primary
focus:ring-offset-2

/* Dark mode */
dark:bg-gray-600 (off)
dark:focus:ring-offset-gray-900
```

---

## Implementation Details

### File Organization

Each component will have:

1. **Component TypeScript File** (.ts)
   - Class definition with all inputs/outputs
   - ControlValueAccessor implementation
   - Helper methods
   - Type interfaces where needed
   - JSDoc documentation

2. **Template HTML File** (.html)
   - Semantic HTML with proper ARIA attributes
   - Tailwind CSS classes (no custom CSS)
   - Event bindings and two-way binding
   - Conditional rendering for labels, hints, errors

3. **Spec File** (.spec.ts)
   - Unit tests for component functionality
   - ControlValueAccessor behavior tests
   - Reactive Forms integration tests
   - Accessibility testing (ARIA attributes)

4. **Barrel Export** (index.ts)
   - Export all 5 components for easy import

### Critical Implementation Notes

#### 1. ControlValueAccessor Pattern

Every component must follow this pattern:

```typescript
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true
    }
  ]
})
export class FormInputComponent implements ControlValueAccessor {
  private onChangeFn: ((value: any) => void) | null = null;
  private onTouchedFn: (() => void) | null = null;

  // Implementation of all ControlValueAccessor methods
}
```

#### 2. Unique ID Generation

Generate unique IDs for proper label association:

```typescript
private fieldId: string = '';

constructor() {
  this.fieldId = this.generateId();
}

private generateId(): string {
  return `form-${Math.random().toString(36).substring(2, 11)}`;
}
```

#### 3. Touch Tracking

Track when field is touched to show errors:

```typescript
private isTouched: boolean = false;

onTouched(): void {
  this.isTouched = true;
  if (this.onTouchedFn) {
    this.onTouchedFn();
  }
}
```

#### 4. Dark Mode Implementation

Use `dark:` prefix for all dark mode classes:

```html
<!-- Light: gray-700, Dark: gray-300 -->
<label class="text-gray-700 dark:text-gray-300">

<!-- Light: #FFFFFF, Dark: #1A1F2E -->
<input class="bg-white dark:bg-gray-700">
```

#### 5. Tailwind Configuration Usage

Leverage extended theme from tailwind.config.js:

```html
<!-- Primary color defined in config -->
<div class="focus:ring-primary dark:focus:ring-primary">

<!-- Custom border radius from config -->
<input class="rounded-xl">

<!-- Accent colors -->
<span class="text-accent-red"> <!-- #F2545B -->
<span class="text-accent-green"> <!-- #00A862 -->
```

#### 6. Animation Usage

Use fade-in animation defined in tailwind.config.js:

```html
<p class="animate-fade-in">Error message appears with fade-in</p>
```

### Reactive Forms Integration Example

Components work seamlessly with FormBuilder:

```typescript
// In parent component
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  agreeToTerms: [false, [Validators.required]],
  theme: ['light', Validators.required],
  notes: ['', Validators.maxLength(500)]
});

// In template
<app-form-input
  label="Email"
  type="email"
  formControlName="email"
  [errorMessage]="getErrorMessage('email')">
</app-form-input>

<app-form-checkbox
  label="I agree to terms"
  formControlName="agreeToTerms"
  [errorMessage]="getErrorMessage('agreeToTerms')">
</app-form-checkbox>

<app-form-toggle
  label="Dark Mode"
  formControlName="theme"
  (change)="onThemeChange($event)">
</app-form-toggle>
```

### Error Message Handling Pattern

Parent component manages error messages:

```typescript
getErrorMessage(fieldName: string): string | null {
  const field = this.form.get(fieldName);

  if (!field || !field.errors) {
    return null;
  }

  if (field.hasError('required')) {
    return `${fieldName} is required`;
  }
  if (field.hasError('email')) {
    return 'Please enter a valid email address';
  }
  if (field.hasError('minlength')) {
    const minLength = field.getError('minlength').requiredLength;
    return `Minimum ${minLength} characters required`;
  }
  if (field.hasError('maxlength')) {
    const maxLength = field.getError('maxlength').requiredLength;
    return `Maximum ${maxLength} characters allowed`;
  }
  if (field.hasError('pattern')) {
    return `Invalid format`;
  }

  return 'Invalid input';
}
```

### Accessibility Checklist

For each component ensure:

- [ ] `<label>` element with `for` attribute properly associated
- [ ] `aria-label` on inputs when label not visible
- [ ] `aria-invalid="true/false"` for validation state
- [ ] `aria-required="true"` when required
- [ ] `aria-disabled="true"` when disabled
- [ ] `aria-describedby` linking to error or hint IDs
- [ ] `role="alert"` on error messages
- [ ] `aria-live="polite"` on error messages for announcement
- [ ] Keyboard navigation (Tab, Space, Enter)
- [ ] Focus visible with outline/ring
- [ ] Proper semantic HTML (button for toggles, not divs)
- [ ] Color not sole indicator (icons/text for validation)

---

## Testing Strategy

### Unit Tests for FormInputComponent

```typescript
describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
  });

  describe('ControlValueAccessor', () => {
    it('should write value when writeValue is called', () => {
      component.writeValue('test value');
      expect(component.value).toBe('test value');
    });

    it('should update form control when value changes', () => {
      const onChange = jasmine.createSpy('onChange');
      component.registerOnChange(onChange);

      // Simulate input change
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'new value';
      input.nativeElement.dispatchEvent(new Event('input'));

      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('should mark field as touched on blur', () => {
      const onTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouched);

      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.dispatchEvent(new Event('blur'));

      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('Error Display', () => {
    it('should not show error when field is not touched', () => {
      component.errorMessage = 'This field is required';
      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorEl).toBeFalsy();
    });

    it('should show error when field is touched and has error', () => {
      component.errorMessage = 'This field is required';
      component['isTouched'] = true;
      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorEl).toBeTruthy();
      expect(errorEl.nativeElement.textContent).toContain('required');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label when provided', () => {
      component.ariaLabel = 'Email input';
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.getAttribute('aria-label')).toBe('Email input');
    });

    it('should set aria-invalid when error message present', () => {
      component.errorMessage = 'Required';
      component['isTouched'] = true;
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.getAttribute('aria-invalid')).toBe('true');
    });
  });
});
```

### Integration Test with ReactiveFormsModule

```typescript
describe('FormInputComponent with ReactiveFormsModule', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  @Component({
    selector: 'app-test',
    template: `
      <form [formGroup]="form">
        <app-form-input
          label="Email"
          type="email"
          formControlName="email"
          [errorMessage]="getErrorMessage('email')">
        </app-form-input>
      </form>
    `,
    standalone: true,
    imports: [FormInputComponent, ReactiveFormsModule]
  })
  class TestComponent {
    form: FormGroup;

    constructor(private fb: FormBuilder) {
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      });
    }

    getErrorMessage(fieldName: string): string | null {
      const field = this.form.get(fieldName);
      if (field?.hasError('required')) return 'Email is required';
      if (field?.hasError('email')) return 'Invalid email';
      return null;
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should sync with form control value', () => {
    component.form.get('email')?.setValue('test@example.com');
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.value).toBe('test@example.com');
  });

  it('should update form control on input change', () => {
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = 'new@example.com';
    input.nativeElement.dispatchEvent(new Event('input'));

    expect(component.form.get('email')?.value).toBe('new@example.com');
  });
});
```

---

## Import and Usage Examples

### Barrel Export (index.ts)

```typescript
// src/app/shared/components/ui/forms/index.ts
export { FormInputComponent } from './form-input/form-input.component';
export { FormSelectComponent } from './form-select/form-select.component';
export { FormTextareaComponent } from './form-textarea/form-textarea.component';
export { FormCheckboxComponent } from './form-checkbox/form-checkbox.component';
export { FormToggleComponent } from './form-toggle/form-toggle.component';
export type { SelectOption } from './form-select/form-select.component';
```

### Usage in Feature Components

```typescript
// src/app/features/auth/login/login.component.ts
import {
  FormInputComponent,
  FormCheckboxComponent,
  FormToggleComponent
} from '@shared/components/ui/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormInputComponent,
    FormCheckboxComponent,
    FormToggleComponent
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
      darkMode: [false]
    });
  }

  getErrorMessage(fieldName: string): string | null {
    // Implementation...
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Handle login
    }
  }
}
```

### Usage in Template

```html
<!-- src/app/features/auth/login/login.component.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="space-y-4">
    <app-form-input
      label="Email Address"
      type="email"
      placeholder="you@example.com"
      formControlName="email"
      [errorMessage]="getErrorMessage('email')"
      hint="We'll never share your email">
    </app-form-input>

    <app-form-input
      label="Password"
      type="password"
      placeholder="Enter your password"
      formControlName="password"
      [errorMessage]="getErrorMessage('password')"
      [minLength]="8"
      hint="At least 8 characters">
    </app-form-input>

    <app-form-checkbox
      label="Remember me"
      formControlName="rememberMe">
    </app-form-checkbox>

    <app-form-toggle
      label="Dark Mode"
      formControlName="darkMode">
    </app-form-toggle>

    <button type="submit" [disabled]="form.invalid">
      Sign In
    </button>
  </div>
</form>
```

---

## File Structure Summary

Files to create:

```
src/app/shared/components/
├── ui/
│   └── forms/
│       ├── form-input/
│       │   ├── form-input.component.ts
│       │   ├── form-input.component.html
│       │   └── form-input.component.spec.ts
│       ├── form-select/
│       │   ├── form-select.component.ts
│       │   ├── form-select.component.html
│       │   └── form-select.component.spec.ts
│       ├── form-textarea/
│       │   ├── form-textarea.component.ts
│       │   ├── form-textarea.component.html
│       │   └── form-textarea.component.spec.ts
│       ├── form-checkbox/
│       │   ├── form-checkbox.component.ts
│       │   ├── form-checkbox.component.html
│       │   └── form-checkbox.component.spec.ts
│       ├── form-toggle/
│       │   ├── form-toggle.component.ts
│       │   ├── form-toggle.component.html
│       │   └── form-toggle.component.spec.ts
│       └── index.ts (barrel export)
```

---

## Key Tailwind Classes Reference

### Form Inputs

```
Base:
- w-full (full width)
- px-3 py-2 (padding)
- border border-gray-300 (light mode border)
- rounded-xl (border radius)
- text-gray-900 (text color light)
- placeholder-gray-500 (placeholder light)

States:
- focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
- disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-75
- dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400

Error:
- border-accent-red (when touched && error)
- text-accent-red (for error text)

Animations:
- transition-all (smooth transitions)
- animate-fade-in (error messages)
```

### Labels

```
- block text-sm font-medium
- text-gray-700 (light)
- dark:text-gray-300 (dark)
- mb-2 (margin bottom)
```

### Toggles

```
- relative inline-flex
- h-6 w-11 (height/width)
- rounded-full (fully rounded)
- bg-primary (when active)
- bg-gray-300 (when inactive)
- focus:ring-2 focus:ring-primary focus:ring-offset-2
- transition-colors duration-200
- dark:focus:ring-offset-gray-900
```

---

## Implementation Checklist

- [ ] Create form-input directory and files (ts, html, spec)
- [ ] Create form-select directory and files (ts, html, spec)
- [ ] Create form-textarea directory and files (ts, html, spec)
- [ ] Create form-checkbox directory and files (ts, html, spec)
- [ ] Create form-toggle directory and files (ts, html, spec)
- [ ] Create barrel export index.ts in forms folder
- [ ] All components standalone: true
- [ ] All components use inject() for dependencies
- [ ] All components implement ControlValueAccessor
- [ ] All components have proper TypeScript interfaces
- [ ] All components have Tailwind styling only (no custom CSS)
- [ ] All components support dark mode (dark: classes)
- [ ] All components have ARIA attributes for a11y
- [ ] All components have error display logic
- [ ] All components have unit tests (.spec.ts)
- [ ] All components properly export from index.ts
- [ ] Test all components in Reactive Forms context
- [ ] Verify keyboard navigation and focus states
- [ ] Verify screen reader compatibility
- [ ] Verify dark mode toggling

---

## Success Criteria

1. All 5 form components created with TypeScript (.ts) and HTML (.html) files
2. Each component properly implements ControlValueAccessor
3. Components work seamlessly with Angular Reactive Forms
4. All styling uses Tailwind CSS (no custom CSS files)
5. Dark mode support with `dark:` prefix classes
6. Proper ARIA attributes for accessibility compliance
7. Error messages display only after field is touched
8. Unique ID generation for label associations
9. Focus states clearly visible with primary color ring
10. Unit tests cover basic functionality and ControlValueAccessor behavior
11. All components exported from barrel index.ts
12. Documentation with JSDoc for all public APIs
13. Responsive design using Tailwind breakpoints
14. Support for all input types (text, email, number, password, tel, url)
15. Character count and validation feedback

---

## Notes for Implementation

### Important Reminders

1. **Use `inject()` instead of constructor injection** - More consistent with Angular 20 functional style
2. **No custom CSS files** - All styling via Tailwind utility classes
3. **Dark mode classes** - Always include `dark:` variants alongside light mode
4. **ControlValueAccessor** - Essential for Reactive Forms integration
5. **Touch tracking** - Errors only show after field is touched
6. **ARIA attributes** - Every input needs proper accessibility attributes
7. **Unique IDs** - Generate unique IDs for label-input association
8. **Tailwind Config** - Leverage extended theme (primary color, spacing, animations)
9. **Barrel exports** - All components exported from index.ts for easy imports
10. **TypeScript strict mode** - All types properly defined, no `any` type

### Component Naming Convention

- Component class: `FormInputComponent`, `FormSelectComponent`, etc.
- Selector: `app-form-input`, `app-form-select`, etc.
- File names: `form-input.component.ts`, `form-select.component.ts`, etc.
- Folder names: `form-input/`, `form-select/`, etc. (lowercase, hyphenated)

### Testing Considerations

- Use TestBed for component testing
- Mock user input with dispatchEvent
- Test ControlValueAccessor implementation
- Test error display logic (touched state)
- Test ARIA attributes presence
- Test Reactive Forms integration
- Test dark mode classes application

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Status**: Ready for Implementation
