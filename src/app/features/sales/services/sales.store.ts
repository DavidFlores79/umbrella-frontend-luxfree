import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Sale } from '../../../shared/models/sale.model';
import { tap, catchError } from 'rxjs/operators';
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
  }

  loadSales(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getSales().pipe(
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
