import { Injectable, inject } from '@angular/core';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { User } from '../../../shared/models/user.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsersStore extends StoreBase<UsersState> {
  private readonly mockApi = inject(MockApiService);

  // Selectors
  readonly users$ = this.select(state => state.users);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);
  readonly selectedUser$ = this.select(state => state.selectedUser);

  constructor() {
    super({
      users: [],
      loading: false,
      error: null,
      selectedUser: null
    });
  }

  loadUsers(): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.getUsers().pipe(
      tap(users => {
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to load users',
          loading: false
        });
        return of([]);
      })
    ).subscribe();
  }

  createUser(user: Partial<User>): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.createUser(user as any).pipe(
      tap(newUser => {
        const users = [...this.currentState.users, newUser];
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to create user',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  updateUser(id: string, updates: Partial<User>): void {
    this.patchState({ loading: true, error: null });

    const updateDto = { id, ...updates };
    this.mockApi.updateUser(updateDto as any).pipe(
      tap(updatedUser => {
        const users = this.currentState.users.map((u: User) =>
          u.id === id ? updatedUser : u
        );
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to update user',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  deleteUser(id: string): void {
    this.patchState({ loading: true, error: null });

    this.mockApi.deleteUser(id).pipe(
      tap(() => {
        const users = this.currentState.users.filter((u: User) => u.id !== id);
        this.patchState({
          users,
          loading: false,
          error: null
        });
      }),
      catchError(err => {
        this.patchState({
          error: err.message || 'Failed to delete user',
          loading: false
        });
        throw err;
      })
    ).subscribe();
  }

  selectUser(id: string): void {
    const user = this.currentState.users.find((u: User) => u.id === id);
    this.patchState({ selectedUser: user || null });
  }

  clearError(): void {
    this.patchState({ error: null });
  }
}
