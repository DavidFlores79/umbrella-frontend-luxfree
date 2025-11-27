import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input() rounded = false; // Pill-shaped vs rectangle

  get baseClasses(): string {
    return 'inline-flex items-center justify-center font-medium transition-all duration-200';
  }

  get variantClasses(): string {
    const variants: Record<BadgeVariant, string> = {
      success: 'bg-accent-green/10 text-accent-green dark:bg-accent-green/20 dark:text-green-300',
      warning: 'bg-accent-yellow/10 text-accent-yellow dark:bg-accent-yellow/20 dark:text-yellow-300',
      error: 'bg-accent-red/10 text-accent-red dark:bg-accent-red/20 dark:text-red-300',
      info: 'bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-blue-300',
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return variants[this.variant];
  }

  get sizeClasses(): string {
    const sizes: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };
    return sizes[this.size];
  }

  get roundedClass(): string {
    return this.rounded ? 'rounded-full' : 'rounded-md';
  }
}
