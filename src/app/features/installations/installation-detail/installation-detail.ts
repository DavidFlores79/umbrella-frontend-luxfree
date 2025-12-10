import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstallationsStore } from '../services/installations.store';
import { AuthService } from '../../../core/services/auth.service';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { ImageUploadComponent } from '../../../shared/components/ui/image-upload/image-upload.component';
import { filter, take } from 'rxjs/operators';

/**
 * Installation detail component with event logging and photo upload
 */
@Component({
  selector: 'app-installation-detail',
  imports: [CommonModule, ReactiveFormsModule, Card, Button, FormInput, FormSelect, ImageUploadComponent],
  templateUrl: './installation-detail.html',
  styleUrl: './installation-detail.css',
})
export class InstallationDetail implements OnInit {
  private readonly store = inject(InstallationsStore);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly installation$ = this.store.selectedInstallation$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  showEventForm = false;
  eventPhotos: string[] = [];
  uploadError = '';

  eventForm!: FormGroup;

  readonly eventTypeOptions = [
    { value: 'site_inspection', label: '🔍 Site Inspection' },
    { value: 'preparation', label: '🛠️ Preparation' },
    { value: 'installation', label: '🔧 Installation' },
    { value: 'testing', label: '⚡ Testing' },
    { value: 'quality_check', label: '✓ Quality Check' },
    { value: 'completion', label: '✅ Completion' },
    { value: 'issue', label: '⚠️ Issue' },
    { value: 'other', label: '📋 Other' }
  ];

  readonly eventStatusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'issue', label: 'Issue' }
  ];

  ngOnInit(): void {
    this.initializeEventForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.store.loadInstallationById(params['id']);
      }
    });
  }

  private initializeEventForm(): void {
    this.eventForm = this.fb.group({
      eventType: ['installation', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['completed', Validators.required],
      issueDescription: ['']
    });
  }

  onToggleEventForm(): void {
    this.showEventForm = !this.showEventForm;
    if (!this.showEventForm) {
      this.eventForm.reset({
        eventType: 'installation',
        status: 'completed'
      });
      this.eventPhotos = [];
      this.uploadError = '';
    }
  }

  onEventPhotosChange(photos: string[]): void {
    this.eventPhotos = photos;
    this.uploadError = '';
  }

  onImageError(error: string): void {
    this.uploadError = error;
  }

  onSubmitEvent(): void {
    if (this.eventForm.invalid) {
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.installation$.pipe(
      filter(installation => !!installation),
      take(1)
    ).subscribe(installation => {
      if (!installation) return;

      const currentUser = this.authService.currentUser;

      this.store.addEvent({
        installationId: installation.id,
        performedByUserId: currentUser?.id || '',
        photos: this.eventPhotos,
        ...this.eventForm.value
      });

      // Reset form
      this.eventForm.reset({
        eventType: 'installation',
        status: 'completed'
      });
      this.eventPhotos = [];
      this.showEventForm = false;
    });
  }

  onBackToList(): void {
    this.router.navigate(['/installations']);
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

  getEventStatusBadge(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'issue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getTotalPhotos(events: any[]): number {
    return events.reduce((sum, e) => sum + e.photos.length, 0);
  }
}
