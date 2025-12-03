import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompaniesStore } from '../services/companies.store';
import { PermissionService } from '../../../core/services/permission.service';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Company } from '../../../shared/models/company.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    SearchBar,
    Card,
    Button,
    Badge,
    Alert,
    EmptyState,
    DateFormatPipe
  ],
  templateUrl: './company-list.component.html'
})
export class CompanyListComponent implements OnInit {
  private readonly store = inject(CompaniesStore);
  private readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);

  readonly companies$ = this.store.companies$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  searchTerm = '';

  readonly filteredCompanies$ = this.companies$.pipe(
    map(companies => {
      if (!this.searchTerm) {
        return companies;
      }
      const term = this.searchTerm.toLowerCase();
      return companies.filter(company =>
        company.name.toLowerCase().includes(term) ||
        company.email.toLowerCase().includes(term) ||
        company.phone?.toLowerCase().includes(term)
      );
    })
  );

  readonly columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'plan', label: 'Plan', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  ngOnInit(): void {
    // USER role should not have access to companies module
    if (this.permissions.hasRole('user')) {
      console.warn('⚠️ USER role attempting to access companies - redirecting to dashboard');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.store.loadCompanies();
  }

  canCreate(): boolean {
    // Only admins can create companies
    return this.permissions.isAdmin();
  }

  canEdit(): boolean {
    // Admins and managers can edit companies
    return this.permissions.isManager();
  }

  canDelete(): boolean {
    // Only admins can delete companies
    return this.permissions.isAdmin();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onCreate(): void {
    this.router.navigate(['/companies/create']);
  }

  onEdit(company: Company): void {
    this.router.navigate(['/companies/edit', company.id]);
  }

  onDelete(company: Company): void {
    if (confirm(`Are you sure you want to delete "${company.name}"?`)) {
      this.store.deleteCompany(company.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' {
    return status === 'active' ? 'success' : 'warning';
  }

  getPlanBadgeVariant(plan: string): 'success' | 'warning' | 'error' | 'info' {
    switch (plan) {
      case 'premium':
        return 'success';
      case 'basic':
        return 'info';
      default:
        return 'warning';
    }
  }
}
