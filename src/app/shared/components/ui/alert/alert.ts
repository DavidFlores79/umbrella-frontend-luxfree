import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  @Input() type: AlertType = 'info';
  @Input() title = '';
  @Input() dismissible = false;
  @Input() showIcon = true;
  @Output() dismissed = new EventEmitter<void>();

  visible = true;

  onDismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }

  get baseClasses(): string {
    return 'p-4 rounded-lg border transition-all duration-200 animate-fade-in';
  }

  get typeClasses(): string {
    const types: Record<AlertType, string> = {
      success: 'bg-accent-green/10 border-accent-green/30 text-accent-green dark:bg-accent-green/20 dark:border-accent-green/40',
      warning: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow dark:bg-accent-yellow/20 dark:border-accent-yellow/40',
      error: 'bg-accent-red/10 border-accent-red/30 text-accent-red dark:bg-accent-red/20 dark:border-accent-red/40',
      info: 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue dark:bg-accent-blue/20 dark:border-accent-blue/40'
    };
    return types[this.type];
  }

  get icon(): string {
    const icons: Record<AlertType, string> = {
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.type];
  }
}
