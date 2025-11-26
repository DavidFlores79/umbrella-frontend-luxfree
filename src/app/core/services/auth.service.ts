import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { User, LoginCredentials, AuthResponse, RegisterDto } from '../../shared/models/user.model';
import { MockApiService } from './mock-api.service';

/**
 * Authentication state interface.
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Authentication service handling login, registration, and session management.
 * Uses localStorage for token persistence.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly mockApi = inject(MockApiService);
  private readonly router = inject(Router);

  private readonly STORAGE_KEYS = {
    token: 'umbrella_auth_token',
    user: 'umbrella_auth_user'
  };

  private readonly state$ = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  // Observables for reactive access
  readonly user$ = this.state$.pipe(map(state => state.user));
  readonly isAuthenticated$ = this.state$.pipe(map(state => state.isAuthenticated));
  readonly loading$ = this.state$.pipe(map(state => state.loading));
  readonly error$ = this.state$.pipe(map(state => state.error));

  constructor() {
    this.initializeFromStorage();
  }

  /**
   * Gets the current user synchronously.
   */
  get currentUser(): User | null {
    return this.state$.getValue().user;
  }

  /**
   * Gets the authentication token synchronously.
   */
  get token(): string | null {
    return this.state$.getValue().token;
  }

  /**
   * Checks if user is authenticated synchronously.
   */
  get isAuthenticated(): boolean {
    return this.state$.getValue().isAuthenticated;
  }

  /**
   * Logs in a user with email and password.
   */
  login(credentials: LoginCredentials): Observable<User> {
    this.patchState({ loading: true, error: null });

    return this.mockApi.login(credentials).pipe(
      tap((response: AuthResponse) => {
        this.setAuthData(response.token, response.user);
        this.patchState({ loading: false });
      }),
      map(response => response.user),
      catchError(error => {
        this.patchState({
          loading: false,
          error: error.message || 'Login failed'
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Registers a new user and creates a new company.
   */
  register(data: RegisterDto): Observable<User> {
    this.patchState({ loading: true, error: null });

    return this.mockApi.register(data).pipe(
      tap((response: AuthResponse) => {
        this.setAuthData(response.token, response.user);
        this.patchState({ loading: false });
      }),
      map(response => response.user),
      catchError(error => {
        this.patchState({
          loading: false,
          error: error.message || 'Registration failed'
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs out the current user and clears session data.
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Gets the authentication token for HTTP headers.
   */
  getAuthToken(): string | null {
    return this.token;
  }

  /**
   * Checks if the current user has a specific permission.
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUser;
    return user ? user.permissions.includes(permission as any) : false;
  }

  /**
   * Checks if the current user has a specific role.
   */
  hasRole(role: string): boolean {
    const user = this.currentUser;
    return user ? user.role === role : false;
  }

  /**
   * Updates the current user data in state and storage.
   */
  updateUserData(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.user, JSON.stringify(user));
    this.patchState({ user });
  }

  /**
   * Clears any authentication errors.
   */
  clearError(): void {
    this.patchState({ error: null });
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Initializes auth state from localStorage on service creation.
   */
  private initializeFromStorage(): void {
    const token = localStorage.getItem(this.STORAGE_KEYS.token);
    const userJson = localStorage.getItem(this.STORAGE_KEYS.user);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;

        // Simple token validation (check if it's not expired)
        if (this.isTokenValid(token)) {
          this.patchState({
            user,
            token,
            isAuthenticated: true
          });
        } else {
          // Token expired, clear storage
          this.clearAuthData();
        }
      } catch (error) {
        // Invalid data in storage, clear it
        this.clearAuthData();
      }
    }
  }

  /**
   * Sets authentication data in state and persists to localStorage.
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.token, token);
    localStorage.setItem(this.STORAGE_KEYS.user, JSON.stringify(user));

    this.patchState({
      user,
      token,
      isAuthenticated: true,
      error: null
    });
  }

  /**
   * Clears authentication data from state and localStorage.
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.token);
    localStorage.removeItem(this.STORAGE_KEYS.user);

    this.patchState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  }

  /**
   * Validates if a token is still valid.
   * Simple validation based on token age (24 hours).
   */
  private isTokenValid(token: string): boolean {
    try {
      // Decode the base64 token
      const payload = JSON.parse(atob(token));
      const timestamp = payload.timestamp;

      if (!timestamp) {
        return false;
      }

      // Check if token is less than 24 hours old
      const tokenAge = Date.now() - timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      return tokenAge < maxAge;
    } catch {
      return false;
    }
  }

  /**
   * Updates the auth state.
   */
  private patchState(partialState: Partial<AuthState>): void {
    this.state$.next({
      ...this.state$.getValue(),
      ...partialState
    });
  }
}
