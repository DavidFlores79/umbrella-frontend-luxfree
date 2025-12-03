import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Company } from '../../shared/models/company.model';
import { AuthService } from './auth.service';
import { MockApiService } from './mock-api.service';

/**
 * Company context state interface.
 */
interface CompanyContextState {
  currentCompany: Company | null;
  availableCompanies: Company[];
  loading: boolean;
  error: string | null;
}

/**
 * Service managing the current company context for multi-tenancy.
 * Tracks which company the user is currently working with.
 */
@Injectable({
  providedIn: 'root'
})
export class CompanyContextService {
  private readonly authService = inject(AuthService);
  private readonly mockApi = inject(MockApiService);

  private readonly STORAGE_KEY = 'umbrella_current_company';

  private readonly state$ = new BehaviorSubject<CompanyContextState>({
    currentCompany: null,
    availableCompanies: [],
    loading: false,
    error: null
  });

  // Observables for reactive access
  readonly currentCompany$ = this.state$.pipe(map(state => state.currentCompany));
  readonly availableCompanies$ = this.state$.pipe(map(state => state.availableCompanies));
  readonly loading$ = this.state$.pipe(map(state => state.loading));
  readonly error$ = this.state$.pipe(map(state => state.error));

  constructor() {
    this.initializeContext();
  }

  /**
   * Gets the current company synchronously.
   */
  get currentCompany(): Company | null {
    return this.state$.getValue().currentCompany;
  }

  /**
   * Gets the current company ID synchronously.
   */
  get currentCompanyId(): string | null {
    return this.currentCompany?.id ?? null;
  }

  /**
   * Sets the current company context.
   */
  setCurrentCompany(company: Company): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(company));
    this.patchState({ currentCompany: company, error: null });
  }

  /**
   * Switches to a different company.
   */
  switchCompany(companyId: string): Observable<Company> {
    this.patchState({ loading: true, error: null });

    return this.mockApi.getCompany(companyId).pipe(
      map(company => {
        this.setCurrentCompany(company);
        this.patchState({ loading: false });
        return company;
      })
    );
  }

  /**
   * Loads available companies for the current user.
   * - Admin users can see all companies
   * - Manager and User roles only see their own company
   */
  loadAvailableCompanies(): Observable<Company[]> {
    const user = this.authService.currentUser;

    if (!user) {
      this.patchState({ availableCompanies: [], error: 'No user logged in' });
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    this.patchState({ loading: true, error: null });

    return this.mockApi.getCompanies().pipe(
      map(companies => {
        // Admins can see all companies, others only see their own
        const userCompanies = user.role === 'admin'
          ? companies
          : companies.filter(c => c.id === user.companyId);

        this.patchState({
          availableCompanies: userCompanies,
          loading: false
        });
        return userCompanies;
      })
    );
  }

  /**
   * Refreshes the current company data.
   */
  refreshCurrentCompany(): Observable<Company | null> {
    const currentId = this.currentCompanyId;

    if (!currentId) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    this.patchState({ loading: true, error: null });

    return this.mockApi.getCompany(currentId).pipe(
      map(company => {
        this.setCurrentCompany(company);
        this.patchState({ loading: false });
        return company;
      })
    );
  }

  /**
   * Clears the current company context.
   */
  clearContext(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.patchState({
      currentCompany: null,
      availableCompanies: [],
      error: null
    });
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Initializes company context from storage or user's company.
   */
  private initializeContext(): void {
    // Subscribe to auth changes to update company context
    this.authService.user$.subscribe(user => {
      if (user) {
        // User is logged in
        const storedCompany = localStorage.getItem(this.STORAGE_KEY);
        let shouldLoadFromUser = true;

        // Check if stored company belongs to current user
        if (storedCompany) {
          try {
            const company = JSON.parse(storedCompany) as Company;
            // Only use stored company if it belongs to the current user
            if (company.id === user.companyId) {
              this.patchState({ currentCompany: company });
              shouldLoadFromUser = false;
            } else {
              // Clear invalid stored company (belongs to different user)
              localStorage.removeItem(this.STORAGE_KEY);
            }
          } catch {
            // Invalid data, clear it
            localStorage.removeItem(this.STORAGE_KEY);
          }
        }

        // Load company from user's companyId if needed
        if (shouldLoadFromUser) {
          this.mockApi.getCompany(user.companyId).subscribe(
            company => {
              this.setCurrentCompany(company);
            },
            error => {
              this.patchState({ error: 'Failed to load company context' });
            }
          );
        }
      } else {
        // User logged out, clear context
        this.clearContext();
      }
    });
  }

  /**
   * Updates the company context state.
   */
  private patchState(partialState: Partial<CompanyContextState>): void {
    this.state$.next({
      ...this.state$.getValue(),
      ...partialState
    });
  }
}
