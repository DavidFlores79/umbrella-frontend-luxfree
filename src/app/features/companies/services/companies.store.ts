import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Company } from '../../../shared/models/company.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  selectedCompany: Company | null;
}

@Injectable({
  providedIn: 'root'
})
export class CompaniesStore extends StoreBase<CompaniesState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly companies$ = this.select(state => state.companies);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedCompany$ = this.select(state => state.selectedCompany);

  constructor() {
    super({
      companies: [],
      loading: false,
      error: null,
      selectedCompany: null
    });
  }

  loadCompanies(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getCompanies().pipe(
      tap(companies => {
        this.patchState({
          companies,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load companies',
          loading: false
        });
        return of([]);
      })
    ).subscribe();
  }

  createCompany(company: Partial<Company>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createCompany(company as any).pipe(
      tap(newCompany => {
        const companies = [...this.currentState.companies, newCompany];
        this.patchState({
          companies,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create company',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateCompany(id: string, updates: Partial<Company>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateCompany(updateDto as any).pipe(
      tap(updatedCompany => {
        const companies = this.currentState.companies.map((c: Company) =>
          c.id === id ? updatedCompany : c
        );
        this.patchState({
          companies,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update company',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteCompany(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteCompany(id).pipe(
      tap(() => {
        const companies = this.currentState.companies.filter((c: Company) => c.id !== id);
        this.patchState({
          companies,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete company',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectCompany(id: string): void {
    const company = this.currentState.companies.find((c: Company) => c.id === id);
    this.patchState({ selectedCompany: company || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
