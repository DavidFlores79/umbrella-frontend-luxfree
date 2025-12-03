import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientsStore } from '../services/clients.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  private readonly clientsStore = inject(ClientsStore);
  private readonly permissions = inject(PermissionService);

  readonly clients$ = this.clientsStore.clients$;
  readonly loading$ = this.clientsStore.loading$;
  readonly error$ = this.clientsStore.error$;

  ngOnInit(): void {
    this.clientsStore.loadClients();
  }

  deleteClient(id: string): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientsStore.deleteClient(id);
    }
  }

  toggleActive(id: string, isActive: boolean): void {
    this.clientsStore.updateClient(id, { isActive: !isActive });
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
