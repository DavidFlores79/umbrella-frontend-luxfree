import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circle' | 'rectangle' | 'card' | 'table';

@Component({
  selector: 'app-skeleton-loader',
  imports: [CommonModule],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.css',
})
export class SkeletonLoader {
  @Input() variant: SkeletonVariant = 'text';
  @Input() width = '100%';
  @Input() height = 'auto';
  @Input() rows = 1; // For text variant
  @Input() animate = true;

  get baseClasses(): string {
    const animation = this.animate ? 'animate-pulse' : '';
    return `bg-gray-200 dark:bg-gray-700 ${animation}`;
  }

  get variantClasses(): string {
    const variants: Record<SkeletonVariant, string> = {
      text: 'h-4 rounded',
      circle: 'rounded-full',
      rectangle: 'rounded-lg',
      card: 'rounded-xl h-48',
      table: 'rounded-lg h-12'
    };
    return variants[this.variant];
  }

  get rowsArray(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }
}
