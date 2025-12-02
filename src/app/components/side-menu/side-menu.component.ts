import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideMenuHeaderComponent } from './side-menu-header/side-menu-header.component';
import { SideMenuOptionsComponent } from './side-menu-options/side-menu-options.component';
import { AuthService } from '../../auth/application/services/auth.service';
import { LanguageSwitcherComponent } from '../../shared/presentation/components/language-switcher/language-switcher.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'side-menu',
  imports: [CommonModule, SideMenuHeaderComponent, SideMenuOptionsComponent, LanguageSwitcherComponent, TranslatePipe],
  templateUrl: './side-menu.component.html',
})
export class SideMenuComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isVolunteer(): boolean {
    return this.authService.isVolunteer();
  }

  isOrganization(): boolean {
    return this.authService.isOrganization();
  }

  onLogout() {
    // Note: Using hardcoded text for confirm dialog - could be improved with translation service
    if (confirm('¿Estás seguro de que deseas salir?')) {
      // Usar AuthService para cerrar sesión
      this.authService.logout();
      
      console.log('Usuario ha cerrado sesión');
      
      // Redirigir a la página de login
      this.router.navigate(['/login']);
    }
  }
}
