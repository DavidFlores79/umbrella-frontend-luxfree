import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InstallationsStore } from '../services/installations.store';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { ProjectType } from '../../../shared/models/installation.model';
import { map } from 'rxjs/operators';

/**
 * Installation list component - displays all installation projects
 */
@Component({
  selector: 'app-installation-list',
  imports: [CommonModule, Card, Button],
  templateUrl: './installation-list.html',
  styleUrl: './installation-list.css',
})
export class InstallationList implements OnInit {
  private readonly store = inject(InstallationsStore);
  private readonly router = inject(Router);

  readonly installations$ = this.store.installations$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  selectedFilter: ProjectType | 'all' = 'all';

  // Filtered installations based on selected project type
  readonly filteredInstallations$ = this.store.installations$.pipe(
    map(installations => {
      if (this.selectedFilter === 'all') {
        return installations;
      }
      return installations.filter(i => i.projectType === this.selectedFilter);
    })
  );

  ngOnInit(): void {
    this.store.loadInstallations();
  }

  onFilterChange(filter: ProjectType | 'all'): void {
    this.selectedFilter = filter;
  }

  onViewDetails(id: string): void {
    this.router.navigate(['/installations', id]);
  }

  onCreateNew(): void {
    this.router.navigate(['/installations/create']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'scheduled': return 'text-gray-600';
      case 'cancelled': return 'text-red-600';
      case 'on_hold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  }

  getProjectTypeIcon(type: ProjectType): string {
    switch (type) {
      case 'solar_installation': return '☀️';
      case 'solar_maintenance': return '🔧';
      case 'street_lighting': return '💡';
      case 'street_lighting_maintenance': return '🔨';
      case 'electrical_work': return '⚡';
      default: return '📋';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
