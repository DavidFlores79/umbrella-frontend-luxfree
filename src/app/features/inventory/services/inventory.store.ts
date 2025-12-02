import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { InventoryItem, InventoryMovement } from '../../../shared/models/inventory.model';
import { tap, catchError, distinctUntilChanged, skip } from 'rxjs/operators';
import { of } from 'rxjs';

interface InventoryState {
  items: InventoryItem[];
  movements: InventoryMovement[];
  loading: boolean;
  error: string | null;
  selectedItem: InventoryItem | null;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryStore extends StoreBase<InventoryState> {
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  readonly items$ = this.select(state => state.items);
  readonly movements$ = this.select(state => state.movements);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedItem$ = this.select(state => state.selectedItem);

  constructor() {
    super({
      items: [],
      movements: [],
      loading: false,
      error: null,
      selectedItem: null
    });

    // Auto-reload inventory when company changes
    this.setupCompanyChangeReload();
  }

  /**
   * Gets the company ID for filtering inventory based on user role.
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
      this.loadInventory();
    });
  }

  loadInventory(): void {
    const companyId = this.getCompanyIdForFiltering();
    this.patchState({ loading: true, error: null });
    this.mockApi.getInventory(companyId).pipe(
      tap(items => this.patchState({ items, loading: false, error: null })),
      catchError(err => {
        this.patchState({ error: err.message || 'Failed to load inventory', loading: false });
        return of([]);
      })
    ).subscribe();
  }

  loadMovements(inventoryItemId: string): void {
    this.patchState({ loading: true, error: null });
    this.mockApi.getInventoryMovements(inventoryItemId).pipe(
      tap(movements => this.patchState({ movements, loading: false, error: null })),
      catchError(err => {
        this.patchState({ error: err.message || 'Failed to load movements', loading: false });
        return of([]);
      })
    ).subscribe();
  }

  createInventoryItem(item: Partial<InventoryItem>): void {
    this.patchState({ loading: true, error: null });
    this.mockApi.createInventoryItem(item as any).pipe(
      tap(newItem => {
        const items = [...this.currentState.items, newItem];
        this.patchState({ items, loading: false, error: null });
      }),
      catchError(err => {
        this.patchState({ error: err.message || 'Failed to create inventory item', loading: false });
        throw err;
      })
    ).subscribe();
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>): void {
    this.patchState({ loading: true, error: null });
    const updateDto = { id, ...updates };
    this.mockApi.updateInventoryItem(updateDto as any).pipe(
      tap(updatedItem => {
        const items = this.currentState.items.map((i: InventoryItem) =>
          i.id === id ? updatedItem : i
        );
        this.patchState({ items, loading: false, error: null });
      }),
      catchError(err => {
        this.patchState({ error: err.message || 'Failed to update inventory item', loading: false });
        throw err;
      })
    ).subscribe();
  }

  selectItem(id: string): void {
    const item = this.currentState.items.find((i: InventoryItem) => i.id === id);
    this.patchState({ selectedItem: item || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
