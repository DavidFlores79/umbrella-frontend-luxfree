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
  readonly recentTransactions$ = this.select(state => state.recentTransactions);
  readonly lowStockItems$ = this.select(state => state.lowStockItems);
  readonly loading$ = this.select(state => state.loading);
  readonly error$ = this.select(state => state.error);

  // Combined view model for component
  readonly viewModel$ = this.select(state => ({
    metrics: state.metrics,
    revenueData: state.revenueData,
    expenseData: state.expenseData,
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
        inventoryAlerts: 0
      },
      revenueData: null,
      expenseData: null,
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
      alerts: this.mockApi.getInventoryAlerts(companyId)
    }).pipe(
      tap(({ sales, purchases, inventory, alerts }) => {
        // Calculate metrics
        const metrics = this.calculateMetrics(sales, purchases, alerts.length);

        // Generate chart data
        const revenueData = this.generateRevenueChartData(sales);
        const expenseData = this.generateExpenseChartData(purchases);

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
      alerts: this.mockApi.getInventoryAlerts(companyId)
    }).pipe(
      tap(({ sales, purchases, alerts }) => {
        const metrics = this.calculateMetrics(sales, purchases, alerts.length);
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
    alertCount: number
  ): DashboardMetrics {
    const totalRevenue = sales
      .filter(s => s.status === 'paid')
      .reduce((sum, sale) => sum + sale.total, 0);

    const totalExpenses = purchases
      .filter(p => p.status === 'received' || p.status === 'paid')
      .reduce((sum, purchase) => sum + purchase.total, 0);

    const profit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      profit,
      inventoryAlerts: alertCount
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
      .slice(0, 10); // Last 10 transactions
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
}
