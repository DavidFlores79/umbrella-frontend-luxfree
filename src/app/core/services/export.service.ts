import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export format type.
 */
export type ExportFormat = 'csv' | 'pdf';

/**
 * Table column definition for exports.
 */
export interface ExportColumn {
  header: string;
  field: string;
  width?: number;
}

/**
 * PDF export options.
 */
export interface PdfExportOptions {
  title: string;
  columns: ExportColumn[];
  data: any[];
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  includeDate?: boolean;
}

/**
 * CSV export options.
 */
export interface CsvExportOptions {
  columns: ExportColumn[];
  data: any[];
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Service for exporting data to CSV and PDF formats.
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /**
   * Exports data to CSV format and triggers download.
   *
   * @param options - CSV export options
   */
  exportToCsv(options: CsvExportOptions): void {
    const {
      columns,
      data,
      filename = 'export.csv',
      includeHeaders = true
    } = options;

    let csv = '';

    // Add headers
    if (includeHeaders) {
      csv += columns.map(col => this.escapeCsvValue(col.header)).join(',') + '\n';
    }

    // Add data rows
    data.forEach(row => {
      const values = columns.map(col => {
        const value = this.getNestedValue(row, col.field);
        return this.escapeCsvValue(value);
      });
      csv += values.join(',') + '\n';
    });

    // Create and download file
    this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Exports data to PDF format and triggers download.
   *
   * @param options - PDF export options
   */
  exportToPdf(options: PdfExportOptions): void {
    const {
      title,
      columns,
      data,
      filename = 'export.pdf',
      orientation = 'portrait',
      includeDate = true
    } = options;

    // Create new PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 15);

    // Add date if requested
    if (includeDate) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dateText = `Generated: ${new Date().toLocaleDateString()}`;
      doc.text(dateText, 14, 22);
    }

    // Prepare table data
    const headers = columns.map(col => col.header);
    const body = data.map(row =>
      columns.map(col => {
        const value = this.getNestedValue(row, col.field);
        return this.formatPdfValue(value);
      })
    );

    // Add table using autoTable
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: includeDate ? 27 : 20,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 122, 89], // Primary coral color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        textColor: [45, 62, 80], // Text color
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [247, 249, 251] // Background tertiary
      },
      margin: { top: 15, right: 14, bottom: 15, left: 14 },
      columnStyles: this.getColumnStyles(columns)
    });

    // Save the PDF
    doc.save(filename);
  }

  /**
   * Exports simple data (array of objects) to CSV.
   *
   * @param data - Array of objects to export
   * @param filename - Output filename
   */
  exportSimpleCsv(data: any[], filename: string = 'export.csv'): void {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Automatically detect columns from first object
    const columns: ExportColumn[] = Object.keys(data[0]).map(key => ({
      header: this.formatHeader(key),
      field: key
    }));

    this.exportToCsv({ columns, data, filename });
  }

  /**
   * Exports simple data (array of objects) to PDF.
   *
   * @param data - Array of objects to export
   * @param title - PDF title
   * @param filename - Output filename
   */
  exportSimplePdf(
    data: any[],
    title: string,
    filename: string = 'export.pdf'
  ): void {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Automatically detect columns from first object
    const columns: ExportColumn[] = Object.keys(data[0]).map(key => ({
      header: this.formatHeader(key),
      field: key
    }));

    this.exportToPdf({ title, columns, data, filename });
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Escapes a value for safe use in CSV.
   */
  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // If value contains comma, quotes, or newline, wrap in quotes and escape existing quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Formats a value for PDF display.
   */
  private formatPdfValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    return String(value);
  }

  /**
   * Gets a nested value from an object using dot notation.
   *
   * @param obj - The object to get value from
   * @param path - The path (e.g., 'user.name')
   * @returns The value or empty string
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj) ?? '';
  }

  /**
   * Formats a field name into a readable header.
   *
   * @param field - Field name (e.g., 'firstName')
   * @returns Formatted header (e.g., 'First Name')
   */
  private formatHeader(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Creates column styles for PDF based on column widths.
   */
  private getColumnStyles(columns: ExportColumn[]): Record<number, any> {
    const styles: Record<number, any> = {};

    columns.forEach((col, index) => {
      if (col.width) {
        styles[index] = { cellWidth: col.width };
      }
    });

    return styles;
  }

  /**
   * Downloads a file with the given content.
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}
