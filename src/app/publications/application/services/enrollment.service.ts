import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { PublicationService } from './publication.service';
import { Publication } from '../../domain/model/publication';

export interface Enrollment {
  id: string;
  publicationId: string;
  volunteerId: string;
  volunteerName: string;
  registeredAt: string;
}

/**
 * Service for managing volunteer enrollments in publications.
 */
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  constructor(
    private apiService: ApiService,
    private publicationService: PublicationService
  ) {}

  /**
   * Register a volunteer for a publication
   */
  registerVolunteer(publicationId: string, volunteerId: string, volunteerName: string): Observable<any> {
    // First, get the current publication to check available spots
    return this.publicationService.getPublicationById(publicationId).pipe(
      switchMap(publication => {
        // Check if volunteer is already registered
        const enrollments = this.getStoredEnrollments();
        const existingEnrollment = enrollments.find(
          e => e.publicationId === publicationId && e.volunteerId === volunteerId
        );
        
        if (existingEnrollment) {
          throw new Error('Ya estás registrado en este voluntariado');
        }
        
        if (publication.currentVolunteers >= publication.maxVolunteers) {
          throw new Error('No hay cupos disponibles');
        }
        
        // Create enrollment
        const enrollment: Enrollment = {
          id: Date.now().toString(),
          publicationId: publicationId,
          volunteerId: volunteerId,
          volunteerName: volunteerName,
          registeredAt: new Date().toISOString()
        };
        
        // Store enrollment
        this.storeEnrollment(enrollment);
        
        // Update the publication to increment currentVolunteers
        const updatedData = {
          currentVolunteers: publication.currentVolunteers + 1
        };
        
        return this.publicationService.updatePublication(publicationId, updatedData).pipe(
          tap(() => {
            console.log('Contador de voluntarios actualizado');
            // Refresh publications list
            this.publicationService.refreshPublications();
          }),
          map(() => ({
            success: true,
            message: 'Registrado exitosamente',
            enrollment: enrollment
          }))
        );
      })
    );
  }

  /**
   * Get enrollments for a publication
   */
  getEnrollmentsByPublication(publicationId: string): Observable<Enrollment[]> {
    const enrollments = this.getStoredEnrollments();
    const publicationEnrollments = enrollments.filter(e => e.publicationId === publicationId);
    return of(publicationEnrollments);
  }

  /**
   * Check if a volunteer is registered for a publication
   */
  isVolunteerRegistered(publicationId: string, volunteerId: string): boolean {
    const enrollments = this.getStoredEnrollments();
    return enrollments.some(
      e => e.publicationId === publicationId && e.volunteerId === volunteerId
    );
  }

  /**
   * Store enrollment in localStorage (temporary solution)
   */
  private storeEnrollment(enrollment: Enrollment): void {
    const enrollments = this.getStoredEnrollments();
    enrollments.push(enrollment);
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
  }

  /**
   * Get stored enrollments from localStorage
   */
  private getStoredEnrollments(): Enrollment[] {
    const stored = localStorage.getItem('enrollments');
    return stored ? JSON.parse(stored) : [];
  }
}

