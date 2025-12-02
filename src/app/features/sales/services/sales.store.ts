import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Sale } from '../../../shared/models/sale.model';
import { tap, catchError, distinctUntilChanged, skip } from 'rxjs/operators';
import { of } from 'rxjs';

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
   */
  private setupCompanyChangeReload(): void {
    this.companyContext.currentCompany$.pipe(
      distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
      skip(1) // Skip initial value to avoid double-loading
    ).subscribe(() => {
      this.loadSales();
    });
  }

  loadSales(): void {
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

  clearError(): void {
    this.patchState({ error: null });
  }
}
