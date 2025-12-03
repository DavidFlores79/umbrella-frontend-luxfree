import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Product } from '../../../shared/models/product.model';
import { tap, catchError, distinctUntilChanged, skip, filter, take, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsStore extends StoreBase<ProductsState> {
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly products$ = this.select(state => state.products);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedProduct$ = this.select(state => state.selectedProduct);

  constructor() {
    super({
      products: [],
      loading: false,
      error: null,
      selectedProduct: null
    });

    // Auto-reload products when company changes (for admin users switching companies)
    this.setupCompanyChangeReload();
  }

  /**
   * Gets the company ID for filtering products based on user role.
   * Admins see all companies, other users see only their company.
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
      this.loadProducts();
    });
  }

  /**
   * Ensures currentCompany is initialized before loading data.
   * This prevents the race condition where loadProducts() is called
   * before currentCompanyId is set, which would cause ALL companies' data to load.
   */
  private ensureInitialized(): Observable<void> {
    return this.companyContext.currentCompany$.pipe(
      filter(company => company !== null),
      take(1),
      map(() => undefined)
    );
  }

  loadProducts(): void {
    this.ensureInitialized().subscribe(() => {
      const companyId = this.getCompanyIdForFiltering();
      this.patchState({ loading: true, error: null });

      this.mockApi.getProducts(companyId).pipe(
        tap(products => {
          this.patchState({
            products,
            loading: false,
            error: null
          });
        }),
        catchError(err => {
          this.patchState({
            error: err.message || 'Failed to load products',
            loading: false
          });
          return of([]);
        })
      ).subscribe();
    });
  }

  createProduct(product: Partial<Product>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createProduct(product as any).pipe(
      tap(newProduct => {
        const products = [...this.currentState.products, newProduct];
        this.patchState({
          products,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create product',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateProduct(updateDto as any).pipe(
      tap(updatedProduct => {
        const products = this.currentState.products.map((p: Product) =>
          p.id === id ? updatedProduct : p
        );
        this.patchState({
          products,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update product',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteProduct(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteProduct(id).pipe(
      tap(() => {
        const products = this.currentState.products.filter((p: Product) => p.id !== id);
        this.patchState({
          products,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete product',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectProduct(id: string): void {
    const product = this.currentState.products.find((p: Product) => p.id === id);
    this.patchState({ selectedProduct: product || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
