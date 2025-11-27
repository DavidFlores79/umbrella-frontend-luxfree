import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ChipVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-chip',
  imports: [CommonModule],
  templateUrl: './chip.html',
  styleUrl: './chip.css',
})
export class Chip {
  @Input() variant: ChipVariant = 'default';
  @Input() removable = false;
  @Input() disabled = false;
  @Output() removed = new EventEmitter<void>();

  onRemove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled) {
      this.removed.emit();
    }
  }

  get baseClasses(): string {
    return 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200';
  }

  get variantClasses(): string {
    const variants: Record<ChipVariant, string> = {
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      success: 'bg-accent-green/10 text-accent-green dark:bg-accent-green/20 dark:text-green-300',
      warning: 'bg-accent-yellow/10 text-accent-yellow dark:bg-accent-yellow/20 dark:text-yellow-300',
      error: 'bg-accent-red/10 text-accent-red dark:bg-accent-red/20 dark:text-red-300',
      info: 'bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-300'
    };
    return variants[this.variant];
  }

  get disabledClass(): string {
    return this.disabled ? 'opacity-50 cursor-not-allowed' : '';
  }
}
