import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { Publication } from '../../domain/model/publication';

/**
 * Application service for managing publications.
 * 
 * @remarks
 * This service handles publication-related operations in the Publications bounded context.
 */
@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private publicationsSubject = new BehaviorSubject<Publication[]>([]);
  public publications$ = this.publicationsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadPublications();
  }

  private loadPublications(): void {
    this.apiService.get<any[]>('publications').subscribe({
      next: (publications) => {
        const mappedPublications = publications.map(pub => this.mapToPublication(pub));
        this.publicationsSubject.next(mappedPublications);
        console.log('Publicaciones recargadas desde servidor:', mappedPublications.length);
      },
      error: (error) => {
        console.error('Error loading publications:', error);
        // Mantener las publicaciones existentes en caso de error
      }
    });
  }

  /**
   * Fuerza la recarga de publicaciones desde el servidor.
   * Útil cuando se necesita asegurar que se tienen las últimas publicaciones.
   */
  refreshPublications(): void {
    this.loadPublications();
  }

  private mapToPublication(data: any): Publication {
    return new Publication(
      data.id,
      data.title,
      data.description,
      data.image,
      data.organizationId,
      data.likes || 0,
      data.date || '',
      data.time || '',
      data.location || '',
      data.maxVolunteers || 0,
      data.currentVolunteers || 0,
      this.mapBackendPublicationStatusToFrontend(data.status),
      data.tags || [],
      data.createdAt || new Date().toISOString(),
      data.updatedAt || new Date().toISOString()
    );
  }

  getPublications(): Observable<Publication[]> {
    return this.publications$;
  }

  getPublicationById(id: string): Observable<Publication> {
    return this.apiService.get<any>(`publications/${id}`).pipe(
      map(pub => this.mapToPublication(pub))
    );
  }

  getPublicationsByOrganization(organizationId: string): Observable<Publication[]> {
    // El backend usa /publications/organization/{organizationId}
    return this.apiService.get<any[]>(`publications/organization/${organizationId}`).pipe(
      map(publications => publications.map(pub => this.mapToPublication(pub)))
    );
  }

  createPublication(publicationData: Partial<Publication>): Observable<Publication> {
    const newPublication = {
      ...publicationData,
      likes: publicationData.likes ?? 0,
      status: this.mapFrontendPublicationStatusToBackend(publicationData.status ?? 'published'),
      createdAt: publicationData.createdAt ?? new Date().toISOString(),
      updatedAt: publicationData.updatedAt ?? new Date().toISOString()
    };

    return this.apiService.post<any>('publications', newPublication).pipe(
      map(pub => this.mapToPublication(pub)),
      tap(createdPublication => {
        console.log('Publicación creada, recargando lista:', createdPublication);
        // Recargar todas las publicaciones desde el servidor para asegurar sincronización
        // Usar setTimeout para dar tiempo al servidor de procesar la creación
        setTimeout(() => {
          this.loadPublications();
        }, 500);
      })
    );
  }

  updatePublication(id: string, publicationData: Partial<Publication>): Observable<Publication> {
    // Primero obtener la publicación actual para preservar todos los campos
    return this.getPublicationById(id).pipe(
      switchMap(currentPub => {
        // Hacer merge de los datos actuales con los nuevos datos
        const updatedPublication = {
          id: currentPub.id,
          title: publicationData.title ?? currentPub.title,
          description: publicationData.description ?? currentPub.description,
          image: publicationData.image ?? currentPub.image,
          organizationId: publicationData.organizationId ?? currentPub.organizationId,
          likes: publicationData.likes ?? currentPub.likes,
          date: publicationData.date ?? currentPub.date,
          time: publicationData.time ?? currentPub.time,
          location: publicationData.location ?? currentPub.location,
          maxVolunteers: publicationData.maxVolunteers ?? currentPub.maxVolunteers,
          currentVolunteers: publicationData.currentVolunteers ?? currentPub.currentVolunteers,
          status: publicationData.status ? this.mapFrontendPublicationStatusToBackend(publicationData.status) : currentPub.status,
          tags: publicationData.tags ?? currentPub.tags,
          createdAt: currentPub.createdAt,
          updatedAt: new Date().toISOString()
        };

        return this.apiService.put<any>(`publications/${id}`, updatedPublication).pipe(
          map(pub => this.mapToPublication(pub)),
          tap(updatedPub => {
            const currentPublications = this.publicationsSubject.value;
            this.publicationsSubject.next(
              currentPublications.map(p => p.id === id ? updatedPub : p)
            );
          })
        );
      })
    );
  }

  deletePublication(id: string): Observable<void> {
    return this.apiService.delete<void>(`publications/${id}`).pipe(
      tap(() => {
        const currentPublications = this.publicationsSubject.value;
        this.publicationsSubject.next(
          currentPublications.filter(p => p.id !== id)
        );
      })
    );
  }

  publishPublication(id: string): Observable<Publication> {
    return this.apiService.patch<any>(`publications/${id}`, { 
      status: 'published',
      updatedAt: new Date().toISOString()
    }).pipe(
      map(pub => this.mapToPublication(pub)),
      tap(publishedPublication => {
        const currentPublications = this.publicationsSubject.value;
        this.publicationsSubject.next(
          currentPublications.map(p => p.id === id ? publishedPublication : p)
        );
      })
    );
  }

  archivePublication(id: string): Observable<Publication> {
    return this.apiService.patch<any>(`publications/${id}`, { 
      status: 'archived',
      updatedAt: new Date().toISOString()
    }).pipe(
      map(pub => this.mapToPublication(pub)),
      tap(archivedPublication => {
        const currentPublications = this.publicationsSubject.value;
        this.publicationsSubject.next(
          currentPublications.map(p => p.id === id ? archivedPublication : p)
        );
      })
    );
  }

  likePublication(id: string): Observable<Publication> {
    // El backend usa PUT /publications/{id}/like
    return this.apiService.put<any>(`publications/${id}/like`, {}).pipe(
      map(pub => this.mapToPublication(pub)),
      tap((updatedPublication) => {
        const currentPublications = this.publicationsSubject.value;
        this.publicationsSubject.next(
          currentPublications.map(p => p.id === id ? updatedPublication : p)
        );
        console.log('Publicación actualizada después de like, likes:', updatedPublication.likes);
      })
    );
  }

  private mapBackendPublicationStatusToFrontend(backendStatus: string): 'draft' | 'published' | 'archived' {
    const statusMap: { [key: string]: 'draft' | 'published' | 'archived' } = {
      'DRAFT': 'draft',
      'PUBLISHED': 'published',
      'ARCHIVED': 'archived'
    };
    return statusMap[backendStatus] || 'draft';
  }

  private mapFrontendPublicationStatusToBackend(frontendStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'DRAFT',
      'published': 'PUBLISHED',
      'archived': 'ARCHIVED'
    };
    return statusMap[frontendStatus] || 'DRAFT';
  }
}

