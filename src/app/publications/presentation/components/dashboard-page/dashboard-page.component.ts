import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PublicationService } from '../../../application/services/publication.service';
import { Publication } from '../../../domain/model/publication';
import { AuthService } from '../../../../auth/application/services/auth.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import { EnrollmentService, Enrollment } from '../../../application/services/enrollment.service';
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
    private enrollmentService: EnrollmentService
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

    // Check if already registered
    if (this.enrollmentService.isVolunteerRegistered(publication.id, this.currentUser.id)) {
      alert('Ya estás registrado en este voluntariado');
      return;
    }

    // Check if there are available spots
    if (!publication.hasAvailableSpots()) {
      alert('No hay cupos disponibles');
      return;
    }

    this.enrollmentService.registerVolunteer(
      publication.id,
      this.currentUser.id,
      this.currentUser.name
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Registro exitoso:', result);
          
          // Immediately update enrollments list for this publication
          this.loadEnrollmentsForPublication(publication.id);
          
          // Reload publications to get updated counter from backend
          this.publicationService.refreshPublications();
          
          // Wait a bit and then reload to ensure we get the updated data
          setTimeout(() => {
            this.loadPublications();
          }, 300);
          
          alert('Registrado exitosamente');
        },
        error: (error: any) => {
          console.error('Error registering:', error);
          alert(error.message || 'Error al registrarse');
        }
      });
  }

  loadEnrollmentsForPublication(publicationId: string) {
    this.enrollmentService.getEnrollmentsByPublication(publicationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enrollments) => {
          console.log('Enrollments cargados para publicación', publicationId, ':', enrollments);
          // Use spread operator to trigger change detection
          this.publicationEnrollments = {
            ...this.publicationEnrollments,
            [publicationId]: enrollments
          };
        },
        error: (error) => {
          console.error('Error loading enrollments:', error);
        }
      });
  }

  getEnrollmentsForPublication(publicationId: string): Enrollment[] {
    return this.publicationEnrollments[publicationId] || [];
  }

  isRegistered(publicationId: string): boolean {
    if (!this.currentUser) return false;
    return this.enrollmentService.isVolunteerRegistered(publicationId, this.currentUser.id);
  }

  trackByPublicationId(index: number, publication: Publication): string {
    return publication.id;
  }

  trackByEnrollmentId(index: number, enrollment: Enrollment): string {
    return enrollment.id;
  }
}

