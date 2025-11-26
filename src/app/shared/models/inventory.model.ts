/**
 * Inventory item representing current stock levels for a product.
 */
export interface InventoryItem {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  minThreshold: number;
  maxThreshold: number;
  location: string;
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Inventory movement record for tracking stock changes.
 */
export interface InventoryMovement {
  id: string;
  companyId: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  productSku: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceId?: string; // Sale ID, Purchase ID, or Adjustment ID
  referenceType?: 'sale' | 'purchase' | 'adjustment';
  location: string;
  performedBy: string;
  notes?: string;
  createdAt: Date;
}

/**
 * Types of inventory movements.
 */
export type MovementType = 'in' | 'out' | 'adjustment';

/**
 * Inventory alert for low stock warnings.
 */
export interface InventoryAlert {
  id: string;
  companyId: string;
  inventoryItemId: string;
  productId: string;
  productName: string;
  productSku: string;
  currentQuantity: number;
  minThreshold: number;
  severity: 'low' | 'critical';
  isRead: boolean;
  createdAt: Date;
}

/**
 * DTO for creating an inventory item.
 */
export interface CreateInventoryItemDto {
  companyId: string;
  productId: string;
  quantity: number;
  minThreshold: number;
  maxThreshold: number;
  location: string;
}

/**
 * DTO for updating an inventory item.
 */
export interface UpdateInventoryItemDto {
  id: string;
  quantity?: number;
  minThreshold?: number;
  maxThreshold?: number;
  location?: string;
}

/**
 * DTO for creating an inventory movement.
 */
export interface CreateInventoryMovementDto {
  companyId: string;
  inventoryItemId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  referenceId?: string;
  referenceType?: 'sale' | 'purchase' | 'adjustment';
  location: string;
  performedBy: string;
  notes?: string;
}

/**
 * Inventory statistics for dashboard.
 */
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageTurnover: number;
}
