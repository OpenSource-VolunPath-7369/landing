import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from '../../../shared/infrastructure/api.service';
import { Organization } from '../../domain/model/organization';

/**
 * Application service for managing organizations.
 * 
 * @remarks
 * This service handles organization-related operations in the Organizations bounded context.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private organizationsSubject = new BehaviorSubject<Organization[]>([]);
  public organizations$ = this.organizationsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadOrganizations();
  }

  private loadOrganizations(): void {
    this.apiService.get<any[]>('organizations').subscribe(
      organizations => {
        const mappedOrgs = organizations.map(org => this.mapToOrganization(org));
        this.organizationsSubject.next(mappedOrgs);
      }
    );
  }

  private mapToOrganization(data: any): Organization {
    // Manejar campos alternativos (location/ubicacion para address)
    const address = data.address || data.location || data.ubicacion || '';
    const phone = data.phone || data.telefono || '';
    const email = data.email || data.correo || '';
    const name = data.name || data.nombre || '';
    
    const org = new Organization(
      String(data.id),
      name,
      data.logo || '',
      data.description || '',
      data.website || '',
      email,
      phone,
      address,
      data.foundedYear || 0,
      data.volunteerCount || 0,
      data.rating || 0,
      data.categories || [],
      data.isVerified || false,
      data.socialMedia || {}
    );
    
    // Guardar userId si existe (para uso en notificaciones)
    (org as any).userId = data.userId;
    
    return org;
  }

  getOrganizations(): Observable<Organization[]> {
    return this.organizations$;
  }

  getOrganizationById(id: string): Observable<Organization> {
    return this.apiService.get<any>(`organizations/${id}`).pipe(
      map(org => this.mapToOrganization(org))
    );
  }

  createOrganization(organizationData: Partial<Organization>): Observable<Organization> {
    // Asegurar que el logo se incluya explícitamente
    const newOrganization = {
      ...organizationData,
      logo: organizationData.logo || '', // Asegurar que el logo esté presente
      isVerified: organizationData.isVerified !== undefined ? organizationData.isVerified : false,
      volunteerCount: organizationData.volunteerCount !== undefined ? organizationData.volunteerCount : 0,
      rating: organizationData.rating !== undefined ? organizationData.rating : 0
    };

    console.log('OrganizationService.createOrganization - Datos a enviar:', {
      ...newOrganization,
      logoLength: newOrganization.logo ? newOrganization.logo.length : 0
    });

    return this.apiService.post<any>('organizations', newOrganization).pipe(
      map(org => {
        console.log('OrganizationService.createOrganization - Respuesta del servidor:', {
          id: org.id,
          name: org.name,
          logo: org.logo,
          logoLength: org.logo ? org.logo.length : 0
        });
        return this.mapToOrganization(org);
      }),
      tap(createdOrg => {
        console.log('OrganizationService.createOrganization - Organización mapeada:', {
          id: createdOrg.id,
          name: createdOrg.name,
          logo: createdOrg.logo,
          logoLength: createdOrg.logo ? createdOrg.logo.length : 0
        });
        const currentOrgs = this.organizationsSubject.value;
        this.organizationsSubject.next([createdOrg, ...currentOrgs]);
      })
    );
  }

  updateOrganization(id: string, organizationData: Partial<Organization>): Observable<Organization> {
    // Preparar datos según el formato del backend
    const updateData: any = {
      name: organizationData.name,
      email: organizationData.email,
      logo: organizationData.logo,
      description: organizationData.description || '',
      website: organizationData.website || '',
      phone: organizationData.phone,
      address: organizationData.address || '',
      foundedYear: organizationData.foundedYear || new Date().getFullYear(),
      categories: organizationData.categories || [],
      socialMedia: organizationData.socialMedia || {},
      isVerified: organizationData.isVerified !== undefined ? organizationData.isVerified : false
    };
    
    return this.apiService.put<any>(`organizations/${id}`, updateData).pipe(
      map(org => this.mapToOrganization(org)),
      tap(updatedOrg => {
        const currentOrgs = this.organizationsSubject.value;
        this.organizationsSubject.next(
          currentOrgs.map(o => o.id === id ? updatedOrg : o)
        );
        // Recargar todas las organizaciones para asegurar sincronización
        this.loadOrganizations();
      })
    );
  }

  /**
   * Fuerza la recarga de organizaciones desde el servidor.
   * Útil cuando se necesita asegurar que se tienen los últimos datos.
   */
  refreshOrganizations(): void {
    this.loadOrganizations();
  }

  verifyOrganization(id: string): Observable<Organization> {
    return this.apiService.patch<any>(`organizations/${id}`, { isVerified: true }).pipe(
      map(org => this.mapToOrganization(org)),
      tap(verifiedOrg => {
        const currentOrgs = this.organizationsSubject.value;
        this.organizationsSubject.next(
          currentOrgs.map(o => o.id === id ? verifiedOrg : o)
        );
      })
    );
  }
}

