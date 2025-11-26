import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-toggle',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-toggle.html',
  styleUrl: './form-toggle.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormToggle),
      multi: true
    }
  ]
})
export class FormToggle implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() toggleChange = new EventEmitter<boolean>();

  checked = false;
  uniqueId = `form-toggle-${Math.random().toString(36).substring(2, 9)}`;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(): void {
    if (this.disabled) return;

    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.toggleChange.emit(this.checked);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get sizeClasses(): string {
    const sizes = {
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-14'
    };
    return sizes[this.size];
  }

  get thumbSizeClasses(): string {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    return sizes[this.size];
  }

  get thumbTranslateClasses(): string {
    const translates = {
      sm: 'translate-x-4',
      md: 'translate-x-5',
      lg: 'translate-x-7'
    };
    return this.checked ? translates[this.size] : 'translate-x-0';
  }
}
