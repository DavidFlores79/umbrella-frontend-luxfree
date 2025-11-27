import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../button/button';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule, Button],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  @Input() icon = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'; // Default document icon
  @Input() title = 'No data available';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionVariant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Output() actionClick = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClick.emit();
  }

  get hasAction(): boolean {
    return !!this.actionLabel;
  }
}
