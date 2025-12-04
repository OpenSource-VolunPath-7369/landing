import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PublicationService } from '../../../application/services/publication.service';
import { Publication } from '../../../domain/model/publication';
import { AuthService } from '../../../../auth/application/services/auth.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import { EnrollmentService, Enrollment } from '../../../application/services/enrollment.service';
import { VolunteerService } from '../../../../volunteers/application/services/volunteer.service';
import { User } from '../../../../interfaces';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Dashboard component for managing publications.
 * 
 * @remarks
 * This component is part of the Publications bounded context presentation layer.
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.css']
})
export default class DashboardPageComponent implements OnInit, OnDestroy {
  publications: Publication[] = [];
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;
  publicationEnrollments: { [publicationId: string]: Enrollment[] } = {};
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private publicationService: PublicationService,
    public authService: AuthService,
    private organizationService: OrganizationService,
    private enrollmentService: EnrollmentService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit() {
    this.loadPublications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPublications() {
    this.loading = true;
    this.error = null;
    this.currentUser = this.authService.getCurrentUser();

    // Si el usuario es una organización, filtrar solo sus publicaciones
    if (this.authService.isOrganization() && this.currentUser) {
      // Obtener la organización del usuario actual
      this.organizationService.getOrganizations()
        .pipe(
          takeUntil(this.destroy$),
          map(organizations => {
            // Buscar organización que coincida con el email del usuario
            const userOrg = organizations.find(org => 
              org.email.toLowerCase().trim() === this.currentUser?.email.toLowerCase().trim()
            );
            
            // Si no se encuentra por email, buscar por nombre en el bio
            if (!userOrg && this.currentUser?.bio) {
              const bioMatch = this.currentUser.bio.match(/organización:\s*(.+)/i);
              if (bioMatch && bioMatch[1]) {
                const orgNameFromBio = bioMatch[1].trim();
                return organizations.find(org => 
                  org.name.toLowerCase().trim() === orgNameFromBio.toLowerCase()
                );
              }
            }
            return userOrg;
          }),
          switchMap(userOrg => {
            if (!userOrg) {
              console.warn('No se encontró organización para el usuario actual');
              return this.publicationService.getPublications();
            }
            
            const organizationId = userOrg.id;
            console.log('Filtrando publicaciones para organización:', {
              organizationId: organizationId,
              organizationName: userOrg.name,
              userEmail: this.currentUser?.email
            });
            
            // Cargar todas las publicaciones y filtrar por organizationId
            return this.publicationService.getPublications().pipe(
              map(publications => {
                const filtered = publications.filter(pub => 
                  String(pub.organizationId) === String(organizationId)
                );
                console.log('Publicaciones filtradas:', {
                  total: publications.length,
                  filtradas: filtered.length,
                  organizationId: organizationId
                });
                return filtered;
              })
            );
          })
        )
        .subscribe({
          next: (publications) => {
            this.publications = publications;
            this.loading = false;
            // Load enrollments for each publication
            publications.forEach(pub => {
              this.loadEnrollmentsForPublication(pub.id);
              // Check registration status for current user
              if (this.currentUser) {
                this.checkRegistrationStatus(pub.id);
              }
            });
          },
          error: (error) => {
            this.error = 'Error loading publications';
            this.loading = false;
            console.error('Error loading publications:', error);
          }
        });
    } else {
      // Si no es organización, cargar todas las publicaciones (por si acaso)
      this.publicationService.getPublications()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (publications) => {
            this.publications = publications;
            this.loading = false;
            // Load enrollments for each publication
            publications.forEach(pub => {
              this.loadEnrollmentsForPublication(pub.id);
              // Check registration status for current user
              if (this.currentUser) {
                this.checkRegistrationStatus(pub.id);
              }
            });
          },
          error: (error) => {
            this.error = 'Error loading publications';
            this.loading = false;
            console.error('Error loading publications:', error);
          }
        });
    }
  }

  deletePublication(publicationId: string) {
    const publication = this.publications.find(p => p.id === publicationId);
    const publicationTitle = publication?.title || 'esta publicación';
    
    // Note: Using hardcoded text for confirm dialog - could be improved with translation service
    if (confirm(`¿Estás seguro de que quieres eliminar "${publicationTitle}"?\n\nEsta acción no se puede deshacer.`)) {
      console.log('Eliminando publicación:', publicationId);
      
      this.publicationService.deletePublication(publicationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Publicación eliminada exitosamente:', publicationId);
            // La lista se actualiza automáticamente gracias al BehaviorSubject en el servicio
            // Pero recargamos para asegurar que esté sincronizada
            this.loadPublications();
          },
          error: (error: any) => {
            console.error('Error deleting publication:', error);
            console.error('Error completo:', JSON.stringify(error, null, 2));
            alert('Error al eliminar la publicación: ' + (error.message || 'Error desconocido'));
          }
        });
    }
  }

  createNewPublication() {
    console.log('Navegando a nueva publicación');
    this.router.navigate(['/nueva-publicacion']);
  }

  editPublication(publicationId: string) {
    console.log('Editando publicación:', publicationId);
    this.router.navigate(['/nueva-publicacion', publicationId]);
  }

  retry() {
    this.loadPublications();
  }

  registerForPublication(publication: Publication) {
    if (!this.currentUser) {
      alert('Debes iniciar sesión para registrarte');
      return;
    }

    // Check if already registered (synchronous check from local state)
    if (this.isRegistered(publication.id)) {
      alert('Ya estás registrado en este voluntariado');
      return;
    }

    // Check if there are available spots
    if (!publication.hasAvailableSpots()) {
      alert('No hay cupos disponibles');
      return;
    }

    // First, get the volunteer ID from the backend using userId
    // The backend expects volunteerId, not userId
    this.volunteerService.getVolunteerByUserId(this.currentUser.id)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(volunteer => {
          if (!volunteer) {
            throw new Error('No se encontró el perfil de voluntario. Por favor completa tu perfil primero.');
          }
          console.log('Registrando con volunteerId:', volunteer.id, 'publicationId:', publication.id, 'volunteerName:', this.currentUser.name);
          return this.enrollmentService.registerVolunteer(
            publication.id,
            volunteer.id,
            this.currentUser.name
          );
        }),
        catchError(error => {
          console.error('Error obteniendo voluntario:', error);
          // Try alternative: get from volunteers list
          return this.volunteerService.getVolunteers().pipe(
            map(volunteers => {
              const volunteer = volunteers.find(v => v.userId === this.currentUser?.id);
              if (!volunteer) {
                throw new Error('No se encontró el perfil de voluntario. Por favor completa tu perfil primero.');
              }
              return volunteer;
            }),
            switchMap(volunteer => {
              console.log('Registrando con volunteerId (alternativo):', volunteer.id, 'publicationId:', publication.id);
              return this.enrollmentService.registerVolunteer(
                publication.id,
                volunteer.id,
                this.currentUser.name
              );
            })
          );
        })
      )
      .subscribe({
        next: (result) => {
          console.log('Registro exitoso:', result);
          console.log('Enrollment creado:', result.enrollment);
          
          // Reload enrollments from backend immediately
          this.loadEnrollmentsForPublication(publication.id);
          
          // Reload publications to get updated counter from backend
          // The backend automatically updates the counter when creating enrollment
          setTimeout(() => {
            this.publicationService.refreshPublications();
            setTimeout(() => {
              this.loadPublications();
            }, 300);
          }, 500);
          
          alert('Registrado exitosamente');
        },
        error: (error: any) => {
          console.error('Error registering:', error);
          alert(error.message || 'Error al registrarse');
        }
      });
  }

  loadEnrollmentsForPublication(publicationId: string) {
    console.log('Cargando enrollments para publicación:', publicationId);
    this.enrollmentService.getEnrollmentsByPublication(publicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enrollments) => {
          console.log('Enrollments cargados para publicación', publicationId, ':', enrollments);
          console.log('Cantidad de enrollments:', enrollments.length);
          // Use spread operator to trigger change detection
          this.publicationEnrollments = {
            ...this.publicationEnrollments,
            [publicationId]: enrollments
          };
          console.log('Enrollments actualizados en componente:', this.publicationEnrollments[publicationId]);
        },
        error: (error) => {
          console.error('Error loading enrollments:', error);
          console.error('Error completo:', JSON.stringify(error, null, 2));
        }
      });
  }

  getEnrollmentsForPublication(publicationId: string): Enrollment[] {
    const enrollments = this.publicationEnrollments[publicationId];
    return enrollments ? enrollments : [];
  }

  isRegistered(publicationId: string): boolean {
    if (!this.currentUser) return false;
    // Check synchronously from local state first
    const enrollments = this.publicationEnrollments[publicationId] || [];
    // We need to check by volunteerId, not userId
    // For now, check by volunteerName as a workaround
    return enrollments.some(e => e.volunteerName === this.currentUser?.name);
  }

  checkRegistrationStatus(publicationId: string) {
    if (!this.currentUser) return;
    
    // Get volunteer ID first
    this.volunteerService.getVolunteers()
      .pipe(
        takeUntil(this.destroy$),
        map(volunteers => {
          const volunteer = volunteers.find(v => v.userId === this.currentUser?.id);
          return volunteer?.id;
        }),
        switchMap(volunteerId => {
          if (!volunteerId) {
            return of(false);
          }
          return this.enrollmentService.isVolunteerRegistered(publicationId, volunteerId);
        }),
        catchError(error => {
          console.error('Error checking registration status:', error);
          return of(false);
        })
      )
      .subscribe({
        next: (isRegistered) => {
          // Update local state if needed
          if (isRegistered) {
            this.loadEnrollmentsForPublication(publicationId);
          }
        }
      });
  }

  trackByPublicationId(index: number, publication: Publication): string {
    return publication.id;
  }

  trackByEnrollmentId(index: number, enrollment: Enrollment): string {
    return enrollment.id;
  }
}

