/**
 * Sales transaction entity.
 */
export interface Sale {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: SaleLineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: SaleStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual line item in a sale.
 */
export interface SaleLineItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

/**
 * Sale status workflow.
 */
export type SaleStatus = 'draft' | 'pending' | 'paid' | 'cancelled';

/**
 * DTO for creating a new sale.
 */
export interface CreateSaleDto {
  companyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CreateSaleLineItemDto[];
  status?: SaleStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  notes?: string;
  createdBy: string;
}

/**
 * DTO for creating a sale line item.
 */
export interface CreateSaleLineItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

/**
 * DTO for updating an existing sale.
 */
export interface UpdateSaleDto {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: CreateSaleLineItemDto[];
  status?: SaleStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  notes?: string;
}
