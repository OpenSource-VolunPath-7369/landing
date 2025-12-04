import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { DashboardService } from '../../services/dashboard.service';
import { CommunityService } from '../../services/community.service';
import { Publication, Organization } from '../../interfaces';

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
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private communityService: CommunityService
  ) {
    this.publicationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      organizationId: ['', Validators.required],
      tags: [''],
      isPublic: [true],
      scheduledDate: ['']
    });
  }

  ngOnInit() {
    this.loadOrganizations();
    console.log('NuevaPublicacionPageComponent initialized');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrganizations() {
    this.loading = true;
    this.communityService.getOrganizations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (organizations) => {
          this.organizations = organizations;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar las organizaciones';
          this.loading = false;
          console.error('Error loading organizations:', error);
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
      // Crear preview de la imagen
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
    console.log('Formulario enviado');
    console.log('Formulario válido:', this.publicationForm.valid);
    console.log('Formulario valores:', this.publicationForm.value);
    console.log('Errores del formulario:', this.publicationForm.errors);
    
    if (this.publicationForm.valid && !this.submitting) {
      this.submitting = true;
      this.error = null;

      const formData = this.publicationForm.value;
      const publicationData: Partial<Publication> = {
        title: formData.title,
        description: formData.description,
        organizationId: formData.organizationId,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : [],
        status: 'published',
        likes: 0,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        image: this.imagePreview || '/assets/img-ecologico.png', // Default image
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Datos de publicación a enviar:', publicationData);

      this.dashboardService.createPublication(publicationData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newPublication) => {
            console.log('Publicación creada exitosamente:', newPublication);
            this.submitting = false;
            alert('Publicación creada exitosamente');
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.error = 'Error al crear la publicación: ' + (error.message || 'Error desconocido');
            this.submitting = false;
            console.error('Error creating publication:', error);
            alert('Error al crear la publicación. Revisa la consola para más detalles.');
          }
        });
    } else {
      console.log('Formulario inválido, marcando campos como tocados');
      // Marcar todos los campos como tocados para mostrar errores
      this.publicationForm.markAllAsTouched();
      
      // Mostrar errores específicos
      Object.keys(this.publicationForm.controls).forEach(key => {
        const control = this.publicationForm.get(key);
        if (control && control.invalid) {
          console.log(`Campo ${key} es inválido:`, control.errors);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
  }

  get isFormValid(): boolean {
    return this.publicationForm.valid && !this.submitting;
  }

  retry() {
    this.loadOrganizations();
  }
}
