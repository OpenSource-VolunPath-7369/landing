import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { OrganizationProfile } from '../../interfaces/organization.interface';
import { ProfileService } from '../../services/profile.service';
import { OrganizationService } from '../../organizations/application/services/organization.service';
import { VolunteerService } from '../../volunteers/application/services/volunteer.service';
import { AuthService } from '../../auth/application/services/auth.service';
import { ApiService } from '../../shared/infrastructure/api.service';
import { User } from '../../interfaces';
import { Organization } from '../../organizations/domain/model/organization';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './perfil-page.component.html',
  styleUrls: ['./perfil-page.component.css']
})
export default class PerfilPageComponent implements OnInit, OnDestroy {
  isEditing = false;
  profileForm!: FormGroup;
  originalProfile: OrganizationProfile;
  loading = false;
  
  // Usuario actual y detección de rol
  currentUser: User | null = null;
  isVolunteerMode = false;
  
  private destroy$ = new Subject<void>();
  
  profile: OrganizationProfile = {
    organization: {
      id: '',
      name: '',
      email: '',
      location: '',
      phone: '',
      type: ''
    },
    representative: {
      id: '',
      name: '',
      email: ''
    }
  };
  
  // Perfil de voluntario (mock)
  volunteerProfile: User = {
    id: '1',
    name: 'Alex C.',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=128&q=80',
    role: 'volunteer',
    joinedDate: '2024-01-15',
    bio: 'Voluntario comprometido con causas sociales y ambientales',
    skills: ['Comunicación', 'Trabajo en equipo', 'Organización', 'Liderazgo'],
    location: 'Lima, Perú'
  };

  organizationTypes = [
    'Organización Juvenil',
    'ONG',
    'Fundación',
    'Asociación Civil',
    'Cooperativa',
    'Otro'
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private organizationService: OrganizationService,
    private volunteerService: VolunteerService,
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.originalProfile = { ...this.profile };
  }

