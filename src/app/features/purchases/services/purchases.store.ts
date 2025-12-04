import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Purchase } from '../../../shared/models/purchase.model';
import { tap, catchError, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface PurchasesState {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  selectedPurchase: Purchase | null;
}

@Injectable({
  providedIn: 'root'
})
export class PurchasesStore extends StoreBase<PurchasesState> {
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly purchases$ = this.select(state => state.purchases);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedPurchase$ = this.select(state => state.selectedPurchase);

  constructor() {
    super({
      purchases: [],
      loading: false,
      error: null,
      selectedPurchase: null
    });

    // Auto-reload purchases when company changes
    this.setupCompanyChangeReload();
  }

  /**
   * Gets the company ID for filtering purchases based on user role.
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
      this.loadPurchases();
    });
  }

  /**
   * Ensures currentCompany is initialized before loading data.
   * This prevents the race condition where loadPurchases() is called
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

  loadPurchases(): void {
    this.ensureInitialized().subscribe(() => {
      const companyId = this.getCompanyIdForFiltering();
      this.patchState({ loading: true, error: null });

      this.mockApi.getPurchases(companyId).pipe(
        tap(purchases => {
          this.patchState({
            purchases,
            loading: false,
            error: null
          });
        }),
        catchError(err => {
          this.patchState({
            error: err.message || 'Failed to load purchases',
            loading: false
          });
          return of([]);
        })
      ).subscribe();
    });
  }

  createPurchase(purchase: Partial<Purchase>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createPurchase(purchase as any).pipe(
      tap(newPurchase => {
        const purchases = [...this.currentState.purchases, newPurchase];
        this.patchState({
          purchases,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create purchase',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updatePurchase(id: string, updates: Partial<Purchase>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updatePurchase(updateDto as any).pipe(
      tap(updatedPurchase => {
        const purchases = this.currentState.purchases.map((s: Purchase) =>
          s.id === id ? updatedPurchase : s
        );
        this.patchState({
          purchases,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update purchase',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deletePurchase(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deletePurchase(id).pipe(
      tap(() => {
        const purchases = this.currentState.purchases.filter((s: Purchase) => s.id !== id);
        this.patchState({
          purchases,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete purchase',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectPurchase(id: string): void {
    const purchase = this.currentState.purchases.find((s: Purchase) => s.id === id);
    this.patchState({ selectedPurchase: purchase || null });
  }

  /**
   * Load a single purchase by ID. More efficient than loadPurchases() for edit forms.
   * When switching to real API, this will fetch only one purchase from backend.
   */
  loadPurchaseById(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getPurchase(id).pipe(
      tap(purchase => {
        // Check if purchase already exists in store
        const purchases = this.currentState.purchases;
        const existingIndex = purchases.findIndex(p => p.id === id);

        const updatedPurchases = existingIndex >= 0
          ? purchases.map(p => p.id === id ? purchase : p)
          : [...purchases, purchase];

        this.patchState({
          purchases: updatedPurchases,
          selectedPurchase: purchase,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load purchase',
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
