import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable image upload component with preview and multiple file support.
 * Uses native HTML5 drag-and-drop API (no external dependencies).
 *
 * Features:
 * - Drag and drop or click to upload
 * - Image preview with thumbnails
 * - Multiple file support
 * - Base64 encoding for storage
 * - Remove individual images
 * - Max file size validation
 *
 * Usage:
 * <app-image-upload
 *   [images]="productImages"
 *   [maxFiles]="5"
 *   [maxFileSize]="5242880"
 *   (imagesChange)="onImagesChange($event)"
 * ></app-image-upload>
 */
@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Input() images: string[] = []; // Base64 or URLs
  @Input() maxFiles: number = 10;
  @Input() maxFileSize: number = 5242880; // 5MB default
  @Input() accept: string = 'image/*';
  @Input() label: string = 'Upload Images';
  @Input() showPreview: boolean = true;

  @Output() imagesChange = new EventEmitter<string[]>();
  @Output() error = new EventEmitter<string>();

  isDragging = false;

  /**
   * Handle file input change.
   */
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = ''; // Reset input to allow same file selection
    }
  }

  /**
   * Handle drag over event.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  /**
   * Handle drag leave event.
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  /**
   * Handle file drop.
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(Array.from(files));
    }
  }

  /**
   * Process selected files.
   */
  private processFiles(files: File[]): void {
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      this.error.emit('Please select valid image files');
      return;
    }

    // Validate max files
    if (this.images.length + imageFiles.length > this.maxFiles) {
      this.error.emit(`Maximum ${this.maxFiles} images allowed`);
      return;
    }

    // Convert files to base64
    imageFiles.forEach(file => {
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.error.emit(`File ${file.name} exceeds maximum size of ${this.formatBytes(this.maxFileSize)}`);
        return;
      }

      // Read file and convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.images = [...this.images, base64];
        this.imagesChange.emit(this.images);
      };
      reader.onerror = () => {
        this.error.emit(`Failed to read file ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Remove an image from the list.
   */
  removeImage(index: number): void {
    this.images = this.images.filter((_, i) => i !== index);
    this.imagesChange.emit(this.images);
  }

  /**
   * Format max file size for display.
   */
  formatMaxSize(): string {
    return this.formatBytes(this.maxFileSize);
  }

  /**
   * Format bytes to human-readable size.
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
