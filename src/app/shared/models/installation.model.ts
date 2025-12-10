/**
 * Installation/Project entity for tracking service delivery and field work.
 * Ideal for solar panel installations, construction projects, or any service
 * requiring documentation with photos and event tracking.
 */
export interface Installation {
  id: string;
  companyId: string;
  projectNumber: string; // e.g., "INS-2025-001"
  customerId: string; // Reference to customer/client
  customerName: string; // Denormalized for display

  // Project details
  title: string; // e.g., "Solar Panel Installation - Residential 5kW"
  description: string;
  location: InstallationLocation;
  projectType: ProjectType;
  status: InstallationStatus;

  // Scheduling
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Team assignment
  assignedToUserId?: string;
  assignedToUserName?: string;
  teamMembers: TeamMember[];

  // Events and documentation
  events: InstallationEvent[];

  // Summary and notes
  summary?: string; // Final summary for report
  notes?: string; // Internal notes

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Installation location details.
 */
export interface InstallationLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Team member assigned to installation.
 */
export interface TeamMember {
  userId: string;
  userName: string;
  role: TeamRole; // 'lead', 'technician', 'assistant'
}

export type TeamRole = 'lead' | 'technician' | 'assistant' | 'supervisor';

/**
 * Individual event/milestone during installation with photos.
 */
export interface InstallationEvent {
  id: string;
  timestamp: Date;
  eventType: EventType;
  title: string; // e.g., "Panel mounting completed"
  description: string; // e.g., "All 12 panels mounted on south-facing roof"
  performedBy: string; // User name
  performedByUserId: string;

  // Photo evidence
  photos: InstallationPhoto[];

  // Optional metrics/measurements
  measurements?: Record<string, string | number>; // e.g., { "voltage": "240V", "panelCount": 12 }

  // Status tracking
  status: EventStatus; // 'completed', 'pending', 'issue'
  issueDescription?: string; // If status is 'issue'
}

/**
 * Photo attachment for installation events.
 */
export interface InstallationPhoto {
  id: string;
  filename: string;
  url: string; // For cloud storage OR base64 data URL
  thumbnailUrl?: string; // Optional thumbnail
  caption?: string;
  uploadedAt: Date;
  uploadedBy: string; // User name
}

/**
 * Project types.
 */
export type ProjectType =
  | 'solar_installation'
  | 'solar_maintenance'
  | 'street_lighting'
  | 'street_lighting_maintenance'
  | 'electrical_work'
  | 'construction'
  | 'plumbing'
  | 'hvac'
  | 'renovation'
  | 'other';

/**
 * Installation status.
 */
export type InstallationStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

/**
 * Event types for different installation phases.
 */
export type EventType =
  | 'site_inspection'
  | 'preparation'
  | 'installation'
  | 'testing'
  | 'quality_check'
  | 'completion'
  | 'issue'
  | 'other';

/**
 * Event completion status.
 */
export type EventStatus = 'completed' | 'pending' | 'issue';

/**
 * DTO for creating a new installation.
 */
export interface CreateInstallationDto {
  companyId: string;
  customerId: string;
  title: string;
  description: string;
  location: InstallationLocation;
  projectType: ProjectType;
  scheduledDate: Date;
  assignedToUserId?: string;
  teamMembers?: TeamMember[];
}

/**
 * DTO for updating an installation.
 */
export interface UpdateInstallationDto {
  id: string;
  title?: string;
  description?: string;
  location?: InstallationLocation;
  status?: InstallationStatus;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  assignedToUserId?: string;
  teamMembers?: TeamMember[];
  summary?: string;
  notes?: string;
}

/**
 * DTO for adding an event to installation.
 */
export interface AddInstallationEventDto {
  installationId: string;
  eventType: EventType;
  title: string;
  description: string;
  performedByUserId: string;
  photos?: string[]; // Base64 or URLs
  measurements?: Record<string, string | number>;
  status: EventStatus;
  issueDescription?: string;
}
