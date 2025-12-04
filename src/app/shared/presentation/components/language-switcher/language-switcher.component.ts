import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcherComponent implements OnInit {
  currentLang = 'es';
  languages = ['es', 'en'];

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Cargar idioma guardado o usar el idioma actual del servicio
    const savedLang = localStorage.getItem('selectedLanguage');
    const currentLangFromService = this.translate.getCurrentLang();
    
    if (savedLang && savedLang !== currentLangFromService) {
      this.translate.use(savedLang);
      this.currentLang = savedLang;
    } else if (currentLangFromService) {
      this.currentLang = currentLangFromService;
    } else {
      this.translate.setDefaultLang('es');
      this.currentLang = 'es';
    }
  }

  useLanguage(language: string) {
    if (language && language !== this.currentLang) {
      console.log('Changing language to:', language);
      this.translate.use(language).subscribe({
        next: () => {
          this.currentLang = language;
          localStorage.setItem('selectedLanguage', language);
          console.log('Language changed successfully to:', language);
        },
        error: (error) => {
          console.error('Error changing language:', error);
        }
      });
    }
  }
}

