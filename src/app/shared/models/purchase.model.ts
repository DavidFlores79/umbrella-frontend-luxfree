/**
 * Purchase order entity.
 */
export interface Purchase {
  id: string;
  companyId: string;
  purchaseOrderNumber: string;
  vendorId?: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  items: PurchaseLineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: PurchaseStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual line item in a purchase order.
 */
export interface PurchaseLineItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

/**
 * Purchase status workflow.
 */
export type PurchaseStatus = 'draft' | 'ordered' | 'received' | 'paid' | 'cancelled';

/**
 * DTO for creating a new purchase order.
 */
export interface CreatePurchaseDto {
  companyId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  items: CreatePurchaseLineItemDto[];
  status?: PurchaseStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: string;
}

/**
 * DTO for creating a purchase line item.
 */
export interface CreatePurchaseLineItemDto {
  productId: string;
  quantity: number;
  unitCost: number;
}

/**
 * DTO for updating an existing purchase order.
 */
export interface UpdatePurchaseDto {
  id: string;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  items?: CreatePurchaseLineItemDto[];
  status?: PurchaseStatus;
  paymentMethod?: string;
  paymentDate?: Date;
  receivedDate?: Date;
  notes?: string;
}
