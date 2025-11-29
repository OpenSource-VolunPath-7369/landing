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
    // El backend devuelve scheduledDate y scheduledTime
    // Formatear fecha si viene en formato ISO o YYYY-MM-DD
    let formattedDate = data.scheduledDate || data.date || '';
    let formattedTime = data.scheduledTime || data.time || '';
    
    // Si la fecha viene en formato YYYY-MM-DD, formatearla a DD/MM/YYYY
    if (formattedDate && formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        const [year, month, day] = formattedDate.split('-');
        formattedDate = `${day}/${month}/${year}`;
      } catch (e) {
        // Si falla, usar el valor original
        console.warn('Error formatting date:', formattedDate);
      }
    } else if (formattedDate && formattedDate.includes('T')) {
      // Si viene en formato ISO, extraer solo la fecha
      try {
        const dateObj = new Date(formattedDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
        }
      } catch (e) {
        console.warn('Error parsing ISO date:', formattedDate);
      }
    }
    
    // Si no hay fecha programada, usar createdAt como fallback
    if (!formattedDate && data.createdAt) {
      try {
        const dateObj = new Date(data.createdAt);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
        }
      } catch (e) {
        // Ignorar error
      }
    }
    
    // El tiempo viene directamente del backend en formato HH:MM
    // Si no viene, intentar extraerlo de createdAt
    if (!formattedTime && data.createdAt) {
      try {
        const dateObj = new Date(data.createdAt);
        if (!isNaN(dateObj.getTime())) {
          formattedTime = dateObj.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          });
        }
      } catch (e) {
        // Ignorar error
      }
    }
    
    console.log('Mapping publication:', {
      id: data.id,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      formattedDate,
      formattedTime,
      location: data.location
    });
    
    return new Publication(
      String(data.id),
      data.title,
      data.description,
      data.image,
      String(data.organizationId),
      data.likes || 0,
      formattedDate,
      formattedTime,
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
    // Convertir fecha y hora del frontend al formato del backend
    let scheduledDate = '';
    if (publicationData.date) {
      // Si viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
      if (typeof publicationData.date === 'string' && publicationData.date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = publicationData.date.split('/');
        scheduledDate = `${year}-${month}-${day}`;
      } else if (typeof publicationData.date === 'string' && publicationData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Ya está en formato YYYY-MM-DD
        scheduledDate = publicationData.date;
      } else if (publicationData.date instanceof Date) {
        // Si es un objeto Date, convertirlo a YYYY-MM-DD
        scheduledDate = publicationData.date.toISOString().split('T')[0];
      } else {
        // Intentar parsear como string
        try {
          const dateObj = new Date(publicationData.date as any);
          if (!isNaN(dateObj.getTime())) {
            scheduledDate = dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Error parsing date:', publicationData.date);
        }
      }
    }
    
    // La hora debe venir como string en formato HH:MM
    const scheduledTime = publicationData.time || '';
    
    // Preparar datos para el backend
    const updateData: any = {
      title: publicationData.title,
      description: publicationData.description,
      image: publicationData.image,
      organizationId: publicationData.organizationId ? Number(publicationData.organizationId) : undefined,
      tags: publicationData.tags,
      status: publicationData.status ? this.mapFrontendPublicationStatusToBackend(publicationData.status) : undefined,
      location: publicationData.location,
      maxVolunteers: publicationData.maxVolunteers,
      currentVolunteers: publicationData.currentVolunteers
    };
    
    // Solo agregar scheduledDate y scheduledTime si tienen valores
    if (scheduledDate) {
      updateData.scheduledDate = scheduledDate;
    }
    if (scheduledTime) {
      updateData.scheduledTime = scheduledTime;
    }
    
    // Eliminar campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('Updating publication with data:', { 
      id, 
      originalDate: publicationData.date,
      originalTime: publicationData.time,
      scheduledDate,
      scheduledTime,
      updateData 
    });

    return this.apiService.put<any>(`publications/${id}`, updateData).pipe(
      map(pub => this.mapToPublication(pub)),
      tap(updatedPub => {
        console.log('Publication updated successfully:', updatedPub);
        const currentPublications = this.publicationsSubject.value;
        this.publicationsSubject.next(
          currentPublications.map(p => p.id === id ? updatedPub : p)
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

