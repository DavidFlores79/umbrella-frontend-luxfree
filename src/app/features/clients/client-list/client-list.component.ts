import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientsStore } from '../services/clients.store';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  private readonly clientsStore = inject(ClientsStore);

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
}
