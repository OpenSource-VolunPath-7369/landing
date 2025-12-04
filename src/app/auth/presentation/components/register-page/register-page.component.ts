import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../application/services/auth.service';
import { VolunteerService } from '../../../../volunteers/application/services/volunteer.service';
import { ApiService } from '../../../../shared/infrastructure/api.service';
import { OrganizationService } from '../../../../organizations/application/services/organization.service';
import { Organization } from '../../../../organizations/domain/model/organization';
import { User } from '../../../../interfaces';
import { of } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatSelectModule,
    TranslatePipe
  ],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export default class RegisterPageComponent {
  registerForm!: FormGroup;
  userType: 'volunteer' | 'organization' = 'volunteer';
  selectedImage: string | null = null;
  imageFile: File | null = null;
  imageLoading = false;
  
  organizationTypes = [
    'ONG',
    'Organización Social',
    'Organización Juvenil',
    'Organización Voluntariado'
  ];


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private volunteerService: VolunteerService,
    private apiService: ApiService,
    private organizationService: OrganizationService
  ) {
    this.initializeForm();
  }

  initializeForm() {
    if (this.userType === 'volunteer') {
      this.registerForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        location: ['', Validators.required],
        bio: ['', Validators.maxLength(500)],
        skills: ['']
      }, { validators: this.passwordMatchValidator });
    } else {
      this.registerForm = this.fb.group({
        organizationName: ['', [Validators.required, Validators.minLength(3)]],
        organizationType: ['', Validators.required],
        district: ['', Validators.required],
        organizationEmail: ['', [Validators.required, Validators.email]],
        organizationPhone: ['', Validators.required],
        representativeName: ['', [Validators.required, Validators.minLength(3)]],
        representativeEmail: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      }, { validators: this.passwordMatchValidator });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onUserTypeChange() {
    this.initializeForm();
    this.selectedImage = null;
    this.imageFile = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        alert('Por favor selecciona una imagen válida (JPG, PNG, GIF o WEBP)');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe exceder 5MB');
        return;
      }
      
      this.imageLoading = true;
      this.imageFile = file;
      
      // Comprimir y redimensionar la imagen antes de convertir a base64
      this.compressImage(file).then(compressedBase64 => {
        this.selectedImage = compressedBase64;
        this.imageLoading = false;
      }).catch(error => {
        console.error('Error comprimiendo imagen:', error);
        // Fallback: usar la imagen original sin comprimir
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          this.selectedImage = e.target?.result as string;
          this.imageLoading = false;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionar a máximo 400x400px para reducir el tamaño
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Crear canvas para redimensionar y comprimir
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con compresión (calidad 0.8 para reducir tamaño)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imageFile = null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      if (this.userType === 'volunteer') {
        this.registerVolunteer();
      } else {
        this.registerOrganization();
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  registerVolunteer(): void {
    const formData = this.registerForm.value;
    const skillsArray = formData.skills
      ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
      : [];

    // Usar la imagen seleccionada o una por defecto
    const avatar = this.selectedImage || '/assets/mundo.png';

    // Crear usuario en el backend usando el endpoint de autenticación
    const signUpRequest = {
      username: formData.email, // Usar email como username
      email: formData.email,
      password: formData.password, // El backend lo hasheará
      name: formData.name,
      avatar: avatar,
      roles: ['ROLE_VOLUNTEER']
    };

    this.apiService.post<any>('authentication/sign-up', signUpRequest)
      .pipe(
        switchMap((userResponse) => {
          // El backend ahora crea automáticamente el registro de voluntario cuando se crea el usuario
          // Solo intentar crear/actualizar el voluntario si el backend no lo creó automáticamente
          // Primero verificar si el voluntario ya existe
          return this.apiService.get<any>(`volunteers/user/${userResponse.id}`).pipe(
            switchMap((existingVolunteer) => {
              // Si el voluntario ya existe (creado automáticamente por el backend), actualizarlo con datos adicionales
              if (existingVolunteer) {
                const updateData = {
                  bio: formData.bio || 'Voluntario comprometido con causas sociales y ambientales',
                  location: formData.location,
                  skills: skillsArray
                };
                return this.apiService.put<any>(`volunteers/${existingVolunteer.id}`, updateData).pipe(
                  map(() => userResponse)
                );
              } else {
                // Si no existe, crearlo (caso raro, pero por si acaso)
                const volunteerData = {
                  name: formData.name,
                  email: formData.email,
                  avatar: avatar,
                  bio: formData.bio || 'Voluntario comprometido con causas sociales y ambientales',
                  location: formData.location,
                  userId: userResponse.id,
                  skills: skillsArray
                };
                return this.apiService.post<any>('volunteers', volunteerData).pipe(
                  catchError((error) => {
                    // Si falla porque ya existe (creado entre tanto), ignorar el error
                    if (error.error?.message?.includes('already exists')) {
                      console.log('Volunteer already exists, continuing with registration');
                      return of(userResponse);
                    }
                    throw error;
                  }),
                  map(() => userResponse)
                );
              }
            }),
            catchError((error) => {
              // Si no se puede obtener el voluntario, intentar crearlo
              if (error.status === 404) {
                const volunteerData = {
                  name: formData.name,
                  email: formData.email,
                  avatar: avatar,
                  bio: formData.bio || 'Voluntario comprometido con causas sociales y ambientales',
                  location: formData.location,
                  userId: userResponse.id,
                  skills: skillsArray
                };
                return this.apiService.post<any>('volunteers', volunteerData).pipe(
                  catchError((createError) => {
                    // Si falla porque ya existe, ignorar el error y continuar
                    if (createError.error?.message?.includes('already exists')) {
                      console.log('Volunteer already exists, continuing with registration');
                      return of(userResponse);
                    }
                    throw createError;
                  }),
                  map(() => userResponse)
                );
              }
              // Si es otro error, ignorarlo y continuar (el backend ya creó el voluntario)
              console.warn('Error checking/creating volunteer, but continuing with registration:', error);
              return of(userResponse);
            })
          );
        }),
        catchError((error) => {
          console.error('Error en registro:', error);
          throw error;
        })
      )
      .subscribe({
        next: (userResponse) => {
            // Mapear roles del backend al frontend
            const roles = userResponse.roles || ['ROLE_VOLUNTEER'];
            const mappedRole = roles.includes('ROLE_ADMIN') ? 'admin' :
                              roles.includes('ROLE_ORGANIZATION_ADMIN') ? 'organization_admin' :
                              'volunteer';
            
            // Crear objeto User para el frontend
            const volunteerUser: User = {
              id: String(userResponse.id),
              name: userResponse.name || formData.name,
              email: userResponse.email || formData.email,
              avatar: userResponse.avatar || avatar,
              role: mappedRole,
              joinedDate: new Date().toISOString(),
              bio: formData.bio || '',
              skills: skillsArray,
              location: formData.location
            };

            console.log('Usuario voluntario creado:', volunteerUser);
            
            // Guardar usuario usando AuthService
            this.authService.login(volunteerUser);
            
            alert('¡Registro exitoso! Bienvenido a Volunpath');
            
            // Redirigir según el rol
            if (volunteerUser.role === 'volunteer') {
              this.router.navigate(['/comunidad']);
            } else {
              this.router.navigate(['/dashboard']);
            }
        },
        error: (error: any) => {
          console.error('Error registering volunteer:', error);
          alert(error.error?.message || error.message || 'Error al registrarse. Por favor intenta nuevamente.');
        }
      });
  }

  registerOrganization(): void {
    const formData = this.registerForm.value;
    
    // Usar la imagen seleccionada o una por defecto
    const avatar = this.selectedImage || '/assets/mundo.png';
    
    // Crear usuario en el backend usando el endpoint de autenticación
    const signUpRequest = {
      username: formData.representativeEmail, // Usar email como username
      email: formData.representativeEmail,
      password: formData.password, // El backend lo hasheará
      name: formData.representativeName,
      avatar: avatar,
      roles: ['ROLE_ORGANIZATION_ADMIN']
    };

    // Guardar organización en el backend (como usuario primero)
    this.apiService.post<any>('authentication/sign-up', signUpRequest).pipe(
      switchMap((createdUser: any) => {
        // Convertir a User para AuthService
        const organizationUser = {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          avatar: createdUser.avatar,
          role: createdUser.role,
          joinedDate: createdUser.joinedDate,
          bio: createdUser.bio,
          skills: createdUser.skills || [],
          location: createdUser.location
        };

        // Crear la organización en el backend
        const organizationData = {
          name: formData.organizationName,
          email: formData.representativeEmail,
          logo: avatar,
          description: `Organización: ${formData.organizationName}`,
          website: '',
          phone: formData.organizationPhone || '',
          address: formData.district,
          foundedYear: new Date().getFullYear(),
          userId: createdUser.id,
          categories: formData.organizationType ? [formData.organizationType] : [],
          socialMedia: {}
        };
        
        return this.apiService.post<any>('organizations', organizationData).pipe(
          map((createdOrg: any) => {
            console.log('✅ Organización creada exitosamente:', {
              id: createdOrg.id,
              name: createdOrg.name,
              email: createdOrg.email
            });
            
            // Mapear roles del backend al frontend
            const roles = createdUser.roles || ['ROLE_ORGANIZATION_ADMIN'];
            const mappedRole = roles.includes('ROLE_ADMIN') ? 'admin' :
                              roles.includes('ROLE_ORGANIZATION_ADMIN') ? 'organization_admin' :
                              'volunteer';
            
            // Crear objeto User para el frontend
            const orgUser: User = {
              id: String(createdUser.id),
              name: createdUser.name || formData.representativeName,
              email: createdUser.email || formData.representativeEmail,
              avatar: createdUser.avatar || avatar,
              role: mappedRole,
              joinedDate: new Date().toISOString(),
              bio: `Organización: ${formData.organizationName}`,
              skills: [],
              location: formData.district
            };
            
            console.log('Usuario organización creado:', orgUser);
            
            // Guardar usuario usando AuthService
            this.authService.login(orgUser);
            
            alert('¡Registro exitoso! Tu organización "' + createdOrg.name + '" ha sido registrada correctamente.');
            
            // Redirigir según el rol
            if (orgUser.role === 'volunteer') {
              this.router.navigate(['/comunidad']);
            } else {
              this.router.navigate(['/dashboard']);
            }
            
            return createdOrg;
          }),
          catchError((orgError: any) => {
            console.error('❌ Error al crear la organización:', orgError);
            throw orgError;
          })
        );
      }),
      catchError((userError: any) => {
        console.error('❌ Error al crear el usuario:', userError);
        throw userError;
      })
    )
    .subscribe({
      error: (error: any) => {
        console.error('Error registering organization:', error);
        alert(error.error?.message || error.message || 'Error al registrarse. Por favor intenta nuevamente.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/login']);
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '/assets/mundo.png';
    }
  }
}


