import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VendorsStore } from '../services/vendors.store';
import { PermissionService } from '../../../core/services/permission.service';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { Vendor } from '../../../shared/models/vendor.model';
import { map, combineLatestWith } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, SearchBar, Card, Button, Badge, Alert, EmptyState],
  templateUrl: './vendor-list.component.html'
})
export class VendorListComponent implements OnInit {
  private readonly vendorsStore = inject(VendorsStore);
  private readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);

  readonly vendors$ = this.vendorsStore.vendors$;
  readonly loading$ = this.vendorsStore.loading$;
  readonly error$ = this.vendorsStore.error$;

  private readonly searchTerm$ = new BehaviorSubject<string>('');

  readonly filteredVendors$ = this.vendors$.pipe(
    combineLatestWith(this.searchTerm$),
    map(([vendors, searchTerm]) => {
      if (!searchTerm) return vendors;
      const term = searchTerm.toLowerCase();
      return vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(term) ||
        vendor.email.toLowerCase().includes(term) ||
        vendor.phone?.toLowerCase().includes(term) ||
        vendor.taxId?.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    this.vendorsStore.loadVendors();
  }

  onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  onCreate(): void {
    this.router.navigate(['/vendors/create']);
  }

  onEdit(vendor: Vendor): void {
    this.router.navigate(['/vendors/edit', vendor.id]);
  }

  deleteVendor(id: string): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      this.vendorsStore.deleteVendor(id);
    }
  }

  toggleActive(id: string, isActive: boolean): void {
    this.vendorsStore.updateVendor(id, { isActive: !isActive });
  }

  dismissError(): void {
    this.vendorsStore.clearError();
  }

  // Permission checks for UI
  canCreate(): boolean {
    return this.permissions.hasPermission('vendors:write');
  }

  canEdit(): boolean {
    return this.permissions.hasPermission('vendors:write');
  }

  canDelete(): boolean {
    return this.permissions.hasPermission('vendors:delete');
  }
}
