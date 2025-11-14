import { Component } from '@angular/core';
import { RouterLink,RouterLinkActive} from "@angular/router";
import { AuthService } from '../../../auth/application/services/auth.service';


interface MenuOption {
  icon: string;
  label: string;
  subLabel: string;
  route: string;
  organizationOnly?: boolean; // Opcional: solo para organizaciones
}

@Component({
  selector: 'side-menu-options',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu-options.component.html',
})
export class SideMenuOptionsComponent {
  constructor(private authService: AuthService) {}

  isVolunteer(): boolean {
    return this.authService.isVolunteer();
  }

  private allMenuOptions: MenuOption[] = [
    {
      icon: 'fa-solid fa-user-group',
      label: 'Comunidad',
      subLabel: 'Explora la comunidad',
      route: '/comunidad'
    },
    {
      icon: 'fa-solid fa-chart-line',
      label: 'dashboard',
      subLabel: 'Gestiona tu organización',
      route: 'dashboard',
      organizationOnly: true // Solo para organizaciones
    },
    {
      icon: 'fa-solid fa-message',
      label: 'Mensajes',
      subLabel: 'Recibe y envía mensajes',
      route: 'mensajes'
    },
    {
      icon: 'fa-solid fa-bell',
      label: 'Notificaciones',
      subLabel: 'Recibe notificaciones',
      route: 'notificaciones'
    },
    {
      icon: 'fa-solid fa-user',
      label: 'Perfil',
      subLabel: 'Configura tu perfil',
      route: 'perfil'
    },
    {
      icon: 'fa-solid fa-question',
      label: 'Ayuda y Soporte',
      subLabel: 'Resuelve tus dudas',
      route: 'soporte'
    }
  ];

  get menuOptions(): MenuOption[] {
    if (this.isVolunteer()) {
      // Filtrar opciones que son solo para organizaciones
      return this.allMenuOptions.filter(option => !option.organizationOnly);
    }
    return this.allMenuOptions;
  }
}
