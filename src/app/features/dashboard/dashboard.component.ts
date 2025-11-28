import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

// Core Services
import { DashboardStore } from './services/dashboard.store';
import { CurrencyService } from '../../core/services/currency.service';

// Shared Components
import { MainLayout } from '../../shared/components/layout/main-layout/main-layout';
import { StatCard } from '../../shared/components/ui/stat-card/stat-card';
import { Card } from '../../shared/components/ui/card/card';
import { SkeletonLoader } from '../../shared/components/ui/skeleton-loader/skeleton-loader';
import { Alert } from '../../shared/components/ui/alert/alert';
import { Badge } from '../../shared/components/ui/badge/badge';

// Pipes
import { CurrencyPipe as CustomCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MainLayout,
    StatCard,
    Card,
    SkeletonLoader,
    Alert,
    Badge,
    CustomCurrencyPipe,
    DateFormatPipe
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardStore = inject(DashboardStore);
  private readonly currencyService = inject(CurrencyService);

  // Observable subscriptions
  readonly viewModel$ = this.dashboardStore.viewModel$;

  // Chart options (data comes from store)
  revenueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => this.currencyService.formatCompanyCurrency(Number(value))
        }
      }
    }
  };

  expenseChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  ngOnInit(): void {
    this.dashboardStore.loadDashboardData();
  }

  onRefresh(): void {
    this.dashboardStore.loadDashboardData();
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      'paid': 'success',
      'received': 'success',
      'draft': 'info',
      'pending': 'warning',
      'ordered': 'warning',
      'cancelled': 'error'
    };
    return statusMap[status] || 'info';
  }

  getTypeBadgeVariant(type: string): 'success' | 'error' {
    return type === 'sale' ? 'success' : 'error';
  }

  calculateProfitTrend(metrics: any): 'up' | 'down' | 'neutral' {
    if (metrics.profit > 0) return 'up';
    if (metrics.profit < 0) return 'down';
    return 'neutral';
  }
}
