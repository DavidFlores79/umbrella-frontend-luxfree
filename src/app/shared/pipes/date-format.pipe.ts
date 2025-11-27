import { Pipe, PipeTransform } from '@angular/core';

export type DateFormatType = 'short' | 'medium' | 'long' | 'relative';

/**
 * Custom date formatting pipe with multiple format options.
 *
 * @example
 * {{ date | appDateFormat }}  // Default: medium
 * {{ date | appDateFormat:'short' }}  // 01/15/2024
 * {{ date | appDateFormat:'long' }}  // January 15, 2024
 * {{ date | appDateFormat:'relative' }}  // 2 hours ago
 */
@Pipe({
  name: 'appDateFormat',
  pure: true
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: Date | string | number | null | undefined,
    format: DateFormatType = 'medium'
  ): string {
    // Handle null/undefined
    if (!value) {
      return '-';
    }

    // Convert to Date object
    const date = this.toDate(value);

    if (!date || isNaN(date.getTime())) {
      return '-';
    }

    // Apply requested format
    switch (format) {
      case 'short':
        return this.formatShort(date);
      case 'medium':
        return this.formatMedium(date);
      case 'long':
        return this.formatLong(date);
      case 'relative':
        return this.formatRelative(date);
      default:
        return this.formatMedium(date);
    }
  }

  /**
   * Converts various input types to Date object.
   */
  private toDate(value: Date | string | number): Date | null {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  /**
   * Short format: MM/DD/YYYY
   */
  private formatShort(date: Date): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
  }

  /**
   * Medium format: Jan 15, 2024
   */
  private formatMedium(date: Date): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  }

  /**
   * Long format: January 15, 2024
   */
  private formatLong(date: Date): string {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  }

  /**
   * Relative format: "2 hours ago", "3 days ago", etc.
   */
  private formatRelative(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    // Future dates
    if (diffMs < 0) {
      return this.formatMedium(date);
    }

    // Just now
    if (diffSec < 30) {
      return 'Just now';
    }

    // Seconds
    if (diffSec < 60) {
      return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    }

    // Minutes
    if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    }

    // Hours
    if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    }

    // Days
    if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    }

    // Weeks
    if (diffWeek < 4) {
      return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
    }

    // Months
    if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
    }

    // Years
    return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`;
  }
}