  ngOnInit() {
    console.log('PerfilPageComponent initialized');
    this.currentUser = this.authService.getCurrentUser();
    this.isVolunteerMode = this.authService.isVolunteer();
    
    console.log('Current user:', this.currentUser);
    console.log('Is volunteer mode:', this.isVolunteerMode);
    
    // Suscribirse a cambios del usuario para actualizar el perfil
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('User changed in profile page:', user);
        this.currentUser = user;
        this.isVolunteerMode = this.authService.isVolunteer();
        if (this.isVolunteerMode && user) {
          this.volunteerProfile = { ...user };
          console.log('Volunteer profile updated:', this.volunteerProfile);
          if (this.isEditing) {
            this.initializeVolunteerForm();
          }
        } else if (!this.isVolunteerMode && user) {
          // Si es organización y cambió el usuario, recargar el perfil
          this.loadProfile();
        }
      });
    
    if (this.isVolunteerMode) {
      // Si es voluntario, usar datos del usuario actual
      if (this.currentUser) {
        this.volunteerProfile = { ...this.currentUser };
        console.log('Volunteer profile loaded from current user:', this.volunteerProfile);
      } else {
        console.warn('No current user found for volunteer profile');
      }
      this.initializeVolunteerForm();
    } else {
      // Si es organización, cargar perfil de organización
      this.initializeForm();
      this.loadProfile();
    }
  }

  loadProfile() {
    if (!this.currentUser) {
      console.error('No current user found');
      this.snackBar.open('Error: No se encontró el usuario actual', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.loading = true;
    
    // Buscar la organización que corresponde al usuario actual
    this.organizationService.getOrganizations()
      .pipe(
        takeUntil(this.destroy$),
        map((organizations: Organization[]) => {
          // Buscar organización que corresponda al usuario actual
          // PRIORIDAD 1: Buscar por el nombre de la organización en el bio del usuario
          // El bio tiene formato "Organización: [nombre]"
          let userOrg: Organization | undefined = undefined;
          
          if (this.currentUser?.bio) {
            const userBio = this.currentUser.bio.toLowerCase().trim();
            // Extraer el nombre de la organización del bio
            const bioMatch = userBio.match(/organización:\s*(.+)/);
            if (bioMatch && bioMatch[1]) {
              const orgNameFromBio = bioMatch[1].trim().toLowerCase();
              console.log('Nombre de organización extraído del bio:', orgNameFromBio);
              
              // PRIORIDAD MÁXIMA: Buscar organización que coincida EXACTAMENTE con el nombre del bio
              userOrg = organizations.find((org: Organization) => {
                const orgName = org.name.toLowerCase().trim();
                // Coincidencia exacta primero
                if (orgName === orgNameFromBio) {
                  return true;
                }
                // Si no hay coincidencia exacta, verificar si el nombre del bio está contenido en el nombre de la organización
                // o viceversa, pero solo si ambos tienen al menos 3 caracteres
                if (orgNameFromBio.length >= 3 && orgName.length >= 3) {
                  return orgName.includes(orgNameFromBio) || orgNameFromBio.includes(orgName);
                }
                return false;
              });
              
              if (userOrg) {
                console.log('Organización encontrada por bio (coincidencia exacta o parcial):', userOrg.name, 'ID:', userOrg.id);
              } else {
                console.log('No se encontró organización con el nombre del bio:', orgNameFromBio);
                console.log('Organizaciones disponibles:', organizations.map(o => ({ name: o.name, id: o.id, email: o.email })));
              }
            }
          }
          
          // PRIORIDAD 2: Buscar por email exacto (solo si no encontramos por bio)
          // El email de la organización debe coincidir con el email del representante/usuario
          if (!userOrg) {
            const userEmail = this.currentUser?.email.toLowerCase().trim() || '';
            userOrg = organizations.find((org: Organization) => {
              const orgEmail = org.email.toLowerCase().trim();
              const exactMatch = orgEmail === userEmail;
              if (exactMatch) {
                console.log('Coincidencia de email exacto:', orgEmail, '===', userEmail);
              }
              return exactMatch;
            });
            if (userOrg) {
              console.log('Organización encontrada por email exacto:', userOrg.name, 'ID:', userOrg.id);
            } else {
              console.log('No se encontró organización por email exacto. Email del usuario:', this.currentUser?.email);
              console.log('Emails de organizaciones disponibles:', organizations.map(o => ({ name: o.name, email: o.email })));
            }
          }
          
          // NO usar búsquedas parciales para evitar coincidencias incorrectas
          // Solo usar coincidencias exactas por nombre (del bio) o email
          
          console.log('=== RESUMEN DE BÚSQUEDA ===');
          console.log('Usuario actual:', {
            name: this.currentUser?.name,
            email: this.currentUser?.email,
            bio: this.currentUser?.bio,
            id: this.currentUser?.id
          });
          console.log('Organización encontrada:', userOrg ? {
            name: userOrg.name,
            id: userOrg.id,
            email: userOrg.email
          } : 'NINGUNA');
          console.log('Total organizaciones disponibles:', organizations.length);
          console.log('Lista completa de organizaciones:', organizations.map(o => ({
            name: o.name,
            id: o.id,
            email: o.email
          })));
          
          if (!userOrg) {
            console.error('ERROR: No se encontró ninguna organización para el usuario actual');
          }
          
          return userOrg;
        }),
        switchMap((userOrg: Organization | undefined) => {
          if (!userOrg) {
            // Si no se encuentra la organización, crear un perfil temporal con los datos del usuario
            // Esto permite que el usuario vea y edite su información mientras se crea la organización
            const tempProfile: OrganizationProfile = {
              organization: {
                id: '',
                name: this.currentUser?.bio?.replace(/organización:\s*/i, '').trim() || 'Mi Organización',
                email: this.currentUser?.email || '',
                location: this.currentUser?.location || '',
                phone: '',
                type: '',
                logo: this.currentUser?.avatar || '' // Usar el avatar del usuario como logo temporal
              },
              representative: {
                id: this.currentUser?.id || '',
                name: this.currentUser?.name || '',
                email: this.currentUser?.email || ''
              }
            };
            
            console.warn('⚠️ No se encontró la organización en la base de datos. Usando perfil temporal.');
            console.warn('Esto puede significar que la organización no se creó correctamente durante el registro.');
            console.warn('Nombre esperado del bio:', this.currentUser?.bio);
            
            return of(tempProfile);
          }
          
          // Usar el ID directamente como string (puede ser numérico o alfanumérico)
          const organizationId = userOrg.id;
          // Obtener el logo de la organización encontrada
          const orgLogo = userOrg.logo || this.currentUser?.avatar || '';
          
          return this.profileService.getProfile(organizationId).pipe(
            map((profile: OrganizationProfile) => {
              // Actualizar el nombre del representante con el nombre del usuario actual
              profile.representative.name = this.currentUser?.name || profile.representative.name;
              profile.representative.email = this.currentUser?.email || profile.representative.email;
              // Asegurar que el logo esté presente: usar el del perfil, o el de la organización encontrada, o el avatar del usuario
              if (!profile.organization.logo) {
                profile.organization.logo = orgLogo;
              }
              return profile;
            })
          );
        })
      )
      .subscribe({
        next: (profile) => {
          // Si el perfil tiene ID vacío, significa que no se encontró la organización
          if (!profile.organization.id) {
            console.warn('⚠️ Mostrando perfil temporal porque la organización no existe en la base de datos');
            this.snackBar.open(
              'Tu organización no se encontró en la base de datos. Por favor, contacta al administrador o regístrate nuevamente.',
              'Cerrar',
              { duration: 8000 }
            );
          }
          
          this.profile = profile;
          this.originalProfile = { ...profile };
          this.initializeForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.snackBar.open('Error al cargar el perfil: ' + (error.message || 'Error desconocido'), 'Cerrar', {
            duration: 5000
          });
          this.loading = false;
        }
      });
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      organizationName: [this.profile.organization.name, [Validators.required, Validators.minLength(3)]],
      organizationEmail: [this.profile.organization.email, [Validators.required, Validators.email]],
      organizationLocation: [this.profile.organization.location, [Validators.required]],
      organizationPhone: [this.profile.organization.phone, [Validators.required]],
      organizationType: [this.profile.organization.type, [Validators.required]],
      representativeName: [this.profile.representative.name, [Validators.required, Validators.minLength(3)]],
      representativeEmail: [this.profile.representative.email, [Validators.required, Validators.email]]
    });
  }

  initializeVolunteerForm() {
    this.profileForm = this.fb.group({
      name: [this.volunteerProfile.name, [Validators.required, Validators.minLength(3)]],
      email: [this.volunteerProfile.email, [Validators.required, Validators.email]],
      location: [this.volunteerProfile.location, [Validators.required]],
      bio: [this.volunteerProfile.bio, [Validators.maxLength(500)]],
      skills: [this.volunteerProfile.skills.join(', '), []]
    });
  }

  onUpdatePassword() {
    console.log('Actualizar contraseña');
    // TODO: Implementar funcionalidad de cambio de contraseña
  }

  onEditProfile() {
    this.isEditing = true;
    console.log('Modo de edición activado');
  }

  onSaveProfile() {
    if (this.profileForm.valid && !this.loading) {
      this.loading = true;
      
      if (this.isVolunteerMode) {
        // Guardar perfil de voluntario
        const skillsArray = this.profileForm.value.skills
          ? this.profileForm.value.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
          : [];
        
        const updatedVolunteer: User = {
          ...this.volunteerProfile,
          name: this.profileForm.value.name,
          email: this.profileForm.value.email,
          location: this.profileForm.value.location,
          bio: this.profileForm.value.bio || '',
          skills: skillsArray
        };
        
        // Actualizar en el backend usando el servicio de voluntarios
        if (this.currentUser?.id) {
          // Primero obtener el voluntario por userId para obtener su ID
          this.apiService.get<any>(`volunteers/user/${this.currentUser.id}`)
            .pipe(
              switchMap((volunteer: any) => {
                if (!volunteer || !volunteer.id) {
                  throw new Error('No se encontró el perfil de voluntario');
                }
                
                // Preparar datos para actualizar
                const updateData = {
                  name: updatedVolunteer.name,
                  email: updatedVolunteer.email,
                  avatar: updatedVolunteer.avatar,
                  bio: updatedVolunteer.bio,
                  location: updatedVolunteer.location,
                  skills: updatedVolunteer.skills || []
                };
                
                // Actualizar usando el servicio de voluntarios
                return this.volunteerService.updateVolunteer(String(volunteer.id), updateData);
              })
            )
            .subscribe({
              next: (savedVolunteer) => {
                // Actualizar perfil local
                this.volunteerProfile = { ...updatedVolunteer };
                // Actualizar usuario en sesión
                this.authService.login(updatedVolunteer);
                // Actualizar currentUser
                this.currentUser = { ...updatedVolunteer };
                
                this.isEditing = false;
                this.loading = false;
                
                this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
                  duration: 3000
                });
              },
              error: (error) => {
                console.error('Error updating volunteer profile:', error);
                this.snackBar.open('Error al actualizar el perfil: ' + (error.error?.message || error.message || 'Error desconocido'), 'Cerrar', {
                  duration: 5000
                });
                this.loading = false;
              }
            });
        } else {
          // Si no hay ID, solo actualizar localmente
          this.volunteerProfile = updatedVolunteer;
          this.authService.login(updatedVolunteer);
          this.isEditing = false;
          this.loading = false;
          this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
            duration: 3000
          });
        }
      } else {
        // Guardar perfil de organización
        // Usar el ID directamente como string (puede ser numérico o alfanumérico)
        const organizationId = this.profile.organization.id;
        const userId = this.currentUser?.id;
        const currentLogo = this.profile.organization.logo || this.currentUser?.avatar || '';
        
        const updateData = {
          organizationName: this.profileForm.value.organizationName,
          organizationEmail: this.profileForm.value.organizationEmail,
          organizationLocation: this.profileForm.value.organizationLocation,
          organizationPhone: this.profileForm.value.organizationPhone,
          organizationType: this.profileForm.value.organizationType,
          representativeName: this.profileForm.value.representativeName,
          representativeEmail: this.profileForm.value.representativeEmail
        };
        
        console.log('Actualizando perfil de organización:', {
          organizationId,
          userId,
          currentLogo,
          updateData
        });
        
        this.profileService.updateProfile(organizationId, updateData, userId, currentLogo).subscribe({
          next: (updatedProfile) => {
            console.log('Perfil actualizado exitosamente:', updatedProfile);
            
            // Actualizar el perfil local
            this.profile = updatedProfile;
            this.originalProfile = { ...updatedProfile };
            
            // Actualizar el usuario en sesión si cambió el nombre o email
            if (this.currentUser) {
              const updatedUser: User = {
                ...this.currentUser,
                name: updateData.representativeName,
                email: updateData.representativeEmail,
                location: updateData.organizationLocation,
                bio: `Organización: ${updateData.organizationName}`,
                avatar: updatedProfile.organization.logo || this.currentUser.avatar || '' // Preservar el logo/avatar
              };
              this.authService.login(updatedUser);
              this.currentUser = updatedUser;
            }
            
            // Recargar las organizaciones para que se actualicen en otros componentes
            this.organizationService.refreshOrganizations();
            
            // Actualizar el formulario con los nuevos valores
            this.initializeForm();
            
            this.isEditing = false;
            this.loading = false;
            
            this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.snackBar.open('Error al actualizar el perfil: ' + (error.message || 'Error desconocido'), 'Cerrar', {
              duration: 5000
            });
            this.loading = false;
          }
        });
      }
    } else {
      this.profileForm.markAllAsTouched();
      console.log('Formulario inválido');
    }
  }

  onCancelEdit() {
    this.isEditing = false;
    this.profileForm.reset();
    if (this.isVolunteerMode) {
      this.initializeVolunteerForm();
    } else {
    this.initializeForm();
    }
    console.log('Edición cancelada');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}