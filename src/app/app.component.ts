import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SideMenuComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Volunpath';
  showSidebar = false; // Iniciar en false para que no aparezca por defecto

  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    // Inicializar el servicio de traducción
    this.translate.setDefaultLang('es');
    const savedLang = localStorage.getItem('selectedLanguage') || 'es';
    this.translate.use(savedLang);
  }

  ngOnInit() {
    // Verificar la ruta actual inmediatamente
    this.updateSidebarVisibility();
    
    // Suscribirse a cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSidebarVisibility();
      });
  }

  private updateSidebarVisibility() {
    const url = this.router.url || window.location.pathname;
    // Ocultar sidebar en la página de login y registro
    const isAuthPage = url === '/login' || url.includes('/login') || url === '/register' || url.includes('/register');
    this.showSidebar = !isAuthPage;
  }
}
