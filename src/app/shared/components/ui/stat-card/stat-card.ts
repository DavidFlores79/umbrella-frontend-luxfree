import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../card/card';

export type TrendDirection = 'up' | 'down' | 'neutral';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, Card],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input() title = '';
  @Input() value = '';
  @Input() change = ''; // e.g., "+12.5%"
  @Input() trend: TrendDirection = 'neutral';
  @Input() loading = false;
  @Input() icon = ''; // SVG path for custom icon

  get trendColor(): string {
    const colors: Record<TrendDirection, string> = {
      up: 'text-accent-green',
      down: 'text-accent-red',
      neutral: 'text-text-light dark:text-text-dark-light'
    };
    return colors[this.trend];
  }

  get trendIcon(): string {
    const icons: Record<TrendDirection, string> = {
      up: 'M5 10l7-7m0 0l7 7m-7-7v18',
      down: 'M19 14l-7 7m0 0l-7-7m7 7V4',
      neutral: 'M5 12h14'
    };
    return icons[this.trend];
  }

  get hasChange(): boolean {
    return !!this.change;
  }
}
