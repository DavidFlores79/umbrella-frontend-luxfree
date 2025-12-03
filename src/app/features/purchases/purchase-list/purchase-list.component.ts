import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PurchasesStore } from '../services/purchases.store';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Purchase } from '../../../shared/models/purchase.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, SearchBar, Card, Button, Badge, Alert, EmptyState, DateFormatPipe, CurrencyPipe],
  templateUrl: './purchase-list.component.html'
})
export class PurchaseListComponent implements OnInit {
  private readonly store = inject(PurchasesStore);
  private readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  readonly purchases$ = this.store.purchases$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  searchTerm = '';

  readonly filteredPurchases$ = this.purchases$.pipe(
    map(purchases => {
      if (!this.searchTerm) return purchases;
      const term = this.searchTerm.toLowerCase();
      return purchases.filter(purchase =>
        purchase.purchaseOrderNumber.toLowerCase().includes(term) ||
        purchase.vendorName.toLowerCase().includes(term) ||
        purchase.vendorEmail.toLowerCase().includes(term) ||
        purchase.status.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    console.log('🔍 [PURCHASES] Current user role:', this.permissions.isAdmin() ? 'ADMIN' : 'NON-ADMIN');
    console.log('🏢 [PURCHASES] Current company ID:', this.companyContext.currentCompanyId);

    this.store.loadPurchases();

    // Log purchases to verify filtering
    this.purchases$.subscribe(purchases => {
      console.log('🛒 [PURCHASES] Loaded purchases count:', purchases.length);
      if (purchases.length > 0) {
        console.log('🛒 [PURCHASES] Sample purchase companies:',
          purchases.slice(0, 3).map(p => ({ po: p.purchaseOrderNumber, companyId: p.companyId }))
        );
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onCreate(): void {
    this.router.navigate(['/purchases/create']);
  }

  onEdit(purchase: Purchase): void {
    this.router.navigate(['/purchases/edit', purchase.id]);
  }

  onDelete(purchase: Purchase): void {
    if (confirm(`Are you sure you want to delete purchase order "${purchase.purchaseOrderNumber}"?`)) {
      this.store.deletePurchase(purchase.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case 'paid': return 'success';
      case 'received': return 'success';
      case 'ordered': return 'warning';
      case 'draft': return 'info';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  }

  // Permission checks for UI
  canCreate(): boolean {
    return this.permissions.hasPermission('purchases:write');
  }

  canEdit(): boolean {
    return this.permissions.hasPermission('purchases:write');
  }

  canDelete(): boolean {
    return this.permissions.hasPermission('purchases:delete');
  }
}
