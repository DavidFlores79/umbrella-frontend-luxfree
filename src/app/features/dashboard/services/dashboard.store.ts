import { Injectable, inject } from '@angular/core';
import { forkJoin, catchError, tap } from 'rxjs';
import { StoreBase } from '../../../core/services/store-base.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { Sale } from '../../../shared/models/sale.model';
import { Purchase } from '../../../shared/models/purchase.model';
import { InventoryItem } from '../../../shared/models/inventory.model';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  inventoryAlerts: number;
  outstandingInvoices: number;
  pendingOrders: number;
  activeClients: number;
  totalProducts: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalRevenue: number;
  orderCount: number;
}

export interface TopVendor {
  id: string;
  name: string;
  totalExpenses: number;
  orderCount: number;
}

export interface RecentTransaction {
  id: string;
  type: 'sale' | 'purchase';
  number: string;
  customerOrVendor: string;
  amount: number;
  status: string;
  date: Date;
}

export interface DashboardState {
  metrics: DashboardMetrics;
  revenueData: ChartData | null;
  expenseData: ChartData | null;
  salesVsExpensesData: ChartData | null;
  revenueBreakdownData: ChartData | null;
  topCustomers: TopCustomer[];
  topVendors: TopVendor[];
  recentTransactions: RecentTransaction[];
  lowStockItems: InventoryItem[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStore extends StoreBase<DashboardState> {
  private readonly mockApi = inject(MockApiService);
  private readonly companyContext = inject(CompanyContextService);

  // Selectors
  readonly metrics$ = this.select(state => state.metrics);
  readonly revenueData$ = this.select(state => state.revenueData);
  readonly expenseData$ = this.select(state => state.expenseData);
  readonly salesVsExpensesData$ = this.select(state => state.salesVsExpensesData);
  readonly revenueBreakdownData$ = this.select(state => state.revenueBreakdownData);
  readonly topCustomers$ = this.select(state => state.topCustomers);
  readonly topVendors$ = this.select(state => state.topVendors);
  readonly recentTransactions$ = this.select(state => state.recentTransactions);
  readonly lowStockItems$ = this.select(state => state.lowStockItems);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

  // Combined view model for component
  readonly viewModel$ = this.select(state => ({
    metrics: state.metrics,
    revenueData: state.revenueData,
    expenseData: state.expenseData,
    salesVsExpensesData: state.salesVsExpensesData,
    revenueBreakdownData: state.revenueBreakdownData,
    topCustomers: state.topCustomers,
    topVendors: state.topVendors,
    recentTransactions: state.recentTransactions,
    lowStockItems: state.lowStockItems,
    loading: state.loading,
    error: state.error,
    hasData: state.recentTransactions.length > 0
  }));

  constructor() {
    super({
      metrics: {
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
        inventoryAlerts: 0,
        outstandingInvoices: 0,
        pendingOrders: 0,
        activeClients: 0,
        totalProducts: 0
      },
      revenueData: null,
      expenseData: null,
      salesVsExpensesData: null,
      revenueBreakdownData: null,
      topCustomers: [],
      topVendors: [],
      recentTransactions: [],
      lowStockItems: [],
      loading: false,
      error: null
    });
  }

  /**
   * Loads all dashboard data in parallel.
   */
  loadDashboardData(): void {
    const companyId = this.companyContext.currentCompanyId;
    if (!companyId) {
      this.patchState({
        error: 'No company selected',
        loading: false
      });
      return;
    }

    this.patchState({ loading: true, error: null });

    forkJoin({
      sales: this.mockApi.getSales(companyId),
      purchases: this.mockApi.getPurchases(companyId),
      inventory: this.mockApi.getInventory(companyId),
      alerts: this.mockApi.getInventoryAlerts(companyId),
      clients: this.mockApi.getClients(companyId),
      products: this.mockApi.getProducts(companyId)
    }).pipe(
      tap(({ sales, purchases, inventory, alerts, clients, products }) => {
        // Calculate metrics
        const metrics = this.calculateMetrics(sales, purchases, alerts.length, clients.length, products.length);

        // Generate chart data
        const revenueData = this.generateRevenueChartData(sales);
        const expenseData = this.generateExpenseChartData(purchases);
        const salesVsExpensesData = this.generateSalesVsExpensesData(sales, purchases);
        const revenueBreakdownData = this.generateRevenueBreakdownData(sales);

        // Get top performers
        const topCustomers = this.getTopCustomers(sales);
        const topVendors = this.getTopVendors(purchases);

        // Get recent transactions
        const recentTransactions = this.getRecentTransactions(sales, purchases);

        // Get low stock items
        const lowStockItems = inventory.filter(item =>
          item.quantity <= item.minThreshold
        ).slice(0, 5); // Top 5 low stock items

        this.patchState({
          metrics,
          revenueData,
          expenseData,
          salesVsExpensesData,
          revenueBreakdownData,
          topCustomers,
          topVendors,
          recentTransactions,
          lowStockItems,
          loading: false
        });
      }),
      catchError(error => {
        this.patchState({
          error: error.message || 'Failed to load dashboard data',
          loading: false
        });
        throw error;
      })
    ).subscribe();
  }

  /**
   * Refreshes only the metrics without reloading all data.
   */
  refreshMetrics(): void {
    const companyId = this.companyContext.currentCompanyId;
    if (!companyId) return;

    forkJoin({
      sales: this.mockApi.getSales(companyId),
      purchases: this.mockApi.getPurchases(companyId),
      alerts: this.mockApi.getInventoryAlerts(companyId),
      clients: this.mockApi.getClients(companyId),
      products: this.mockApi.getProducts(companyId)
    }).pipe(
      tap(({ sales, purchases, alerts, clients, products }) => {
        const metrics = this.calculateMetrics(sales, purchases, alerts.length, clients.length, products.length);
        this.patchState({ metrics });
      }),
      catchError(error => {
        console.error('Failed to refresh metrics:', error);
        throw error;
      })
    ).subscribe();
  }

  // ==================== PRIVATE METHODS ====================

  private calculateMetrics(
    sales: Sale[],
    purchases: Purchase[],
    alertCount: number,
    clientsCount: number,
    productsCount: number
  ): DashboardMetrics {
    const totalRevenue = sales
      .filter(s => s.status === 'paid')
      .reduce((sum, sale) => sum + sale.total, 0);

    const totalExpenses = purchases
      .filter(p => p.status === 'received' || p.status === 'paid')
      .reduce((sum, purchase) => sum + purchase.total, 0);

    const profit = totalRevenue - totalExpenses;

    const outstandingInvoices = sales.filter(s => s.status === 'pending').length;
    const pendingOrders = purchases.filter(p => p.status === 'ordered').length;

    // Count unique active clients (those with at least one paid sale)
    const activeClientIds = new Set(
      sales.filter(s => s.status === 'paid').map(s => s.customerId)
    );

    return {
      totalRevenue,
      totalExpenses,
      profit,
      inventoryAlerts: alertCount,
      outstandingInvoices,
      pendingOrders,
      activeClients: activeClientIds.size,
      totalProducts: productsCount
    };
  }

  private generateRevenueChartData(sales: Sale[]): ChartData {
    // Group sales by month for last 6 months
    const monthlyData = this.groupByMonth(sales, 'createdAt');

    return {
      labels: monthlyData.labels,
      datasets: [
        {
          label: 'Revenue',
          data: monthlyData.values,
          borderColor: '#FF7A59', // Primary coral
          backgroundColor: 'rgba(255, 122, 89, 0.1)',
          borderWidth: 2,
          fill: true
        }
      ]
    };
  }

  private generateExpenseChartData(purchases: Purchase[]): ChartData {
    // Group purchases by category (you may need to add category field)
    // For now, using a simple count by status
    const statuses = ['draft', 'ordered', 'received', 'paid', 'cancelled'];
    const counts = statuses.map(status =>
      purchases.filter(p => p.status === status).length
    );

    return {
      labels: ['Draft', 'Ordered', 'Received', 'Paid', 'Cancelled'],
      datasets: [
        {
          label: 'Purchases by Status',
          data: counts,
          backgroundColor: [
            '#0091AE', // Accent blue
            '#00A862', // Accent green
            '#FFB800', // Accent yellow
            '#FF7A59', // Primary coral
            '#F2545B'  // Accent red
          ],
          borderWidth: 0
        }
      ]
    };
  }

  private getRecentTransactions(
    sales: Sale[],
    purchases: Purchase[]
  ): RecentTransaction[] {
    const saleTransactions: RecentTransaction[] = sales.map(sale => ({
      id: sale.id,
      type: 'sale' as const,
      number: sale.invoiceNumber,
      customerOrVendor: sale.customerName,
      amount: sale.total,
      status: sale.status,
      date: sale.createdAt
    }));

    const purchaseTransactions: RecentTransaction[] = purchases.map(purchase => ({
      id: purchase.id,
      type: 'purchase' as const,
      number: purchase.purchaseOrderNumber,
      customerOrVendor: purchase.vendorName,
      amount: purchase.total,
      status: purchase.status,
      date: purchase.createdAt
    }));

    // Combine and sort by date descending
    return [...saleTransactions, ...purchaseTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3); // Last 3 transactions
  }

  private groupByMonth(items: any[], dateField: string): { labels: string[], values: number[] } {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const last6Months: { month: string, total: number }[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const key = `${monthName} ${year}`;

      const monthTotal = items
        .filter(item => {
          const itemDate = new Date(item[dateField]);
          return itemDate.getMonth() === date.getMonth() &&
                 itemDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, item) => sum + (item.total || 0), 0);

      last6Months.push({ month: key, total: monthTotal });
    }

    return {
      labels: last6Months.map(m => m.month),
      values: last6Months.map(m => m.total)
    };
  }

  private generateSalesVsExpensesData(sales: Sale[], purchases: Purchase[]): ChartData {
    const salesByMonth = this.groupByMonth(sales.filter(s => s.status === 'paid'), 'createdAt');
    const expensesByMonth = this.groupByMonth(purchases.filter(p => p.status === 'received' || p.status === 'paid'), 'createdAt');

    return {
      labels: salesByMonth.labels,
      datasets: [
        {
          label: 'Revenue',
          data: salesByMonth.values,
          backgroundColor: 'rgba(255, 122, 89, 0.7)',
          borderColor: '#FF7A59',
          borderWidth: 2
        },
        {
          label: 'Expenses',
          data: expensesByMonth.values,
          backgroundColor: 'rgba(242, 84, 91, 0.7)',
          borderColor: '#F2545B',
          borderWidth: 2
        }
      ]
    };
  }

  private generateRevenueBreakdownData(sales: Sale[]): ChartData {
    const paidSales = sales.filter(s => s.status === 'paid');
    const pendingSales = sales.filter(s => s.status === 'pending');
    const draftSales = sales.filter(s => s.status === 'draft');

    const paidTotal = paidSales.reduce((sum, s) => sum + s.total, 0);
    const pendingTotal = pendingSales.reduce((sum, s) => sum + s.total, 0);
    const draftTotal = draftSales.reduce((sum, s) => sum + s.total, 0);

    return {
      labels: ['Paid', 'Pending', 'Draft'],
      datasets: [
        {
          label: 'Revenue by Status',
          data: [paidTotal, pendingTotal, draftTotal],
          backgroundColor: [
            '#00A862', // Green for paid
            '#FFB800', // Yellow for pending
            '#0091AE'  // Blue for draft
          ],
          borderWidth: 0
        }
      ]
    };
  }

  private getTopCustomers(sales: Sale[]): TopCustomer[] {
    const customerMap = new Map<string, { name: string, totalRevenue: number, orderCount: number }>();

    sales
      .filter(s => s.status === 'paid' && s.customerId)
      .forEach(sale => {
        const customerId = sale.customerId!; // Safe because we filtered out undefined
        const existing = customerMap.get(customerId);
        if (existing) {
          existing.totalRevenue += sale.total;
          existing.orderCount += 1;
        } else {
          customerMap.set(customerId, {
            name: sale.customerName,
            totalRevenue: sale.total,
            orderCount: 1
          });
        }
      });

    return Array.from(customerMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5); // Top 5
  }

  private getTopVendors(purchases: Purchase[]): TopVendor[] {
    const vendorMap = new Map<string, { name: string, totalExpenses: number, orderCount: number }>();

    purchases
      .filter(p => (p.status === 'received' || p.status === 'paid') && p.vendorId)
      .forEach(purchase => {
        const vendorId = purchase.vendorId!; // Safe because we filtered out undefined
        const existing = vendorMap.get(vendorId);
        if (existing) {
          existing.totalExpenses += purchase.total;
          existing.orderCount += 1;
        } else {
          vendorMap.set(vendorId, {
            name: purchase.vendorName,
            totalExpenses: purchase.total,
            orderCount: 1
          });
        }
      });

    return Array.from(vendorMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalExpenses - a.totalExpenses)
      .slice(0, 5); // Top 5
  }
}
