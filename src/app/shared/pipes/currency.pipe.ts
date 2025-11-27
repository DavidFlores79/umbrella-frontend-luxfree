import { Pipe, PipeTransform, inject } from '@angular/core';
import { CompanyContextService } from '../../core/services/company-context.service';
import { Currency } from '../models/company.model';

/**
 * Custom currency pipe that uses the company's configured currency
 * or accepts an explicit currency code.
 *
 * @example
 * {{ price | appCurrency }}  // Uses company currency
 * {{ price | appCurrency:'EUR' }}  // Explicit currency
 * {{ price | appCurrency:'USD':true }}  // Show symbol only
 */
@Pipe({
  name: 'appCurrency',
  pure: true // Can be pure since currency doesn't change frequently
})
export class CurrencyPipe implements PipeTransform {
  private readonly companyContext = inject(CompanyContextService);

  // Currency symbols mapping
  private readonly currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    MXN: 'MX$',
    CAD: 'CA$',
    AUD: 'AU$',
    JPY: '¥',
    CHF: 'CHF'
  };

  transform(
    value: number | string | null | undefined,
    currencyCode?: Currency,
    symbolOnly = false
  ): string {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '-';
    }

    // Convert to number
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '-';
    }

    // Determine currency to use
    const currency = currencyCode || this.getCompanyCurrency();

    // Return symbol only if requested
    if (symbolOnly) {
      return this.currencySymbols[currency];
    }

    // Format using Intl.NumberFormat
    try {
      const formatter = new Intl.NumberFormat(this.getLocale(currency), {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return formatter.format(numValue);
    } catch (error) {
      // Fallback to manual formatting
      const symbol = this.currencySymbols[currency];
      return `${symbol}${numValue.toFixed(2)}`;
    }
  }

  /**
   * Gets the company's configured currency or defaults to USD.
   */
  private getCompanyCurrency(): Currency {
    const company = this.companyContext.currentCompany;
    return company?.settings?.currency || 'USD';
  }

  /**
   * Maps currency to appropriate locale for Intl.NumberFormat.
   */
  private getLocale(currency: Currency): string {
    const localeMap: Record<Currency, string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      MXN: 'es-MX',
      CAD: 'en-CA',
      AUD: 'en-AU',
      JPY: 'ja-JP',
      CHF: 'de-CH'
    };
    return localeMap[currency];
  }
}
