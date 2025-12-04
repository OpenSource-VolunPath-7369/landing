import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrganizationService } from '../../../application/services/organization.service';
import { PublicationService } from '../../../../publications/application/services/publication.service';
import { Organization } from '../../../domain/model/organization';
import { Publication } from '../../../../publications/domain/model/publication';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-organization-profile-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './organization-profile-page.component.html',
  styleUrls: ['./organization-profile-page.component.css']
})
export default class OrganizationProfilePageComponent implements OnInit, OnDestroy {
  organization: Organization | null = null;
  publications: Publication[] = [];
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private publicationService: PublicationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadOrganization(id);
        this.loadOrganizationPublications(id);
        
        // Suscribirse a cambios en las organizaciones para actualizar automáticamente
        this.organizationService.getOrganizations()
          .pipe(takeUntil(this.destroy$))
          .subscribe(organizations => {
            const updatedOrg = organizations.find(org => org.id === id);
            if (updatedOrg) {
              // Actualizar la organización si hay cambios
              const wasChanged = !this.organization || 
                JSON.stringify(this.organization) !== JSON.stringify(updatedOrg);
              
              if (wasChanged) {
                this.organization = updatedOrg;
                console.log('Organización actualizada automáticamente:', updatedOrg);
                // Recargar publicaciones también
                this.loadOrganizationPublications(id);
              }
            }
          });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrganization(id: string) {
    this.loading = true;
    this.error = null;
    
    // Cargar directamente desde el servidor para asegurar datos actualizados
    this.loadOrganizationFromServer(id);
  }

  private loadOrganizationFromServer(id: string) {
    this.organizationService.getOrganizationById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organization: Organization) => {
          this.organization = organization;
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al cargar la organización';
          this.loading = false;
          console.error('Error loading organization:', error);
        }
      });
  }

  // Método público para recargar la organización manualmente
  refreshOrganization() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadOrganizationFromServer(id);
      this.loadOrganizationPublications(id);
    }
  }

  private loadOrganizationPublications(organizationId: string) {
    this.publicationService.getPublicationsByOrganization(organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (publications: Publication[]) => {
          // Filtrar solo las publicaciones publicadas
          this.publications = publications.filter(pub => pub.isPublished());
        },
        error: (error: any) => {
          console.error('Error loading organization publications:', error);
        }
      });
  }

  goBack() {
    this.router.navigate(['/comunidad']);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '/assets/mundo.png';
    }
  }
}

