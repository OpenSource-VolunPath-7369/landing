import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading-error',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  template: `
    <div class="loading-error-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="loading-text">{{ loadingText || 'Cargando...' }}</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-state">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3 class="error-title">{{ errorTitle || 'Error' }}</h3>
        <p class="error-message">{{ error }}</p>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onRetry()"
          class="retry-button">
          <mat-icon>refresh</mat-icon>
          Reintentar
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="isEmpty && !loading && !error" class="empty-state">
        <mat-icon class="empty-icon">{{ emptyIcon || 'inbox' }}</mat-icon>
        <h3 class="empty-title">{{ emptyTitle || 'No hay datos' }}</h3>
        <p class="empty-message">{{ emptyMessage || 'No se encontraron elementos para mostrar.' }}</p>
        <button 
          *ngIf="showEmptyAction"
          mat-raised-button 
          color="primary" 
          (click)="onEmptyAction()"
          class="empty-action-button">
          <mat-icon>{{ emptyActionIcon || 'add' }}</mat-icon>
          {{ emptyActionText || 'Crear nuevo' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .loading-error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      padding: 2rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-text {
      color: #6b7280;
      font-size: 1rem;
      margin: 0;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
      max-width: 400px;
    }

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #dc2626;
    }

    .error-title {
      color: #374151;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .error-message {
      color: #6b7280;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }

    .retry-button {
      margin-top: 0.5rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1rem;
      max-width: 400px;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #9ca3af;
    }

    .empty-title {
      color: #374151;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }

    .empty-message {
      color: #6b7280;
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }

    .empty-action-button {
      margin-top: 0.5rem;
    }
  `]
})
export class LoadingErrorComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() isEmpty = false;
  @Input() loadingText = '';
  @Input() errorTitle = '';
  @Input() emptyIcon = '';
  @Input() emptyTitle = '';
  @Input() emptyMessage = '';
  @Input() showEmptyAction = false;
  @Input() emptyActionText = '';
  @Input() emptyActionIcon = '';

  onRetry() {
    // This will be handled by the parent component
  }

  onEmptyAction() {
    // This will be handled by the parent component
  }
}






