import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsersStore } from '../services/users.store';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { CompanyContextService } from '../../../core/services/company-context.service';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { User } from '../../../shared/models/user.model';
import { Company } from '../../../shared/models/company.model';
import { map, switchMap, combineLatestWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-user-list',
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
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private readonly store = inject(UsersStore);
  private readonly router = inject(Router);
  private readonly mockApi = inject(MockApiService);
  private readonly permissions = inject(PermissionService);
  private readonly companyContext = inject(CompanyContextService);

  readonly users$ = this.store.users$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  companies$ = this.mockApi.getCompanies();

  usersWithCompany$ = this.users$.pipe(
    combineLatestWith(this.companies$),
    map(([users, companies]) => {
      return users.map(user => ({
        ...user,
        companyName: companies.find(c => c.id === user.companyId)?.name || 'Unknown'
      }));
    })
  );

  searchTerm = '';

  filteredUsers$ = this.usersWithCompany$.pipe(
    map(users => {
      if (!this.searchTerm) {
        return users;
      }
      const term = this.searchTerm.toLowerCase();
      return users.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.companyName?.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    console.log('🔍 Current user role:', this.permissions.isAdmin() ? 'ADMIN' : 'NON-ADMIN');
    console.log('🏢 Current company ID:', this.companyContext.currentCompanyId);

    this.store.loadUsers();
  }

  readonly columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  onCreate(): void {
    this.router.navigate(['/users/create']);
  }

  onEdit(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  onDelete(user: User): void {
    if (confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"?`)) {
      this.store.deleteUser(user.id);
    }
  }

  dismissError(): void {
    this.store.clearError();
  }

  getStatusBadgeVariant(isActive: boolean): 'success' | 'warning' | 'error' | 'info' {
    return isActive ? 'success' : 'warning';
  }

  getRoleBadgeVariant(role: string): 'success' | 'warning' | 'error' | 'info' {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      default:
        return 'info';
    }
  }

  // Permission checks for UI
  canCreate(): boolean {
    return this.permissions.hasPermission('users:write');
  }

  canEdit(): boolean {
    return this.permissions.hasPermission('users:write');
  }

  canDelete(): boolean {
    return this.permissions.hasPermission('users:delete');
  }
}
