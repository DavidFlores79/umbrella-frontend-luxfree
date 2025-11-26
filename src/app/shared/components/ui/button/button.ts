import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  get baseClasses(): string {
    return 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  }

  get variantClasses(): string {
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary: 'bg-background-tertiary dark:bg-background-dark-tertiary text-text dark:text-text-dark-DEFAULT hover:bg-background-secondary dark:hover:bg-background-dark-secondary focus:ring-text-lighter border border-gray-300 dark:border-gray-600',
      danger: 'bg-accent-red text-white hover:bg-red-600 focus:ring-accent-red',
      ghost: 'bg-transparent text-text dark:text-text-dark-DEFAULT hover:bg-background-secondary dark:hover:bg-background-dark-secondary focus:ring-text-lighter'
    };
    return variants[this.variant];
  }

  get sizeClasses(): string {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    return sizes[this.size];
  }

  get widthClass(): string {
    return this.fullWidth ? 'w-full' : '';
  }
}
