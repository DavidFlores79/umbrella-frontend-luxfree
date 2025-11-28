import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { InventoryStore } from '../services/inventory.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [CommonModule, Card, Button, Badge, DateFormatPipe],
  templateUrl: './inventory-detail.component.html'
})
export class InventoryDetailComponent implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly selectedItem$ = this.store.selectedItem$;
  readonly movements$ = this.store.movements$;
  readonly loading$ = this.store.loading$;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.store.selectItem(params['id']);
        this.store.loadMovements(params['id']);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/inventory']);
  }

  getMovementTypeBadgeVariant(type: string): 'success' | 'warning' | 'error' | 'info' {
    switch (type) {
      case 'in': return 'success';
      case 'out': return 'error';
      case 'adjustment': return 'warning';
      default: return 'info';
    }
  }
}
