import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorsStore } from '../services/vendors.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vendor-list.component.html'
})
export class VendorListComponent implements OnInit {
  private readonly vendorsStore = inject(VendorsStore);
  private readonly permissions = inject(PermissionService);

  readonly vendors$ = this.vendorsStore.vendors$;
  readonly loading$ = this.vendorsStore.loading$;
  readonly error$ = this.vendorsStore.error$;

  ngOnInit(): void {
    this.vendorsStore.loadVendors();
  }

  deleteVendor(id: string): void {
    if (confirm('Are you sure you want to delete this vendor?')) {
      this.vendorsStore.deleteVendor(id);
    }
  }

  toggleActive(id: string, isActive: boolean): void {
    this.vendorsStore.updateVendor(id, { isActive: !isActive });
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
