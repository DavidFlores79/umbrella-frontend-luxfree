/**
 * Client entity representing customers/clients for sales transactions.
 * Clients are company-specific (multi-tenant).
 */
export interface Client {
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
 * DTO for creating a new client.
 */
export interface CreateClientDto {
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  notes?: string;
}

/**
 * DTO for updating an existing client.
 */
export interface UpdateClientDto extends Partial<CreateClientDto> {
  id: string;
  isActive?: boolean;
}
