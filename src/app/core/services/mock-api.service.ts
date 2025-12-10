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
import {
  Installation,
  CreateInstallationDto,
  UpdateInstallationDto,
  AddInstallationEventDto,
  InstallationEvent,
  InstallationPhoto
} from '../../shared/models/installation.model';

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
    clients: 'umbrella_clients',
    installations: 'umbrella_installations'
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
        name: 'Luxfree Solar Solutions',
        email: 'contacto@luxfree.com',
        phone: '+52 (999) 123-4567',
        address: 'Calle 60 #450 x 51 y 53, Col. Centro',
        city: 'Mérida',
        state: 'Yucatán',
        country: 'México',
        postalCode: '97000',
        taxId: 'LUX850623ND4',
        website: 'https://luxfree.com',
        settings: this.getDefaultCompanySettings({ currency: 'MXN', plan: 'premium' } as any),
        status: 'active',
        isActive: true,
        createdAt: new Date('2020-03-15'),
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
      // Luxfree Solar Solutions users
      {
        id: 'user-1',
        companyId: 'company-1',
        email: 'admin@luxfree.com',
        firstName: 'David',
        lastName: 'Flores',
        phone: '+52 (999) 100-0001',
        role: 'admin',
        permissions: ROLE_PERMISSIONS.admin,
        isActive: true,
        lastLogin: new Date('2025-01-25'),
        createdAt: new Date('2020-03-15'),
        updatedAt: new Date('2025-01-25')
      },
      {
        id: 'user-2',
        companyId: 'company-1',
        email: 'gerente@luxfree.com',
        firstName: 'María',
        lastName: 'González',
        phone: '+52 (999) 100-0002',
        role: 'manager',
        permissions: ROLE_PERMISSIONS.manager,
        isActive: true,
        lastLogin: new Date('2025-01-24'),
        createdAt: new Date('2020-04-01'),
        updatedAt: new Date('2025-01-24')
      },
      {
        id: 'user-3',
        companyId: 'company-1',
        email: 'tecnico@luxfree.com',
        firstName: 'Jorge',
        lastName: 'Medina',
        phone: '+52 (999) 100-0003',
        role: 'user',
        permissions: ROLE_PERMISSIONS.user,
        isActive: true,
        createdAt: new Date('2020-05-15'),
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

    // Luxfree Solar Solutions products (30+ products - Solar & Lighting)
    const luxfreeProducts = [
      // Solar Panel Systems
      { sku: 'SOLAR-PANEL-300', name: 'Panel Solar Monocristalino 300W', category: 'solar', price: 2850.00, cost: 1950.00 },
      { sku: 'SOLAR-PANEL-400', name: 'Panel Solar Monocristalino 400W', category: 'solar', price: 3650.00, cost: 2550.00 },
      { sku: 'SOLAR-PANEL-450', name: 'Panel Solar Bifacial 450W', category: 'solar', price: 4250.00, cost: 2950.00 },
      { sku: 'SOLAR-PANEL-550', name: 'Panel Solar Alta Eficiencia 550W', category: 'solar', price: 5450.00, cost: 3850.00 },

      // Inverters
      { sku: 'INV-MICRO-1000', name: 'Microinversor 1000W', category: 'solar', price: 3250.00, cost: 2150.00 },
      { sku: 'INV-STRING-5K', name: 'Inversor String 5kW Monofásico', category: 'solar', price: 18500.00, cost: 13500.00 },
      { sku: 'INV-STRING-10K', name: 'Inversor String 10kW Trifásico', category: 'solar', price: 32500.00, cost: 24000.00 },
      { sku: 'INV-HYBRID-5K', name: 'Inversor Híbrido 5kW con Batería', category: 'solar', price: 45500.00, cost: 34000.00 },
      { sku: 'INV-HYBRID-10K', name: 'Inversor Híbrido 10kW con Batería', category: 'solar', price: 68500.00, cost: 52000.00 },

      // Mounting & Structure
      { sku: 'MOUNT-ROOF-TILE', name: 'Estructura Montaje Teja (10 paneles)', category: 'solar', price: 4850.00, cost: 3250.00 },
      { sku: 'MOUNT-ROOF-METAL', name: 'Estructura Montaje Lámina (10 paneles)', category: 'solar', price: 3950.00, cost: 2650.00 },
      { sku: 'MOUNT-GROUND', name: 'Estructura Montaje Piso (10 paneles)', category: 'solar', price: 6850.00, cost: 4650.00 },
      { sku: 'MOUNT-TRACKER', name: 'Seguidor Solar 1 Eje (20 paneles)', category: 'solar', price: 45500.00, cost: 32000.00 },

      // Batteries & Storage
      { sku: 'BATT-LIFEPO4-5KWH', name: 'Batería LiFePO4 5kWh 48V', category: 'solar', price: 32500.00, cost: 24500.00 },
      { sku: 'BATT-LIFEPO4-10KWH', name: 'Batería LiFePO4 10kWh 48V', category: 'solar', price: 58500.00, cost: 44500.00 },
      { sku: 'BATT-LIFEPO4-15KWH', name: 'Batería LiFePO4 15kWh 48V', category: 'solar', price: 82500.00, cost: 64000.00 },

      // Cables & Connectors
      { sku: 'CABLE-SOLAR-6MM-100M', name: 'Cable Solar 6mm² (100m)', category: 'supplies', price: 3250.00, cost: 2150.00 },
      { sku: 'CABLE-SOLAR-4MM-100M', name: 'Cable Solar 4mm² (100m)', category: 'supplies', price: 2450.00, cost: 1650.00 },
      { sku: 'MC4-CONNECTOR-PAIR', name: 'Conectores MC4 (10 pares)', category: 'supplies', price: 285.00, cost: 185.00 },
      { sku: 'JUNCTION-BOX', name: 'Caja de Conexiones String Box 2 in 1 out', category: 'supplies', price: 1850.00, cost: 1250.00 },

      // Residential Street Lighting
      { sku: 'LIGHT-LED-30W-SOLAR', name: 'Luminaria LED Solar 30W con Poste 4m', category: 'lighting', price: 8850.00, cost: 6250.00 },
      { sku: 'LIGHT-LED-50W-SOLAR', name: 'Luminaria LED Solar 50W con Poste 5m', category: 'lighting', price: 12500.00, cost: 8850.00 },
      { sku: 'LIGHT-LED-60W-SOLAR', name: 'Luminaria LED Solar 60W con Poste 6m', category: 'lighting', price: 15850.00, cost: 11250.00 },
      { sku: 'LIGHT-LED-100W-SOLAR', name: 'Luminaria LED Solar 100W con Poste 7m', category: 'lighting', price: 22500.00, cost: 16850.00 },

      // Public Street Lighting
      { sku: 'LIGHT-LED-150W-SOLAR-PUB', name: 'Luminaria Pública LED Solar 150W Poste 8m', category: 'lighting', price: 32500.00, cost: 24500.00 },
      { sku: 'LIGHT-LED-200W-SOLAR-PUB', name: 'Luminaria Pública LED Solar 200W Poste 10m', category: 'lighting', price: 42500.00, cost: 32000.00 },
      { sku: 'LIGHT-LED-250W-SOLAR-PUB', name: 'Luminaria Pública LED Solar 250W Poste 12m', category: 'lighting', price: 54500.00, cost: 41500.00 },
      { sku: 'POLE-GALV-6M', name: 'Poste Galvanizado 6m para Luminaria', category: 'lighting', price: 3850.00, cost: 2650.00 },
      { sku: 'POLE-GALV-8M', name: 'Poste Galvanizado 8m para Luminaria', category: 'lighting', price: 5250.00, cost: 3850.00 },
      { sku: 'POLE-GALV-10M', name: 'Poste Galvanizado 10m para Luminaria', category: 'lighting', price: 7850.00, cost: 5650.00 },
      { sku: 'POLE-GALV-12M', name: 'Poste Galvanizado 12m para Luminaria', category: 'lighting', price: 10850.00, cost: 7850.00 },

      // Installation Services
      { sku: 'SERV-INSTALL-RES-3KW', name: 'Instalación Sistema Solar Residencial hasta 3kW', category: 'services', price: 8500.00, cost: 0.00 },
      { sku: 'SERV-INSTALL-RES-5KW', name: 'Instalación Sistema Solar Residencial hasta 5kW', category: 'services', price: 12500.00, cost: 0.00 },
      { sku: 'SERV-INSTALL-RES-10KW', name: 'Instalación Sistema Solar Residencial hasta 10kW', category: 'services', price: 18500.00, cost: 0.00 },
      { sku: 'SERV-INSTALL-COM-20KW', name: 'Instalación Sistema Solar Comercial hasta 20kW', category: 'services', price: 32500.00, cost: 0.00 },
      { sku: 'SERV-INSTALL-LIGHT-RES', name: 'Instalación Luminaria Residencial (por unidad)', category: 'services', price: 2500.00, cost: 0.00 },
      { sku: 'SERV-INSTALL-LIGHT-PUB', name: 'Instalación Luminaria Pública (por unidad)', category: 'services', price: 4500.00, cost: 0.00 },

      // Maintenance Services
      { sku: 'SERV-MAINT-SOLAR-BASIC', name: 'Mantenimiento Preventivo Sistema Solar (Básico)', category: 'services', price: 1850.00, cost: 0.00 },
      { sku: 'SERV-MAINT-SOLAR-COMP', name: 'Mantenimiento Preventivo Sistema Solar (Completo)', category: 'services', price: 3850.00, cost: 0.00 },
      { sku: 'SERV-MAINT-LIGHT', name: 'Mantenimiento Luminarias (por unidad)', category: 'services', price: 850.00, cost: 0.00 },

      // Engineering & Consulting
      { sku: 'SERV-DESIGN-RES', name: 'Proyecto y Diseño Sistema Solar Residencial', category: 'services', price: 5500.00, cost: 0.00 },
      { sku: 'SERV-DESIGN-COM', name: 'Proyecto y Diseño Sistema Solar Comercial/Industrial', category: 'services', price: 15500.00, cost: 0.00 },
      { sku: 'SERV-CONSULT-HOUR', name: 'Consultoría Energética (por hora)', category: 'services', price: 850.00, cost: 0.00 },
      { sku: 'SERV-PERMITS', name: 'Gestión de Permisos CFE/Municipales', category: 'services', price: 4500.00, cost: 0.00 }
    ];

    luxfreeProducts.forEach(p => {
      products.push({
        id: `product-luxfree-${products.length + 1}`,
        companyId: 'company-1',
        sku: p.sku,
        name: p.name,
        description: `${p.name} - Alta calidad y garantía extendida`,
        category: p.category as any,
        type: p.category === 'services' ? 'service' : 'product',
        price: p.price,
        cost: p.cost,
        taxRate: 16.0,
        unit: p.category === 'services' ? 'servicio' : 'pieza',
        isActive: true,
        trackInventory: p.category !== 'services',
        createdAt: new Date('2020-03-20'),
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
      // Luxfree Solar Solutions vendors
      {
        id: 'vendor-1',
        companyId: 'company-1',
        name: 'JA Solar México S. de R.L.',
        email: 'ventas@jasolar.com.mx',
        phone: '+52 (55) 5300-0001',
        address: 'Av. Insurgentes Sur 1458, Col. Actipan, CDMX, C.P. 03230',
        taxId: 'JAS140825XX1',
        notes: 'Proveedor principal de paneles solares monocristalinos',
        isActive: true,
        createdAt: new Date('2020-04-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'vendor-2',
        companyId: 'company-1',
        name: 'Growatt Inversores México',
        email: 'info@growatt.mx',
        phone: '+52 (55) 5300-0002',
        address: 'Calz. de Tlalpan 1234, Col. Portales, CDMX, C.P. 03300',
        taxId: 'GRO160315XX5',
        notes: 'Inversores string y híbridos - Mejor precio/calidad',
        isActive: true,
        createdAt: new Date('2020-05-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'vendor-3',
        companyId: 'company-1',
        name: 'BYD Energy Storage México',
        email: 'comercial@bydenergy.mx',
        phone: '+52 (55) 5300-0003',
        address: 'Av. Santa Fe 495, Col. Cruz Manca, CDMX, C.P. 05349',
        taxId: 'BYD180920XX8',
        notes: 'Baterías LiFePO4 y sistemas de almacenamiento',
        isActive: true,
        createdAt: new Date('2020-06-15'),
        updatedAt: new Date('2024-03-01')
      },
      {
        id: 'vendor-4',
        companyId: 'company-1',
        name: 'Estructuras Solares del Sureste',
        email: 'ventas@estructurassolar.com',
        phone: '+52 (999) 300-0001',
        address: 'Calle 62 #385 x 43 y 45, Centro, Mérida, Yucatán, C.P. 97000',
        taxId: 'ESS190410XX2',
        notes: 'Fabricante local de estructuras de montaje - Entregas rápidas',
        isActive: true,
        createdAt: new Date('2020-07-01'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'vendor-5',
        companyId: 'company-1',
        name: 'Iluminación LED Yucatán',
        email: 'proyectos@ledyucatan.com',
        phone: '+52 (999) 300-0002',
        address: 'Av. Itzáes #234, Col. García Ginerés, Mérida, Yucatán, C.P. 97070',
        taxId: 'ILY170815XX6',
        notes: 'Luminarias LED solares para alumbrado público',
        isActive: true,
        createdAt: new Date('2020-08-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: 'vendor-6',
        companyId: 'company-1',
        name: 'Postes y Herrajes del Golfo',
        email: 'ventas@postesgolfo.com',
        phone: '+52 (999) 300-0003',
        address: 'Carretera Mérida-Progreso Km 15.5, Mérida, Yucatán, C.P. 97310',
        taxId: 'PHG150620XX9',
        notes: 'Postes galvanizados para alumbrado - Fabricación local',
        isActive: true,
        createdAt: new Date('2021-01-15'),
        updatedAt: new Date('2024-01-25')
      },
      {
        id: 'vendor-7',
        companyId: 'company-1',
        name: 'Cables y Conductores Eléctricos SA',
        email: 'ventas@cablesconductores.com.mx',
        phone: '+52 (55) 5300-0004',
        address: 'Circuito Exterior Mexiquense #450, Naucalpan, Estado de México, C.P. 53370',
        taxId: 'CCE130505XX3',
        notes: 'Cable solar certificado UV - Stock permanente',
        isActive: true,
        createdAt: new Date('2021-02-01'),
        updatedAt: new Date('2024-03-10')
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
      // Luxfree Solar Solutions clients
      {
        id: 'client-1',
        companyId: 'company-1',
        name: 'Residencial Las Américas',
        email: 'administracion@lasamericas.mx',
        phone: '+52 (999) 200-0001',
        address: 'Privada Las Américas #123, Col. Montecristo, Mérida, Yucatán, C.P. 97133',
        taxId: 'RLA850623ND4',
        notes: 'Fraccionamiento residencial - Proyecto alumbrado público solar',
        isActive: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'client-2',
        companyId: 'company-1',
        name: 'Gobierno Municipal de Umán',
        email: 'obras.publicas@uman.gob.mx',
        phone: '+52 (999) 200-0002',
        address: 'Palacio Municipal, Calle 20 s/n, Centro, Umán, Yucatán, C.P. 97390',
        taxId: 'UMA850101XX0',
        notes: 'Cliente gobierno - Alumbrado público vialidades principales',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'client-3',
        companyId: 'company-1',
        name: 'Hotel Hacienda Xcanatún',
        email: 'mantenimiento@xcanatun.com',
        phone: '+52 (999) 200-0003',
        address: 'Calle 20 s/n x 19 y 19A, Xcanatún, Mérida, Yucatán, C.P. 97302',
        taxId: 'HHX100215XX3',
        notes: 'Sistema solar para reducción de costos energéticos',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'client-4',
        companyId: 'company-1',
        name: 'Industrias del Sureste S.A. de C.V.',
        email: 'compras@indusureste.com',
        phone: '+52 (999) 200-0004',
        address: 'Parque Industrial Yucatán, Lote 15, Kanasín, Yucatán, C.P. 97370',
        taxId: 'ISU950815XX9',
        notes: 'Instalación industrial 50kW - Reducción huella carbono',
        isActive: true,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: 'client-5',
        companyId: 'company-1',
        name: 'Familia Pérez García',
        email: 'carlos.perez@email.com',
        phone: '+52 (999) 200-0005',
        address: 'Calle 45 #234 x 22 y 24, Col. Sodzil Norte, Mérida, Yucatán, C.P. 97115',
        taxId: 'PEGC801215XX6',
        notes: 'Cliente residencial - Sistema 5kW con baterías',
        isActive: true,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      },
      {
        id: 'client-6',
        companyId: 'company-1',
        name: 'Plaza Comercial La Isla',
        email: 'gerencia@plazalaisla.com',
        phone: '+52 (999) 200-0006',
        address: 'Av. Colón #501, Col. García Ginerés, Mérida, Yucatán, C.P. 97070',
        taxId: 'PCL120630XX2',
        notes: 'Sistema solar estacionamiento + iluminación LED',
        isActive: true,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: 'client-7',
        companyId: 'company-1',
        name: 'Universidad Tecnológica Metropolitana',
        email: 'infraestructura@utm.edu.mx',
        phone: '+52 (999) 200-0007',
        address: 'Calle 115 #404, Col. Chuburná de Hidalgo, Mérida, Yucatán, C.P. 97200',
        taxId: 'UTM080915XX5',
        notes: 'Proyecto educativo - Sistema 30kW con propósito didáctico',
        isActive: true,
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-04-01')
      },
      {
        id: 'client-8',
        companyId: 'company-1',
        name: 'Súper Farmacia del Mayab',
        email: 'operaciones@farmayab.com',
        phone: '+52 (999) 200-0008',
        address: 'Av. Itzáes #502, Col. Centro, Mérida, Yucatán, C.P. 97000',
        taxId: 'SFM140720XX8',
        notes: 'Cadena de farmacias - 8 sucursales',
        isActive: true,
        createdAt: new Date('2024-04-20'),
        updatedAt: new Date('2024-04-20')
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

  // ========================================
  // INSTALLATION METHODS
  // ========================================

  /**
   * Get all installations
   */
  getInstallations(): Observable<Installation[]> {
    const installations = this.getFromStorage<Installation>(this.STORAGE_KEYS.installations);
    return of(installations).pipe(delay(this.DELAY_MS));
  }

  /**
   * Get single installation by ID
   */
  getInstallation(id: string): Observable<Installation> {
    const installations = this.getFromStorage<Installation>(this.STORAGE_KEYS.installations);
    const installation = installations.find(i => i.id === id);

    if (!installation) {
      return throwError(() => new Error('Installation not found')).pipe(delay(this.DELAY_MS));
    }

    return of(installation).pipe(delay(this.DELAY_MS));
  }

  /**
   * Create new installation
   */
  createInstallation(dto: CreateInstallationDto): Observable<Installation> {
    const installations = this.getFromStorage<Installation>(this.STORAGE_KEYS.installations);
    const clients = this.getFromStorage<Client>(this.STORAGE_KEYS.clients);
    const client = clients.find(c => c.id === dto.customerId);

    const newInstallation: Installation = {
      id: this.generateId(),
      ...dto,
      projectNumber: this.generateProjectNumber(),
      customerName: client?.name || 'Unknown Customer',
      status: 'scheduled',
      events: [],
      teamMembers: dto.teamMembers || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    installations.push(newInstallation);
    this.saveToStorage(this.STORAGE_KEYS.installations, installations);
    return of(newInstallation).pipe(delay(this.DELAY_MS));
  }

  /**
   * Update installation
   */
  updateInstallation(id: string, dto: Partial<UpdateInstallationDto>): Observable<Installation> {
    const installations = this.getFromStorage<Installation>(this.STORAGE_KEYS.installations);
    const index = installations.findIndex(i => i.id === id);

    if (index === -1) {
      return throwError(() => new Error('Installation not found')).pipe(delay(this.DELAY_MS));
    }

    const updatedInstallation: Installation = {
      ...installations[index],
      ...dto,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    installations[index] = updatedInstallation;
    this.saveToStorage(this.STORAGE_KEYS.installations, installations);
    return of(updatedInstallation).pipe(delay(this.DELAY_MS));
  }

  /**
   * Add event to installation
   */
  addInstallationEvent(dto: AddInstallationEventDto): Observable<Installation> {
    const installations = this.getFromStorage<Installation>(this.STORAGE_KEYS.installations);
    const installation = installations.find(i => i.id === dto.installationId);

    if (!installation) {
      return throwError(() => new Error('Installation not found')).pipe(delay(this.DELAY_MS));
    }

    // Get user name (lookup from users)
    const users = this.getFromStorage<User>(this.STORAGE_KEYS.users);
    const user = users.find(u => u.id === dto.performedByUserId);

    const newEvent: InstallationEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      eventType: dto.eventType,
      title: dto.title,
      description: dto.description,
      performedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
      performedByUserId: dto.performedByUserId,
      photos: (dto.photos || []).map((photoData, index) => ({
        id: this.generateId(),
        filename: `event-photo-${index + 1}.jpg`,
        url: photoData,
        uploadedAt: new Date(),
        uploadedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
      })),
      measurements: dto.measurements,
      status: dto.status,
      issueDescription: dto.issueDescription
    };

    installation.events.push(newEvent);
    installation.updatedAt = new Date();

    // Auto-update installation status based on event
    if (dto.eventType === 'completion' && dto.status === 'completed') {
      installation.status = 'completed';
      installation.completedAt = new Date();
    } else if (installation.status === 'scheduled' && installation.events.length === 1) {
      installation.status = 'in_progress';
      installation.startedAt = new Date();
    }

    this.saveToStorage(this.STORAGE_KEYS.installations, installations);
    return of(installation).pipe(delay(this.DELAY_MS));
  }

  /**
   * Generate project number (INS-YYYY-NNNN)
   */
  private generateProjectNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INS-${year}-${random}`;
  }
}
