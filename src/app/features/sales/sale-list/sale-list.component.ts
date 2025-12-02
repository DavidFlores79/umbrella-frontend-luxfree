import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SalesStore } from '../services/sales.store';
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
import { Sale } from '../../../shared/models/sale.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    CommonModule,
    SearchBar,
    Card,
    Button,
    Badge,
    Alert,
    EmptyState,
    DateFormatPipe,
    CurrencyPipe
  ],
  templateUrl: './sale-list.component.html'
})
export class SaleListComponent implements OnInit {
  private readonly store = inject(SalesStore);
  private readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  readonly sales$ = this.store.sales$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  searchTerm = '';

  readonly filteredSales$ = this.sales$.pipe(
    map(sales => {
      if (!this.searchTerm) {
        return sales;
      }
      const term = this.searchTerm.toLowerCase();
      return sales.filter(sale =>
        sale.invoiceNumber.toLowerCase().includes(term) ||
        sale.customerName.toLowerCase().includes(term) ||
        sale.customerEmail.toLowerCase().includes(term) ||
        sale.status.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    console.log('🔍 [SALES] Current user role:', this.permissions.isAdmin() ? 'ADMIN' : 'NON-ADMIN');
    console.log('🏢 [SALES] Current company ID:', this.companyContext.currentCompanyId);

    this.store.loadSales();

    // Log sales to verify filtering
    this.sales$.subscribe(sales => {
      console.log('💰 [SALES] Loaded sales count:', sales.length);
      if (sales.length > 0) {
        console.log('💰 [SALES] Sample sale companies:',
          sales.slice(0, 3).map(s => ({ invoice: s.invoiceNumber, companyId: s.companyId }))
        );
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onCreate(): void {
    this.router.navigate(['/sales/create']);
  }

  onEdit(sale: Sale): void {
    this.router.navigate(['/sales/edit', sale.id]);
  }

  onDelete(sale: Sale): void {
    if (confirm(`Are you sure you want to delete invoice "${sale.invoiceNumber}"?`)) {
      this.store.deleteSale(sale.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  }
}
