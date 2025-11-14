import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../application/services/auth.service';
import { ApiService } from '../../../../shared/infrastructure/api.service';
import { User } from '../../../../interfaces';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export default class LoginPageComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  error: string | null = null;

  /**
   * Mapear roles del backend a roles del frontend
   */
  private mapBackendRoleToFrontendRole(roles: string[]): 'volunteer' | 'organization_admin' | 'admin' {
    if (roles.includes('ROLE_ADMIN')) {
      return 'admin';
    } else if (roles.includes('ROLE_ORGANIZATION_ADMIN')) {
      return 'organization_admin';
    } else {
      return 'volunteer';
    }
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Verificar si hay credenciales guardadas
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      this.loginForm.patchValue({
        username: savedUsername,
        rememberMe: true
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      const formData = this.loginForm.value;

      // Guardar usuario si "Recuérdame" está marcado
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      // Usar el endpoint de autenticación del backend Spring Boot
      const signInRequest = {
        username: formData.username,
        password: formData.password
      };

      this.apiService.post<any>('authentication/sign-in', signInRequest)
        .subscribe({
          next: (response) => {
            // Response del backend: { id, username, email, name, avatar, token, roles }
            console.log('Login exitoso:', response);
            console.log('Roles recibidos del backend:', response.roles);
            
            // Guardar token
            if (response.token) {
              localStorage.setItem('token', response.token);
            }
            
            // Mapear roles del backend al frontend
            const mappedRole = this.mapBackendRoleToFrontendRole(response.roles || []);
            console.log('Rol mapeado:', mappedRole);
            
            // Crear objeto User para el frontend
            const user: User = {
              id: String(response.id),
              name: response.name || response.username,
              email: response.email || formData.username,
              avatar: response.avatar || '/assets/mundo.png',
              role: mappedRole,
              joinedDate: new Date().toISOString(),
              bio: '',
              skills: [],
              location: ''
            };
            
            console.log('Usuario creado para login:', user);
            
            // Guardar sesión usando AuthService
            this.authService.login(user);
            this.loading = false;
            
            // Redirigir según el rol
            if (user.role === 'volunteer') {
              console.log('Redirigiendo a /comunidad (voluntario)');
              this.router.navigate(['/comunidad']);
            } else if (user.role === 'organization_admin') {
              console.log('Redirigiendo a /dashboard (organización)');
              this.router.navigate(['/dashboard']);
            } else {
              console.log('Redirigiendo a /dashboard (admin)');
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error: any) => {
            console.error('Error en login:', error);
            this.loading = false;
            this.error = error.error?.message || error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
      this.error = 'Por favor completa todos los campos correctamente';
    }
  }

  onForgotPassword(): void {
    // Implementar lógica de recuperación de contraseña
    alert('Funcionalidad de recuperación de contraseña próximamente');
  }

  onRegister(): void {
    // Redirigir a página de registro
    this.router.navigate(['/register']);
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '/assets/mundo.png';
      img.style.filter = 'brightness(0) invert(1)';
    }
  }
}

