/**
 * Product or service entity in the catalog.
 */
export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  price: number;
  cost: number;
  taxRate: number;
  unit: string; // e.g., 'piece', 'kg', 'hour', 'meter'
  image?: string;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product categories for classification.
 */
export type ProductCategory =
  | 'electronics'
  | 'clothing'
  | 'food'
  | 'furniture'
  | 'tools'
  | 'supplies'
  | 'software'
  | 'services'
  | 'other';

/**
 * Product types.
 */
export type ProductType = 'product' | 'service' | 'labor';

/**
 * DTO for creating a new product.
 */
export interface CreateProductDto {
  companyId: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  price: number;
  cost: number;
  taxRate?: number;
  unit: string;
  trackInventory?: boolean;
}

/**
 * DTO for updating an existing product.
 */
export interface UpdateProductDto {
  id: string;
  sku?: string;
  name?: string;
  description?: string;
  category?: ProductCategory;
  type?: ProductType;
  price?: number;
  cost?: number;
  taxRate?: number;
  unit?: string;
  isActive?: boolean;
  trackInventory?: boolean;
}
