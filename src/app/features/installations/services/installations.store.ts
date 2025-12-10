import { Injectable, inject } from '@angular/core';
import { tap, catchError, of } from 'rxjs';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import {
  Installation,
  CreateInstallationDto,
  UpdateInstallationDto,
  AddInstallationEventDto
} from '../../../shared/models/installation.model';

/**
 * Installation state interface
 */
interface InstallationsState {
  installations: Installation[];
  selectedInstallation: Installation | null;
  loading: boolean;
  error: string | null;
}

/**
 * Installations store for managing installation projects
 * (solar panels, street lighting, etc.)
 */
@Injectable({ providedIn: 'root' })
export class InstallationsStore extends StoreBase<InstallationsState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly installations$ = this.select(state => state.installations);
  readonly selectedInstallation$ = this.select(state => state.selectedInstallation);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

  constructor() {
    super({
      installations: [],
      selectedInstallation: null,
      loading: false,
      error: null
    });
  }

  /**
   * Load all installations (for list view)
   */
  loadInstallations(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getInstallations().pipe(
      tap(installations => this.patchState({ installations, loading: false })),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Load specific installation by ID (for detail/edit views)
   * CRITICAL: Use this instead of loadInstallations() for single-item views
   */
  loadInstallationById(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getInstallation(id).pipe(
      tap(installation => {
        const installations = this.currentState.installations;
        const existingIndex = installations.findIndex(i => i.id === id);

        const updatedInstallations = existingIndex >= 0
          ? installations.map(i => i.id === id ? installation : i)
          : [...installations, installation];

        this.patchState({
          installations: updatedInstallations,
          selectedInstallation: installation,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load installation',
          loading: false
        });
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Create new installation project
   */
  createInstallation(dto: CreateInstallationDto): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createInstallation(dto).pipe(
      tap(installation => {
        const installations = [...this.currentState.installations, installation];
        this.patchState({
          installations,
          selectedInstallation: installation,
          loading: false
        });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }

  /**
   * Update installation details
   */
  updateInstallation(id: string, dto: Partial<UpdateInstallationDto>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.updateInstallation(id, dto).pipe(
      tap(installation => {
        const installations = this.currentState.installations.map(i =>
          i.id === id ? installation : i
        );
        this.patchState({
          installations,
          selectedInstallation: installation,
          loading: false
        });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }

  /**
   * Add event to installation (with photos)
   */
  addEvent(dto: AddInstallationEventDto): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.addInstallationEvent(dto).pipe(
      tap(updatedInstallation => {
        const installations = this.currentState.installations.map(i =>
          i.id === dto.installationId ? updatedInstallation : i
        );
        this.patchState({
          installations,
          selectedInstallation: updatedInstallation,
          loading: false
        });
      }),
      catchError(err => {
        this.patchState({ error: err.message, loading: false });
        throw err;
      })
    ).subscribe();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.patchState({ error: null });
  }

  /**
   * Select specific installation
   */
  selectInstallation(id: string | null): void {
    if (!id) {
      this.patchState({ selectedInstallation: null });
      return;
    }

    const installation = this.currentState.installations.find(i => i.id === id);
    if (installation) {
      this.patchState({ selectedInstallation: installation });
    }
  }
}
