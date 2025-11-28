import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryStore } from '../services/inventory.store';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { InventoryItem } from '../../../shared/models/inventory.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, SearchBar, Card, Badge, Alert, EmptyState],
  templateUrl: './inventory-list.component.html'
})
export class InventoryListComponent implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly router = inject(Router);

  readonly items$ = this.store.items$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  searchTerm = '';

  readonly filteredItems$ = this.items$.pipe(
    map(items => {
      if (!this.searchTerm) return items;
      const term = this.searchTerm.toLowerCase();
      return items.filter(item =>
        item.productName.toLowerCase().includes(term) ||
        item.productSku.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    this.store.loadInventory();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onViewDetail(item: InventoryItem): void {
    this.router.navigate(['/inventory', item.id]);
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStockBadgeVariant(item: InventoryItem): 'success' | 'warning' | 'error' | 'info' {
    if (item.quantity <= 0) return 'error';
    if (item.quantity <= item.minThreshold) return 'warning';
    return 'success';
  }

  getStockStatus(item: InventoryItem): string {
    if (item.quantity <= 0) return 'Out of Stock';
    if (item.quantity <= item.minThreshold) return 'Low Stock';
    return 'In Stock';
  }
}
