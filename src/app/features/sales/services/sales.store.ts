import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Sale } from '../../../shared/models/sale.model';
import { tap, catchError, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface SalesState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  selectedSale: Sale | null;
}

@Injectable({
  providedIn: 'root'
})
export class SalesStore extends StoreBase<SalesState> {
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly sales$ = this.select(state => state.sales);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedSale$ = this.select(state => state.selectedSale);

  constructor() {
    super({
      sales: [],
      loading: false,
      error: null,
      selectedSale: null
    });

    // Auto-reload sales when company changes
    this.setupCompanyChangeReload();
  }

  /**
   * Gets the company ID for filtering sales based on user role.
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
      this.loadSales();
    });
  }

  /**
   * Ensures currentCompany is initialized before loading data.
   * This prevents the race condition where loadSales() is called
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

  loadSales(): void {
    this.ensureInitialized().subscribe(() => {
      const companyId = this.getCompanyIdForFiltering();
      this.patchState({ loading: true, error: null });

      this.mockApi.getSales(companyId).pipe(
        tap(sales => {
          this.patchState({
            sales,
            loading: false,
            error: null
          });
        }),
        catchError(err => {
          this.patchState({
            error: err.message || 'Failed to load sales',
            loading: false
          });
          return of([]);
        })
      ).subscribe();
    });
  }

  createSale(sale: Partial<Sale>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createSale(sale as any).pipe(
      tap(newSale => {
        const sales = [...this.currentState.sales, newSale];
        this.patchState({
          sales,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create sale',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateSale(id: string, updates: Partial<Sale>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateSale(updateDto as any).pipe(
      tap(updatedSale => {
        const sales = this.currentState.sales.map((s: Sale) =>
          s.id === id ? updatedSale : s
        );
        this.patchState({
          sales,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update sale',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteSale(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteSale(id).pipe(
      tap(() => {
        const sales = this.currentState.sales.filter((s: Sale) => s.id !== id);
        this.patchState({
          sales,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete sale',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectSale(id: string): void {
    const sale = this.currentState.sales.find((s: Sale) => s.id === id);
    this.patchState({ selectedSale: sale || null });
  }

  /**
   * Load a single sale by ID. More efficient than loadSales() for edit forms.
   * When switching to real API, this will fetch only one sale from backend.
   */
  loadSaleById(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getSale(id).pipe(
      tap(sale => {
        // Check if sale already exists in store
        const sales = this.currentState.sales;
        const existingIndex = sales.findIndex(s => s.id === id);

        const updatedSales = existingIndex >= 0
          ? sales.map(s => s.id === id ? sale : s)
          : [...sales, sale];

        this.patchState({
          sales: updatedSales,
          selectedSale: sale,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load sale',
          loading: false
        });
        return of(null);
      })
    ).subscribe();
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
