/**
 * Company entity representing a multi-tenant organization.
 */
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  website?: string;
  logo?: string;
  settings: CompanySettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Company-specific settings and preferences.
 */
export interface CompanySettings {
  currency: Currency;
  timezone: string;
  dateFormat: string;
  fiscalYearStart: string; // Format: 'MM-DD'
  taxRate: number; // Default tax rate percentage
  invoicePrefix: string;
  purchaseOrderPrefix: string;
  allowNegativeInventory: boolean;
  lowStockThreshold: number; // Default threshold for low stock alerts
}

/**
 * Supported currencies for multi-currency support.
 */
export type Currency = 'USD' | 'EUR' | 'GBP' | 'MXN' | 'CAD' | 'AUD' | 'JPY' | 'CHF';

/**
 * DTO for creating a new company.
 */
export interface CreateCompanyDto {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  website?: string;
  settings?: Partial<CompanySettings>;
}

/**
 * DTO for updating an existing company.
 */
export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  id: string;
  settings?: Partial<CompanySettings>;
  isActive?: boolean;
}
