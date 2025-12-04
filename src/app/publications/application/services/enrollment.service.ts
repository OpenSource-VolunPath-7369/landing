import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { PublicationService } from './publication.service';

export interface Enrollment {
  id: number;
  publicationId: number;
  volunteerId: number;
  volunteerName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
    const enrollmentData = {
      publicationId: Number(publicationId),
      volunteerId: Number(volunteerId),
      volunteerName: volunteerName
    };

    return this.apiService.post<Enrollment>(
      `publications/${publicationId}/enrollments`,
      enrollmentData
    ).pipe(
      tap((enrollment) => {
        console.log('Enrollment creado en backend:', enrollment);
        // Refresh publications to get updated counter
        setTimeout(() => {
          this.publicationService.refreshPublications();
        }, 300);
      }),
      map((enrollment) => ({
        success: true,
        message: 'Registrado exitosamente',
        enrollment: this.mapToFrontendEnrollment(enrollment)
      }))
    );
  }

  /**
   * Get enrollments for a publication
   */
  getEnrollmentsByPublication(publicationId: string): Observable<Enrollment[]> {
    return this.apiService.get<Enrollment[]>(`publications/${publicationId}/enrollments`).pipe(
      map(enrollments => enrollments.map(e => this.mapToFrontendEnrollment(e)))
    );
  }

  /**
   * Check if a volunteer is registered for a publication
   */
  isVolunteerRegistered(publicationId: string, volunteerId: string): Observable<boolean> {
    return this.apiService.get<boolean>(
      `publications/${publicationId}/enrollments/check?volunteerId=${volunteerId}`
    );
  }

  /**
   * Map backend enrollment to frontend format
   */
  private mapToFrontendEnrollment(backendEnrollment: any): Enrollment {
    return {
      id: backendEnrollment.id,
      publicationId: backendEnrollment.publicationId,
      volunteerId: backendEnrollment.volunteerId,
      volunteerName: backendEnrollment.volunteerName,
      status: backendEnrollment.status,
      createdAt: backendEnrollment.createdAt,
      updatedAt: backendEnrollment.updatedAt
    };
  }
}

