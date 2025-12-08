import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import {
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanySettings
} from '../../shared/models/company.model';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  LoginCredentials,
  AuthResponse,
  RegisterDto,
  ROLE_PERMISSIONS
} from '../../shared/models/user.model';
import {
  Product,
  CreateProductDto,
  UpdateProductDto
} from '../../shared/models/product.model';
import {
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
  SaleLineItem
} from '../../shared/models/sale.model';
import {
  Purchase,
  CreatePurchaseDto,
  UpdatePurchaseDto,
  PurchaseLineItem
} from '../../shared/models/purchase.model';
import {
  InventoryItem,
  InventoryMovement,
  InventoryAlert,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateInventoryMovementDto
} from '../../shared/models/inventory.model';
import {
  Vendor,
  CreateVendorDto,
  UpdateVendorDto
} from '../../shared/models/vendor.model';
import {
  Client,
  CreateClientDto,
  UpdateClientDto
} from '../../shared/models/client.model';

/**
 * Mock API service that simulates a backend API using localStorage.
 * Provides CRUD operations for all entities with realistic seed data.
 * All operations include a 300ms delay to simulate network latency.
 */
@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private readonly DELAY_MS = 300;
  private readonly STORAGE_KEYS = {
    companies: 'umbrella_companies',
    users: 'umbrella_users',
    products: 'umbrella_products',
    sales: 'umbrella_sales',
    purchases: 'umbrella_purchases',
    inventory: 'umbrella_inventory',
    movements: 'umbrella_movements',
    alerts: 'umbrella_alerts',
    vendors: 'umbrella_vendors',
    clients: 'umbrella_clients'
  };

  constructor() {
    this.initializeSeedData();
  }

  // ==================== COMPANIES ====================

  getCompanies(): Observable<Company[]> {
    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);
    return of(companies).pipe(delay(this.DELAY_MS));
  }

  getCompany(id: string): Observable<Company> {
    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);
    const company = companies.find(c => c.id === id);

    if (!company) {
      return throwError(() => new Error('Company not found')).pipe(delay(this.DELAY_MS));
    }

    return of(company).pipe(delay(this.DELAY_MS));
  }

  createCompany(dto: CreateCompanyDto): Observable<Company> {
    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);

    const newCompany: Company = {
      id: this.generateId(),
      ...dto,
      settings: this.getDefaultCompanySettings(dto.settings),
      status: 'active',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    companies.push(newCompany);
    this.saveToStorage(this.STORAGE_KEYS.companies, companies);

    return of(newCompany).pipe(delay(this.DELAY_MS));
  }

  updateCompany(dto: UpdateCompanyDto): Observable<Company> {
    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);
    const index = companies.findIndex(c => c.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('Company not found')).pipe(delay(this.DELAY_MS));
    }

    const updated: Company = {
      ...companies[index],
      ...dto,
      settings: dto.settings ? { ...companies[index].settings, ...dto.settings } : companies[index].settings,
      updatedAt: new Date()
    };

    companies[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.companies, companies);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  deleteCompany(id: string): Observable<void> {
    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);
    const filtered = companies.filter(c => c.id !== id);

    if (companies.length === filtered.length) {
      return throwError(() => new Error('Company not found')).pipe(delay(this.DELAY_MS));
    }

    this.saveToStorage(this.STORAGE_KEYS.companies, filtered);
    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== USERS ====================

  getUsers(companyId?: string): Observable<User[]> {
    let users = this.getFromStorage<User>(this.STORAGE_KEYS.users);

    if (companyId) {
      users = users.filter(u => u.companyId === companyId);
    }

    return of(users).pipe(delay(this.DELAY_MS));
  }

  getUser(id: string): Observable<User> {
    const users = this.getFromStorage<User>(this.STORAGE_KEYS.users);
    const user = users.find(u => u.id === id);

    if (!user) {
      return throwError(() => new Error('User not found')).pipe(delay(this.DELAY_MS));
    }

    return of(user).pipe(delay(this.DELAY_MS));
  }

  createUser(dto: CreateUserDto): Observable<User> {
    const users = this.getFromStorage<User>(this.STORAGE_KEYS.users);

    // Check if email already exists
    if (users.some(u => u.email === dto.email)) {
      return throwError(() => new Error('Email already exists')).pipe(delay(this.DELAY_MS));
    }

    const newUser: User = {
      id: this.generateId(),
      companyId: dto.companyId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: dto.role,
      permissions: ROLE_PERMISSIONS[dto.role],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);
    this.saveToStorage(this.STORAGE_KEYS.users, users);

    return of(newUser).pipe(delay(this.DELAY_MS));
  }

  updateUser(dto: UpdateUserDto): Observable<User> {
    const users = this.getFromStorage<User>(this.STORAGE_KEYS.users);
    const index = users.findIndex(u => u.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('User not found')).pipe(delay(this.DELAY_MS));
    }

    const updated: User = {
      ...users[index],
      ...dto,
      permissions: dto.role ? ROLE_PERMISSIONS[dto.role] : users[index].permissions,
      updatedAt: new Date()
    };

    users[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.users, users);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  deleteUser(id: string): Observable<void> {
    const users = this.getFromStorage<User>(this.STORAGE_KEYS.users);
    const filtered = users.filter(u => u.id !== id);

    if (users.length === filtered.length) {
      return throwError(() => new Error('User not found')).pipe(delay(this.DELAY_MS));
    }

    this.saveToStorage(this.STORAGE_KEYS.users, filtered);
    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== AUTH ====================

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const users = this.getFromStorage<User>(this.STORAGE_KEYS.users);
    const user = users.find(u => u.email === credentials.email);

    // Simple password check (in real app, use hashed passwords)
    if (!user || credentials.password !== 'password123') {
      return throwError(() => new Error('Invalid credentials')).pipe(delay(this.DELAY_MS));
    }

    if (!user.isActive) {
      return throwError(() => new Error('Account is inactive')).pipe(delay(this.DELAY_MS));
    }

    // Update last login and sync permissions with current role definition
    const index = users.findIndex(u => u.id === user.id);
    users[index].lastLogin = new Date();
    users[index].permissions = ROLE_PERMISSIONS[user.role]; // Sync permissions with current role
    this.saveToStorage(this.STORAGE_KEYS.users, users);

    const token = this.generateToken(users[index]);

    return of({ token, user: users[index] }).pipe(delay(this.DELAY_MS));
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    const users = this.getFromStorage<User>(this.STORAGE_KEYS.users);

    // Check if email already exists
    if (users.some(u => u.email === dto.email)) {
      return throwError(() => new Error('Email already exists')).pipe(delay(this.DELAY_MS));
    }

    // Create company first
    const companyDto: CreateCompanyDto = {
      name: dto.companyName,
      email: dto.companyEmail,
      phone: dto.companyPhone,
      address: dto.companyAddress,
      city: dto.companyCity,
      state: dto.companyState,
      country: dto.companyCountry,
      postalCode: dto.companyPostalCode,
      taxId: dto.companyTaxId
    };

    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);
    const newCompany: Company = {
      id: this.generateId(),
      ...companyDto,
      settings: this.getDefaultCompanySettings(),
      status: 'active',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    companies.push(newCompany);
    this.saveToStorage(this.STORAGE_KEYS.companies, companies);

    // Create admin user
    const newUser: User = {
      id: this.generateId(),
      companyId: newCompany.id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role: 'admin',
      permissions: ROLE_PERMISSIONS.admin,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);
    this.saveToStorage(this.STORAGE_KEYS.users, users);

    const token = this.generateToken(newUser);

    return of({ token, user: newUser }).pipe(delay(this.DELAY_MS));
  }

  // ==================== PRODUCTS ====================

  getProducts(companyId?: string): Observable<Product[]> {
    let products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);

    if (companyId) {
      products = products.filter(p => p.companyId === companyId);
    }

    return of(products).pipe(delay(this.DELAY_MS));
  }

  getProduct(id: string): Observable<Product> {
    const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);
    const product = products.find(p => p.id === id);

    if (!product) {
      return throwError(() => new Error('Product not found')).pipe(delay(this.DELAY_MS));
    }

    return of(product).pipe(delay(this.DELAY_MS));
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);

    // Check if SKU already exists for company
    if (products.some(p => p.companyId === dto.companyId && p.sku === dto.sku)) {
      return throwError(() => new Error('SKU already exists')).pipe(delay(this.DELAY_MS));
    }

    const newProduct: Product = {
      id: this.generateId(),
      ...dto,
      taxRate: dto.taxRate ?? 0,
      trackInventory: dto.trackInventory ?? true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    products.push(newProduct);
    this.saveToStorage(this.STORAGE_KEYS.products, products);

    // Create inventory item if tracking inventory
    if (newProduct.trackInventory) {
      const inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);
      const inventoryItem: InventoryItem = {
        id: this.generateId(),
        companyId: dto.companyId,
        productId: newProduct.id,
        productName: newProduct.name,
        productSku: newProduct.sku,
        quantity: 0,
        minThreshold: 10,
        maxThreshold: 100,
        location: 'Main Warehouse',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inventory.push(inventoryItem);
      this.saveToStorage(this.STORAGE_KEYS.inventory, inventory);
    }

    return of(newProduct).pipe(delay(this.DELAY_MS));
  }

  updateProduct(dto: UpdateProductDto): Observable<Product> {
    const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);
    const index = products.findIndex(p => p.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('Product not found')).pipe(delay(this.DELAY_MS));
    }

    const updated: Product = {
      ...products[index],
      ...dto,
      updatedAt: new Date()
    };

    products[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.products, products);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  deleteProduct(id: string): Observable<void> {
    const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);
    const filtered = products.filter(p => p.id !== id);

    if (products.length === filtered.length) {
      return throwError(() => new Error('Product not found')).pipe(delay(this.DELAY_MS));
    }

    this.saveToStorage(this.STORAGE_KEYS.products, filtered);
    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== SALES ====================

  getSales(companyId?: string): Observable<Sale[]> {
    let sales = this.getFromStorage<Sale>(this.STORAGE_KEYS.sales);

    if (companyId) {
      sales = sales.filter(s => s.companyId === companyId);
    }

    return of(sales).pipe(delay(this.DELAY_MS));
  }

  getSale(id: string): Observable<Sale> {
    const sales = this.getFromStorage<Sale>(this.STORAGE_KEYS.sales);
    const sale = sales.find(s => s.id === id);

    if (!sale) {
      return throwError(() => new Error('Sale not found')).pipe(delay(this.DELAY_MS));
    }

    return of(sale).pipe(delay(this.DELAY_MS));
  }

  createSale(dto: CreateSaleDto): Observable<Sale> {
    const sales = this.getFromStorage<Sale>(this.STORAGE_KEYS.sales);
    const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);
    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);

    const company = companies.find(c => c.id === dto.companyId);
    if (!company) {
      return throwError(() => new Error('Company not found')).pipe(delay(this.DELAY_MS));
    }

    // Calculate line items
    const items: SaleLineItem[] = dto.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const unitPrice = item.unitPrice;
      const subtotal = unitPrice * item.quantity;
      const taxAmount = subtotal * product.taxRate / 100;
      const total = subtotal + taxAmount;

      return {
        id: this.generateId(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice,
        taxRate: product.taxRate,
        taxAmount,
        subtotal,
        total
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = `${company.settings.invoicePrefix}${String(sales.length + 1).padStart(5, '0')}`;

    const newSale: Sale = {
      id: this.generateId(),
      companyId: dto.companyId,
      invoiceNumber,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      items,
      subtotal,
      taxAmount,
      total,
      status: dto.status ?? 'draft',
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate,
      notes: dto.notes,
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    sales.push(newSale);
    this.saveToStorage(this.STORAGE_KEYS.sales, sales);

    // Update inventory if sale is paid
    if (newSale.status === 'paid') {
      this.updateInventoryForSale(newSale, dto.createdBy);
    }

    return of(newSale).pipe(delay(this.DELAY_MS));
  }

  updateSale(dto: UpdateSaleDto): Observable<Sale> {
    const sales = this.getFromStorage<Sale>(this.STORAGE_KEYS.sales);
    const index = sales.findIndex(s => s.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('Sale not found')).pipe(delay(this.DELAY_MS));
    }

    let updated = { ...sales[index] };

    // Recalculate if items changed
    if (dto.items) {
      const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);
      const items: SaleLineItem[] = dto.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const unitPrice = item.unitPrice;
        const subtotal = unitPrice * item.quantity;
        const taxAmount = subtotal * product.taxRate / 100;
        const total = subtotal + taxAmount;

        return {
          id: this.generateId(),
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: item.quantity,
          unitPrice,
          taxRate: product.taxRate,
          taxAmount,
          subtotal,
          total
        };
      });

      updated.items = items;
      updated.subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      updated.taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
      updated.total = updated.subtotal + updated.taxAmount;
    }

    // Destructure items from dto to avoid overwriting the correctly typed items array
    const { items: _, ...dtoWithoutItems } = dto;
    updated = {
      ...updated,
      ...dtoWithoutItems,
      updatedAt: new Date()
    };

    sales[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.sales, sales);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  deleteSale(id: string): Observable<void> {
    const sales = this.getFromStorage<Sale>(this.STORAGE_KEYS.sales);
    const filtered = sales.filter(s => s.id !== id);

    if (sales.length === filtered.length) {
      return throwError(() => new Error('Sale not found')).pipe(delay(this.DELAY_MS));
    }

    this.saveToStorage(this.STORAGE_KEYS.sales, filtered);
    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== PURCHASES ====================

  getPurchases(companyId?: string): Observable<Purchase[]> {
    let purchases = this.getFromStorage<Purchase>(this.STORAGE_KEYS.purchases);

    if (companyId) {
      purchases = purchases.filter(p => p.companyId === companyId);
    }

    return of(purchases).pipe(delay(this.DELAY_MS));
  }

  getPurchase(id: string): Observable<Purchase> {
    const purchases = this.getFromStorage<Purchase>(this.STORAGE_KEYS.purchases);
    const purchase = purchases.find(p => p.id === id);

    if (!purchase) {
      return throwError(() => new Error('Purchase not found')).pipe(delay(this.DELAY_MS));
    }

    return of(purchase).pipe(delay(this.DELAY_MS));
  }

  createPurchase(dto: CreatePurchaseDto): Observable<Purchase> {
    const purchases = this.getFromStorage<Purchase>(this.STORAGE_KEYS.purchases);
    const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);
    const companies = this.getFromStorage<Company>(this.STORAGE_KEYS.companies);

    const company = companies.find(c => c.id === dto.companyId);
    if (!company) {
      return throwError(() => new Error('Company not found')).pipe(delay(this.DELAY_MS));
    }

    // Calculate line items
    const items: PurchaseLineItem[] = dto.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const unitCost = item.unitCost;
      const subtotal = unitCost * item.quantity;
      const taxAmount = subtotal * product.taxRate / 100;
      const total = subtotal + taxAmount;

      return {
        id: this.generateId(),
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitCost,
        taxRate: product.taxRate,
        taxAmount,
        subtotal,
        total
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + taxAmount;

    // Generate PO number
    const purchaseOrderNumber = `${company.settings.purchaseOrderPrefix}${String(purchases.length + 1).padStart(5, '0')}`;

    const newPurchase: Purchase = {
      id: this.generateId(),
      companyId: dto.companyId,
      purchaseOrderNumber,
      vendorName: dto.vendorName,
      vendorEmail: dto.vendorEmail,
      vendorPhone: dto.vendorPhone,
      items,
      subtotal,
      taxAmount,
      total,
      status: dto.status ?? 'draft',
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate,
      receivedDate: dto.receivedDate,
      notes: dto.notes,
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    purchases.push(newPurchase);
    this.saveToStorage(this.STORAGE_KEYS.purchases, purchases);

    // Update inventory if purchase is received
    if (newPurchase.status === 'received') {
      this.updateInventoryForPurchase(newPurchase, dto.createdBy);
    }

    return of(newPurchase).pipe(delay(this.DELAY_MS));
  }

  updatePurchase(dto: UpdatePurchaseDto): Observable<Purchase> {
    const purchases = this.getFromStorage<Purchase>(this.STORAGE_KEYS.purchases);
    const index = purchases.findIndex(p => p.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('Purchase not found')).pipe(delay(this.DELAY_MS));
    }

    let updated = { ...purchases[index] };

    // Recalculate if items changed
    if (dto.items) {
      const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);
      const items: PurchaseLineItem[] = dto.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const unitCost = item.unitCost;
        const subtotal = unitCost * item.quantity;
        const taxAmount = subtotal * product.taxRate / 100;
        const total = subtotal + taxAmount;

        return {
          id: this.generateId(),
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: item.quantity,
          unitCost,
          taxRate: product.taxRate,
          taxAmount,
          subtotal,
          total
        };
      });

      updated.items = items;
      updated.subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      updated.taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
      updated.total = updated.subtotal + updated.taxAmount;
    }

    // Destructure items from dto to avoid overwriting the correctly typed items array
    const { items: _purchaseItems, ...dtoWithoutPurchaseItems } = dto;
    updated = {
      ...updated,
      ...dtoWithoutPurchaseItems,
      updatedAt: new Date()
    };

    purchases[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.purchases, purchases);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  deletePurchase(id: string): Observable<void> {
    const purchases = this.getFromStorage<Purchase>(this.STORAGE_KEYS.purchases);
    const filtered = purchases.filter(p => p.id !== id);

    if (purchases.length === filtered.length) {
      return throwError(() => new Error('Purchase not found')).pipe(delay(this.DELAY_MS));
    }

    this.saveToStorage(this.STORAGE_KEYS.purchases, filtered);
    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== INVENTORY ====================

  getInventory(companyId?: string): Observable<InventoryItem[]> {
    let inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);

    if (companyId) {
      inventory = inventory.filter(i => i.companyId === companyId);
    }

    return of(inventory).pipe(delay(this.DELAY_MS));
  }

  getInventoryItem(id: string): Observable<InventoryItem> {
    const inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);
    const item = inventory.find(i => i.id === id);

    if (!item) {
      return throwError(() => new Error('Inventory item not found')).pipe(delay(this.DELAY_MS));
    }

    return of(item).pipe(delay(this.DELAY_MS));
  }

  createInventoryItem(dto: CreateInventoryItemDto): Observable<InventoryItem> {
    const inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);
    const products = this.getFromStorage<Product>(this.STORAGE_KEYS.products);

    const product = products.find(p => p.id === dto.productId);
    if (!product) {
      return throwError(() => new Error('Product not found')).pipe(delay(this.DELAY_MS));
    }

    const newItem: InventoryItem = {
      id: this.generateId(),
      companyId: dto.companyId,
      productId: dto.productId,
      productName: product.name,
      productSku: product.sku,
      quantity: dto.quantity,
      minThreshold: dto.minThreshold,
      maxThreshold: dto.maxThreshold,
      location: dto.location,
      lastRestocked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inventory.push(newItem);
    this.saveToStorage(this.STORAGE_KEYS.inventory, inventory);

    return of(newItem).pipe(delay(this.DELAY_MS));
  }

  updateInventoryItem(dto: UpdateInventoryItemDto): Observable<InventoryItem> {
    const inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);
    const index = inventory.findIndex(i => i.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('Inventory item not found')).pipe(delay(this.DELAY_MS));
    }

    const updated: InventoryItem = {
      ...inventory[index],
      ...dto,
      updatedAt: new Date()
    };

    inventory[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.inventory, inventory);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  getInventoryMovements(inventoryItemId: string): Observable<InventoryMovement[]> {
    const movements = this.getFromStorage<InventoryMovement>(this.STORAGE_KEYS.movements);
    return of(movements.filter(m => m.inventoryItemId === inventoryItemId)).pipe(delay(this.DELAY_MS));
  }

  createInventoryMovement(dto: CreateInventoryMovementDto): Observable<InventoryMovement> {
    const inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);
    const movements = this.getFromStorage<InventoryMovement>(this.STORAGE_KEYS.movements);

    const itemIndex = inventory.findIndex(i => i.id === dto.inventoryItemId);
    if (itemIndex === -1) {
      return throwError(() => new Error('Inventory item not found')).pipe(delay(this.DELAY_MS));
    }

    const item = inventory[itemIndex];
    const previousQuantity = item.quantity;
    let newQuantity: number;

    switch (dto.type) {
      case 'in':
        newQuantity = previousQuantity + dto.quantity;
        break;
      case 'out':
        newQuantity = previousQuantity - dto.quantity;
        break;
      case 'adjustment':
        newQuantity = dto.quantity;
        break;
    }

    const movement: InventoryMovement = {
      id: this.generateId(),
      companyId: dto.companyId,
      inventoryItemId: dto.inventoryItemId,
      productId: dto.productId,
      productName: item.productName,
      productSku: item.productSku,
      type: dto.type,
      quantity: dto.quantity,
      previousQuantity,
      newQuantity,
      reason: dto.reason,
      referenceId: dto.referenceId,
      referenceType: dto.referenceType,
      location: dto.location,
      performedBy: dto.performedBy,
      notes: dto.notes,
      createdAt: new Date()
    };

    movements.push(movement);
    inventory[itemIndex].quantity = newQuantity;
    inventory[itemIndex].updatedAt = new Date();

    if (dto.type === 'in') {
      inventory[itemIndex].lastRestocked = new Date();
    }

    this.saveToStorage(this.STORAGE_KEYS.movements, movements);
    this.saveToStorage(this.STORAGE_KEYS.inventory, inventory);

    // Check for low stock alerts
    this.checkInventoryAlerts(inventory[itemIndex]);

    return of(movement).pipe(delay(this.DELAY_MS));
  }

  getInventoryAlerts(companyId: string): Observable<InventoryAlert[]> {
    const alerts = this.getFromStorage<InventoryAlert>(this.STORAGE_KEYS.alerts);
    return of(alerts.filter(a => a.companyId === companyId && !a.isRead)).pipe(delay(this.DELAY_MS));
  }

  markAlertAsRead(alertId: string): Observable<void> {
    const alerts = this.getFromStorage<InventoryAlert>(this.STORAGE_KEYS.alerts);
    const index = alerts.findIndex(a => a.id === alertId);

    if (index !== -1) {
      alerts[index].isRead = true;
      this.saveToStorage(this.STORAGE_KEYS.alerts, alerts);
    }

    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== VENDORS ====================

  getVendors(companyId?: string): Observable<Vendor[]> {
    let vendors = this.getFromStorage<Vendor>(this.STORAGE_KEYS.vendors);

    if (companyId) {
      vendors = vendors.filter(v => v.companyId === companyId);
    }

    return of(vendors).pipe(delay(this.DELAY_MS));
  }

  getVendor(id: string): Observable<Vendor> {
    const vendors = this.getFromStorage<Vendor>(this.STORAGE_KEYS.vendors);
    const vendor = vendors.find(v => v.id === id);

    if (!vendor) {
      return throwError(() => new Error('Vendor not found')).pipe(delay(this.DELAY_MS));
    }

    return of(vendor).pipe(delay(this.DELAY_MS));
  }

  createVendor(dto: CreateVendorDto): Observable<Vendor> {
    const vendors = this.getFromStorage<Vendor>(this.STORAGE_KEYS.vendors);

    const newVendor: Vendor = {
      id: this.generateId(),
      ...dto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    vendors.push(newVendor);
    this.saveToStorage(this.STORAGE_KEYS.vendors, vendors);

    return of(newVendor).pipe(delay(this.DELAY_MS));
  }

  updateVendor(dto: UpdateVendorDto): Observable<Vendor> {
    const vendors = this.getFromStorage<Vendor>(this.STORAGE_KEYS.vendors);
    const index = vendors.findIndex(v => v.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('Vendor not found')).pipe(delay(this.DELAY_MS));
    }

    const updated: Vendor = {
      ...vendors[index],
      ...dto,
      updatedAt: new Date()
    };

    vendors[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.vendors, vendors);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  deleteVendor(id: string): Observable<void> {
    const vendors = this.getFromStorage<Vendor>(this.STORAGE_KEYS.vendors);
    const index = vendors.findIndex(v => v.id === id);

    if (index === -1) {
      return throwError(() => new Error('Vendor not found')).pipe(delay(this.DELAY_MS));
    }

    vendors.splice(index, 1);
    this.saveToStorage(this.STORAGE_KEYS.vendors, vendors);

    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== CLIENTS ====================

  getClients(companyId?: string): Observable<Client[]> {
    let clients = this.getFromStorage<Client>(this.STORAGE_KEYS.clients);

    if (companyId) {
      clients = clients.filter(c => c.companyId === companyId);
    }

    return of(clients).pipe(delay(this.DELAY_MS));
  }

  getClient(id: string): Observable<Client> {
    const clients = this.getFromStorage<Client>(this.STORAGE_KEYS.clients);
    const client = clients.find(c => c.id === id);

    if (!client) {
      return throwError(() => new Error('Client not found')).pipe(delay(this.DELAY_MS));
    }

    return of(client).pipe(delay(this.DELAY_MS));
  }

  createClient(dto: CreateClientDto): Observable<Client> {
    const clients = this.getFromStorage<Client>(this.STORAGE_KEYS.clients);

    const newClient: Client = {
      id: this.generateId(),
      ...dto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    clients.push(newClient);
    this.saveToStorage(this.STORAGE_KEYS.clients, clients);

    return of(newClient).pipe(delay(this.DELAY_MS));
  }

  updateClient(dto: UpdateClientDto): Observable<Client> {
    const clients = this.getFromStorage<Client>(this.STORAGE_KEYS.clients);
    const index = clients.findIndex(c => c.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error('Client not found')).pipe(delay(this.DELAY_MS));
    }

    const updated: Client = {
      ...clients[index],
      ...dto,
      updatedAt: new Date()
    };

    clients[index] = updated;
    this.saveToStorage(this.STORAGE_KEYS.clients, clients);

    return of(updated).pipe(delay(this.DELAY_MS));
  }

  deleteClient(id: string): Observable<void> {
    const clients = this.getFromStorage<Client>(this.STORAGE_KEYS.clients);
    const index = clients.findIndex(c => c.id === id);

    if (index === -1) {
      return throwError(() => new Error('Client not found')).pipe(delay(this.DELAY_MS));
    }

    clients.splice(index, 1);
    this.saveToStorage(this.STORAGE_KEYS.clients, clients);

    return of(void 0).pipe(delay(this.DELAY_MS));
  }

  // ==================== HELPER METHODS ====================

  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(user: User): string {
    return btoa(JSON.stringify({ userId: user.id, companyId: user.companyId, timestamp: Date.now() }));
  }

  private getDefaultCompanySettings(settings?: Partial<CompanySettings>): CompanySettings {
    return {
      currency: settings?.currency ?? 'USD',
      plan: (settings as any)?.plan ?? 'free',
      timezone: settings?.timezone ?? 'America/New_York',
      dateFormat: settings?.dateFormat ?? 'MM/DD/YYYY',
      fiscalYearStart: settings?.fiscalYearStart ?? '01-01',
      taxRate: settings?.taxRate ?? 8.5,
      invoicePrefix: settings?.invoicePrefix ?? 'INV-',
      purchaseOrderPrefix: settings?.purchaseOrderPrefix ?? 'PO-',
      allowNegativeInventory: settings?.allowNegativeInventory ?? false,
      lowStockThreshold: settings?.lowStockThreshold ?? 10
    };
  }

  private updateInventoryForSale(sale: Sale, userId: string): void {
    const inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);

    sale.items.forEach(item => {
      const invItem = inventory.find(i => i.productId === item.productId && i.companyId === sale.companyId);

      if (invItem) {
        this.createInventoryMovement({
          companyId: sale.companyId,
          inventoryItemId: invItem.id,
          productId: item.productId,
          type: 'out',
          quantity: item.quantity,
          reason: 'Sale',
          referenceId: sale.id,
          referenceType: 'sale',
          location: invItem.location,
          performedBy: userId
        }).subscribe();
      }
    });
  }

  private updateInventoryForPurchase(purchase: Purchase, userId: string): void {
    const inventory = this.getFromStorage<InventoryItem>(this.STORAGE_KEYS.inventory);

    purchase.items.forEach(item => {
      const invItem = inventory.find(i => i.productId === item.productId && i.companyId === purchase.companyId);

      if (invItem) {
        this.createInventoryMovement({
          companyId: purchase.companyId,
          inventoryItemId: invItem.id,
          productId: item.productId,
          type: 'in',
          quantity: item.quantity,
          reason: 'Purchase',
          referenceId: purchase.id,
          referenceType: 'purchase',
          location: invItem.location,
          performedBy: userId
        }).subscribe();
      }
    });
  }

  private checkInventoryAlerts(item: InventoryItem): void {
    if (item.quantity <= item.minThreshold) {
      const alerts = this.getFromStorage<InventoryAlert>(this.STORAGE_KEYS.alerts);

      // Check if alert already exists
      const existingAlert = alerts.find(
        a => a.inventoryItemId === item.id && !a.isRead
      );

      if (!existingAlert) {
        const alert: InventoryAlert = {
          id: this.generateId(),
          companyId: item.companyId,
          inventoryItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          currentQuantity: item.quantity,
          minThreshold: item.minThreshold,
          severity: item.quantity === 0 ? 'critical' : 'low',
          isRead: false,
          createdAt: new Date()
        };

        alerts.push(alert);
        this.saveToStorage(this.STORAGE_KEYS.alerts, alerts);
      }
    }
  }

  private initializeSeedData(): void {
    // Only initialize if storage is empty
    if (this.getFromStorage(this.STORAGE_KEYS.companies).length > 0) {
      return;
    }

    console.log('Initializing seed data...');

    // Will continue with seed data in next part due to size
    this.seedCompanies();
    this.seedUsers();
    this.seedProducts();
    this.seedVendors();
    this.seedClients();
    this.seedSales();
    this.seedPurchases();
  }

  private seedCompanies(): void {
    const companies: Company[] = [
      {
        id: 'company-1',
        name: 'Tech Solutions Inc.',
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 123-4567',
        address: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105',
        taxId: 'US123456789',
        website: 'https://techsolutions.com',
        settings: this.getDefaultCompanySettings({ currency: 'USD', plan: 'premium' } as any),
        status: 'active',
        isActive: true,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 'company-2',
        name: 'Global Traders Ltd.',
        email: 'info@globaltraders.com',
        phone: '+44 20 1234 5678',
        address: '456 Commerce Street',
        city: 'London',
        state: 'England',
        country: 'UK',
        postalCode: 'SW1A 1AA',
        taxId: 'GB987654321',
        website: 'https://globaltraders.com',
        settings: this.getDefaultCompanySettings({ currency: 'GBP', plan: 'basic' } as any),
        status: 'active',
        isActive: true,
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 'company-3',
        name: 'Comercio México S.A. de C.V.',
        email: 'contacto@comerciomexico.com',
        phone: '+52 55 1234 5678',
        address: 'Av. Reforma 789',
        city: 'Mexico City',
        state: 'CDMX',
        country: 'Mexico',
        postalCode: '06600',
        taxId: 'MX112233445566',
        settings: this.getDefaultCompanySettings({ currency: 'MXN', plan: 'free' } as any),
        status: 'active',
        isActive: true,
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2025-01-01')
      }
    ];

    this.saveToStorage(this.STORAGE_KEYS.companies, companies);
  }

  private seedUsers(): void {
    const users: User[] = [
      // Tech Solutions Inc. users
      {
        id: 'user-1',
        companyId: 'company-1',
        email: 'admin@techsolutions.com',
        firstName: 'John',
        lastName: 'Admin',
        phone: '+1 (555) 100-0001',
        role: 'admin',
        permissions: ROLE_PERMISSIONS.admin,
        isActive: true,
        lastLogin: new Date('2025-01-25'),
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2025-01-25')
      },
      {
        id: 'user-2',
        companyId: 'company-1',
        email: 'manager@techsolutions.com',
        firstName: 'Sarah',
        lastName: 'Manager',
        phone: '+1 (555) 100-0002',
        role: 'manager',
        permissions: ROLE_PERMISSIONS.manager,
        isActive: true,
        lastLogin: new Date('2025-01-24'),
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2025-01-24')
      },
      {
        id: 'user-3',
        companyId: 'company-1',
        email: 'user@techsolutions.com',
        firstName: 'Mike',
        lastName: 'User',
        phone: '+1 (555) 100-0003',
        role: 'user',
        permissions: ROLE_PERMISSIONS.user,
        isActive: true,
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2025-01-01')
      },
      // Global Traders Ltd. users
      {
        id: 'user-4',
        companyId: 'company-2',
        email: 'admin@globaltraders.com',
        firstName: 'Emma',
        lastName: 'Thompson',
        phone: '+44 20 1000 0001',
        role: 'admin',
        permissions: ROLE_PERMISSIONS.admin,
        isActive: true,
        lastLogin: new Date('2025-01-25'),
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2025-01-25')
      },
      {
        id: 'user-5',
        companyId: 'company-2',
        email: 'manager@globaltraders.com',
        firstName: 'James',
        lastName: 'Wilson',
        phone: '+44 20 1000 0002',
        role: 'manager',
        permissions: ROLE_PERMISSIONS.manager,
        isActive: true,
        createdAt: new Date('2023-04-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 'user-6',
        companyId: 'company-2',
        email: 'user@globaltraders.com',
        firstName: 'Oliver',
        lastName: 'Brown',
        phone: '+44 20 1000 0003',
        role: 'user',
        permissions: ROLE_PERMISSIONS.user,
        isActive: true,
        createdAt: new Date('2023-05-10'),
        updatedAt: new Date('2025-01-01')
      },
      // Comercio México users
      {
        id: 'user-7',
        companyId: 'company-3',
        email: 'admin@comerciomexico.com',
        firstName: 'Carlos',
        lastName: 'García',
        phone: '+52 55 1000 0001',
        role: 'admin',
        permissions: ROLE_PERMISSIONS.admin,
        isActive: true,
        lastLogin: new Date('2025-01-26'),
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2025-01-26')
      },
      {
        id: 'user-8',
        companyId: 'company-3',
        email: 'manager@comerciomexico.com',
        firstName: 'María',
        lastName: 'López',
        phone: '+52 55 1000 0002',
        role: 'manager',
        permissions: ROLE_PERMISSIONS.manager,
        isActive: true,
        createdAt: new Date('2023-07-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 'user-9',
        companyId: 'company-3',
        email: 'user@comerciomexico.com',
        firstName: 'José',
        lastName: 'Martínez',
        phone: '+52 55 1000 0003',
        role: 'user',
        permissions: ROLE_PERMISSIONS.user,
        isActive: true,
        createdAt: new Date('2023-08-15'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 'user-10',
        companyId: 'company-3',
        email: 'inactive@comerciomexico.com',
        firstName: 'Pedro',
        lastName: 'Hernández',
        phone: '+52 55 1000 0004',
        role: 'user',
        permissions: ROLE_PERMISSIONS.user,
        isActive: false,
        createdAt: new Date('2023-09-01'),
        updatedAt: new Date('2024-12-01')
      }
    ];

    this.saveToStorage(this.STORAGE_KEYS.users, users);
  }

  private seedProducts(): void {
    // Will add 50+ products in the actual implementation
    // For now, adding a representative sample
    const products: Product[] = [];

    // Tech Solutions Inc. products (20 products)
    const techProducts = [
      { sku: 'LAPTOP-001', name: 'Dell XPS 15 Laptop', category: 'electronics', price: 1299.99, cost: 950.00 },
      { sku: 'LAPTOP-002', name: 'MacBook Pro 14"', category: 'electronics', price: 1999.99, cost: 1500.00 },
      { sku: 'MOUSE-001', name: 'Logitech MX Master 3', category: 'electronics', price: 99.99, cost: 65.00 },
      { sku: 'KB-001', name: 'Mechanical Keyboard RGB', category: 'electronics', price: 149.99, cost: 95.00 },
      { sku: 'MON-001', name: '27" 4K Monitor', category: 'electronics', price: 399.99, cost: 280.00 },
      { sku: 'HD-001', name: '1TB External SSD', category: 'electronics', price: 129.99, cost: 85.00 },
      { sku: 'WEB-001', name: 'HD Webcam 1080p', category: 'electronics', price: 79.99, cost: 45.00 },
      { sku: 'HEAD-001', name: 'Wireless Headphones', category: 'electronics', price: 249.99, cost: 150.00 },
      { sku: 'TAB-001', name: 'iPad Pro 11"', category: 'electronics', price: 799.99, cost: 600.00 },
      { sku: 'DOCK-001', name: 'USB-C Docking Station', category: 'electronics', price: 199.99, cost: 130.00 },
      { sku: 'SOFT-001', name: 'Software License (Annual)', category: 'software', price: 499.99, cost: 100.00 },
      { sku: 'SOFT-002', name: 'Cloud Storage (1TB/year)', category: 'software', price: 119.99, cost: 50.00 },
      { sku: 'SERV-001', name: 'IT Consulting (per hour)', category: 'services', price: 150.00, cost: 0.00 },
      { sku: 'SERV-002', name: 'Network Setup', category: 'services', price: 500.00, cost: 0.00 },
      { sku: 'SERV-003', name: 'System Maintenance', category: 'services', price: 200.00, cost: 0.00 },
      { sku: 'CABLE-001', name: 'HDMI Cable 6ft', category: 'supplies', price: 19.99, cost: 8.00 },
      { sku: 'CABLE-002', name: 'USB-C Cable 10ft', category: 'supplies', price: 24.99, cost: 12.00 },
      { sku: 'ADAP-001', name: 'USB-C to HDMI Adapter', category: 'supplies', price: 29.99, cost: 15.00 },
      { sku: 'CASE-001', name: 'Laptop Carrying Case', category: 'supplies', price: 49.99, cost: 25.00 },
      { sku: 'STAND-001', name: 'Laptop Stand Aluminum', category: 'supplies', price: 59.99, cost: 30.00 }
    ];

    techProducts.forEach(p => {
      products.push({
        id: `product-tech-${products.length + 1}`,
        companyId: 'company-1',
        sku: p.sku,
        name: p.name,
        description: `High-quality ${p.name.toLowerCase()} for professional use`,
        category: p.category as any,
        type: p.category === 'services' ? 'service' : (p.category === 'software' ? 'service' : 'product'),
        price: p.price,
        cost: p.cost,
        taxRate: 8.5,
        unit: p.category === 'services' ? 'hour' : 'piece',
        isActive: true,
        trackInventory: p.category !== 'services' && p.category !== 'software',
        createdAt: new Date('2023-01-20'),
        updatedAt: new Date('2025-01-01')
      });
    });

    // Global Traders Ltd. products (15 products)
    const traderProducts = [
      { sku: 'CLOTH-001', name: 'Premium Cotton T-Shirt', category: 'clothing', price: 29.99, cost: 12.00 },
      { sku: 'CLOTH-002', name: 'Denim Jeans', category: 'clothing', price: 79.99, cost: 35.00 },
      { sku: 'CLOTH-003', name: 'Leather Jacket', category: 'clothing', price: 199.99, cost: 90.00 },
      { sku: 'CLOTH-004', name: 'Running Shoes', category: 'clothing', price: 119.99, cost: 55.00 },
      { sku: 'CLOTH-005', name: 'Wool Sweater', category: 'clothing', price: 89.99, cost: 40.00 },
      { sku: 'FOOD-001', name: 'Organic Coffee Beans 1kg', category: 'food', price: 24.99, cost: 10.00 },
      { sku: 'FOOD-002', name: 'Green Tea Premium', category: 'food', price: 19.99, cost: 8.00 },
      { sku: 'FOOD-003', name: 'Artisan Chocolate Box', category: 'food', price: 34.99, cost: 15.00 },
      { sku: 'FOOD-004', name: 'Olive Oil Extra Virgin 500ml', category: 'food', price: 16.99, cost: 7.00 },
      { sku: 'FURN-001', name: 'Office Chair Ergonomic', category: 'furniture', price: 299.99, cost: 150.00 },
      { sku: 'FURN-002', name: 'Standing Desk Electric', category: 'furniture', price: 599.99, cost: 320.00 },
      { sku: 'FURN-003', name: 'Bookshelf Modern', category: 'furniture', price: 199.99, cost: 95.00 },
      { sku: 'FURN-004', name: 'Conference Table', category: 'furniture', price: 799.99, cost: 400.00 },
      { sku: 'FURN-005', name: 'Filing Cabinet', category: 'furniture', price: 249.99, cost: 120.00 },
      { sku: 'TOOL-001', name: 'Cordless Drill Set', category: 'tools', price: 149.99, cost: 75.00 }
    ];

    traderProducts.forEach(p => {
      products.push({
        id: `product-trader-${products.length + 1}`,
        companyId: 'company-2',
        sku: p.sku,
        name: p.name,
        description: `Quality ${p.name.toLowerCase()}`,
        category: p.category as any,
        type: 'product',
        price: p.price,
        cost: p.cost,
        taxRate: 20.0,
        unit: 'piece',
        isActive: true,
        trackInventory: true,
        createdAt: new Date('2023-03-25'),
        updatedAt: new Date('2025-01-01')
      });
    });

    // Comercio México products (20 products)
    const mexicoProducts = [
      { sku: 'ELEC-001', name: 'Smart TV 55"', category: 'electronics', price: 8999.00, cost: 6500.00 },
      { sku: 'ELEC-002', name: 'Microwave Oven', category: 'electronics', price: 1999.00, cost: 1200.00 },
      { sku: 'ELEC-003', name: 'Refrigerator 18 cu ft', category: 'electronics', price: 12999.00, cost: 9000.00 },
      { sku: 'ELEC-004', name: 'Washing Machine', category: 'electronics', price: 7999.00, cost: 5500.00 },
      { sku: 'ELEC-005', name: 'Air Conditioner 12000 BTU', category: 'electronics', price: 6999.00, cost: 4800.00 },
      { sku: 'SUPP-001', name: 'Office Paper A4 (500 sheets)', category: 'supplies', price: 159.00, cost: 80.00 },
      { sku: 'SUPP-002', name: 'Ballpoint Pen (12 pack)', category: 'supplies', price: 89.00, cost: 40.00 },
      { sku: 'SUPP-003', name: 'Notebook Spiral', category: 'supplies', price: 49.00, cost: 20.00 },
      { sku: 'SUPP-004', name: 'Stapler Heavy Duty', category: 'supplies', price: 199.00, cost: 95.00 },
      { sku: 'SUPP-005', name: 'File Folders (25 pack)', category: 'supplies', price: 129.00, cost: 60.00 },
      { sku: 'FURN-MEX-001', name: 'Executive Desk', category: 'furniture', price: 4999.00, cost: 2800.00 },
      { sku: 'FURN-MEX-002', name: 'Office Chair Mesh', category: 'furniture', price: 2499.00, cost: 1400.00 },
      { sku: 'FURN-MEX-003', name: 'Meeting Room Table', category: 'furniture', price: 7999.00, cost: 4500.00 },
      { sku: 'FURN-MEX-004', name: 'Storage Cabinet', category: 'furniture', price: 3499.00, cost: 1900.00 },
      { sku: 'FURN-MEX-005', name: 'Reception Desk', category: 'furniture', price: 9999.00, cost: 5800.00 },
      { sku: 'SERV-MEX-001', name: 'Delivery Service', category: 'services', price: 150.00, cost: 0.00 },
      { sku: 'SERV-MEX-002', name: 'Installation Service', category: 'services', price: 500.00, cost: 0.00 },
      { sku: 'SERV-MEX-003', name: 'Maintenance Service', category: 'services', price: 350.00, cost: 0.00 },
      { sku: 'TOOL-MEX-001', name: 'Power Tool Set', category: 'tools', price: 2999.00, cost: 1700.00 },
      { sku: 'TOOL-MEX-002', name: 'Hand Tool Kit', category: 'tools', price: 999.00, cost: 550.00 }
    ];

    mexicoProducts.forEach(p => {
      products.push({
        id: `product-mexico-${products.length + 1}`,
        companyId: 'company-3',
        sku: p.sku,
        name: p.name,
        description: `${p.name} de alta calidad`,
        category: p.category as any,
        type: p.category === 'services' ? 'service' : 'product',
        price: p.price,
        cost: p.cost,
        taxRate: 16.0,
        unit: p.category === 'services' ? 'service' : 'piece',
        isActive: true,
        trackInventory: p.category !== 'services',
        createdAt: new Date('2023-06-15'),
        updatedAt: new Date('2025-01-01')
      });
    });

    this.saveToStorage(this.STORAGE_KEYS.products, products);

    // Create inventory items for products that track inventory
    const inventory: InventoryItem[] = [];
    products.filter(p => p.trackInventory).forEach((product, index) => {
      inventory.push({
        id: `inventory-${index + 1}`,
        companyId: product.companyId,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: Math.floor(Math.random() * 100) + 10,
        minThreshold: 10,
        maxThreshold: 100,
        location: 'Main Warehouse',
        lastRestocked: new Date('2024-12-15'),
        createdAt: product.createdAt,
        updatedAt: new Date('2025-01-01')
      });
    });

    this.saveToStorage(this.STORAGE_KEYS.inventory, inventory);
  }

  private seedSales(): void {
    const sales: Sale[] = [];
    const clients = [
      { id: 'client-1', name: 'ABC Corporation', email: 'contact@abc-corp.com', phone: '+1 (555) 200-0001' },
      { id: 'client-2', name: 'XYZ Industries', email: 'sales@xyz-ind.com', phone: '+1 (555) 200-0002' },
      { id: 'client-3', name: 'Tech Startup LLC', email: 'info@techstartup.com', phone: '+1 (555) 200-0003' },
      { id: 'client-4', name: 'Enterprise Solutions', email: 'contact@entsol.com', phone: '+1 (555) 200-0004' },
      { id: 'client-5', name: 'Digital Agency', email: 'hello@digitalagency.com', phone: '+1 (555) 200-0005' }
    ];

    const products = [
      { id: 'product-tech-1', name: 'Dell XPS 15 Laptop', sku: 'LAPTOP-001', price: 1299.99 },
      { id: 'product-tech-2', name: 'HP Monitor 27"', sku: 'MONITOR-001', price: 349.99 },
      { id: 'product-tech-3', name: 'Logitech MX Master 3', sku: 'MOUSE-001', price: 99.99 },
      { id: 'product-tech-4', name: 'Dell Docking Station', sku: 'DOCK-001', price: 249.99 },
      { id: 'product-tech-5', name: 'Webcam HD Pro', sku: 'WEBCAM-001', price: 129.99 }
    ];

    const statuses: Array<'paid' | 'pending' | 'draft'> = ['paid', 'paid', 'paid', 'paid', 'pending', 'draft'];
    const paymentMethods = ['Credit Card', 'Bank Transfer', 'PayPal', 'Cash'];

    let invoiceCounter = 1;
    const now = new Date();

    // Generate 40-50 sales across the last 6 months
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const salesInMonth = 6 + Math.floor(Math.random() * 4); // 6-10 sales per month

      for (let i = 0; i < salesInMonth; i++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Random date within the month
        const saleDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);

        // Generate 1-3 items per sale
        const itemCount = 1 + Math.floor(Math.random() * 3);
        const items = [];
        let subtotal = 0;

        for (let j = 0; j < itemCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = 1 + Math.floor(Math.random() * 5);
          const unitPrice = product.price;
          const itemSubtotal = quantity * unitPrice;
          const taxRate = 8.5;
          const taxAmount = (itemSubtotal * taxRate) / 100;
          const total = itemSubtotal + taxAmount;

          items.push({
            id: `sli-${invoiceCounter}-${j}`,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity,
            unitPrice,
            taxRate,
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            subtotal: parseFloat(itemSubtotal.toFixed(2)),
            total: parseFloat(total.toFixed(2))
          });

          subtotal += itemSubtotal;
        }

        const taxAmount = (subtotal * 8.5) / 100;
        const total = subtotal + taxAmount;

        sales.push({
          id: `sale-${invoiceCounter}`,
          companyId: 'company-1',
          invoiceNumber: `INV-${String(invoiceCounter).padStart(5, '0')}`,
          customerId: client.id,
          customerName: client.name,
          customerEmail: client.email,
          customerPhone: client.phone,
          items,
          subtotal: parseFloat(subtotal.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          status,
          paymentMethod,
          paymentDate: status === 'paid' ? saleDate : undefined,
          createdBy: 'user-1',
          createdAt: saleDate,
          updatedAt: saleDate
        });

        invoiceCounter++;
      }
    }

    this.saveToStorage(this.STORAGE_KEYS.sales, sales);
  }

  private seedPurchases(): void {
    const purchases: Purchase[] = [];
    const vendors = [
      { id: 'vendor-1', name: 'Tech Distributor Inc.', email: 'sales@techdist.com', phone: '+1 (555) 300-0001' },
      { id: 'vendor-2', name: 'Office Supplies Plus', email: 'orders@officesupplies.com', phone: '+1 (555) 300-0002' },
      { id: 'vendor-3', name: 'Global Electronics', email: 'contact@globalelec.com', phone: '+1 (555) 300-0003' }
    ];

    const products = [
      { id: 'product-tech-1', name: 'Dell XPS 15 Laptop', sku: 'LAPTOP-001', cost: 950.00 },
      { id: 'product-tech-2', name: 'HP Monitor 27"', sku: 'MONITOR-001', cost: 220.00 },
      { id: 'product-tech-3', name: 'Logitech MX Master 3', sku: 'MOUSE-001', cost: 65.00 },
      { id: 'product-tech-4', name: 'Dell Docking Station', sku: 'DOCK-001', cost: 180.00 },
      { id: 'product-tech-5', name: 'Webcam HD Pro', sku: 'WEBCAM-001', cost: 85.00 }
    ];

    const statuses: Array<'draft' | 'ordered' | 'received' | 'paid' | 'cancelled'> =
      ['received', 'received', 'paid', 'paid', 'ordered', 'draft'];
    const paymentMethods = ['Bank Transfer', 'Credit Card', 'Wire Transfer', 'Check'];

    let poCounter = 1;
    const now = new Date();

    // Generate 30-40 purchases across the last 6 months
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const purchasesInMonth = 4 + Math.floor(Math.random() * 4); // 4-8 purchases per month

      for (let i = 0; i < purchasesInMonth; i++) {
        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Random date within the month
        const purchaseDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);

        // Generate 1-3 items per purchase
        const itemCount = 1 + Math.floor(Math.random() * 3);
        const items = [];
        let subtotal = 0;

        for (let j = 0; j < itemCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = 5 + Math.floor(Math.random() * 15); // 5-20 units
          const unitCost = product.cost;
          const itemSubtotal = quantity * unitCost;
          const taxRate = 8.5;
          const taxAmount = (itemSubtotal * taxRate) / 100;
          const total = itemSubtotal + taxAmount;

          items.push({
            id: `pli-${poCounter}-${j}`,
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity,
            unitCost,
            taxRate,
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            subtotal: parseFloat(itemSubtotal.toFixed(2)),
            total: parseFloat(total.toFixed(2))
          });

          subtotal += itemSubtotal;
        }

        const taxAmount = (subtotal * 8.5) / 100;
        const total = subtotal + taxAmount;

        const receivedDate = (status === 'received' || status === 'paid')
          ? new Date(purchaseDate.getTime() + (3 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000)
          : undefined;

        purchases.push({
          id: `purchase-${poCounter}`,
          companyId: 'company-1',
          purchaseOrderNumber: `PO-${String(poCounter).padStart(5, '0')}`,
          vendorId: vendor.id,
          vendorName: vendor.name,
          vendorEmail: vendor.email,
          vendorPhone: vendor.phone,
          items,
          subtotal: parseFloat(subtotal.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          status,
          paymentMethod,
          paymentDate: status === 'paid' ? receivedDate : undefined,
          receivedDate,
          createdBy: 'user-1',
          createdAt: purchaseDate,
          updatedAt: receivedDate || purchaseDate
        });

        poCounter++;
      }
    }

    this.saveToStorage(this.STORAGE_KEYS.purchases, purchases);
  }

  private seedVendors(): void {
    const vendors: Vendor[] = [
      {
        id: 'vendor-1',
        companyId: 'company-1',
        name: 'Tech Distributor Inc.',
        email: 'sales@techdist.com',
        phone: '+1 (555) 300-0001',
        address: '123 Tech Street, Silicon Valley, CA 94025',
        taxId: 'TAX-001-TECH',
        notes: 'Primary supplier for computer hardware and peripherals',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'vendor-2',
        companyId: 'company-1',
        name: 'Office Supplies Plus',
        email: 'orders@officesupplies.com',
        phone: '+1 (555) 300-0002',
        address: '456 Office Way, Business City, NY 10001',
        taxId: 'TAX-002-OFFICE',
        notes: 'Office furniture and supplies',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'vendor-3',
        companyId: 'company-1',
        name: 'Global Electronics',
        email: 'contact@globalelec.com',
        phone: '+1 (555) 300-0003',
        address: '789 Electronics Blvd, Tech City, TX 75001',
        taxId: 'TAX-003-ELEC',
        isActive: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      },
      {
        id: 'vendor-4',
        companyId: 'company-2',
        name: 'Premium Restaurant Supply',
        email: 'sales@premiumsupply.com',
        phone: '+1 (555) 400-0001',
        address: '321 Restaurant Row, Culinary City, FL 33101',
        taxId: 'TAX-004-REST',
        notes: 'Kitchen equipment and supplies',
        isActive: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'vendor-5',
        companyId: 'company-2',
        name: 'Fresh Food Distributors',
        email: 'orders@freshfood.com',
        phone: '+1 (555) 400-0002',
        address: '654 Food Street, Market Town, IL 60601',
        taxId: 'TAX-005-FOOD',
        notes: 'Fresh ingredients and produce',
        isActive: true,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: 'vendor-6',
        companyId: 'company-3',
        name: 'Professional Services Group',
        email: 'info@proservices.com',
        phone: '+1 (555) 500-0001',
        address: '987 Business Ave, Corporate City, WA 98101',
        taxId: 'TAX-006-PRO',
        isActive: true,
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25')
      }
    ];

    this.saveToStorage(this.STORAGE_KEYS.vendors, vendors);
  }

  private seedClients(): void {
    const clients: Client[] = [
      {
        id: 'client-1',
        companyId: 'company-1',
        name: 'ABC Corporation',
        email: 'purchasing@abccorp.com',
        phone: '+1 (555) 100-0001',
        address: '100 Corporate Plaza, Business District, CA 90001',
        taxId: 'TAX-CLIENT-001',
        notes: 'Regular corporate client - Net 30 payment terms',
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'client-2',
        companyId: 'company-1',
        name: 'XYZ Enterprises',
        email: 'accounts@xyzent.com',
        phone: '+1 (555) 100-0002',
        address: '200 Enterprise Way, Commerce City, CA 90002',
        taxId: 'TAX-CLIENT-002',
        notes: 'VIP client - priority shipping',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'client-3',
        companyId: 'company-1',
        name: 'Tech Startup LLC',
        email: 'billing@techstartup.com',
        phone: '+1 (555) 100-0003',
        address: '300 Innovation Drive, Startup Valley, CA 94025',
        taxId: 'TAX-CLIENT-003',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'client-4',
        companyId: 'company-2',
        name: 'Event Planning Pros',
        email: 'catering@eventpros.com',
        phone: '+1 (555) 200-0001',
        address: '400 Event Street, Party City, FL 33102',
        taxId: 'TAX-CLIENT-004',
        notes: 'Regular catering orders for corporate events',
        isActive: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'client-5',
        companyId: 'company-2',
        name: 'Downtown Hotel Group',
        email: 'purchasing@downtownhotel.com',
        phone: '+1 (555) 200-0002',
        address: '500 Hotel Avenue, Hospitality District, FL 33103',
        taxId: 'TAX-CLIENT-005',
        notes: 'Weekly food supply orders',
        isActive: true,
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05')
      },
      {
        id: 'client-6',
        companyId: 'company-3',
        name: 'Mega Corporation',
        email: 'procurement@megacorp.com',
        phone: '+1 (555) 300-0001',
        address: '600 Corporate Tower, Big Business City, WA 98102',
        taxId: 'TAX-CLIENT-006',
        notes: 'Enterprise client - volume discounts',
        isActive: true,
        createdAt: new Date('2024-01-30'),
        updatedAt: new Date('2024-01-30')
      }
    ];

    this.saveToStorage(this.STORAGE_KEYS.clients, clients);
  }
}
