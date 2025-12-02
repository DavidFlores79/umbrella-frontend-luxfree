import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Client } from '../../../shared/models/client.model';
import { tap, catchError, distinctUntilChanged, skip } from 'rxjs/operators';
import { of } from 'rxjs';

interface ClientsState {
  clients: Client[];
  loading: boolean;
  error: string | null;
  selectedClient: Client | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsStore extends StoreBase<ClientsState> {
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly clients$ = this.select(state => state.clients);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedClient$ = this.select(state => state.selectedClient);

  constructor() {
    super({
      clients: [],
      loading: false,
      error: null,
      selectedClient: null
    });

    // Auto-reload clients when company changes
    this.setupCompanyChangeReload();
  }

  /**
   * Gets the company ID for filtering clients based on user role.
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
      this.loadClients();
    });
  }

  loadClients(): void {
    const companyId = this.getCompanyIdForFiltering();
    this.patchState({ loading: true, error: null });

    this.mockApi.getClients(companyId).pipe(
      tap(clients => {
        this.patchState({
          clients,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load clients',
          loading: false
        });
        return of([]);
      })
    ).subscribe();
  }

  createClient(client: Partial<Client>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createClient(client as any).pipe(
      tap(newClient => {
        const clients = [...this.currentState.clients, newClient];
        this.patchState({
          clients,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create client',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateClient(id: string, updates: Partial<Client>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateClient(updateDto as any).pipe(
      tap(updatedClient => {
        const clients = this.currentState.clients.map((c: Client) =>
          c.id === id ? updatedClient : c
        );
        this.patchState({
          clients,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update client',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteClient(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteClient(id).pipe(
      tap(() => {
        const clients = this.currentState.clients.filter((c: Client) => c.id !== id);
        this.patchState({
          clients,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete client',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectClient(id: string): void {
    const client = this.currentState.clients.find((c: Client) => c.id === id);
    this.patchState({ selectedClient: client || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
