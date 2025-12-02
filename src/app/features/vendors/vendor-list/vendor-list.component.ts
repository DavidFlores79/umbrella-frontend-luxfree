import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VendorsStore } from '../services/vendors.store';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vendor-list.component.html'
})
export class VendorListComponent implements OnInit {
  private readonly vendorsStore = inject(VendorsStore);

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
}
