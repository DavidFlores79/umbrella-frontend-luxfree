import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Vendor } from '../../../shared/models/vendor.model';
import { tap, catchError, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface VendorsState {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  selectedVendor: Vendor | null;
}

@Injectable({
  providedIn: 'root'
})
export class VendorsStore extends StoreBase<VendorsState> {
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly vendors$ = this.select(state => state.vendors);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedVendor$ = this.select(state => state.selectedVendor);

  constructor() {
    super({
      vendors: [],
      loading: false,
      error: null,
      selectedVendor: null
    });

    // Auto-reload vendors when company changes
    this.setupCompanyChangeReload();
  }

  /**
   * Gets the company ID for filtering vendors based on user role.
   * Admins see all companies, other users see only their company.
   */
  private getCompanyIdForFiltering(): string | undefined {
    return this.permissions.isAdmin()
      ? undefined // Admins see all companies
      : this.companyContext.currentCompanyId ?? undefined;
  }

  /**
   * Sets up automatic reload when company context changes.
   * Only reloads for non-admin users, as admins always see all companies' data.
   */
  private setupCompanyChangeReload(): void {
    // Admins see all companies' data, so don't reload on company context changes
    if (this.permissions.isAdmin()) {
      return;
    }

    this.companyContext.currentCompany$.pipe(
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      skip(1) // Skip initial value to avoid double-loading
    ).subscribe(() => {
      this.loadVendors();
    });
  }

  /**
   * Ensures currentCompany is initialized before loading data.
   * This prevents the race condition where loadVendors() is called
   * before currentCompanyId is set, which would cause ALL companies' data to load.
   * Admins skip this check since they should see all companies' data.
   */
  private ensureInitialized(): Observable<void> {
    // Admins don't need to wait for company context - they see all data
    if (this.permissions.isAdmin()) {
      return of(undefined);
    }

    return this.companyContext.currentCompany$.pipe(
      filter(company => company !== null),
      take(1),
      map(() => undefined)
    );
  }

  loadVendors(): void {
    this.ensureInitialized().subscribe(() => {
      const companyId = this.getCompanyIdForFiltering();
      this.patchState({ loading: true, error: null });

      this.mockApi.getVendors(companyId).pipe(
        tap(vendors => {
          this.patchState({
            vendors,
            loading: false,
            error: null
          });
        }),
        catchError(err => {
          this.patchState({
            error: err.message || 'Failed to load vendors',
            loading: false
          });
          return of([]);
        })
      ).subscribe();
    });
  }

  createVendor(vendor: Partial<Vendor>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createVendor(vendor as any).pipe(
      tap(newVendor => {
        const vendors = [...this.currentState.vendors, newVendor];
        this.patchState({
          vendors,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create vendor',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateVendor(id: string, updates: Partial<Vendor>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateVendor(updateDto as any).pipe(
      tap(updatedVendor => {
        const vendors = this.currentState.vendors.map((v: Vendor) =>
          v.id === id ? updatedVendor : v
        );
        this.patchState({
          vendors,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update vendor',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteVendor(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteVendor(id).pipe(
      tap(() => {
        const vendors = this.currentState.vendors.filter((v: Vendor) => v.id !== id);
        this.patchState({
          vendors,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete vendor',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectVendor(id: string): void {
    const vendor = this.currentState.vendors.find((v: Vendor) => v.id === id);
    this.patchState({ selectedVendor: vendor || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
