/**
 * Vendor entity representing suppliers/vendors for purchase orders.
 * Vendors are company-specific (multi-tenant).
 */
export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new vendor.
 */
export interface CreateVendorDto {
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  notes?: string;
}

/**
 * DTO for updating an existing vendor.
 */
export interface UpdateVendorDto extends Partial<CreateVendorDto> {
  id: string;
  isActive?: boolean;
}
