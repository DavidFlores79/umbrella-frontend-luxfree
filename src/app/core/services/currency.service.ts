import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Currency } from '../../shared/models/company.model';
import { CompanyContextService } from './company-context.service';

/**
 * Currency locale mapping for Intl.NumberFormat.
 */
const CURRENCY_LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  MXN: 'es-MX',
  CAD: 'en-CA',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  CHF: 'de-CH'
};

/**
 * Service for currency formatting and conversion.
 * Uses Intl.NumberFormat API for locale-aware formatting.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly companyContext = inject(CompanyContextService);

  /**
   * Formats a number as currency using the specified currency code.
   *
   * @param amount - The amount to format
   * @param currencyCode - The currency code (e.g., 'USD', 'EUR')
   * @param options - Additional formatting options
   * @returns Formatted currency string
   */
  format(
    amount: number,
    currencyCode: Currency,
    options?: Intl.NumberFormatOptions
  ): string {
    const locale = CURRENCY_LOCALES[currencyCode] || 'en-US';

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      ...options
    });

    return formatter.format(amount);
  }

  /**
   * Formats a number using the current company's currency.
   *
   * @param amount - The amount to format
   * @param options - Additional formatting options
   * @returns Formatted currency string
   */
  formatCompanyCurrency(
    amount: number,
    options?: Intl.NumberFormatOptions
  ): string {
    const currency = this.getCurrentCurrency();
    return this.format(amount, currency, options);
  }

  /**
   * Formats a number as currency with no decimal places.
   *
   * @param amount - The amount to format
   * @param currencyCode - The currency code
   * @returns Formatted currency string without decimals
   */
  formatWhole(amount: number, currencyCode: Currency): string {
    return this.format(amount, currencyCode, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  /**
   * Formats a number as compact currency (e.g., $1.2K, $3.4M).
   *
   * @param amount - The amount to format
   * @param currencyCode - The currency code
   * @returns Compact formatted currency string
   */
  formatCompact(amount: number, currencyCode: Currency): string {
    const locale = CURRENCY_LOCALES[currencyCode] || 'en-US';

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      compactDisplay: 'short'
    });

    return formatter.format(amount);
  }

  /**
   * Gets the current company's currency code.
   *
   * @returns The current currency code or 'USD' as default
   */
  getCurrentCurrency(): Currency {
    const company = this.companyContext.currentCompany;
    return company?.settings.currency || 'USD';
  }

  /**
   * Gets the current company's currency as an observable.
   */
  get currentCurrency$(): Observable<Currency> {
    return this.companyContext.currentCompany$.pipe(
      map(company => company?.settings.currency || 'USD')
    );
  }

  /**
   * Gets the currency symbol for a given currency code.
   *
   * @param currencyCode - The currency code
   * @returns The currency symbol (e.g., '$', '€', '£')
   */
  getCurrencySymbol(currencyCode: Currency): string {
    const symbols: Record<Currency, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      MXN: '$',
      CAD: '$',
      AUD: '$',
      JPY: '¥',
      CHF: 'CHF'
    };

    return symbols[currencyCode] || currencyCode;
  }

  /**
   * Gets the full currency name.
   *
   * @param currencyCode - The currency code
   * @returns The full currency name
   */
  getCurrencyName(currencyCode: Currency): string {
    const names: Record<Currency, string> = {
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      MXN: 'Mexican Peso',
      CAD: 'Canadian Dollar',
      AUD: 'Australian Dollar',
      JPY: 'Japanese Yen',
      CHF: 'Swiss Franc'
    };

    return names[currencyCode] || currencyCode;
  }

  /**
   * Gets all supported currencies.
   *
   * @returns Array of supported currency codes
   */
  getSupportedCurrencies(): Currency[] {
    return ['USD', 'EUR', 'GBP', 'MXN', 'CAD', 'AUD', 'JPY', 'CHF'];
  }

  /**
   * Gets all supported currencies with their names and symbols.
   */
  getCurrencyOptions(): Array<{ code: Currency; name: string; symbol: string }> {
    return this.getSupportedCurrencies().map(code => ({
      code,
      name: this.getCurrencyName(code),
      symbol: this.getCurrencySymbol(code)
    }));
  }

  /**
   * Parses a currency string to a number.
   *
   * @param value - The currency string to parse
   * @returns The numeric value
   */
  parse(value: string): number {
    // Remove all non-numeric characters except decimal point and minus sign
    const cleaned = value.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
}
