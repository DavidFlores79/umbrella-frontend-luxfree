import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';

/**
 * Base class for RxJS-based state management stores.
 * All feature stores should extend this class.
 *
 * @template T - The state interface type
 *
 * @example
 * ```typescript
 * interface MyState {
 *   items: MyItem[];
 *   loading: boolean;
 *   error: string | null;
 * }
 *
 * @Injectable({ providedIn: 'root' })
 * export class MyStore extends StoreBase<MyState> {
 *   readonly items$ = this.select(state => state.items);
 *   readonly loading$ = this.select(state => state.loading);
 *
 *   constructor() {
 *     super({ items: [], loading: false, error: null });
 *   }
 *
 *   loadItems(): void {
 *     this.patchState({ loading: true });
 *     // API call logic here
 *   }
 * }
 * ```
 */
export abstract class StoreBase<T extends object> {
  private readonly state$: BehaviorSubject<T>;

  /**
   * Creates a new store instance with the initial state.
   * @param initialState - The initial state object
   */
  protected constructor(initialState: T) {
    this.state$ = new BehaviorSubject<T>(initialState);
  }

  /**
   * Gets the current state value synchronously.
   * Use this sparingly - prefer using select() for reactive access.
   *
   * @returns The current state snapshot
   */
  protected get currentState(): T {
    return this.state$.getValue();
  }

  /**
   * Exposes the state as an observable for reactive subscriptions.
   *
   * @returns Observable of the complete state
   */
  protected get state(): Observable<T> {
    return this.state$.asObservable();
  }

  /**
   * Creates a selector for a specific slice of the state.
   * Automatically includes distinctUntilChanged to prevent unnecessary emissions.
   *
   * @param selector - Function to select a portion of the state
   * @returns Observable of the selected state slice
   *
   * @example
   * ```typescript
   * readonly items$ = this.select(state => state.items);
   * readonly loading$ = this.select(state => state.loading);
   * ```
   */
  protected select<K>(selector: (state: T) => K): Observable<K> {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  /**
   * Updates the state by merging the partial state with the current state.
   * This is the primary method for updating state.
   *
   * @param partialState - Partial state object to merge
   *
   * @example
   * ```typescript
   * this.patchState({ loading: true });
   * this.patchState({ items: newItems, loading: false });
   * ```
   */
  protected patchState(partialState: Partial<T>): void {
    this.state$.next({
      ...this.state$.getValue(),
      ...partialState
    });
  }

  /**
   * Completely replaces the current state with a new state.
   * Use this when you need to reset or completely replace the state.
   *
   * @param newState - The complete new state object
   *
   * @example
   * ```typescript
   * this.setState({ items: [], loading: false, error: null });
   * ```
   */
  protected setState(newState: T): void {
    this.state$.next(newState);
  }

  /**
   * Resets the state to the initial state.
   * Useful for cleanup or logout scenarios.
   *
   * @param initialState - The initial state to reset to
   *
   * @example
   * ```typescript
   * resetState(): void {
   *   this.reset({ items: [], loading: false, error: null });
   * }
   * ```
   */
  protected reset(initialState: T): void {
    this.state$.next(initialState);
  }
}
