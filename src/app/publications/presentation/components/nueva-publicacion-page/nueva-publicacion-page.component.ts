import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { PublicationService } from '../../../application/services/publication.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import { Publication } from '../../../domain/model/publication';
import { Organization } from '../../../../organizations/domain/model/organization';

/**
 * New publication page component.
 * 
 * @remarks
 * This component is part of the Publications bounded context presentation layer.
 */
@Component({
  selector: 'app-nueva-publicacion-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './nueva-publicacion-page.component.html',
  styleUrls: ['./nueva-publicacion-page.component.css']
})
export default class NuevaPublicacionPageComponent implements OnInit, OnDestroy {
  publicationForm: FormGroup;
  imagePreview: string | null = null;
  organizations: Organization[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  isEditMode = false;
  publicationId: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private publicationService: PublicationService,
    private organizationService: OrganizationService
  ) {
    this.publicationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      organizationId: ['', Validators.required],
      tags: [''],
      isPublic: [true],
      scheduledDate: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      maxVolunteers: ['', [Validators.required, Validators.min(1)]]
    });

    // Deshabilitar organizationId si no hay organizaciones
    this.organizationService.getOrganizations().subscribe(orgs => {
      if (orgs.length === 0) {
        this.publicationForm.get('organizationId')?.disable();
      } else {
        this.publicationForm.get('organizationId')?.enable();
      }
    });
  }

  ngOnInit() {
    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.publicationId = id;
        this.isEditMode = true;
        this.loadPublicationForEdit(id);
      }
    });
    
    this.loadOrganizations();
    console.log('NuevaPublicacionPageComponent initialized', { isEditMode: this.isEditMode, publicationId: this.publicationId });
  }

  private loadPublicationForEdit(id: string) {
    this.loading = true;
    this.publicationService.getPublicationById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (publication: Publication) => {
          console.log('Publicación cargada para editar:', publication);
          
          // Cargar imagen si existe
          if (publication.image) {
            this.imagePreview = publication.image;
          }
          
          // Llenar el formulario con los datos de la publicación
          this.publicationForm.patchValue({
            title: publication.title,
            description: publication.description,
            organizationId: publication.organizationId,
            tags: publication.tags.join(', '),
            isPublic: publication.isPublished(),
            scheduledDate: publication.date ? new Date(publication.date) : null,
            time: publication.time,
            location: publication.location,
            maxVolunteers: publication.maxVolunteers
          });
          
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Error al cargar la publicación: ' + (error.message || 'Error desconocido');
          this.loading = false;
          console.error('Error loading publication for edit:', error);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrganizations() {
    this.loading = true;
    this.error = null;
    this.organizationService.getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organizations: Organization[]) => {
          console.log('Organizaciones cargadas:', organizations);
          this.organizations = organizations;
          this.loading = false;
          
          // Habilitar/deshabilitar el campo según haya organizaciones
          if (organizations.length === 0) {
            this.error = 'No hay organizaciones disponibles. Por favor crea una organización primero.';
            this.publicationForm.get('organizationId')?.disable();
          } else {
            this.publicationForm.get('organizationId')?.enable();
            // Si hay solo una organización, seleccionarla automáticamente
            if (organizations.length === 1) {
              this.publicationForm.patchValue({ organizationId: organizations[0].id });
            }
          }
        },
        error: (error: any) => {
          this.error = 'Error al cargar las organizaciones: ' + (error.message || 'Error desconocido');
          this.loading = false;
          this.publicationForm.get('organizationId')?.disable();
          console.error('Error loading organizations:', error);
          console.error('Error completo:', JSON.stringify(error, null, 2));
        }
      });
  }

  selectImage() {
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
  }

  onSubmit() {
    console.log('=== INTENTO DE CREAR PUBLICACIÓN ===');
    console.log('Formulario válido:', this.publicationForm.valid);
    console.log('Formulario completo:', this.publicationForm);
    console.log('Valores del formulario:', this.publicationForm.value);
    console.log('Errores del formulario:', this.getFormErrors());
    console.log('Estado submitting:', this.submitting);
    console.log('Organizaciones disponibles:', this.organizations.length);
    
    // Si el campo organizationId está deshabilitado, habilitarlo temporalmente para validar
    const orgControl = this.publicationForm.get('organizationId');
    if (orgControl?.disabled) {
      orgControl.enable();
    }
    
    if (this.publicationForm.valid && !this.submitting) {
      this.submitting = true;
      this.error = null;

      const formData = this.publicationForm.value;
      
      // Validar que organizationId no esté vacío
      if (!formData.organizationId) {
        this.error = 'Por favor selecciona una organización';
        this.submitting = false;
        this.publicationForm.get('organizationId')?.markAsTouched();
        return;
      }

      // Preparar fecha en formato YYYY-MM-DD
      let scheduledDateStr = '';
      if (formData.scheduledDate) {
        const scheduledDate = new Date(formData.scheduledDate);
        scheduledDateStr = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (!this.isEditMode) {
        scheduledDateStr = new Date().toISOString().split('T')[0];
      }

      // Preparar fecha y hora correctamente
      let dateStr = '';
      let timeStr = formData.time || '';
      
      if (formData.scheduledDate) {
        // Si es un objeto Date, convertirlo a string YYYY-MM-DD
        if (formData.scheduledDate instanceof Date) {
          dateStr = formData.scheduledDate.toISOString().split('T')[0];
        } else if (typeof formData.scheduledDate === 'string') {
          // Si ya es string, verificar formato
          if (formData.scheduledDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dateStr = formData.scheduledDate;
          } else if (formData.scheduledDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            // Convertir DD/MM/YYYY a YYYY-MM-DD
            const [day, month, year] = formData.scheduledDate.split('/');
            dateStr = `${year}-${month}-${day}`;
          } else {
            // Intentar parsear como ISO
            try {
              const dateObj = new Date(formData.scheduledDate);
              dateStr = dateObj.toISOString().split('T')[0];
            } catch (e) {
              console.warn('Error parsing date:', formData.scheduledDate);
            }
          }
        }
      } else if (!this.isEditMode) {
        // Si no hay fecha y es creación nueva, usar fecha actual
        dateStr = new Date().toISOString().split('T')[0];
      }

      const publicationData: any = {
        title: formData.title,
        description: formData.description,
        organizationId: formData.organizationId,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : [],
        image: this.imagePreview || '/assets/img-ecologico.png',
        date: dateStr, // Para el servicio, usar 'date' que luego se convertirá a scheduledDate
        time: timeStr, // Para el servicio, usar 'time' que luego se convertirá a scheduledTime
        location: formData.location,
        maxVolunteers: parseInt(formData.maxVolunteers) || 0,
        currentVolunteers: 0, // Iniciar en 0 para nuevas publicaciones
        updatedAt: new Date().toISOString()
      };

      // Solo agregar estos campos si es creación nueva
      if (!this.isEditMode) {
        publicationData.status = 'published';
        publicationData.likes = 0;
        publicationData.createdAt = new Date().toISOString();
      } else {
        // En modo edición, mantener el status actual si no se especifica
        publicationData.status = formData.status || 'published';
      }
      
      console.log('Publication data prepared:', {
        dateStr,
        timeStr,
        scheduledDate: formData.scheduledDate,
        time: formData.time,
        publicationData
      });

      console.log('Datos de publicación a enviar:', publicationData);

      if (this.isEditMode && this.publicationId) {
        // Modo edición
        this.publicationService.updatePublication(this.publicationId, publicationData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updatedPublication) => {
              console.log('Publicación actualizada exitosamente:', updatedPublication);
              this.submitting = false;
              alert('Publicación actualizada exitosamente');
              this.router.navigate(['/dashboard']);
            },
            error: (error: any) => {
              this.error = 'Error al actualizar la publicación: ' + (error.message || 'Error desconocido');
              this.submitting = false;
              console.error('Error updating publication:', error);
              console.error('Error completo:', JSON.stringify(error, null, 2));
              alert('Error al actualizar la publicación: ' + (error.message || 'Error desconocido'));
            }
          });
      } else {
        // Modo creación
        this.publicationService.createPublication(publicationData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (newPublication) => {
              console.log('Publicación creada exitosamente:', newPublication);
              this.submitting = false;
              alert('Publicación creada exitosamente');
              this.router.navigate(['/dashboard']);
            },
            error: (error: any) => {
              this.error = 'Error al crear la publicación: ' + (error.message || 'Error desconocido');
              this.submitting = false;
              console.error('Error creating publication:', error);
              console.error('Error completo:', JSON.stringify(error, null, 2));
              alert('Error al crear la publicación: ' + (error.message || 'Error desconocido'));
            }
          });
      }
    } else {
      console.log('Formulario inválido, marcando campos como tocados');
      this.publicationForm.markAllAsTouched();
      
      // Mostrar errores específicos
      const errors = this.getFormErrors();
      if (errors.length > 0) {
        this.error = 'Por favor completa todos los campos requeridos: ' + errors.join(', ');
      } else {
        this.error = 'Por favor completa todos los campos requeridos';
      }
    }
  }

  getFormErrors(): string[] {
    const errors: string[] = [];
    const controls = this.publicationForm.controls;
    
    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control && control.invalid && control.touched) {
        if (control.errors?.['required']) {
          errors.push(key === 'title' ? 'Título' : key === 'description' ? 'Descripción' : key === 'organizationId' ? 'Organización' : key);
        } else if (control.errors?.['minlength']) {
          errors.push(`${key === 'title' ? 'Título' : 'Descripción'} debe tener más caracteres`);
        }
      }
    });
    
    return errors;
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }

  get isFormValid(): boolean {
    // Si organizationId está deshabilitado, habilitarlo temporalmente para verificar validez
    const orgControl = this.publicationForm.get('organizationId');
    const wasDisabled = orgControl?.disabled;
    if (wasDisabled && orgControl?.value) {
      orgControl.enable({ emitEvent: false });
    }
    const isValid = this.publicationForm.valid && !this.submitting;
    if (wasDisabled) {
      orgControl?.disable({ emitEvent: false });
    }
    return isValid;
  }

  retry() {
    this.loadOrganizations();
  }
}

