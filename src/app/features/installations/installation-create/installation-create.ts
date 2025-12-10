import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InstallationsStore } from '../services/installations.store';
import { ClientsStore } from '../../clients/services/clients.store';
import { AuthService } from '../../../core/services/auth.service';
import { Card } from '../../../shared/components/ui/card/card';
import { Button } from '../../../shared/components/ui/button/button';
import { FormInput } from '../../../shared/components/ui/forms/form-input/form-input';
import { FormSelect } from '../../../shared/components/ui/forms/form-select/form-select';
import { Alert } from '../../../shared/components/ui/alert/alert';
import { map, filter, takeUntil, skip, take } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-installation-create',
  imports: [CommonModule, ReactiveFormsModule, Card, Button, FormInput, FormSelect, Alert],
  templateUrl: './installation-create.html',
  styleUrl: './installation-create.css',
})
export class InstallationCreate implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(InstallationsStore);
  private readonly clientsStore = inject(ClientsStore);
  private readonly authService = inject(AuthService);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  readonly clientOptions$ = this.clientsStore.clients$.pipe(
    map(clients => clients.map(c => ({ value: c.id, label: c.name })))
  );

  form!: FormGroup;
  submitted = false;

  readonly projectTypeOptions = [
    { value: 'solar_installation', label: '☀️ Solar Panel Installation' },
    { value: 'solar_maintenance', label: '🔧 Solar Maintenance' },
    { value: 'street_lighting', label: '💡 Street Lighting Installation' },
    { value: 'street_lighting_maintenance', label: '🔨 Street Light Maintenance' },
    { value: 'electrical_work', label: '⚡ Electrical Work' },
    { value: 'other', label: '📋 Other' }
  ];

  ngOnInit(): void {
    this.clientsStore.loadClients();
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Get current user's company ID from AuthService
    const currentUser = this.authService.currentUser;

    this.form = this.fb.group({
      companyId: [currentUser?.companyId || '', Validators.required],
      customerId: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      projectType: ['solar_installation', Validators.required],
      scheduledDate: ['', Validators.required],
      // Location
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required]
    });

    console.log('Current user:', currentUser);
    console.log('Company ID:', currentUser?.companyId);
  }

  onSubmit(): void {
    console.log('onSubmit called');
    this.submitted = true;

    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    console.log('Form valid:', this.form.valid);
    console.log('Form value:', this.form.value);

    if (this.form.invalid) {
      console.log('Form is invalid. Errors:');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`  ${key}:`, control.errors);
        }
      });
      return;
    }

    const formValue = this.form.value;
    const installationData = {
      companyId: formValue.companyId,
      customerId: formValue.customerId,
      title: formValue.title,
      description: formValue.description || '',
      projectType: formValue.projectType,
      scheduledDate: new Date(formValue.scheduledDate),
      location: {
        address: formValue.address,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode
      }
    };

    console.log('Creating installation with data:', installationData);

    // Subscribe to the newly created installation to navigate after success
    this.store.selectedInstallation$.pipe(
      skip(1), // Skip the current null value
      filter(installation => installation !== null),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe((installation) => {
      console.log('Installation created successfully:', installation);
      this.router.navigate(['/installations']);
    });

    // Create the installation (this will trigger selectedInstallation$ update)
    this.store.createInstallation(installationData);
    console.log('createInstallation() called');
  }

  onCancel(): void {
    this.router.navigate(['/installations']);
  }

  dismissError(): void {
    this.store.clearError();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !(field.touched || this.submitted)) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      customerId: 'Customer',
      title: 'Project title',
      projectType: 'Project type',
      scheduledDate: 'Scheduled date',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP code'
    };
    return labels[fieldName] || fieldName;
  }
}
