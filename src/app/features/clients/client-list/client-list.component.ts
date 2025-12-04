import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientsStore } from '../services/clients.store';
import { PermissionService } from '../../../core/services/permission.service';
import { SearchBar } from '../../../shared/components/data/search-bar/search-bar';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { Badge } from '../../../shared/components/ui/badge/badge';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { EmptyState } from '../../../shared/components/ui/empty-state/empty-state';
import { Client } from '../../../shared/models/client.model';
import { map, combineLatestWith } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, SearchBar, Card, Button, Badge, Alert, EmptyState],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  private readonly clientsStore = inject(ClientsStore);
  private readonly router = inject(Router);
  private readonly permissions = inject(PermissionService);

  readonly clients$ = this.clientsStore.clients$;
  readonly loading$ = this.clientsStore.loading$;
  readonly error$ = this.clientsStore.error$;

  private readonly searchTerm$ = new BehaviorSubject<string>('');

  readonly filteredClients$ = this.clients$.pipe(
    combineLatestWith(this.searchTerm$),
    map(([clients, searchTerm]) => {
      if (!searchTerm) return clients;
      const term = searchTerm.toLowerCase();
      return clients.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term) ||
        client.taxId?.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {
    this.clientsStore.loadClients();
  }

  onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  onCreate(): void {
    this.router.navigate(['/clients/create']);
  }

  onEdit(client: Client): void {
    this.router.navigate(['/clients/edit', client.id]);
  }

  deleteClient(id: string): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientsStore.deleteClient(id);
    }
  }

  toggleActive(id: string, isActive: boolean): void {
    this.clientsStore.updateClient(id, { isActive: !isActive });
  }

  dismissError(): void {
    this.clientsStore.clearError();
  }

  // Permission checks for UI
  canCreate(): boolean {
    return this.permissions.hasPermission('clients:write');
  }

  canEdit(): boolean {
    return this.permissions.hasPermission('clients:write');
  }

  canDelete(): boolean {
    return this.permissions.hasPermission('clients:delete');
  }
}
