import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Theme mode type.
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Service for managing application theme (light/dark mode).
 * Persists user preference to localStorage and applies theme class to document.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly rendererFactory = inject(RendererFactory2);
  private renderer: Renderer2;

  private readonly STORAGE_KEY = 'umbrella_theme';
  private readonly DARK_MODE_CLASS = 'dark';

  private readonly currentTheme$ = new BehaviorSubject<ThemeMode>('light');

  /**
   * Observable of the current theme mode.
   */
  readonly theme$: Observable<ThemeMode> = this.currentTheme$.asObservable();

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  /**
   * Gets the current theme mode synchronously.
   */
  get currentTheme(): ThemeMode {
    return this.currentTheme$.getValue();
  }

  /**
   * Checks if dark mode is currently active.
   */
  get isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  /**
   * Sets the theme mode.
   *
   * @param theme - The theme mode to set ('light' or 'dark')
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme$.next(theme);
    this.applyTheme(theme);
    this.saveThemePreference(theme);
  }

  /**
   * Toggles between light and dark mode.
   */
  toggleTheme(): void {
    const newTheme: ThemeMode = this.isDarkMode ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Enables dark mode.
   */
  enableDarkMode(): void {
    this.setTheme('dark');
  }

  /**
   * Enables light mode.
   */
  enableLightMode(): void {
    this.setTheme('light');
  }

  /**
   * Detects user's system theme preference.
   *
   * @returns 'dark' if user prefers dark mode, 'light' otherwise
   */
  detectSystemTheme(): ThemeMode {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    return 'light';
  }

  /**
   * Applies the system theme if no user preference is saved.
   */
  useSystemTheme(): void {
    const systemTheme = this.detectSystemTheme();
    this.setTheme(systemTheme);
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Initializes theme from localStorage or system preference.
   */
  private initializeTheme(): void {
    const savedTheme = this.loadThemePreference();

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Use system preference if no saved preference
      this.useSystemTheme();
    }

    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't set a manual preference
        const savedTheme = this.loadThemePreference();
        if (!savedTheme) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /**
   * Applies the theme by adding/removing the dark mode class on document element.
   */
  private applyTheme(theme: ThemeMode): void {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      this.renderer.addClass(htmlElement, this.DARK_MODE_CLASS);
    } else {
      this.renderer.removeClass(htmlElement, this.DARK_MODE_CLASS);
    }
  }

  /**
   * Saves theme preference to localStorage.
   */
  private saveThemePreference(theme: ThemeMode): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  /**
   * Loads theme preference from localStorage.
   */
  private loadThemePreference(): ThemeMode | null {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return (saved === 'dark' || saved === 'light') ? saved : null;
    }

    return null;
  }
}
