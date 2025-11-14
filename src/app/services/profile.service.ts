import { Injectable } from '@angular/core';
import { Observable, map, switchMap, forkJoin, of } from 'rxjs';
import { ApiService } from '../shared/infrastructure/api.service';
import { OrganizationProfile, UpdateOrganizationProfile } from '../interfaces/organization.interface';
import { Organization } from '../organizations/domain/model/organization';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private apiService: ApiService) {}

  getProfile(organizationId: string | number): Observable<OrganizationProfile> {
    return this.apiService.get<any>(`organizations/${organizationId}`).pipe(
      map((org: any) => {
        // Mapear la organización del servidor al formato del perfil
        return {
          organization: {
            id: org.id,
            name: org.name,
            email: org.email,
            location: org.address || org.location || '',
            phone: org.phone,
            type: org.categories && org.categories.length > 0 ? org.categories[0] : '',
            logo: org.logo || '' // Incluir el logo de la organización
          },
          representative: {
            id: '1', // Por ahora usar ID por defecto
            name: 'Representante', // Esto debería venir de users o de otro endpoint
            email: org.email
          }
        };
      })
    );
  }

  updateProfile(organizationId: string | number, profile: UpdateOrganizationProfile, userId?: string, currentLogo?: string): Observable<OrganizationProfile> {
    // Primero obtener la organización actual para preservar el logo
    return this.apiService.get<any>(`organizations/${organizationId}`).pipe(
      switchMap((currentOrg: any) => {
        // Mapear los datos del perfil a la estructura de organización
        const organizationData: any = {
          name: profile.organizationName,
          email: profile.organizationEmail,
          address: profile.organizationLocation, // Mapear location a address
          phone: profile.organizationPhone,
          logo: currentLogo || currentOrg.logo || '' // Preservar el logo existente
        };

        // Si hay un tipo de organización, agregarlo a las categorías
        if (profile.organizationType) {
          organizationData.categories = [profile.organizationType];
        }

        // Preservar otros campos importantes que no se están actualizando
        if (currentOrg.description) {
          organizationData.description = currentOrg.description;
        }
        if (currentOrg.website) {
          organizationData.website = currentOrg.website;
        }
        if (currentOrg.foundedYear) {
          organizationData.foundedYear = currentOrg.foundedYear;
        }
        if (currentOrg.volunteerCount !== undefined) {
          organizationData.volunteerCount = currentOrg.volunteerCount;
        }
        if (currentOrg.rating !== undefined) {
          organizationData.rating = currentOrg.rating;
        }
        if (currentOrg.isVerified !== undefined) {
          organizationData.isVerified = currentOrg.isVerified;
        }
        if (currentOrg.socialMedia) {
          organizationData.socialMedia = currentOrg.socialMedia;
        }

        // Preparar datos para actualizar según el formato del backend
        const updateOrgData = {
          name: organizationData.name,
          email: organizationData.email,
          logo: organizationData.logo,
          description: organizationData.description || currentOrg.description || '',
          website: organizationData.website || currentOrg.website || '',
          phone: organizationData.phone,
          address: organizationData.address,
          foundedYear: organizationData.foundedYear || currentOrg.foundedYear || new Date().getFullYear(),
          categories: organizationData.categories || currentOrg.categories || [],
          socialMedia: organizationData.socialMedia || currentOrg.socialMedia || {},
          isVerified: organizationData.isVerified !== undefined ? organizationData.isVerified : (currentOrg.isVerified || false)
        };

        // Actualizar la organización usando el endpoint PUT
        const updateOrg$ = this.apiService.put<any>(`organizations/${organizationId}`, updateOrgData);

        // Si tenemos userId, también actualizar el usuario en la tabla users
        const updateUser$ = userId 
          ? this.apiService.get<any>(`users/${userId}`).pipe(
              switchMap((user: any) => {
                const userUpdateData = {
                  ...user,
                  name: profile.representativeName,
                  email: profile.representativeEmail,
                  location: profile.organizationLocation,
                  bio: `Organización: ${profile.organizationName}`,
                  avatar: currentLogo || user.avatar || '' // Preservar el avatar/logo del usuario
                };
                return this.apiService.put<any>(`users/${userId}`, userUpdateData);
              })
            )
          : of(null);

        // Actualizar ambos en paralelo
        return forkJoin({
          org: updateOrg$,
          user: updateUser$
        }).pipe(
          switchMap(({ org, user }) => {
            // Recargar el perfil desde el servidor para asegurar que tenemos los datos más recientes
            return this.getProfile(organizationId).pipe(
              map((updatedProfile: OrganizationProfile) => {
                // Actualizar los datos del representante con los datos del usuario si se actualizó
                if (user) {
                  updatedProfile.representative.name = profile.representativeName;
                  updatedProfile.representative.email = profile.representativeEmail;
                }
                return updatedProfile;
              })
            );
          })
        );
      })
    );
  }
}

