import { Component, Input, forwardRef, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-form-select',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-select.html',
  styleUrl: './form-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelect),
      multi: true
    }
  ]
})
export class FormSelect implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() disabled = false;

  value: string | number = '';
  touched = false;
  uniqueId = `form-select-${Math.random().toString(36).substring(2, 9)}`;

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.value = select.value;
    this.onChange(this.value);
  }

  onModelChange(value: string | number): void {
    console.log('onModelChange called with:', value);
    this.onChange(value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  writeValue(value: string | number): void {
    this.value = value || '';
    console.log('FormSelect writeValue called with:', value, 'Type:', typeof value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get showError(): boolean {
    return this.touched && !!this.errorMessage;
  }
}
