import { Component } from '@angular/core';
import { RouterLink,RouterLinkActive} from "@angular/router";
import { AuthService } from '../../../auth/application/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';


interface MenuOption {
  icon: string;
  labelKey: string;
  subLabelKey: string;
  route: string;
  organizationOnly?: boolean; // Opcional: solo para organizaciones
}

@Component({
  selector: 'side-menu-options',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
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
      labelKey: 'menu.community',
      subLabelKey: 'community.explore',
      route: '/comunidad'
    },
    {
      icon: 'fa-solid fa-chart-line',
      labelKey: 'menu.dashboard',
      subLabelKey: 'menu.manageOrganization',
      route: 'dashboard',
      organizationOnly: true // Solo para organizaciones
    },
    {
      icon: 'fa-solid fa-message',
      labelKey: 'menu.messages',
      subLabelKey: 'menu.receiveSendMessages',
      route: 'mensajes'
    },
    {
      icon: 'fa-solid fa-bell',
      labelKey: 'menu.notifications',
      subLabelKey: 'menu.receiveNotifications',
      route: 'notificaciones'
    },
    {
      icon: 'fa-solid fa-user',
      labelKey: 'menu.profile',
      subLabelKey: 'menu.configureProfile',
      route: 'perfil'
    },
    {
      icon: 'fa-solid fa-question',
      labelKey: 'menu.support',
      subLabelKey: 'menu.resolveDoubts',
      route: 'soporte'
    }
  ];

  get menuOptions(): MenuOption[] {
    let options = this.allMenuOptions;
    
    if (this.isVolunteer()) {
      // Filtrar opciones que son solo para organizaciones
      options = options.filter(option => !option.organizationOnly);
    }
    
    // Ocultar Perfil
    options = options.filter(option => option.route !== 'perfil');
    
    return options;
  }
}
