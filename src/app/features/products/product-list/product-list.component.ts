import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsStore } from '../services/products.store';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { Product } from '../../../shared/models/product.model';
import { map, combineLatestWith } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    SearchBar,
    Card,
    Button,
    Badge,
    Alert,
    EmptyState,
    CurrencyPipe
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  private readonly store = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  readonly products$ = this.store.products$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  private readonly searchTerm$ = new BehaviorSubject<string>('');

  readonly filteredProducts$ = this.products$.pipe(
    combineLatestWith(this.searchTerm$),
    map(([products, searchTerm]) => {
      if (!searchTerm) {
        return products;
      }
      const term = searchTerm.toLowerCase();
      return products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    })
  );

  readonly columns = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  ngOnInit(): void {
    console.log('🔍 [PRODUCTS] Current user role:', this.permissions.isAdmin() ? 'ADMIN' : 'NON-ADMIN');
    console.log('🏢 [PRODUCTS] Current company ID:', this.companyContext.currentCompanyId);

    this.store.loadProducts();

    // Log products to verify filtering
    this.products$.subscribe(products => {
      console.log('📦 [PRODUCTS] Loaded products count:', products.length);
      if (products.length > 0) {
        console.log('📦 [PRODUCTS] Sample product companies:',
          products.slice(0, 3).map(p => ({ name: p.name, companyId: p.companyId }))
        );
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  onCreate(): void {
    this.router.navigate(['/products/create']);
  }

  onEdit(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  onDelete(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.store.deleteProduct(product.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(isActive: boolean): 'success' | 'warning' | 'error' | 'info' {
    return isActive ? 'success' : 'warning';
  }

  getCategoryBadgeVariant(category: string): 'success' | 'warning' | 'error' | 'info' {
    switch (category) {
      case 'electronics':
      case 'software':
        return 'info';
      case 'clothing':
      case 'food':
        return 'success';
      case 'services':
        return 'warning';
      default:
        return 'info';
    }
  }

  getTypeBadgeVariant(type: string): 'success' | 'warning' | 'error' | 'info' {
    switch (type) {
      case 'product':
        return 'success';
      case 'service':
        return 'info';
      case 'labor':
        return 'warning';
      default:
        return 'info';
    }
  }

  // Permission checks for UI
  canCreate(): boolean {
    return this.permissions.hasPermission('products:write');
  }

  canEdit(): boolean {
    return this.permissions.hasPermission('products:write');
  }

  canDelete(): boolean {
    return this.permissions.hasPermission('products:delete');
  }
}
