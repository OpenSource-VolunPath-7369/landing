import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProjectService } from '../../../application/services/project.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import { PublicationService } from '../../../../publications/application/services/publication.service';
import { AuthService } from '../../../../auth/application/services/auth.service';
import { NotificationService } from '../../../../communication/application/services/notification.service';
import { ApiService } from '../../../../shared/infrastructure/api.service';
import { Project } from '../../../domain/model/project';
import { Organization } from '../../../../organizations/domain/model/organization';
import { Publication } from '../../../../publications/domain/model/publication';
import { User } from '../../../../interfaces';

/**
 * Component for displaying community activities and organizations.
 * 
 * @remarks
 * This component is part of the Projects bounded context presentation layer.
 */
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-comunidad-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './comunidad-page.component.html',
  styleUrls: ['./comunidad-page.component.css']
})
export default class ComunidadPageComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  publications: Publication[] = [];
  organizations: Organization[] = [];
  loading = false;
  error: string | null = null;
  
  // Usuario actual y detección de rol
  currentUser: User | null = null;
  userRegistrations: Map<string, 'pending' | 'confirmed' | 'cancelled'> = new Map();
  
  // Mensaje de éxito
  successMessage: string | null = null;
  showSuccessMessage = false;
  
  // Mapa para obtener la organización por ID
  organizationsMap: Map<string, Organization> = new Map();
  
  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private organizationService: OrganizationService,
    private publicationService: PublicationService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    // Suscribirse a cambios del usuario
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (this.isVolunteer()) {
          this.loadUserRegistrations();
        }
      });
    
    this.loadData();
    // Forzar recarga de publicaciones cada vez que se entra a la página
    // Esto asegura que se vean las publicaciones recién creadas
    this.publicationService.refreshPublications();
    // Forzar recarga de organizaciones cada vez que se entra a la página
    // Esto asegura que se vean las organizaciones recién registradas
    this.organizationService.refreshOrganizations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.loading = true;
    this.error = null;

    // Load organizations first (needed for publications)
    this.organizationService.getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organizations: Organization[]) => {
          this.organizations = organizations;
          // Crear mapa de organizaciones para acceso rápido
          organizations.forEach(org => {
            this.organizationsMap.set(org.id, org);
          });
          
          // Load projects
          this.projectService.getProjects()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (projects) => {
                this.projects = projects;
                this.loadPublications();
              },
              error: (error) => {
                this.error = 'Error al cargar las actividades';
                this.loading = false;
                console.error('Error loading projects:', error);
              }
            });
        },
        error: (error: any) => {
          console.error('Error loading organizations:', error);
          this.loading = false;
        }
      });
  }

  private loadPublications() {
    // Suscribirse al observable de publicaciones para recibir actualizaciones automáticas
    this.publicationService.getPublications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (publications: Publication[]) => {
          // Filtrar solo las publicaciones publicadas
          this.publications = publications.filter(pub => pub.isPublished());
          this.loading = false;
          console.log('Publicaciones cargadas en comunidad:', this.publications.length);
        },
        error: (error: any) => {
          console.error('Error loading publications:', error);
          this.loading = false;
        }
      });
  }

  getOrganizationForPublication(organizationId: string): Organization | undefined {
    return this.organizationsMap.get(organizationId);
  }

  toggleLikePublication(publication: Publication) {
    this.publicationService.likePublication(publication.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPublication) => {
          console.log('Publication liked:', updatedPublication);
          // Actualizar solo la publicación específica en el array local
          const index = this.publications.findIndex(p => p.id === publication.id);
          if (index !== -1) {
            // Actualizar la publicación en el array sin recargar todo
            this.publications[index] = updatedPublication;
            console.log('Publicación actualizada en el array local, likes:', updatedPublication.likes);
          } else {
            // Si no se encuentra, recargar (por si acaso)
            console.warn('Publicación no encontrada en el array, recargando...');
            this.loadPublications();
          }
        },
        error: (error) => {
          console.error('Error liking publication:', error);
          // En caso de error, no hacer nada para mantener la publicación visible
        }
      });
  }

  toggleLike(project: Project) {
    this.projectService.likeProject(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProject) => {
          console.log('Project liked:', updatedProject);
        },
        error: (error) => {
          console.error('Error liking project:', error);
          this.loadData();
        }
      });
  }

  /**
   * Check if current user is a volunteer
   */
  isVolunteer(): boolean {
    return this.authService.isVolunteer();
  }

  /**
   * Check if current user is an organization
   */
  isOrganization(): boolean {
    return this.authService.isOrganization();
  }

  /**
   * Check if user is registered for a project
   */
  isRegistered(projectId: string): boolean {
    return this.userRegistrations.has(projectId);
  }

  /**
   * Get registration status for a project
   */
  getRegistrationStatus(projectId: string): 'pending' | 'confirmed' | 'cancelled' | null {
    return this.userRegistrations.get(projectId) || null;
  }

  /**
   * Load user registrations (mock for now)
   */
  private loadUserRegistrations(): void {
    // TODO: Conectar con backend Enrollments bounded context
    // Por ahora es mock
    console.log('Loading user registrations for volunteer:', this.currentUser?.id);
  }

  registerForPublication(publication: Publication) {
    // Verificar que el usuario esté autenticado
    if (!this.currentUser) {
      alert('Debes iniciar sesión para registrarte');
      this.router.navigate(['/login']);
      return;
    }

    // Verificar que el usuario sea voluntario
    if (!this.isVolunteer()) {
      alert('Solo los voluntarios pueden registrarse en actividades');
      return;
    }

    if (this.isRegistered(publication.id)) {
      alert('Ya estás registrado en esta actividad');
      return;
    }

    // Para publicaciones, permitir registro siempre
    // TODO: Conectar con backend Enrollments bounded context
    // Por ahora es mock
    this.userRegistrations.set(publication.id, 'pending');
    
    // Mostrar mensaje de éxito
    this.successMessage = '¡Registrado exitosamente!';
    this.showSuccessMessage = true;
    
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.successMessage = null;
    }, 3000);
    
    console.log('Registration created for publication:', publication.id);
  }

  registerForProject(project: Project) {
    // Verificar que el usuario esté autenticado
    if (!this.currentUser) {
      alert('Debes iniciar sesión para registrarte');
      this.router.navigate(['/login']);
      return;
    }

    // Verificar que el usuario sea voluntario
    if (!this.isVolunteer()) {
      alert('Solo los voluntarios pueden registrarse en actividades');
      return;
    }

    if (this.isRegistered(project.id)) {
      alert('Ya estás registrado en esta actividad');
      return;
    }

    // Verificar espacios disponibles (pero permitir registro de todas formas)
    if (!project.hasAvailableSpots()) {
      const confirm = window.confirm('No hay espacios disponibles. ¿Deseas registrarte en lista de espera?');
      if (!confirm) {
        return;
      }
    }

    // TODO: Conectar con backend Enrollments bounded context
    // Por ahora es mock
    this.projectService.registerForProject({
      userId: this.currentUser.id,
      activityId: project.id,
      notes: 'Registro desde la página de comunidad'
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registration) => {
          // Guardar registro localmente
          this.userRegistrations.set(project.id, 'pending');
          
          // Crear notificación para la organización
          const organization = this.organizationsMap.get(project.organizationId);
          if (organization && this.currentUser) {
            // Buscar el usuario de la organización basándose en el email de la organización
            // Primero intentamos buscar usuarios con role 'organization_admin' que coincidan con el email
            this.apiService.get<User[]>('users')
              .pipe(
                map(users => {
                  // Buscar usuario de organización que coincida con el email de la organización
                  const orgUser = users.find(u => 
                    u.role === 'organization_admin' && 
                    (u.email.toLowerCase() === organization.email.toLowerCase() || 
                     u.email.toLowerCase().includes(organization.email.toLowerCase().split('@')[0]))
                  );
                  // Si no encontramos por email, usar el organizationId como fallback
                  // (asumiendo que el ID del usuario puede coincidir con el organizationId)
                  return orgUser?.id || project.organizationId;
                }),
                switchMap(orgUserId => {
                  return this.notificationService.createNotification({
                    userId: orgUserId,
                    title: 'Nueva inscripción',
                    message: `${this.currentUser!.name} se ha registrado en la actividad "${project.title}"`,
                    type: 'activity_confirmed',
                    actionUrl: `/comunidad`
                  });
                }),
                takeUntil(this.destroy$)
              )
              .subscribe({
                next: () => {
                  console.log('Notification created for organization');
                },
                error: (error) => {
                  console.error('Error creating notification:', error);
                  // Intentar crear la notificación con el organizationId como fallback
                  this.notificationService.createNotification({
                    userId: project.organizationId,
                    title: 'Nueva inscripción',
                    message: `${this.currentUser!.name} se ha registrado en la actividad "${project.title}"`,
                    type: 'activity_confirmed',
                    actionUrl: `/comunidad`
                  }).subscribe({
                    next: () => console.log('Notification created with fallback userId'),
                    error: (err) => console.error('Error creating notification with fallback:', err)
                  });
                }
              });
          }
          
          // Mostrar mensaje de éxito
          this.successMessage = '¡Registrado exitosamente!';
          this.showSuccessMessage = true;
          
          // Ocultar el mensaje después de 3 segundos
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.successMessage = null;
          }, 3000);
          
          console.log('Registration created:', registration);
        },
        error: (error) => {
          console.error('Error registering for project:', error);
          alert('Error al registrarse en la actividad');
        }
      });
  }

  retry() {
    this.loadData();
  }

  viewOrganizationProfile(organizationId: string) {
    if (organizationId === 'create') {
      this.router.navigate(['/nueva-publicacion']);
    } else {
      this.router.navigate(['/organizacion', organizationId]);
    }
  }
}

