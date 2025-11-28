import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Product } from '../../../shared/models/product.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  }

  loadProducts(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getProducts().pipe(
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
