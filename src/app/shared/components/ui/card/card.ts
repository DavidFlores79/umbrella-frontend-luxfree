import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() title = '';
  @Input() loading = false;
  @Input() bordered = true;
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  get baseClasses(): string {
    return 'bg-white dark:bg-background-dark-secondary rounded-xl transition-all duration-200';
  }

  get borderClasses(): string {
    return this.bordered ? 'border border-gray-200 dark:border-gray-700' : '';
  }

  get shadowClasses(): string {
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg'
    };
    return shadows[this.shadow];
  }

  get paddingClasses(): string {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    };
    return paddings[this.padding];
  }
}
