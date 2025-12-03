import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
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
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

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
        // Filter companies based on user role
        const filteredCompanies = this.filterCompaniesByRole(companies);

        console.log('🏢 [CompaniesStore] Loading companies...');
        console.log('  - Is Admin:', this.permissions.isAdmin());
        console.log('  - Is Manager:', this.permissions.isManager());
        console.log('  - Current Company ID:', this.companyContext.currentCompanyId);
        console.log('  - Total companies:', companies.length);
        console.log('  - Filtered companies:', filteredCompanies.length);

        this.patchState({
          companies: filteredCompanies,
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

  /**
   * Filters companies based on user role:
   * - USER role: Cannot see any companies (empty array)
   * - MANAGER role: Can only see their own company
   * - ADMIN role: Can see all companies
   */
  private filterCompaniesByRole(companies: Company[]): Company[] {
    // USER role should not see any companies
    if (this.permissions.hasRole('user')) {
      return [];
    }

    // ADMIN can see all companies
    if (this.permissions.isAdmin()) {
      return companies;
    }

    // MANAGER can only see their own company
    if (this.permissions.isManager()) {
      const currentCompanyId = this.companyContext.currentCompanyId;
      if (!currentCompanyId) {
        return [];
      }
      return companies.filter(c => c.id === currentCompanyId);
    }

    // Default: no access
    return [];
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
